/**
 * plateforme.test.ts — les huit briques de S3, éprouvées
 *
 * Le test qui compte est celui de l'idempotence : c'est là que se joue RB10.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  empreinte,
  erreurs,
  ErreurMetier,
  executerUneSeuleFois,
  garde,
  gardeSoiMeme,
  jetonDepuisEnTete,
  Limiteur,
  masquerEmail,
  MagasinMemoire,
  ouvrirSession,
  projeterCommande,
  revoquerFamille,
  revoquerSession,
  verifierJeton,
  type Acteur,
} from '../src/plateforme/index.js';
import { enPage, depuisCurseur } from '../src/plateforme/pagination.js';
import { journaliser } from '../src/plateforme/audit.js';
import { demarrerBase, type BaseDeTest } from './conteneur.js';

let base: BaseDeTest;

beforeAll(async () => {
  base = await demarrerBase();
});
afterAll(async () => {
  await base?.arreter();
});

async function unUtilisateur(): Promise<string> {
  const u = await base.prisma.user.create({
    data: { email: `p-${crypto.randomUUID()}@jp.test` },
  });
  return u.id;
}

// ═══════════════════════════════════════════════════════════════════════════
describe('idempotence — RB10', () => {
  const requete = (cle: string, corps: unknown) => ({
    cle,
    methode: 'POST',
    chemin: '/commandes',
    corps,
  });

  it('exécute UNE seule fois et rend la même réponse au rejeu', async () => {
    const cle = crypto.randomUUID();
    let executions = 0;
    const action = async () => {
      executions++;
      return { status: 201, corps: { commandeId: 'cmd-1' } };
    };

    const premier = await executerUneSeuleFois(base.prisma, requete(cle, { article: 'a' }), action);
    const rejeu = await executerUneSeuleFois(base.prisma, requete(cle, { article: 'a' }), action);

    expect(executions).toBe(1); // ← le cœur de RB10
    expect(rejeu).toEqual(premier);
    expect(rejeu.corps).toEqual({ commandeId: 'cmd-1' });
  });

  it('refuse la MÊME clé pour une requête DIFFÉRENTE', async () => {
    // Le pire cas : un client bogué recevrait la réponse d'une autre commande.
    const cle = crypto.randomUUID();
    await executerUneSeuleFois(base.prisma, requete(cle, { article: 'a' }), async () => ({
      status: 201,
      corps: { id: 1 },
    }));

    await expect(
      executerUneSeuleFois(base.prisma, requete(cle, { article: 'AUTRE' }), async () => ({
        status: 201,
        corps: { id: 2 },
      })),
    ).rejects.toMatchObject({ code: 'CLE_IDEMPOTENCE_REUTILISEE' });
  });

  it('refuse une seconde requête pendant que la première tourne', async () => {
    const cle = crypto.randomUUID();
    let libere: () => void = () => {};
    const enAttente = new Promise<void>((r) => (libere = r));

    const premiere = executerUneSeuleFois(base.prisma, requete(cle, { x: 1 }), async () => {
      await enAttente;
      return { status: 201, corps: { ok: true } };
    });

    await new Promise((r) => setTimeout(r, 50));
    await expect(
      executerUneSeuleFois(base.prisma, requete(cle, { x: 1 }), async () => ({
        status: 201,
        corps: { ok: true },
      })),
    ).rejects.toMatchObject({ code: 'REQUETE_EN_COURS' });

    libere();
    await premiere;
  });

  it('libère la clé si l’action échoue — le client DOIT pouvoir réessayer', async () => {
    const cle = crypto.randomUUID();
    await expect(
      executerUneSeuleFois(base.prisma, requete(cle, { x: 1 }), async () => {
        throw new Error('le prestataire a coupé');
      }),
    ).rejects.toThrow();

    // La clé a été retirée : le rejeu exécute pour de bon.
    const apres = await executerUneSeuleFois(base.prisma, requete(cle, { x: 1 }), async () => ({
      status: 201,
      corps: { rattrape: true },
    }));
    expect(apres.corps).toEqual({ rattrape: true });
  });

  it('l’empreinte distingue deux corps différents', () => {
    expect(empreinte({ a: 1 })).toBe(empreinte({ a: 1 }));
    expect(empreinte({ a: 1 })).not.toBe(empreinte({ a: 2 }));
    expect(empreinte(null)).toBe(empreinte(undefined));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe('sessions', () => {
  it('ne stocke JAMAIS le jeton en clair', async () => {
    const id = await unUtilisateur();
    const { jeton } = await ouvrirSession(base.prisma, { userId: id });

    const { rows } = await base.proprietaire.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM session WHERE token_hash = $1`,
      [jeton],
    );
    expect(rows[0]!.n).toBe('0'); // le jeton en clair n'apparaît nulle part
  });

  it('reconnaît un jeton valide, refuse un inconnu', async () => {
    const id = await unUtilisateur();
    const { jeton, sessionId } = await ouvrirSession(base.prisma, { userId: id });
    expect(await verifierJeton(base.prisma, jeton)).toEqual({ userId: id, sessionId });
    expect(await verifierJeton(base.prisma, 'jeton-inventé')).toBeNull();
  });

  it('un jeton RÉVOQUÉ qui réapparaît fait tomber toute la family', async () => {
    // Un jeton révoqué qui revient est le signe d'un vol (F0.2).
    const id = await unUtilisateur();
    const a = await ouvrirSession(base.prisma, { userId: id });
    const b = await ouvrirSession(base.prisma, { userId: id, family: a.family });

    await revoquerSession(base.prisma, a.sessionId);
    expect(await verifierJeton(base.prisma, a.jeton)).toBeNull();

    // b appartenait à la même family : il tombe aussi.
    expect(await verifierJeton(base.prisma, b.jeton)).toBeNull();
  });

  it('révoquer une family compte ce qu’elle a coupé', async () => {
    const id = await unUtilisateur();
    const a = await ouvrirSession(base.prisma, { userId: id });
    await ouvrirSession(base.prisma, { userId: id, family: a.family });
    expect(await revoquerFamille(base.prisma, a.family)).toBe(2);
  });

  it('lit un en-tête Bearer', () => {
    expect(jetonDepuisEnTete('Bearer abc')).toBe('abc');
    expect(jetonDepuisEnTete('bearer abc')).toBe('abc');
    expect(jetonDepuisEnTete('Basic abc')).toBeNull();
    expect(jetonDepuisEnTete(undefined)).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe('permissions — les DEUX outils', () => {
  const employe: Acteur = { userId: 'e', roles: ['employe_vendeur'] };
  const vendeur: Acteur = { userId: 'v', roles: ['vendeur'] };
  const operateur: Acteur = { userId: 'o', roles: ['operateur'] };

  it('outil 1 — la garde décide QUI entre', () => {
    expect(() => garde(vendeur, 'vendeur')).not.toThrow();
    expect(() => garde(employe, 'vendeur')).toThrow(ErreurMetier);
    expect(() => gardeSoiMeme(vendeur, 'v')).not.toThrow();
    expect(() => gardeSoiMeme(vendeur, 'quelqu-un-dautre')).toThrow(ErreurMetier);
    // Un opérateur JP passe partout — c'est son métier.
    expect(() => gardeSoiMeme(operateur, 'v')).not.toThrow();
  });

  it('outil 2 — la projection décide CE QUI SORT', () => {
    // C'est le test qui justifie l'existence du second outil : l'employé a
    // le droit d'ouvrir la commande, pas d'y voir l'argent (R-R8).
    const commande = { id: 'c1', article: 'robe', montantTotal: 50_000, commission: 4_000 };

    const vuEmploye = projeterCommande(employe, commande);
    expect(vuEmploye.id).toBe('c1');
    expect(vuEmploye.article).toBe('robe');
    expect(vuEmploye.montantTotal).toBeUndefined();
    expect(vuEmploye.commission).toBeUndefined();

    expect(projeterCommande(vendeur, commande).montantTotal).toBe(50_000);
    expect(projeterCommande(operateur, commande).commission).toBe(4_000);
  });

  it('une garde seule ne suffirait pas', () => {
    // L'employé PASSE la garde de lecture de commande…
    expect(() => garde(employe, 'vendeur', 'employe_vendeur')).not.toThrow();
    // …et c'est bien la projection, et elle seule, qui retire l'argent.
    expect(projeterCommande(employe, { montantTotal: 1 }).montantTotal).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe('limitation de débit', () => {
  it('laisse passer jusqu’au plafond puis refuse', async () => {
    const l = new Limiteur(new MagasinMemoire());
    const regle = { max: 3, fenetreMs: 60_000 };
    for (let i = 0; i < 3; i++) {
      expect((await l.verifier('ip:1', regle)).autorise, `essai ${i + 1}`).toBe(true);
    }
    const refuse = await l.verifier('ip:1', regle);
    expect(refuse.autorise).toBe(false);
    expect(refuse.attendreS).toBeGreaterThan(0);
    expect(refuse.restantes).toBe(0);
  });

  it('compte séparément deux clés — identité, adresse, cible', async () => {
    const l = new Limiteur(new MagasinMemoire());
    const regle = { max: 1, fenetreMs: 60_000 };
    expect((await l.verifier('email:a@jp.mg', regle)).autorise).toBe(true);
    expect((await l.verifier('email:b@jp.mg', regle)).autorise).toBe(true);
    expect((await l.verifier('email:a@jp.mg', regle)).autorise).toBe(false);
  });

  it('remet le compteur à zéro après une réussite', async () => {
    const l = new Limiteur(new MagasinMemoire());
    const regle = { max: 2, fenetreMs: 60_000 };
    await l.verifier('c', regle);
    await l.verifier('c', regle);
    await l.reussi('c');
    expect((await l.verifier('c', regle)).autorise).toBe(true);
  });

  it('nettoie les entrées expirées', async () => {
    const m = new MagasinMemoire();
    await m.incrementer('x', -1); // déjà expirée
    expect(m.nettoyer()).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe('pagination par curseur', () => {
  const lot = Array.from({ length: 6 }, (_, i) => ({ id: `a${i}`, rang: i }));

  it('détecte la suite avec taille + 1, sans COUNT', () => {
    const page = enPage(lot, 5, (e) => ({ id: e.id }));
    expect(page.elements).toHaveLength(5);
    expect(page.curseurSuivant).not.toBeNull();
  });

  it('rend un curseur nul en fin de liste', () => {
    const page = enPage(lot.slice(0, 3), 5, (e) => ({ id: e.id }));
    expect(page.elements).toHaveLength(3);
    expect(page.curseurSuivant).toBeNull(); // null, pas undefined : ça traverse JSON
  });

  it('relit sa propre position', () => {
    const page = enPage(lot, 5, (e) => ({ id: e.id, rang: e.rang }));
    expect(depuisCurseur(page.curseurSuivant ?? undefined)).toEqual({ id: 'a4', rang: 4 });
  });

  it('un curseur illisible rend la première page, pas une erreur', () => {
    expect(depuisCurseur('n-importe-quoi')).toBeNull();
    expect(depuisCurseur(undefined)).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe('journal d’audit', () => {
  it('écrit une entrée', async () => {
    const acteurId = await unUtilisateur();
    await journaliser(base.prisma, {
      action: 'exploitation.parametre.modifie',
      cibleType: 'parametre',
      cibleId: 'taux_commission_defaut',
      avant: { valeur: '80' },
      apres: { valeur: '90' },
      acteurId,
    });
    const n = await base.prisma.journalAudit.count({ where: { acteurId } });
    expect(n).toBe(1);
  });

  it('ne fait JAMAIS échouer l’action métier', async () => {
    // Une cible inexistante ferait échouer l'INSERT ; journaliser avale.
    await expect(
      journaliser(base.prisma, {
        action: 'x',
        cibleType: 'y',
        acteurId: '00000000-0000-0000-0000-000000000000',
      }),
    ).resolves.toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
describe('erreurs et contexte', () => {
  it('porte un code stable et un message traduit', () => {
    const e = erreurs.debitDepasse('4 min');
    expect(e.code).toBe('DEBIT_DEPASSE');
    expect(e.statut).toBe(429);
    expect(e.versReponse('fr').message).toBe('Trop de tentatives. Réessayez dans 4 min.');
    expect(e.versReponse('en').message).toBe('Too many attempts. Try again in 4 min.');
  });

  it('reporte l’identifiant de corrélation, pour qu’on puisse le citer', () => {
    expect(erreurs.introuvable().versReponse('fr', 'abc-123').correlation).toBe('abc-123');
  });

  it('masque l’adresse électronique — R-C10', () => {
    // Un journal se copie, s'exporte, part chez un prestataire.
    expect(masquerEmail('miora@jp.mg')).toBe('mi***@jp.mg');
    expect(masquerEmail('pas-une-adresse')).toBe('***');
  });
});
