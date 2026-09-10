/**
 * Identite — route declarations
 *
 * Zod validation from `@jp/contracts`. **No business logic here** :
 * a route reads the request, calls the service, shapes the response.
 *
 * Writes are wrapped in `executerUneSeuleFois` — RB10. The idempotency
 * key is read ONCE per handler through `lireCleIdempotence`, which also
 * validates its shape ; without that, an ill-formed key would only be
 * caught by the database insert, well past any useful error frontier.
 */
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { PrismaClient } from '../../genere/prisma/client.js';
import { auth, HEADERS, idempotencyKeySchema } from '@jp/contracts';
import { service } from './service.js';
import { Limiteur, REGLES } from '../../plateforme/debit.js';
import { erreurs } from '../../plateforme/erreurs.js';
import { executerUneSeuleFois } from '../../plateforme/idempotence.js';

export const routes = [
  {
    methode: 'POST',
    chemin: '/identite/otp/emettre',
    quoi: 'Demande d’envoi d’un code OTP à 6 chiffres',
  },
  {
    methode: 'POST',
    chemin: '/identite/otp/verifier',
    quoi: 'Vérification du code OTP et ouverture de session complète',
  },
  {
    methode: 'POST',
    chemin: '/identite/connexion',
    quoi: 'Connexion classique par email et mot de passe',
  },
] as const;

/**
 * Read and validate the Idempotency-Key header.
 *
 * Read here rather than inside the handler because the check is uniform
 * across every write route in this module, and duplicating the raw header
 * access is exactly how "one route forgot to validate" happens.
 *
 * Fastify lowercases incoming header names — hence `.toLowerCase()` on the
 * contract constant. Reading `req.headers['Idempotency-Key']` directly would
 * silently return `undefined` on a properly-set header and look like a
 * missing key.
 */
function lireCleIdempotence(req: FastifyRequest): string {
  const brut = req.headers[HEADERS.idempotency.toLowerCase()];
  const cle = typeof brut === 'string' ? brut : undefined;
  const parse = idempotencyKeySchema.safeParse(cle);
  if (!parse.success) throw erreurs.cleIdempotenceManquante();
  return parse.data;
}

export function enregistrerRoutes(app: FastifyInstance, db: PrismaClient) {
  const limiteur = new Limiteur();

  // 1. Send an OTP
  app.post('/identite/otp/emettre', async (req, reply) => {
    // The key is read BEFORE Zod validation of the body. A missing key is a
    // client-side defect (the client library forgot to set the header) and
    // should surface as such — not be masked by a body validation error that
    // happens to trip first.
    const cle = lireCleIdempotence(req);

    const resultat = await executerUneSeuleFois(
      db,
      { cle, methode: 'POST', chemin: '/identite/otp/emettre', corps: req.body },
      async () => {
        // Everything below runs AT MOST ONCE per (key, body-fingerprint).
        //
        // The rate-limiter lives INSIDE the callback : a legitimate transport
        // replay (retry after a broken response) reuses the SAME idempotency
        // key ; it must not consume the user's quota a second time. The
        // fingerprint check already refuses a replay with different content,
        // so a real "second attempt from the user" (new key) still hits the
        // limiter through this same code path.
        const parse = auth.requestOtpSchema.safeParse(req.body);
        if (!parse.success) throw erreurs.requeteInvalide();

        const donnees = {
          email: parse.data.email,
          purpose: parse.data.purpose ?? ('signup' as const),
        };

        const cleLimiteur = `otp:${donnees.email}`;
        const verdict = await limiteur.verifier(cleLimiteur, REGLES.ecriture);
        if (!verdict.autorise) throw erreurs.debitDepasse(`${verdict.attendreS}s`);

        const corps = await service.demanderCode(db, donnees);
        return { status: 202, corps };
      },
    );

    reply.code(resultat.status);
    return resultat.corps;
  });

  // 2. Verify OTP and create full account
    // 2. Verify OTP and create full account
  app.post('/identite/otp/verifier', async (req, reply) => {
    const cle = lireCleIdempotence(req);

    const resultat = await executerUneSeuleFois(
      db,
      { cle, methode: 'POST', chemin: '/identite/otp/verifier', corps: req.body },
      async () => {
        const parse = auth.verifyOtpSchema.safeParse(req.body);
        if (!parse.success) throw erreurs.requeteInvalide();

        const cleLimiteur = `otp-verif:${parse.data.email}`;
        const verdict = await limiteur.verifier(cleLimiteur, { max: 5, fenetreMs: 600_000 });
        if (!verdict.autorise) throw erreurs.debitDepasse(`${verdict.attendreS}s`);

        const corps = await service.verifierCode(db, parse.data);
        return { status: 200, corps };
      },
    );

    reply.code(resultat.status);
    return resultat.corps;
  });
  // 3. Password sign-in
  app.post('/identite/connexion', async (req, reply) => {
    const resultat = auth.emailLoginSchema.safeParse(req.body);
    if (!resultat.success) throw erreurs.requeteInvalide();

    const reponse = await service.connexionEmailMotDePasse(db, resultat.data);
    return reply.code(200).send(reponse);
  });
}