/**
 * Identite — déclaration des routes
 *
 * Validation Zod depuis `@jp/contracts`. **Aucune logique métier ici** :
 * une route lit la requête, appelle le service, met en forme la réponse.
 */
import type { FastifyInstance } from 'fastify';
import type { PrismaClient } from '../../genere/prisma/client.js';
import { auth } from '@jp/contracts';
import { service } from './service.js';
import { Limiteur, REGLES } from '../../plateforme/debit.js';
import { erreurs } from '../../plateforme/erreurs.js';

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

export function enregistrerRoutes(app: FastifyInstance, db: PrismaClient) {
  const limiteur = new Limiteur();

  // 1. Envoi d'OTP
  app.post('/identite/otp/emettre', async (req, reply) => {
    const resultat = auth.requestOtpSchema.safeParse(req.body);
    if (!resultat.success) throw erreurs.requeteInvalide();

    const donnees = {
      email: resultat.data.email,
      purpose: resultat.data.purpose ?? ('signup' as const),
    };

    const cle = `otp:${donnees.email}`;
    const verdict = await limiteur.verifier(cle, REGLES.ecriture);
    if (!verdict.autorise) throw erreurs.debitDepasse(`${verdict.attendreS}s`);

    const reponse = await service.demanderCode(db, donnees);
    reply.code(202);
    return reponse;
  });

  // 2. Vérification OTP et création de compte complet
  app.post('/identite/otp/verifier', async (req, reply) => {
    const resultat = auth.verifyOtpSchema.safeParse(req.body);
    if (!resultat.success) throw erreurs.requeteInvalide();

    const cle = `otp-verif:${resultat.data.email}`;
    const verdict = await limiteur.verifier(cle, { max: 5, fenetreMs: 600_000 });
    if (!verdict.autorise) throw erreurs.debitDepasse(`${verdict.attendreS}s`);

    // ⬇️ On passe le résultat complet (le service gère l'upsert des profils)
    const reponse = await service.verifierCode(db, resultat.data);
    return reply.code(200).send(reponse);
  });

  // 3. Connexion par mot de passe
  app.post('/identite/connexion', async (req, reply) => {
    const resultat = auth.emailLoginSchema.safeParse(req.body);
    if (!resultat.success) throw erreurs.requeteInvalide();

    const reponse = await service.connexionEmailMotDePasse(db, resultat.data);
    return reply.code(200).send(reponse);
  });
}
