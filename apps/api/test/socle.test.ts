/**
 * socle.test.ts — les garanties de la migration `socle`, éprouvées
 *
 * Chaque test répond à la question : « qu'est-ce qui casse si on retire cette
 * ligne de la migration ? ». Un test qui ne répond pas à ça n'a pas sa place.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { exploitation } from '@jp/contracts';
import { demarrerBase, type BaseDeTest } from './conteneur.js';

const { PARAMETERS, validate } = exploitation;

let base: BaseDeTest;

beforeAll(async () => {
  base = await demarrerBase();
});

afterAll(async () => {
  await base?.arreter();
});

/** Code PostgreSQL d'un refus de droits. */
const DROITS_REFUSES = '42501';

describe('journal_audit — ajout seul (D3)', () => {
  it('jp_app peut insérer', async () => {
    const { rowCount } = await base.appli.query(
      `INSERT INTO audit_log (id, action, target_type)
       VALUES (gen_random_uuid(), 'essai', 'test')`,
    );
    expect(rowCount).toBe(1);
  });

  it('jp_app ne peut PAS modifier', async () => {
    await expect(
      base.appli.query(`UPDATE audit_log SET action = 'falsifie'`),
    ).rejects.toMatchObject({ code: DROITS_REFUSES });
  });

  it('jp_app ne peut PAS supprimer', async () => {
    await expect(base.appli.query('DELETE FROM audit_log')).rejects.toMatchObject({
      code: DROITS_REFUSES,
    });
  });

  it('le propriétaire, lui, le peut — la contre-épreuve', async () => {
    // Sans ce test, un REVOKE mal écrit et un UPDATE syntaxiquement invalide
    // donneraient exactement le même vert. Il prouve que les trois tests
    // ci-dessus mesurent bien le RÔLE, et pas une faute de frappe.
    const { rowCount } = await base.proprietaire.query(
      `UPDATE audit_log SET action = 'corrige-par-le-proprietaire'`,
    );
    expect(rowCount).toBeGreaterThan(0);
    await base.proprietaire.query('DELETE FROM audit_log');
  });

  it('les droits accordés se limitent à INSERT et SELECT', async () => {
    const { rows } = await base.appli.query<{ privilege_type: string }>(
      `SELECT privilege_type FROM information_schema.table_privileges
       WHERE grantee = 'jp_app' AND table_name = 'audit_log'
       ORDER BY privilege_type`,
    );
    expect(rows.map((r) => r.privilege_type)).toEqual(['INSERT', 'SELECT']);
  });
});

describe('parametre_modification — double validation', () => {
  async function utilisateur(email: string): Promise<string> {
    const { rows } = await base.proprietaire.query<{ id: string }>(
      `INSERT INTO app_user (id, email) VALUES (gen_random_uuid(), $1) RETURNING id`,
      [email],
    );
    return rows[0]!.id;
  }

  it('refuse une modification proposée ET confirmée par la même personne', async () => {
    const moi = await utilisateur(`solo-${Date.now()}@jp.mg`);
    await base.proprietaire.query(
      `INSERT INTO setting (key, value, type, description)
       VALUES ('essai_solo', '1', 'integer', 'essai')`,
    );

    await expect(
      base.proprietaire.query(
        `INSERT INTO setting_change
           (id, setting_key, old_value, new_value, reason,
            proposed_by_id, confirmed_by_id, confirmed_at)
         VALUES (gen_random_uuid(), 'essai_solo', '1', '2', 'essai', $1, $1, now())`,
        [moi],
      ),
    ).rejects.toMatchObject({ constraint: 'confirmation_par_un_autre' });
  });

  it('refuse une confirmation à moitié renseignée', async () => {
    const un = await utilisateur(`propose-${Date.now()}@jp.mg`);
    await base.proprietaire.query(
      `INSERT INTO setting (key, value, type, description)
       VALUES ('essai_moitie', '1', 'integer', 'essai')`,
    );

    // Un confirmateur, mais pas de date : ni confirmé, ni pas confirmé.
    await expect(
      base.proprietaire.query(
        `INSERT INTO setting_change
           (id, setting_key, old_value, new_value, reason,
            proposed_by_id, confirmed_by_id)
         VALUES (gen_random_uuid(), 'essai_moitie', '1', '2', 'essai', $1, $1)`,
        [un],
      ),
    ).rejects.toMatchObject({ code: expect.stringMatching(/^23514$/) });
  });

  it('accepte une modification confirmée par quelqu’un d’autre', async () => {
    const proposeur = await utilisateur(`a-${Date.now()}@jp.mg`);
    const confirmeur = await utilisateur(`b-${Date.now()}@jp.mg`);
    await base.proprietaire.query(
      `INSERT INTO setting (key, value, type, description)
       VALUES ('essai_duo', '1', 'integer', 'essai')`,
    );

    const { rowCount } = await base.proprietaire.query(
      `INSERT INTO setting_change
         (id, setting_key, old_value, new_value, reason,
          proposed_by_id, confirmed_by_id, confirmed_at)
       VALUES (gen_random_uuid(), 'essai_duo', '1', '2', 'essai', $1, $2, now())`,
      [proposeur, confirmeur],
    );
    expect(rowCount).toBe(1);
  });
});

