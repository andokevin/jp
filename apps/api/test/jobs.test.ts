/**
 * jobs.test.ts — S5 · la garantie : un travail rejoué n'agit qu'une fois
 *
 * Le test décisif est `S5.4` : on tue le travailleur EN PLEIN TRAVAIL, on le
 * relance, et on vérifie que l'effet ne s'est produit qu'une fois.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { RedisContainer, type StartedRedisContainer } from '@testcontainers/redis';
import { Queue, Worker } from 'bullmq';
import { empiler, FILES, OPTIONS_DEFAUT } from '../src/jobs/index.js';
import { reconcilier, traiterReference } from '../src/jobs/reference.js';
import { demarrerBase, type BaseDeTest } from './conteneur.js';

let base: BaseDeTest;
let redis: StartedRedisContainer;
let connexion: { host: string; port: number; maxRetriesPerRequest: null };

beforeAll(async () => {
  base = await demarrerBase();
  redis = await new RedisContainer('redis:7-alpine').start();
  connexion = { host: redis.getHost(), port: redis.getPort(), maxRetriesPerRequest: null };
  process.env['REDIS_URL'] = `redis://${redis.getHost()}:${redis.getPort()}`;
}, 300_000);

afterAll(async () => {
  await redis?.stop();
  await base?.arreter();
});

const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('les files', () => {
  it('déclare les six files du projet', () => {
    expect(Object.keys(FILES)).toHaveLength(6);
    expect(FILES).toHaveProperty('expiration-reservation');
  });

  it('n’efface jamais un échec — la file d’échecs est à comprendre', () => {
    expect(OPTIONS_DEFAUT.removeOnFail).toBe(false);
    expect(OPTIONS_DEFAUT.attempts).toBeGreaterThan(1);
  });

  it('refuse d’empiler DEUX FOIS la même clé métier', async () => {
    // Sans ça, un incident réseau qui fait réessayer l'appelant crée deux
    // travaux — et deux remises en stock.
    const cle = `essai-${crypto.randomUUID()}`;
    const q = new Queue('reconciliation', { connection: connexion });
    await q.add('t', { x: 1 }, { jobId: cle });
    await q.add('t', { x: 1 }, { jobId: cle });
    expect(await q.getJobCountByTypes('waiting', 'delayed')).toBe(1);
    await q.obliterate({ force: true });
    await q.close();
  });
});

describe('le travailleur de référence', () => {
  it('traite une fois, et ne refait rien au rejeu', async () => {
    const cle = `ref-${crypto.randomUUID()}`;
    const traitement = traiterReference(base.prisma);

    // On appelle le traitement DEUX fois, comme BullMQ le ferait après une
    // redistribution.
    const faux = (n: number) =>
      ({ data: { cleMetier: cle, cibleId: 'c1' }, attemptsMade: n }) as never;
    await traitement(faux(0));
    await traitement(faux(1));

    const n = await base.prisma.journalAudit.count({
      where: { action: 'socle.reference.traite', cibleId: cle },
    });
    expect(n).toBe(1); // ← la garantie
  });

  it('S5.4 — tué en plein travail puis relancé, l’effet ne se produit qu’une fois', async () => {
    const cle = `tue-${crypto.randomUUID()}`;
    const nomFile = 'reconciliation';
    const q = new Queue(nomFile, { connection: connexion });
    await q.add('reference', { cleMetier: cle, cibleId: 'c2' }, { jobId: cle, attempts: 3 });

    // Premier travailleur : il commence, puis on le TUE avant qu'il n'accuse
    // réception. BullMQ redistribuera le travail.
    let commence = false;
    const tueur = new Worker(
      nomFile,
      async () => {
        commence = true;
        await attendre(3_000); // on ne finira pas
      },
      { connection: connexion, lockDuration: 1_000 },
    );
    await new Promise<void>((r) => {
      const i = setInterval(() => {
        if (commence) {
          clearInterval(i);
          r();
        }
      }, 50);
    });
    await tueur.close(true); // fermeture BRUTALE, sans attendre

    // Second travailleur : le vrai traitement, idempotent.
    const survivant = new Worker(nomFile, traiterReference(base.prisma), {
      connection: connexion,
      concurrency: 1,
    });
    await new Promise<void>((r) => {
      survivant.on('completed', () => r());
      survivant.on('failed', () => r());
    });
    await survivant.close();

    const n = await base.prisma.journalAudit.count({
      where: { action: 'socle.reference.traite', cibleId: cle },
    });
    expect(n).toBe(1); // ← l'effet ne s'est produit QU'UNE FOIS
    await q.obliterate({ force: true });
    await q.close();
  }, 120_000);
});

describe('réconciliation au démarrage — S5.3', () => {
  it('retrouve le travail en souffrance DEPUIS LA BASE, pas depuis Redis', async () => {
    // Redis peut avoir perdu des travaux, ou en porter d'obsolètes. La base,
    // elle, sait ce qui n'a pas été traité (D2).
    await base.prisma.cleIdempotence.create({
      data: {
        cle: `souffrance-${crypto.randomUUID()}`,
        methode: 'POST',
        chemin: '/x',
        empreinteRequete: 'abc',
        creeLe: new Date(Date.now() - 10 * 60_000), // vieille de 10 min
        expireLe: new Date(Date.now() + 3_600_000),
      },
    });

    const empilees: string[] = [];
    const n = await reconcilier(base.prisma, async (cle) => {
      empilees.push(cle);
    });
    expect(n).toBeGreaterThanOrEqual(1);
    expect(empilees.length).toBe(n);
  });

  it('ignore ce qui est récent — une requête en cours n’est pas en souffrance', async () => {
    const cle = `recente-${crypto.randomUUID()}`;
    await base.prisma.cleIdempotence.create({
      data: {
        cle,
        methode: 'POST',
        chemin: '/x',
        empreinteRequete: 'abc',
        expireLe: new Date(Date.now() + 3_600_000),
      },
    });
    const empilees: string[] = [];
    await reconcilier(base.prisma, async (c) => {
      empilees.push(c);
    });
    expect(empilees).not.toContain(cle);
  });
});

describe('empiler', () => {
  it('rend l’identifiant du travail', async () => {
    const id = await empiler('reconciliation', 'essai', { a: 1 }, { cleMetier: `e-${Date.now()}` });
    expect(id).toBeTruthy();
    const q = new Queue('reconciliation', { connection: connexion });
    await q.obliterate({ force: true });
    await q.close();
  });
});
