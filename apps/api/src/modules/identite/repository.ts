/**
 * Identite — accès aux données
 *
 * Les seules requêtes SQL du domaine. **Interne au module** : aucun autre
 * module n’a le droit d’importer ce fichier, la règle est appliquée par
 * ESLint.
 */
import type { PrismaClient } from '../../genere/prisma/client.js';
import type { auth } from '@jp/contracts';

export const depot = {
  /** Cherche un utilisateur par email. */
  async trouverParEmail(db: PrismaClient, email: string) {
    return db.utilisateur.findUnique({ where: { email } });
  },

  /** Crée un utilisateur complet + son profil acheteur (si nécessaire). */
  async creerUtilisateur(
    db: PrismaClient,
    params: auth.VerifierCodeOptSchema & { motDePasseEmpreinte?: string | null },
  ) {
    return db.utilisateur.create({
      data: {
        email: params.email,
        ...(params.motDePasseEmpreinte ? { motDePasseEmpreinte: params.motDePasseEmpreinte } : {}),
        ...(params.prenom ? { prenom: params.prenom } : {}),
        ...(params.nom ? { nom: params.nom } : {}),
        ...(params.genre ? { genre: params.genre as never } : {}),
        ...(params.langue ? { langue: params.langue } : {}),
        ...(params.dateNaissance ? { dateNaissance: params.dateNaissance } : {}),
        ...(params.telephone ? { telephone: params.telephone } : {}),
        ...(params.photoUrl ? { photoUrl: params.photoUrl } : {}),
        // Création du profil acheteur avec les préférences de vêtements
        ...(params.preferencesVetement && params.preferencesVetement.length > 0
          ? {
              profilAcheteur: {
                create: {
                  preferencesVetement: params.preferencesVetement,
                },
              },
            }
          : {}),
      },
    });
  },

  /** Met à jour le profil acheteur (si les préférences arrivent après l'inscription). */
  async mettreAJourProfilAcheteur(
    db: PrismaClient,
    utilisateurId: string,
    preferencesVetement: string[],
  ) {
    return db.profilAcheteur.upsert({
      where: { utilisateurId },
      create: { utilisateurId, preferencesVetement },
      update: { preferencesVetement },
    });
  },

  /** Met à jour le mot de passe d'un utilisateur. */
  async definirMotDePasse(db: PrismaClient, utilisateurId: string, motDePasseEmpreinte: string) {
    return db.utilisateur.update({
      where: { id: utilisateurId },
      data: { motDePasseEmpreinte, motDePasseMajLe: new Date() },
    });
  },

  /** Enregistre un code OTP haché. */
  async enregistrerCodeOtp(db: PrismaClient, email: string, codeEmpreinte: string, expireLe: Date) {
    return db.codeOtp.create({
      data: { email, codeEmpreinte, expireLe },
    });
  },

  /** Récupère le dernier OTP actif pour un email. */
  async trouverDernierOtp(db: PrismaClient, email: string) {
    return db.codeOtp.findFirst({
      where: { email, consommeLe: null, expireLe: { gt: new Date() } },
      orderBy: { creeLe: 'desc' },
    });
  },

  /** Incrémente le compteur de tentatives d'un OTP. */
  async incrementerTentativeOtp(db: PrismaClient, id: string) {
    return db.codeOtp.update({
      where: { id },
      data: { tentatives: { increment: 1 } },
    });
  },

  /** Marque l'OTP comme consommé après vérification réussie. */
  async consommerOtp(db: PrismaClient, id: string) {
    return db.codeOtp.update({
      where: { id },
      data: { consommeLe: new Date() },
    });
  },
} as const;