describe('utilisateur — R-C1 et R-C15', () => {
  it('l’adresse électronique est unique : c’est l’identifiant du compte', async () => {
    const email = `doublon-${Date.now()}@jp.mg`;
    await base.appli.query(`INSERT INTO app_user (id, email) VALUES (gen_random_uuid(), $1)`, [
      email,
    ]);
    await expect(
      base.appli.query(`INSERT INTO app_user (id, email) VALUES (gen_random_uuid(), $1)`, [
        email,
      ]),
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('le téléphone peut être vide : ce n’est plus un identifiant', async () => {
    const { rows } = await base.appli.query<{ phone: string | null }>(
      `INSERT INTO app_user (id, email) VALUES (gen_random_uuid(), $1) RETURNING phone`,
      [`sans-tel-${Date.now()}@jp.mg`],
    );
    expect(rows[0]!.phone).toBeNull();
  });

  it('maj_le a une valeur par défaut — un INSERT à la main ne doit pas échouer', async () => {
    const { rows } = await base.appli.query<{ updated_at: Date }>(
      `INSERT INTO app_user (id, email) VALUES (gen_random_uuid(), $1) RETURNING updated_at`,
      [`majle-${Date.now()}@jp.mg`],
    );
    expect(rows[0]!.updated_at).toBeInstanceOf(Date);
  });

  it('un acteur cité dans le journal ne peut pas être supprimé', async () => {
    const { rows } = await base.proprietaire.query<{ id: string }>(
      `INSERT INTO app_user (id, email) VALUES (gen_random_uuid(), $1) RETURNING id`,
      [`trace-${Date.now()}@jp.mg`],
    );
    const id = rows[0]!.id;
    await base.appli.query(
      `INSERT INTO audit_log (id, actor_id, action, target_type)
       VALUES (gen_random_uuid(), $1, 'essai', 'test')`,
      [id],
    );

    // ON DELETE RESTRICT et non SET NULL : un SET NULL serait un UPDATE sur le
    // journal, donc une porte dérobée dans la garantie d'ajout seul.
    //
    // Le code attendu est 23001 (restrict_violation) et NON 23503
    // (foreign_key_violation). PostgreSQL distingue les deux : RESTRICT est
    // vérifié immédiatement et lève 23001 ; NO ACTION, le défaut, est
    // vérifiable en fin de transaction et lève 23503. Recevoir 23001 prouve
    // donc que c'est bien RESTRICT qui est en place, et pas autre chose.
    await expect(
      base.proprietaire.query('DELETE FROM app_user WHERE id = $1', [id]),
    ).rejects.toMatchObject({ code: '23001' });

    await base.proprietaire.query('DELETE FROM audit_log WHERE actor_id = $1', [id]);
  });
});

describe('le client Prisma applicatif', () => {
  it('lit à travers le rôle restreint', async () => {
    const email = `prisma-${Date.now()}@jp.mg`;
    await base.prisma.user.create({ data: { email } });
    const trouve = await base.prisma.user.findUnique({ where: { email } });
    expect(trouve?.email).toBe(email);
    expect(trouve?.language).toBe('fr'); // français par défaut
  });
});

describe('le registre des paramètres', () => {
  it('chaque valeur par défaut respecte ses propres bornes', () => {
    // Une borne codée qui exclut sa propre valeur par défaut est une faute de
    // frappe qu'on découvrirait sinon dans le back-office, des mois plus tard.
    for (const p of PARAMETERS) {
      expect(validate(p.key, p.default), `${p.key} = ${p.default}`).toBeNull();
    }
  });

  it('refuse une valeur hors bornes, avec le motif', () => {
    expect(validate('duree_reservation_catalogue_s', '10')).toMatch(/Minimum 300/);
    expect(validate('duree_reservation_catalogue_s', '99999')).toMatch(/Maximum 7200/);
    expect(validate('duree_reservation_catalogue_s', 'trente minutes')).toMatch(/entier/);
    expect(validate('cle_inexistante', '1')).toMatch(/inconnu/);
  });

  it('les clés sont uniques', () => {
    const cles = PARAMETERS.map((p) => p.key);
    expect(new Set(cles).size).toBe(cles.length);
  });
});

describe('les univers — R-Y1 à R-Y18', () => {
  it('la table porte les trois, deux ouverts', async () => {
    const tous = await base.prisma.universe.findMany({ orderBy: { rank: 'asc' } });
    expect(tous.map((u) => u.key)).toEqual(['mode', 'beaute', 'tech']);
    expect(tous.filter((u) => u.isOpen).map((u) => u.key)).toEqual(['mode', 'beaute']);
  });

  it('les commissions diffèrent — c’est ce qui empêche un univers vide', async () => {
    // Un revendeur de téléphones gagne ~5 % sur un appareil : lui en prendre 8
    // rendrait JP Tech vide, quel que soit le reste du produit.
    const mode = await base.prisma.universe.findUnique({ where: { key: 'mode' } });
    const tech = await base.prisma.universe.findUnique({ where: { key: 'tech' } });
    expect(mode!.commissionPerMille).toBe(80);
    expect(tech!.commissionPerMille).toBe(30);
  });

  it('la base refuse une commission hors des bornes', async () => {
    // Les bornes sont AUSSI dans le code ; ici c'est le dernier filet.
    await expect(
      base.proprietaire.query(`UPDATE universe SET commission_per_mille = 0 WHERE key = 'mode'`),
    ).rejects.toMatchObject({ constraint: 'commission_dans_les_bornes' });

    await expect(
      base.proprietaire.query(`UPDATE universe SET commission_per_mille = 500 WHERE key = 'mode'`),
    ).rejects.toMatchObject({ constraint: 'commission_dans_les_bornes' });
  });

  it('la base refuse une clé technique avec accent ou majuscule', async () => {
    // La clé est dans les URL et les lignes de commande : un accent casserait
    // un lien partagé selon l'outil qui l'a encodé.
    await expect(
      base.proprietaire.query(
        `INSERT INTO universe (key, name, signature, tab, commission_per_mille)
         VALUES ('Beauté', 'X', 'Y', 'Z', 80)`,
      ),
    ).rejects.toMatchObject({ constraint: 'cle_technique_stable' });
  });

  it('ouvrir un univers est un UPDATE, pas un chantier', async () => {
    // C'est tout l'intérêt d'avoir construit l'abstraction maintenant.
    await base.proprietaire.query(`UPDATE universe SET is_open = true WHERE key = 'tech'`);
    const ouverts = await base.prisma.universe.count({ where: { isOpen: true } });
    expect(ouverts).toBe(3);
    // C'est tout : pas de migration, pas de déploiement, pas de code à écrire.
    await base.proprietaire.query(`UPDATE universe SET is_open = false WHERE key = 'tech'`);
  });
});
