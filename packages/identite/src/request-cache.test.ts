/**
 * F0.1 — RequestCache : TTL, horloge injectable, isolation entre emails
 *
 * On pilote la classe avec une horloge MANUELLE (`clock.now`) : on avance —
 * ou on recule — le temps par écriture directe. Zéro `setTimeout`, zéro
 * sommeil. Si un test dit « à t=61 s l'entrée est partie », c'est parce que
 * la logique de lecture fonctionne, pas parce qu'on a vraiment attendu.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { RequestCache, sharedRequestCache } from './request-cache.js';

/**
 * Mini horloge factice. `now` est un champ mutable ; les tests avancent le
 * temps en l'écrivant. `read` capture `clock` dans sa closure et rend la
 * valeur courante à chaque appel — la classe reçoit `clock.read` en second
 * argument de son constructeur.
 */
function fakeClock(): { now: number; read: () => number } {
  const clock = { now: 0, read: () => clock.now };
  return clock;
}

describe('RequestCache', () => {
  it('set puis get immédiat : rend la réponse avec un décompte frais', () => {
    const clock = fakeClock();
    const cache = new RequestCache(60_000, clock.read);

    cache.set('a@jp.test', { ok: true, expiresInS: 600 });
    const hit = cache.get('a@jp.test');

    expect(hit).toEqual({ ok: true, expiresInS: 600 });
  });

  it('après 30 s : expiresInS est DÉCRÉMENTÉ pour refléter le temps écoulé', () => {
    // Toute la raison d'être du stockage en deadline absolue plutôt qu'en
    // `expiresInS` brut. Un « 10 minutes restantes » servi 30 s plus tard
    // serait un mensonge à l'écran.
    const clock = fakeClock();
    const cache = new RequestCache(60_000, clock.read);

    cache.set('a@jp.test', { ok: true, expiresInS: 600 });
    clock.now += 30_000;

    expect(cache.get('a@jp.test')).toEqual({ ok: true, expiresInS: 570 });
  });

  it('à t=59 s : encore un hit (frontière basse du TTL)', () => {
    const clock = fakeClock();
    const cache = new RequestCache(60_000, clock.read);

    cache.set('a@jp.test', { ok: true, expiresInS: 600 });
    clock.now += 59_000;

    expect(cache.get('a@jp.test')).not.toBeNull();
  });

  it('à t=60 s pile : miss, ET l\'entrée expirée est retirée de la Map', () => {
    // Deux assertions pour une seule règle. La première prouve que le get
    // rend `null` (visible). La seconde prouve que l'entrée a été
    // SUPPRIMÉE de la Map, pas juste filtrée à la sortie (invisible mais
    // essentiel : sans le delete, un process long fuirait de la mémoire).
    //
    // L'astuce du « faire reculer l'horloge » n'est possible que parce
    // qu'elle est injectée. Si l'entrée était encore dans la Map, la
    // reculer sous cacheDeadlineMs la ressusciterait ; ici elle reste
    // absente.
    const clock = fakeClock();
    const cache = new RequestCache(60_000, clock.read);

    cache.set('a@jp.test', { ok: true, expiresInS: 600 });
    clock.now += 60_000;

    expect(cache.get('a@jp.test')).toBeNull();

    clock.now -= 30_000;
    expect(cache.get('a@jp.test')).toBeNull();
  });

  it('deux emails différents sont isolés', () => {
    // Un cache qui fuirait entre emails rendrait le mauvais décompte et,
    // pire, dirait « vous avez déjà un code » pour une adresse jamais
    // utilisée.
    const clock = fakeClock();
    const cache = new RequestCache(60_000, clock.read);

    cache.set('a@jp.test', { ok: true, expiresInS: 600 });
    cache.set('b@jp.test', { ok: true, expiresInS: 300 });

    expect(cache.get('a@jp.test')).toEqual({ ok: true, expiresInS: 600 });
    expect(cache.get('b@jp.test')).toEqual({ ok: true, expiresInS: 300 });
    expect(cache.get('c@jp.test')).toBeNull();
  });

  it('set sur un email existant ÉCRASE l\'entrée précédente', () => {
    // Scénario légitime : l'entrée précédente venait d'expirer au bord du
    // TTL, l'appel réseau est parti, la réponse fraîche arrive et doit
    // remplacer ce qui pouvait rester.
    const clock = fakeClock();
    const cache = new RequestCache(60_000, clock.read);

    cache.set('a@jp.test', { ok: true, expiresInS: 600 });
    clock.now += 40_000;
    cache.set('a@jp.test', { ok: true, expiresInS: 600 }); // réponse fraîche

    // On lit la NOUVELLE deadline — 600 s depuis maintenant, pas 560 s.
    expect(cache.get('a@jp.test')).toEqual({ ok: true, expiresInS: 600 });
  });

  it('clear() vide tout le cache', () => {
    const clock = fakeClock();
    const cache = new RequestCache(60_000, clock.read);

    cache.set('a@jp.test', { ok: true, expiresInS: 600 });
    cache.set('b@jp.test', { ok: true, expiresInS: 600 });
    cache.clear();

    expect(cache.get('a@jp.test')).toBeNull();
    expect(cache.get('b@jp.test')).toBeNull();
  });
});

describe('sharedRequestCache', () => {
  // Le singleton est exercé pour de vrai par le hook. Ici on prouve
  // seulement qu'il existe, qu'il utilise `Date.now` (pas notre horloge
  // factice) et qu'on peut le vider.
  beforeEach(() => sharedRequestCache.clear());

  it('est une instance fonctionnelle de RequestCache', () => {
    sharedRequestCache.set('shared@jp.test', { ok: true, expiresInS: 600 });
    const hit = sharedRequestCache.get('shared@jp.test');

    expect(hit).toEqual({ ok: true, expiresInS: expect.any(Number) });
    // Marge d'une seconde : le test peut prendre quelques ms entre le set
    // et le get, donc `expiresInS` peut valoir 600 ou 599, pas moins.
    expect(hit!.expiresInS).toBeGreaterThan(598);
    expect(hit!.expiresInS).toBeLessThanOrEqual(600);
  });
});
