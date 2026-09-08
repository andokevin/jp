/**
 * attributs.test.ts — les garanties du sprint « ajout d'attributs »
 *
 * Même règle que `socle.test.ts` : chaque test répond à « qu'est-ce qui casse
 * si on retire cette ligne de la migration ? ». Les commentaires du schéma
 * Prisma décrivent une intention ; ces tests sont ce qui la rend vraie.
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

/** Codes SQLSTATE — voir la table des erreurs PostgreSQL. */
const DROITS_REFUSES = '42501';
const DOUBLON = '23505';
const ENUM_INVALIDE = '22P02';
/** `RAISE EXCEPTION` sans code explicite dans une fonction PL/pgSQL. */
const LEVEE_PLPGSQL = 'P0001';

let compteur = 0;
function unique(prefixe: string): string {
  compteur += 1;
  return `${prefixe}-${Date.now()}-${compteur}`;
}

async function creerUtilisateur(genre: string | null = null): Promise<string> {
  const { rows } = await base.appli.query<{ id: string }>(
    `INSERT INTO app_user (id, email, gender) VALUES (gen_random_uuid(), $1, $2) RETURNING id`,
    [`${unique('u')}@jp.mg`, genre],
  );
  return rows[0]!.id;
}

async function creerBoutique(logo: string | null = null): Promise<string> {
  const proprietaire = await creerUtilisateur();
  const { rows } = await base.appli.query<{ id: string }>(
    `INSERT INTO boutique (id, utilisateur_id, nom, slug, logo_url)
     VALUES (gen_random_uuid(), $1, 'Boutique', $2, $3) RETURNING id`,
    [proprietaire, unique('slug'), logo],
  );
  return rows[0]!.id;
}

async function creerArticle(options: { pieceUnique?: boolean } = {}): Promise<string> {
  const boutique = await creerBoutique();
  const { rows } = await base.appli.query<{ id: string }>(
    `INSERT INTO article (id, boutique_id, universe_key, name, price_ariary, one_of_a_kind)
     VALUES (gen_random_uuid(), $1, 'mode', 'Robe', 50000, $2) RETURNING id`,
    [boutique, options.pieceUnique ?? false],
  );
  return rows[0]!.id;
}

describe('app_user.gender — le facultatif qui reste distinguable', () => {
  it("« non renseigné » n'est PAS « autre »", async () => {
    // Si la colonne avait un défaut à 'other', on ne saurait plus jamais qui a
    // répondu et qui a sauté la question — et la statistique compterait comme
    // « autre » tous ceux qui n'ont rien dit.
    const sansReponse = await creerUtilisateur(null);
    const aRepondu = await creerUtilisateur('other');

    const { rows } = await base.appli.query<{ id: string; gender: string | null }>(
      `SELECT id, gender FROM app_user WHERE id = ANY($1::uuid[]) ORDER BY gender NULLS FIRST`,
      [[sansReponse, aRepondu]],
    );
    expect(rows.map((r) => r.gender)).toEqual([null, 'other']);
  });

  it('refuse une valeur hors des trois', async () => {
    // C'est ce que l'énuméré achète face à une colonne texte : la faute de
    // frappe est refusée par la base, pas rattrapée plus tard par un script.
    await expect(creerUtilisateur('Femme')).rejects.toMatchObject({ code: ENUM_INVALIDE });
  });
});

describe('profil_acheteur — trois préférences au plus', () => {
  it('accepte trois types de vêtements', async () => {
    const moi = await creerUtilisateur();
    const { rowCount } = await base.appli.query(
      `INSERT INTO buyer_profile (utilisateur_id, clothing_preferences)
       VALUES ($1, ARRAY['robe','jean','jupe'])`,
      [moi],
    );
    expect(rowCount).toBe(1);
  });

  it('refuse la quatrième', async () => {
    const moi = await creerUtilisateur();
    await expect(
      base.appli.query(
        `INSERT INTO buyer_profile (utilisateur_id, clothing_preferences)
         VALUES ($1, ARRAY['robe','jean','jupe','short'])`,
        [moi],
      ),
    ).rejects.toMatchObject({ constraint: 'profil_acheteur_preferences_max_3' });
  });

  it('sauter la question ne crée pas de ligne ; répondre « aucune » en crée une vide', async () => {
    const silencieux = await creerUtilisateur();
    const explicite = await creerUtilisateur();
    await base.appli.query(
      `INSERT INTO buyer_profile (utilisateur_id, clothing_preferences) VALUES ($1, ARRAY[]::text[])`,
      [explicite],
    );

    const { rows } = await base.appli.query<{ utilisateur_id: string }>(
      `SELECT utilisateur_id FROM buyer_profile WHERE utilisateur_id = ANY($1::uuid[])`,
      [[silencieux, explicite]],
    );
    expect(rows.map((r) => r.utilisateur_id)).toEqual([explicite]);
  });

  it('un compte, au plus un profil', async () => {
    const moi = await creerUtilisateur();
    await base.appli.query(`INSERT INTO buyer_profile (utilisateur_id) VALUES ($1)`, [moi]);
    await expect(
      base.appli.query(`INSERT INTO buyer_profile (utilisateur_id) VALUES ($1)`, [moi]),
    ).rejects.toMatchObject({ code: DOUBLON });
  });
});

