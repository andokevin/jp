/**
 * schema-complet.test.ts — les garanties structurelles du schéma
 *
 * Même règle que `socle.test.ts` : chaque test répond à « qu'est-ce qui casse
 * si on retire cette ligne de la migration ? ». On n'éprouve pas ici la
 * présence des tables — un `CREATE TABLE` qui manque se voit tout seul — mais
 * les invariants qu'aucune relecture de code ne garantirait.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { demarrerBase, type BaseDeTest } from './conteneur.js';

let base: BaseDeTest;

beforeAll(async () => {
  base = await demarrerBase();
});

afterAll(async () => {
  await base?.arreter();
});

const DROITS_REFUSES = '42501';
const DOUBLON = '23505';
const LEVEE_PLPGSQL = 'P0001';

let compteur = 0;
function unique(prefixe: string): string {
  compteur += 1;
  return `${prefixe}-${Date.now()}-${compteur}`;
}

async function utilisateur(): Promise<string> {
  const { rows } = await base.appli.query<{ id: string }>(
    `INSERT INTO app_user (id, email) VALUES (gen_random_uuid(), $1) RETURNING id`,
    [`${unique('u')}@jp.mg`],
  );
  return rows[0]!.id;
}

async function boutique(): Promise<string> {
  const { rows } = await base.appli.query<{ id: string }>(
    `INSERT INTO shop (id, user_id, name, slug)
     VALUES (gen_random_uuid(), $1, 'B', $2) RETURNING id`,
    [await utilisateur(), unique('slug')],
  );
  return rows[0]!.id;
}

async function article(): Promise<string> {
  const { rows } = await base.appli.query<{ id: string }>(
    `INSERT INTO article (id, shop_id, universe_key, name, price_ariary)
     VALUES (gen_random_uuid(), $1, 'mode', 'Robe', 40000) RETURNING id`,
    [await boutique()],
  );
  return rows[0]!.id;
}

async function commande(acheteurId?: string): Promise<string> {
  const { rows } = await base.appli.query<{ id: string }>(
    `INSERT INTO sales_order (id, numero, buyer_id, universe_key, subtotal, total)
     VALUES (gen_random_uuid(), $1, $2, 'mode', 40000, 40000) RETURNING id`,
    [unique('CMD'), acheteurId ?? (await utilisateur())],
  );
  return rows[0]!.id;
}

describe('RB5 — un contenu publié porte au moins un article', () => {
  it('refuse un contenu publié sans article, à la VALIDATION de la transaction', async () => {
    // Le déclencheur est différé : l'erreur ne tombe pas à l'INSERT, elle tombe
    // au COMMIT. C'est exactement ce qu'on veut vérifier — un déclencheur
    // immédiat refuserait une transaction pourtant valide.
    await base.appli.query('BEGIN');
    await base.appli.query(
      `INSERT INTO content (id, author_id, type, media_url, status)
       VALUES (gen_random_uuid(), $1, 'clip', 'video://x', 'published')`,
      [await utilisateur()],
    );
    await expect(base.appli.query('COMMIT')).rejects.toMatchObject({ code: LEVEE_PLPGSQL });
    await base.appli.query('ROLLBACK');
  });

  it('accepte le contenu et ses articles insérés dans la MÊME transaction', async () => {
    // La raison d'être du `DEFERRABLE INITIALLY DEFERRED`. Sans lui, cette
    // séquence — pourtant la seule écrivable — serait refusée à la ligne 1.
    const auteur = await utilisateur();
    const art = await article();
    await base.appli.query('BEGIN');
    const { rows } = await base.appli.query<{ id: string }>(
      `INSERT INTO content (id, author_id, type, media_url, status)
       VALUES (gen_random_uuid(), $1, 'clip', 'video://x', 'published') RETURNING id`,
      [auteur],
    );
    await base.appli.query(`INSERT INTO content_article (content_id, article_id) VALUES ($1, $2)`, [
      rows[0]!.id,
      art,
    ]);
    await expect(base.appli.query('COMMIT')).resolves.toBeTruthy();
  });

  it('un brouillon sans article passe — la règle ne porte que sur le publié', async () => {
    const { rowCount } = await base.appli.query(
      `INSERT INTO content (id, author_id, type, media_url, status)
       VALUES (gen_random_uuid(), $1, 'photo', 'img://x', 'draft')`,
      [await utilisateur()],
    );
    expect(rowCount).toBe(1);
  });

  it('un déballage sans commande source est refusé (R-K2)', async () => {
    await expect(
      base.appli.query(
        `INSERT INTO content (id, author_id, type, media_url)
         VALUES (gen_random_uuid(), $1, 'unboxing', 'video://x')`,
        [await utilisateur()],
      ),
    ).rejects.toMatchObject({ constraint: 'contenu_unboxing_a_une_commande' });
  });
});

describe('order_dispute — le compteur EST la sanction (R-T8, DP-05)', () => {
  it('`counts_in_score` ne peut pas diverger du statut', async () => {
    // Depuis DP-07 il n'y a plus ni séquestre ni arbitre : si ce booléen peut
    // mentir, un signalement ouvert cesse d'avoir la moindre conséquence.
    await expect(
      base.appli.query(
        `INSERT INTO order_dispute
           (id, order_id, opened_by_id, universe_key, reason, status, counts_in_score)
         VALUES (gen_random_uuid(), $1, $2, 'mode', 'not_received', 'open', false)`,
        [await commande(), await utilisateur()],
      ),
    ).rejects.toMatchObject({ constraint: 'compteur_coherent' });
  });

  it("l'instruction a disparu : plus de colonne `decide_par_id`", async () => {
    const { rows } = await base.appli.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'order_dispute'
         AND column_name IN ('decide_par_id', 'decision_texte', 'affecte_a_id')`,
    );
    expect(rows).toHaveLength(0);
  });

  it('RB4 a déménagé : une sanction sans motif écrit est refusée', async () => {
    await expect(
      base.appli.query(
        `INSERT INTO sanction (id, user_id, type, reason_text, applied_by_id)
         VALUES (gen_random_uuid(), $1, 'warning', '   ', $2)`,
        [await utilisateur(), await utilisateur()],
      ),
    ).rejects.toMatchObject({ constraint: 'sanction_motif_ecrit' });
  });
});

describe('ledger_entry — le cœur de la conformité (C4, D3)', () => {
  it('jp_app peut insérer', async () => {
    const { rowCount } = await base.appli.query(
      `INSERT INTO ledger_entry (id, type, amount, direction, account)
       VALUES (gen_random_uuid(), 'essai', 1000, 'credit', 'shop')`,
    );
    expect(rowCount).toBe(1);
  });

  it('jp_app ne peut ni modifier ni supprimer', async () => {
    await expect(
      base.appli.query(`UPDATE ledger_entry SET amount = 1`),
    ).rejects.toMatchObject({ code: DROITS_REFUSES });
    await expect(base.appli.query(`DELETE FROM ledger_entry`)).rejects.toMatchObject({
      code: DROITS_REFUSES,
    });
  });

  it('un montant nul est refusé — une écriture de zéro ne trace rien', async () => {
    await expect(
      base.appli.query(
        `INSERT INTO ledger_entry (id, type, amount, direction, account)
         VALUES (gen_random_uuid(), 'essai', 0, 'debit', 'jp_commission')`,
      ),
    ).rejects.toMatchObject({ constraint: 'ecriture_montant_positif' });
  });
});

describe('réservation — ce qui porte RB1', () => {
  async function variante(stock = 5): Promise<string> {
    const { rows } = await base.appli.query<{ id: string }>(
      `INSERT INTO variant (id, article_id, stock_quantity)
       VALUES (gen_random_uuid(), $1, $2) RETURNING id`,
      [await article(), stock],
    );
    return rows[0]!.id;
  }

  it('une réservation appartient à un compte OU à une session, jamais aux deux', async () => {
    // Une réservation orpheline bloquerait du stock que personne ne pourrait
    // ni payer ni libérer.
    await expect(
      base.appli.query(
        `INSERT INTO reservation (id, variant_id, expires_at)
         VALUES (gen_random_uuid(), $1, now() + interval '10 min')`,
        [await variante()],
      ),
    ).rejects.toMatchObject({ constraint: 'reservation_porteur_unique' });

    await expect(
      base.appli.query(
        `INSERT INTO reservation (id, variant_id, user_id, guest_session_id, expires_at)
         VALUES (gen_random_uuid(), $1, $2, gen_random_uuid(), now() + interval '10 min')`,
        [await variante(), await utilisateur()],
      ),
    ).rejects.toMatchObject({ constraint: 'reservation_porteur_unique' });
  });

  it("l'index d'expiration ne porte QUE sur les réservations actives", async () => {
    // Sans le `WHERE`, la tâche d'expiration — qui tourne toutes les minutes —
    // balaierait toutes les réservations jamais créées.
    const { rows } = await base.appli.query<{ indexdef: string }>(
      `SELECT indexdef FROM pg_indexes WHERE indexname = 'reservation_active_expire'`,
    );
    expect(rows[0]!.indexdef).toContain("WHERE (status = 'active'");
  });
});

describe('D4 — le cumul de promotions est impossible par la FORME de la table', () => {
  it('`order_line.promotion_id` est scalaire, pas une table de liaison', async () => {
    // La décision de modélisation la plus importante du domaine commercial
    // (R-U7). Une table de liaison rouvrirait le cumul ; une colonne ne le peut
    // pas, quel que soit le code écrit au-dessus.
    const { rows } = await base.appli.query<{ data_type: string }>(
      `SELECT data_type FROM information_schema.columns
       WHERE table_name = 'order_line' AND column_name = 'promotion_id'`,
    );
    expect(rows).toHaveLength(1);

    const { rows: liaison } = await base.appli.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'order_line_promotion'`,
    );
    expect(liaison).toHaveLength(0);
  });

  it('une remise ne peut pas dépasser ce qu’elle remise', async () => {
    const { rows: v } = await base.appli.query<{ id: string }>(
      `INSERT INTO variant (id, article_id, stock_quantity)
       VALUES (gen_random_uuid(), $1, 5) RETURNING id`,
      [await article()],
    );
    await expect(
      base.appli.query(
        `INSERT INTO order_line
           (id, order_id, variant_id, shop_id, quantity, unit_price, line_discount)
         VALUES (gen_random_uuid(), $1, $2, $3, 2, 10000, 25000)`,
        [await commande(), v[0]!.id, await boutique()],
      ),
    ).rejects.toMatchObject({ constraint: 'ligne_commande_remise_bornee' });
  });
});

describe('DP-15 — le barème est historisé, jamais modifié', () => {
  async function bareme(taux: number, univers = unique('u')): Promise<string> {
    const { rows } = await base.appli.query<{ id: string }>(
      `INSERT INTO commission_schedule (id, universe_key, rate_per_mille)
       VALUES (gen_random_uuid(), $1, $2) RETURNING id`,
      [univers, taux],
    );
    return rows[0]!.id;
  }

  it('changer un taux en place est refusé', async () => {
    // Un taux modifié en place réécrirait le passé : une commande ne pourrait
    // plus prouver le taux qu'elle a subi (R-G3).
    const id = await bareme(80);
    await expect(
      base.appli.query(`UPDATE commission_schedule SET rate_per_mille = 120 WHERE id = $1`, [id]),
    ).rejects.toMatchObject({ code: LEVEE_PLPGSQL });
  });

  it('clôturer une version passe — c’est la seule modification légitime', async () => {
    const id = await bareme(80);
    const { rowCount } = await base.appli.query(
      `UPDATE commission_schedule SET ends_at = now() WHERE id = $1`,
      [id],
    );
    expect(rowCount).toBe(1);
  });

  it('une seule version EN VIGUEUR par univers et par palier', async () => {
    const univers = unique('u');
    await bareme(80, univers);
    await expect(bareme(120, univers)).rejects.toMatchObject({ code: DOUBLON });
  });
});

describe('DP-08 — un seul abonnement actif par boutique', () => {
  it('refuse un second abonnement actif', async () => {
    const b = await boutique();
    const poser = () =>
      base.appli.query(
        `INSERT INTO shop_subscription (id, shop_id, due_at)
         VALUES (gen_random_uuid(), $1, now() + interval '30 days')`,
        [b],
      );
    await poser();
    await expect(poser()).rejects.toMatchObject({ constraint: 'abonnement_boutique_actif_unique' });
  });

  it('le palier gratuit est à zéro, et un palier payant ne peut pas s’y déguiser', async () => {
    // Sans ce CHECK, un palier `pro` à 0 Ar serait une porte dérobée dans le
    // modèle économique — invisible en relecture de code.
    await expect(
      base.appli.query(
        `INSERT INTO shop_subscription (id, shop_id, tier, amount, due_at)
         VALUES (gen_random_uuid(), $1, 'free', 50000, now() + interval '30 days')`,
        [await boutique()],
      ),
    ).rejects.toMatchObject({ constraint: 'abonnement_montant_coherent' });
  });
});

describe('la numérotation des factures est CONTINUE', () => {
  it('la séquence existe et jp_app peut la consommer', async () => {
    // `max(numero) + 1` donnerait le même numéro à deux factures émises en même
    // temps. Un trou dans une série est un problème comptable ; un doublon en
    // est un pire.
    const { rows } = await base.appli.query<{ nextval: string }>(
      `SELECT nextval('facture_numero_seq') AS nextval`,
    );
    expect(Number(rows[0]!.nextval)).toBeGreaterThan(0);
  });
});
