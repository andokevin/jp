/**
 * temps-reel.test.ts — S6
 *
 * Le test décisif est celui de la resynchronisation : une coupure ne doit
 * rien faire perdre.
 */
import { describe, expect, it, vi } from 'vitest';
import {
  brancherDiffusion,
  DebitConnexion,
  nomCanal,
  publier,
  Registre,
  TAILLE_HISTORIQUE,
  type Connexion,
} from '../src/temps-reel/index.js';

/** Une fausse socket qui note ce qu'on lui envoie. */
function socketFactice(readyState = 1) {
  const recus: string[] = [];
  return {
    socket: { readyState, send: (m: string) => recus.push(m) } as never,
    recus,
  };
}

function lire(recus: readonly string[]) {
  return recus.map((r) => JSON.parse(r) as { canal: string; sequence: number; type: string });
}

describe('canaux et abonnements', () => {
  it('nomme un canal par son type et sa cible', () => {
    expect(nomCanal('direct', 'abc')).toBe('direct:abc');
    expect(nomCanal('commande', 'c1')).toBe('commande:c1');
  });

  it('ne diffuse qu’aux abonnés du canal', () => {
    const r = new Registre();
    const a = socketFactice();
    const b = socketFactice();
    const ca = r.ouvrir(a.socket);
    const cb = r.ouvrir(b.socket);
    r.abonner(ca.id, 'direct:1');
    r.abonner(cb.id, 'direct:2');

    r.diffuser('direct:1', 'message', { texte: 'bonjour' });

    expect(a.recus).toHaveLength(1);
    expect(b.recus).toHaveLength(0);
  });

  it('oublie une connexion fermée', () => {
    const r = new Registre();
    const a = socketFactice();
    const c = r.ouvrir(a.socket);
    r.abonner(c.id, 'direct:1');
    expect(r.nbConnexions('direct:1')).toBe(1);
    r.fermer(c.id);
    expect(r.nbConnexions('direct:1')).toBe(0);
    expect(r.nbConnexions()).toBe(0);
  });

  it('une socket qui lève ne coupe pas la diffusion pour les autres', () => {
    const r = new Registre();
    const casse: Connexion = r.ouvrir({
      readyState: 1,
      send: () => {
        throw new Error('socket morte');
      },
    } as never);
    const bon = socketFactice();
    const cb = r.ouvrir(bon.socket);
    r.abonner(casse.id, 'direct:1');
    r.abonner(cb.id, 'direct:1');

    expect(() => r.diffuser('direct:1', 'x', {})).not.toThrow();
    expect(bon.recus).toHaveLength(1); // l'autre a bien reçu
    expect(r.nbConnexions('direct:1')).toBe(1); // la cassée a été retirée
  });

  it('n’envoie rien sur une socket qui n’est pas ouverte', () => {
    const r = new Registre();
    const f = socketFactice(3); // CLOSED
    const c = r.ouvrir(f.socket);
    r.abonner(c.id, 'direct:1');
    r.diffuser('direct:1', 'x', {});
    expect(f.recus).toHaveLength(0);
  });
});

describe('resynchronisation — S6.3, LE test qui compte', () => {
  it('rend exactement ce qui a été manqué pendant la coupure', () => {
    const r = new Registre();
    const avant = socketFactice();
    const c = r.ouvrir(avant.socket);
    r.abonner(c.id, 'direct:1');

    r.diffuser('direct:1', 'message', { n: 1 });
    r.diffuser('direct:1', 'message', { n: 2 });
    const dernierRecu = lire(avant.recus).at(-1)!.sequence; // = 2

    // ── coupure : la connexion tombe, trois messages passent ──
    r.fermer(c.id);
    r.diffuser('direct:1', 'stock', { restant: 3 });
    r.diffuser('direct:1', 'message', { n: 3 });
    r.diffuser('direct:1', 'stock', { restant: 2 });

    // ── reconnexion : le client annonce où il en était ──
    const delta = r.resynchroniser('direct:1', dernierRecu);
    expect(delta).not.toBeNull();
    expect(delta!.map((m) => m.sequence)).toEqual([3, 4, 5]);
    expect(delta![0]!.donnees).toEqual({ restant: 3 });
  });

  it('rend un delta vide si rien n’a été manqué', () => {
    const r = new Registre();
    r.diffuser('direct:1', 'x', {});
    expect(r.resynchroniser('direct:1', r.sequenceActuelle('direct:1'))).toEqual([]);
  });

  it('exige un rechargement complet si le retard dépasse l’historique', () => {
    // Livrer un état troué en silence serait pire que d'avouer le trou.
    const r = new Registre();
    for (let i = 0; i < TAILLE_HISTORIQUE + 10; i++) r.diffuser('direct:1', 'x', { i });
    expect(r.resynchroniser('direct:1', 0)).toBeNull();
  });

  it('numérote par canal, indépendamment', () => {
    const r = new Registre();
    r.diffuser('direct:1', 'x', {});
    r.diffuser('direct:1', 'x', {});
    r.diffuser('direct:2', 'x', {});
    expect(r.sequenceActuelle('direct:1')).toBe(2);
    expect(r.sequenceActuelle('direct:2')).toBe(1);
  });

  it('borne l’historique — la mémoire ne grossit pas indéfiniment', () => {
    const r = new Registre();
    for (let i = 0; i < TAILLE_HISTORIQUE * 2; i++) r.diffuser('direct:1', 'x', { i });
    const tout = r.resynchroniser('direct:1', TAILLE_HISTORIQUE);
    expect(tout).not.toBeNull();
    expect(tout!.length).toBeLessThanOrEqual(TAILLE_HISTORIQUE);
  });
});

describe('diffusion par événement — S6.2', () => {
  it('un module publie, le registre diffuse — sans qu’ils se connaissent', () => {
    // `contenu` n'a pas à savoir qu'un WebSocket existe.
    const r = new Registre();
    const f = socketFactice();
    const c = r.ouvrir(f.socket);
    r.abonner(c.id, 'commande:c1');

    const debrancher = brancherDiffusion(r);
    publier({ canal: 'commande:c1', type: 'statut', donnees: { statut: 'PAYEE' } });

    expect(lire(f.recus)).toHaveLength(1);
    expect(lire(f.recus)[0]!.type).toBe('statut');

    debrancher();
    publier({ canal: 'commande:c1', type: 'statut', donnees: {} });
    expect(f.recus).toHaveLength(1); // plus rien après débranchement
  });
});

describe('limitation par connexion — S6.4', () => {
  it('coupe au-delà du plafond', () => {
    const d = new DebitConnexion(3, 10_000);
    expect(d.autorise('c1')).toBe(true);
    expect(d.autorise('c1')).toBe(true);
    expect(d.autorise('c1')).toBe(true);
    expect(d.autorise('c1')).toBe(false);
  });

  it('compte PAR CONNEXION, pas par adresse', () => {
    // Couper l'adresse punirait tout un cybercafé.
    const d = new DebitConnexion(1, 10_000);
    expect(d.autorise('c1')).toBe(true);
    expect(d.autorise('c2')).toBe(true);
    expect(d.autorise('c1')).toBe(false);
  });

  it('rouvre après la fenêtre', () => {
    vi.useFakeTimers();
    const d = new DebitConnexion(1, 1_000);
    expect(d.autorise('c1')).toBe(true);
    expect(d.autorise('c1')).toBe(false);
    vi.advanceTimersByTime(1_500);
    expect(d.autorise('c1')).toBe(true);
    vi.useRealTimers();
  });
});