describe('boutique — logo facultatif, et plus de vendeur particulier (DP-01)', () => {
  it('une boutique ouvre sans logo', async () => {
    // Bloquer l'ouverture sur un fichier manquant coûterait des vendeuses :
    // beaucoup ouvrent depuis le téléphone, sans image prête.
    const sansLogo = await creerBoutique(null);
    expect(sansLogo).toBeTruthy();
  });

  it("la colonne `type_boutique` n'existe pas", async () => {
    // Le test qui empêche la réintroduction silencieuse d'un acteur supprimé.
    const { rows } = await base.appli.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'boutique' AND column_name = 'type_boutique'`,
    );
    expect(rows).toHaveLength(0);
  });

  it('un compte, au plus une boutique (DP-02)', async () => {
    const proprietaire = await creerUtilisateur();
    await base.appli.query(
      `INSERT INTO boutique (id, utilisateur_id, nom, slug)
       VALUES (gen_random_uuid(), $1, 'Une', $2)`,
      [proprietaire, unique('slug')],
    );
    await expect(
      base.appli.query(
        `INSERT INTO boutique (id, utilisateur_id, nom, slug)
         VALUES (gen_random_uuid(), $1, 'Deux', $2)`,
        [proprietaire, unique('slug')],
      ),
    ).rejects.toMatchObject({ code: DOUBLON });
  });
});

describe("document_identite — la CIN suffit, le NIF-STAT n'est jamais exigé", () => {
  it('un dossier sans nif_stat est valide', async () => {
    const moi = await creerUtilisateur();
    for (const type of ['cin_recto', 'cin_verso', 'selfie']) {
      const { rowCount } = await base.appli.query(
        `INSERT INTO document_identite (id, utilisateur_id, type, url_chiffree, empreinte)
         VALUES (gen_random_uuid(), $1, $2, 'chiffre://x', $3)`,
        [moi, type, unique('h')],
      );
      expect(rowCount).toBe(1);
    }
  });

  it('redéposer la même pièce ne l’empile pas', async () => {
    const moi = await creerUtilisateur();
    await base.appli.query(
      `INSERT INTO document_identite (id, utilisateur_id, type, url_chiffree, empreinte)
       VALUES (gen_random_uuid(), $1, 'cin_recto', 'chiffre://a', 'a')`,
      [moi],
    );
    await expect(
      base.appli.query(
        `INSERT INTO document_identite (id, utilisateur_id, type, url_chiffree, empreinte)
         VALUES (gen_random_uuid(), $1, 'cin_recto', 'chiffre://b', 'b')`,
        [moi],
      ),
    ).rejects.toMatchObject({ code: DOUBLON });
  });
});

describe('article et variante — le facultatif du direct, le garde-fou du stock', () => {
  it('un article publiable sans mesures ni état — le cas du direct', async () => {
    // En direct, la vendeuse essaie le vêtement devant la caméra. Exiger les
    // mesures fermerait le direct à celle qui ne les connaît pas.
    const article = await creerArticle();
    const { rows } = await base.appli.query<{ measurements: unknown; clothing_condition: string | null }>(
      `SELECT measurements, clothing_condition FROM article WHERE id = $1`,
      [article],
    );
    expect(rows[0]).toEqual({ measurements: null, clothing_condition: null });
  });

  it('la taille non renseignée vaut `taille_unique`, jamais NULL', async () => {
    // NULL n'est jamais égal à NULL : deux variantes sans taille passeraient
    // toutes les deux la clé unique, et le stock se dédoublerait.
    const article = await creerArticle();
    await base.appli.query(
      `INSERT INTO variant (id, article_id, stock_quantity) VALUES (gen_random_uuid(), $1, 5)`,
      [article],
    );
    const { rows } = await base.appli.query<{ taille: string }>(
      `SELECT taille FROM variant WHERE article_id = $1`,
      [article],
    );
    expect(rows[0]!.taille).toBe('taille_unique');

    await expect(
      base.appli.query(
        `INSERT INTO variant (id, article_id, stock_quantity) VALUES (gen_random_uuid(), $1, 3)`,
        [article],
      ),
    ).rejects.toMatchObject({ code: DOUBLON });
  });

  it('deux tailles du même article coexistent', async () => {
    const article = await creerArticle();
    for (const taille of ['S', 'M', 'L']) {
      await base.appli.query(
        `INSERT INTO variant (id, article_id, taille, stock_quantity)
         VALUES (gen_random_uuid(), $1, $2, 2)`,
        [article, taille],
      );
    }
    const { rows } = await base.appli.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM variant WHERE article_id = $1`,
      [article],
    );
    expect(rows[0]!.n).toBe('3');
  });

  it('on ne peut pas réserver plus que le stock — le dernier filet contre la survente', async () => {
    const article = await creerArticle();
    await expect(
      base.appli.query(
        `INSERT INTO variant (id, article_id, stock_quantity, reserved_quantity)
         VALUES (gen_random_uuid(), $1, 2, 3)`,
        [article],
      ),
    ).rejects.toMatchObject({ constraint: 'variante_reservee_sous_stock' });
  });

  it('une pièce unique ne peut pas avoir deux exemplaires (F1.14, RB9)', async () => {
    // Sans le déclencheur, `piece_unique` ne serait qu'un libellé d'affichage
    // et la rareté annoncée pourrait être fausse.
    const article = await creerArticle({ pieceUnique: true });
    await expect(
      base.appli.query(
        `INSERT INTO variant (id, article_id, stock_quantity) VALUES (gen_random_uuid(), $1, 2)`,
        [article],
      ),
    ).rejects.toMatchObject({ code: LEVEE_PLPGSQL });
  });

  it('le prix zéro est refusé', async () => {
    const boutique = await creerBoutique();
    await expect(
      base.appli.query(
        `INSERT INTO article (id, boutique_id, universe_key, name, price_ariary)
         VALUES (gen_random_uuid(), $1, 'mode', 'Gratuit', 0)`,
        [boutique],
      ),
    ).rejects.toMatchObject({ constraint: 'article_prix_positif' });
  });
});

