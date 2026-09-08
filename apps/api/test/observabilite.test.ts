/**
 * observabilite.test.ts — S10
 *
 * Le test qui compte : aucune donnée personnelle ne sort dans un journal.
 */
import { describe, expect, it, beforeEach } from 'vitest';
import {
  ALERTES,
  alertesActives,
  Collecteur,
  EVENEMENTS,
  nettoyer,
} from '../src/observabilite/index.js';

describe('S10.1 — aucune donnée personnelle dans un journal', () => {
  it('retire les secrets, à n’importe quelle profondeur', () => {
    // Un journal se copie, s'exporte, part chez un prestataire : il ne
    // bénéficie d'aucune des protections de la base.
    const sale = {
      userId: 'u1',
      password: 'hunter2',
      niveau2: {
        token: 'abc.def.ghi',
        niveau3: { code: '123456', cin: '101234567890', phone: '+261341234567' },
      },
    };
    const propre = JSON.stringify(nettoyer(sale));

    expect(propre).not.toContain('hunter2');
    expect(propre).not.toContain('abc.def.ghi');
    expect(propre).not.toContain('123456');
    expect(propre).not.toContain('101234567890');
    expect(propre).not.toContain('+261341234567');
    expect(propre).toContain('u1'); // l'identifiant technique reste
  });

  it('MASQUE l’adresse au lieu de la retirer — R-C10', () => {
    // `mi***@jp.mg` suffit à reconnaître un compte pendant un incident, sans
    // constituer un annuaire.
    const propre = nettoyer({ email: 'miora@jp.mg' }) as { email: string };
    expect(propre.email).toBe('mi***@jp.mg');
    expect(propre.email).not.toContain('miora@');
  });

  it('nettoie aussi dans les tableaux', () => {
    const propre = JSON.stringify(nettoyer({ liste: [{ token: 'secret' }] }));
    expect(propre).not.toContain('secret');
  });

  it('s’arrête sur une structure cyclique ou trop profonde', () => {
    let profond: Record<string, unknown> = { fin: true };
    for (let i = 0; i < 20; i++) profond = { niveau: profond };
    expect(() => nettoyer(profond)).not.toThrow();
    expect(JSON.stringify(nettoyer(profond))).toContain('trop profond');
  });
});

describe('S10.2 — métriques', () => {
  let c: Collecteur;
  beforeEach(() => {
    c = new Collecteur();
  });

  it('compte et cumule', () => {
    c.compter('a');
    c.compter('a', 4);
    expect(c.instantane().compteurs['a']).toBe(5);
  });

  it('observe la moyenne et le pic', () => {
    c.observer('latence', 100);
    c.observer('latence', 300);
    const h = c.instantane().histogrammes['latence']!;
    expect(h.n).toBe(2);
    expect(h.somme).toBe(400);
    expect(h.max).toBe(300); // le pic, pas seulement la moyenne
  });

  it('lit une jauge à la demande', () => {
    let profondeur = 7;
    c.jauge('file.attente', () => profondeur);
    expect(c.instantane().jauges['file.attente']).toBe(7);
    profondeur = 12;
    expect(c.instantane().jauges['file.attente']).toBe(12);
  });

  it('une jauge cassée ne casse pas la page de métriques', () => {
    c.jauge('cassee', () => {
      throw new Error('base injoignable');
    });
    expect(() => c.instantane()).not.toThrow();
    expect(c.instantane().jauges['cassee']).toBe(-1);
  });
});

describe('S10.3 — les événements d’usage', () => {
  it('couvre l’entonnoir complet, du compte aux fonds libérés', () => {
    // Ils dessinent les entonnoirs du pilote. Ajoutés après le lancement,
    // ils ne diraient rien du lancement.
    const noms = Object.values(EVENEMENTS);
    for (const attendu of [
      'compte.cree',
      'article.publie',
      'reservation.prise',
      'commande.creee',
      'paiement.reussi',
      'reception.confirmee',
      'fonds.liberes',
    ]) {
      expect(noms, attendu).toContain(attendu);
    }
  });

  it('nomme les échecs autant que les succès', () => {
    // Un entonnoir qui ne compte que les réussites ne dit pas où on perd.
    expect(Object.values(EVENEMENTS)).toContain('paiement.echoue');
    expect(Object.values(EVENEMENTS)).toContain('reservation.expiree');
  });
});

describe('S10.4 — les quatre alertes', () => {
  it('sont exactement quatre, et chacune dit POURQUOI elle réveille', () => {
    // Une alerte qu'on ignore parce qu'elle sonne tous les jours ne protège
    // plus rien.
    expect(ALERTES).toHaveLength(4);
    for (const a of ALERTES) {
      expect(a.pourquoi.length, a.nom).toBeGreaterThan(40);
      expect(a.seuil.length, a.nom).toBeGreaterThan(5);
    }
  });

  it('ne sonnent pas quand tout va bien', () => {
    expect(alertesActives({ compteurs: {}, histogrammes: {}, jauges: {} })).toEqual([]);
  });

  it('UNE SEULE écriture financière échouée suffit à réveiller', () => {
    // Aucun seuil de tolérance : de l'argent dans un état indéterminé.
    const actives = alertesActives({
      compteurs: { 'finance.ecriture.echec': 1 },
      histogrammes: {},
      jauges: {},
    });
    expect(actives.map((a) => a.nom)).toContain('ecriture-financiere-echouee');
  });

  it('la file d’expiration en retard réveille — RB1 côté disponibilité', () => {
    const actives = alertesActives({
      compteurs: {},
      histogrammes: {},
      jauges: { 'file.expiration-reservation.age_ms': 400_000 },
    });
    expect(actives.map((a) => a.nom)).toContain('file-expiration-en-retard');
  });

  it('le taux d’échec de paiement attend un échantillon suffisant', () => {
    const vide = { histogrammes: {}, jauges: {} };
    // 3 tentatives sur 3 échouées : trop peu pour conclure.
    expect(
      alertesActives({
        ...vide,
        compteurs: { 'usage.paiement.tente': 3, 'usage.paiement.echoue': 3 },
      }).map((a) => a.nom),
    ).not.toContain('taux-echec-paiement');

    // 100 tentatives, 30 échecs : le prestataire tousse.
    expect(
      alertesActives({
        ...vide,
        compteurs: { 'usage.paiement.tente': 100, 'usage.paiement.echoue': 30 },
      }).map((a) => a.nom),
    ).toContain('taux-echec-paiement');
  });
});
