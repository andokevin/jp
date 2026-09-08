/**
 * Le serveur — S3.1
 *
 * Fastify, un seul service, seize modules. Pas de micro-services : à cette
 * taille d'équipe, le coût de coordination dépasse le gain d'isolation.
 *
 * Ce fichier **assemble** les huit briques de la plateforme. Il ne contient
 * aucune logique métier, et n'importe aucun module de domaine — la règle est
 * appliquée par ESLint.
 */
import { randomUUID } from 'node:crypto';
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { EN_TETES } from '@jp/contracts';
import { languageFromHeader } from '@jp/i18n';
import { avecContexte, type Contexte } from './contexte.js';
import { ErreurMetier, erreurInterne } from './erreurs.js';
import { jetonDepuisEnTete, verifierJeton, type Identite } from './auth.js';
import { Limiteur } from './debit.js';
import type { PrismaClient } from '../genere/prisma/client.js';
declare module 'fastify' {
  interface FastifyRequest {
    contexte: Contexte;
    identite: Identite | null;
  }
}

export interface OptionsServeur {
  readonly db: PrismaClient;
  readonly limiteur?: Limiteur;
  readonly journaux?: boolean;
  readonly modules?: (app: FastifyInstance, db: PrismaClient) => void;
}

export async function creerServeur(options: OptionsServeur): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.journaux === false ? false : { level: process.env['LOG_LEVEL'] ?? 'info' },
    // Fastify fabrique son propre identifiant ; on impose le nôtre, qui
    // vient de l'en-tête s'il existe. C'est ce qui permet de suivre une
    // requête depuis l'application mobile jusqu'à la file asynchrone.
    genReqId: (req) => (req.headers[EN_TETES.correlation.toLowerCase()] as string) ?? randomUUID(),
    disableRequestLogging: false,
    trustProxy: true,
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: true, credentials: true });

  const limiteur = options.limiteur ?? new Limiteur();
  app.decorate('limiteur', limiteur);

  // ── Le contexte, posé avant tout le reste ────────────────────────────────
  app.addHook('onRequest', async (req, reply) => {
    const jeton = jetonDepuisEnTete(req.headers.authorization);
    const identite = jeton ? await verifierJeton(options.db, jeton) : null;

    const contexte: Contexte = {
      correlation: String(req.id),
      langue: languageFromHeader(req.headers['accept-language']),
      ...(identite ? { utilisateurId: identite.utilisateurId } : {}),
      ...(req.ip ? { adresseIp: req.ip } : {}),
      economieDonnees: req.headers[EN_TETES.economieDonnees.toLowerCase()] === '1',
    };

    req.contexte = contexte;
    req.identite = identite;
    // Le client peut citer cet identifiant dans un signalement.
    reply.header(EN_TETES.correlation, contexte.correlation);
  });

  // `AsyncLocalStorage` doit envelopper le TRAITEMENT, pas seulement le hook :
  // sans ça, le contexte serait perdu au premier `await` du gestionnaire.
  app.addHook('preHandler', (req, _reply, suite) => {
    avecContexte(req.contexte, suite);
  });

  // ── Une seule sortie pour les erreurs ────────────────────────────────────
  app.setErrorHandler((erreur, req, reply) => {
    const langue = req.contexte?.langue ?? 'fr';
    const correlation = req.contexte?.correlation ?? String(req.id);

    if (erreur instanceof ErreurMetier) {
      // Une situation prévue : on répond proprement, sans bruit dans les
      // journaux — un 404 n'est pas un incident.
      return reply.status(erreur.statut).send(erreur.versReponse(langue, correlation));
    }

    // Fastify range les erreurs de validation dans `validation`. Le type est
    // `unknown` côté gestionnaire, d'où la vérification explicite.
    const validation = (
      erreur as {
        validation?: readonly {
          instancePath?: string;
          params?: Record<string, unknown>;
          message?: string;
        }[];
      }
    ).validation;
    if (validation) {
      const champs: Record<string, string> = {};
      for (const v of validation) {
        champs[String(v.instancePath || v.params?.['missingProperty'] || '?')] = v.message ?? '';
      }
      return reply.status(400).send({
        code: 'REQUETE_INVALIDE',
        message:
          langue === 'fr'
            ? 'Une information manque ou est incorrecte.'
            : 'Some information is missing or incorrect.',
        champs,
        correlation,
      });
    }

    // Inattendue : on journalise TOUT, on ne divulgue RIEN.
    req.log.error({ err: erreur, correlation }, 'erreur non gérée');
    return reply.status(500).send(erreurInterne(correlation, langue));
  });

  app.setNotFoundHandler((req, reply) => {
    const langue = req.contexte?.langue ?? 'fr';
    return reply.status(404).send({
      code: 'INTROUVABLE',
      message: langue === 'fr' ? "Ceci n'existe plus." : 'This no longer exists.',
      correlation: req.contexte?.correlation ?? String(req.id),
    });
  });

  // ── Sonde de vie ─────────────────────────────────────────────────────────
  app.get('/sante', async () => {
    await options.db.$queryRaw`SELECT 1`;
    return { etat: 'ok' };
  });

  if (options.modules) {
    options.modules(app, options.db); // On injecte les routes métier ici
  }

  return app;
}

/**
 * Arrêt propre : on cesse d'accepter, on laisse finir ce qui est en cours, on
 * ferme la base. Sans ça, un déploiement coupe des requêtes en vol — et une
 * requête de paiement coupée est exactement ce que `RB10` doit éviter.
 */
export function arretPropre(app: FastifyInstance, fermerDb: () => Promise<void>): void {
  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.once(signal, () => {
      void (async () => {
        app.log.info(`${signal} reçu — arrêt propre`);
        await app.close();
        await fermerDb();
        process.exit(0);
      })();
    });
  }
}