describe('panier — hors direct, et sans vérité sur le stock (D7 révisé)', () => {
  it('un seul panier ACTIF par personne', async () => {
    const moi = await creerUtilisateur();
    await base.appli.query(
      `INSERT INTO panier (id, utilisateur_id) VALUES (gen_random_uuid(), $1)`,
      [moi],
    );
    await expect(
      base.appli.query(`INSERT INTO panier (id, utilisateur_id) VALUES (gen_random_uuid(), $1)`, [
        moi,
      ]),
    ).rejects.toMatchObject({ constraint: 'panier_actif_unique' });
  });

  it("l'historique des paniers validés reste, lui", async () => {
    // C'est ce que l'index PARTIEL achète face à un `UNIQUE` ordinaire : la
    // contrainte ne porte que sur `statut = 'actif'`.
    const moi = await creerUtilisateur();
    await base.appli.query(
      `INSERT INTO panier (id, utilisateur_id, statut) VALUES (gen_random_uuid(), $1, 'valide')`,
      [moi],
    );
    await base.appli.query(
      `INSERT INTO panier (id, utilisateur_id, statut) VALUES (gen_random_uuid(), $1, 'abandonne')`,
      [moi],
    );
    const { rowCount } = await base.appli.query(
      `INSERT INTO panier (id, utilisateur_id) VALUES (gen_random_uuid(), $1)`,
      [moi],
    );
    expect(rowCount).toBe(1);
  });

  it('ajouter deux fois le même article augmente la quantité au lieu d’empiler', async () => {
    const moi = await creerUtilisateur();
    const article = await creerArticle();
    const { rows: v } = await base.appli.query<{ id: string }>(
      `INSERT INTO variant (id, article_id, stock_quantity)
       VALUES (gen_random_uuid(), $1, 10) RETURNING id`,
      [article],
    );
    const { rows: p } = await base.appli.query<{ id: string }>(
      `INSERT INTO panier (id, utilisateur_id) VALUES (gen_random_uuid(), $1) RETURNING id`,
      [moi],
    );

    await base.appli.query(
      `INSERT INTO ligne_panier (id, panier_id, variant_id, quantite)
       VALUES (gen_random_uuid(), $1, $2, 1)`,
      [p[0]!.id, v[0]!.id],
    );
    await expect(
      base.appli.query(
        `INSERT INTO ligne_panier (id, panier_id, variant_id, quantite)
         VALUES (gen_random_uuid(), $1, $2, 1)`,
        [p[0]!.id, v[0]!.id],
      ),
    ).rejects.toMatchObject({ code: DOUBLON });
  });

  it("le panier ne touche PAS au stock — c'est tout l'enjeu de D7", async () => {
    // Une ligne de panier est une intention. Si elle décrémentait le stock, on
    // aurait deux sources de vérité sur ce qui reste, donc de la survente.
    const moi = await creerUtilisateur();
    const article = await creerArticle();
    const { rows: v } = await base.appli.query<{ id: string }>(
      `INSERT INTO variant (id, article_id, stock_quantity)
       VALUES (gen_random_uuid(), $1, 7) RETURNING id`,
      [article],
    );
    const { rows: p } = await base.appli.query<{ id: string }>(
      `INSERT INTO panier (id, utilisateur_id) VALUES (gen_random_uuid(), $1) RETURNING id`,
      [moi],
    );
    await base.appli.query(
      `INSERT INTO ligne_panier (id, panier_id, variant_id, quantite)
       VALUES (gen_random_uuid(), $1, $2, 4)`,
      [p[0]!.id, v[0]!.id],
    );

    const { rows } = await base.appli.query<{ stock_quantity: number; reserved_quantity: number }>(
      `SELECT stock_quantity, reserved_quantity FROM variant WHERE id = $1`,
      [v[0]!.id],
    );
    expect(rows[0]).toEqual({ stock_quantity: 7, reserved_quantity: 0 });
  });
});

