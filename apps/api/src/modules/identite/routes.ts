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
    quoi: 'Vérification du code OTP et ouverture de session',
  },
  {
    methode: 'POST',
    chemin: '/identite/connexion',
    quoi: 'Connexion classique par email et mot de passe',
  },
] as const;

/**
 * Fonction d'assemblage des routes.
 * NOTE : Dans ton architecture, c'est le point d'entrée qui appelle cette fonction.
 */
export function enregistrerRoutes(app: FastifyInstance, db: PrismaClient) {
  const limiteur = new Limiteur(); // Rate limiting pour éviter le spam d'OTP

  // 1. Envoi d'OTP
  app.post('/identite/otp/emettre', async (req, reply) => {
    const resultat = auth.demanderCodeOptSchema.safeParse(req.body);
    if (!resultat.success) throw erreurs.requeteInvalide();

    // Le schéma contient désormais `finalite` (avec valeur par défaut).
    const donnees = {
      email: resultat.data.email,
      finalite: resultat.data.finalite ?? 'inscription' as const,
    };

    // Limitation : max 1 envoi par minute, 5 par heure
    const cle = `otp:${donnees.email}`;
    const verdict = await limiteur.verifier(cle, REGLES.ecriture);
    if (!verdict.autorise) throw erreurs.debitDepasse(`${verdict.attendreS}s`);

    const reponse = await service.demanderCode(db, donnees);
    reply.code(202); // Accepté, traitement en cours
    return reponse;
  });

  // 2. Vérification OTP et session
  app.post('/identite/otp/verifier', async (req, reply) => {
    const resultat = auth.verifierCodeOptSchema.safeParse(req.body);
    if (!resultat.success) throw erreurs.requeteInvalide();

    // ⬇️ CONSTRUCTION ROBUSTE POUR LE SERVICE (gère le `exactOptionalPropertyTypes`)
    const donnees: { email: string; code: string; prenom?: string; motDePasse?: string } = {
      email: resultat.data.email,
      code: resultat.data.code,
    };
    if (resultat.data.prenom) donnees.prenom = resultat.data.prenom;
    if (resultat.data.motDePasse) donnees.motDePasse = resultat.data.motDePasse;

    // On limite aussi la vérification à 5 tentatives par 10 minutes.
    const cle = `otp-verif:${donnees.email}`;
    const verdict = await limiteur.verifier(cle, { max: 5, fenetreMs: 600_000 });
    if (!verdict.autorise) throw erreurs.debitDepasse(`${verdict.attendreS}s`);

    const reponse = await service.verifierCode(db, donnees);
    return reply.code(200).send(reponse);
  });

  // 3. Connexion par mot de passe
  app.post('/identite/connexion', async (req, reply) => {
    const resultat = auth.connexionEmailSchema.safeParse(req.body);
    if (!resultat.success) throw erreurs.requeteInvalide();

    const reponse = await service.connexionEmailMotDePasse(db, resultat.data);
    return reply.code(200).send(reponse);
  });
}