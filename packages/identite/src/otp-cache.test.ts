/**
 * Cache 60 s des demandes OTP — les règles, prouvées sans React
 *
 * Ce qui est vérifié ici n'est pas « le hook utilise le cache » mais les
 * décisions que le cache prend : quand renvoyer une entrée, quand la refuser,
 * comment recalculer le décompte. Un test qui passerait par un `renderHook`
 * ferait double emploi avec les tests intégrés du mobile/web.
 */
import { describe, expect, it } from 'vitest';
import type { auth } from '@jp/contracts';

import { CACHE_TTL_MS, newEntry, readCache, remainingExpiresInS } from './otp-cache.js';

/** Réponse serveur type — code valable 10 min. */
const response: auth.OtpResponse = { ok: true, expiresInS: 600 };

describe('otp-cache', () => {
  describe('readCache', () => {
    it('rend null quand l’email n’a jamais été demandé', () => {
      const cache = new Map();
      expect(readCache(cache, 'a@jp.mg', 0)).toBeNull();
    });

    it('rend l’entrée quand elle est fraîche des deux côtés (TTL + serveur)', () => {
      const cache = new Map([['a@jp.mg', newEntry(response, 1_000)]]);
      // 10 s plus tard — largement dans les 60 s ET dans les 600 s.
      expect(readCache(cache, 'a@jp.mg', 11_000)).not.toBeNull();
    });

    it('rend null exactement à la frontière du TTL local (60 s pile)', () => {
      // Frontière `>=` : à 60 s pile, l'entrée est déjà expirée. Sans cette
      // règle, une entrée « juste sur le fil » resterait ambiguë.
      const cache = new Map([['a@jp.mg', newEntry(response, 0)]]);
      expect(readCache(cache, 'a@jp.mg', CACHE_TTL_MS)).toBeNull();
    });

    it('rend null quand le TTL local est dépassé', () => {
      const cache = new Map([['a@jp.mg', newEntry(response, 0)]]);
      // 61 s plus tard.
      expect(readCache(cache, 'a@jp.mg', 61_000)).toBeNull();
    });

    it('rend null quand le code serveur est mort, même si le TTL local tient', () => {
      // Réponse d'un code de 5 s seulement — cas limite, mais possible si le
      // serveur a rendu un `expiresInS` très court.
      const shortResponse: auth.OtpResponse = { ok: true, expiresInS: 5 };
      const cache = new Map([['a@jp.mg', newEntry(shortResponse, 0)]]);
      // 10 s plus tard, on est encore dans les 60 s de cache mais le code est
      // périmé côté serveur — inutile de rejouer.
      expect(readCache(cache, 'a@jp.mg', 10_000)).toBeNull();
    });

    it('n’attribue le hit qu’à l’email demandé', () => {
      const cache = new Map([['a@jp.mg', newEntry(response, 0)]]);
      expect(readCache(cache, 'b@jp.mg', 10_000)).toBeNull();
    });
  });

  describe('remainingExpiresInS', () => {
    it('rend le temps restant à la seconde près', () => {
      const entry = newEntry(response, 0);
      // 30 s après le dépôt, il reste 570 s sur un code de 600 s.
      expect(remainingExpiresInS(entry, 30_000)).toBe(570);
    });

    it('rend 0 plutôt qu’un nombre négatif au-delà de l’expiration', () => {
      // Filet : `readCache` aurait dû trier en amont, mais un consommateur
      // maladroit ne verrait pas un « -100 » de décompte.
      const entry = newEntry(response, 0);
      expect(remainingExpiresInS(entry, 700_000)).toBe(0);
    });
  });

  describe('newEntry', () => {
    it('encapsule la réponse et l’instant du dépôt', () => {
      const entry = newEntry(response, 42);
      expect(entry).toEqual({ response, storedAtMs: 42 });
    });
  });
});