describe('suppression douce — le REVOKE, pas le commentaire', () => {
  const douces = ['app_user', 'boutique', 'article', 'variant', 'extrait_boutique'] as const;

  it.each(douces)('jp_app ne peut PAS supprimer une ligne de %s', async (table) => {
    await expect(base.appli.query(`DELETE FROM "${table}"`)).rejects.toMatchObject({
      code: DROITS_REFUSES,
    });
  });

  it('marquer un compte supprimé passe, lui', async () => {
    const moi = await creerUtilisateur();
    const { rowCount } = await base.appli.query(
      `UPDATE app_user SET status = 'deleted' WHERE id = $1`,
      [moi],
    );
    expect(rowCount).toBe(1);
  });

  it('marquer une boutique supprimée passe, lui', async () => {
    const boutique = await creerBoutique();
    const { rowCount } = await base.appli.query(
      `UPDATE boutique SET supprimee_le = now() WHERE id = $1`,
      [boutique],
    );
    expect(rowCount).toBe(1);
  });

  it('marquer un article supprimé passe, lui', async () => {
    const article = await creerArticle();
    const { rowCount } = await base.appli.query(
      `UPDATE article SET deleted_at = now() WHERE id = $1`,
      [article],
    );
    expect(rowCount).toBe(1);
  });

  it('marquer un extrait supprimé passe, lui', async () => {
    const boutique = await creerBoutique();
    const { rows } = await base.appli.query<{ id: string }>(
      `INSERT INTO extrait_boutique (id, boutique_id, type, video_url)
       VALUES (gen_random_uuid(), $1, 'annonce', 'video://x') RETURNING id`,
      [boutique],
    );
    const { rowCount } = await base.appli.query(
      `UPDATE extrait_boutique SET supprime_le = now() WHERE id = $1`,
      [rows[0]!.id],
    );
    expect(rowCount).toBe(1);
  });

  it('le propriétaire, lui, le peut — la contre-épreuve', async () => {
    // Sans ce test, un REVOKE mal écrit et un DELETE syntaxiquement invalide
    // donneraient le même vert. Il prouve qu'on mesure bien le RÔLE.
    const orphelin = await creerUtilisateur();
    const { rowCount } = await base.proprietaire.query(`DELETE FROM app_user WHERE id = $1`, [
      orphelin,
    ]);
    expect(rowCount).toBe(1);
  });

  it('panier et ligne_panier gardent DELETE — retirer un article est une vraie suppression', async () => {
    const moi = await creerUtilisateur();
    const { rows } = await base.appli.query<{ id: string }>(
      `INSERT INTO panier (id, utilisateur_id) VALUES (gen_random_uuid(), $1) RETURNING id`,
      [moi],
    );
    const { rowCount } = await base.appli.query(`DELETE FROM panier WHERE id = $1`, [rows[0]!.id]);
    expect(rowCount).toBe(1);
  });
});
