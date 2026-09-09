/**
 * Identite — accès aux données
 *
 * Les seules requêtes SQL du domaine. **Interne au module** : aucun autre
 * module n'a le droit d'importer ce fichier, la règle est appliquée par
 * ESLint.
 *
 * Contrat API et tables Prisma parlent maintenant le même vocabulaire
 * (anglais). Le mapping v2↔fr introduit à l'étape 1b-① est enlevé : le
 * schéma Zod `VerifyOtpSchema` s'accorde directement avec `UserCreateInput`.
 */
import type { PrismaClient } from '../../genere/prisma/client.js';
import type { auth } from '@jp/contracts';

export const depot = {
  /** Cherche un utilisateur par email. */
  async trouverParEmail(db: PrismaClient, email: string) {
    return db.user.findUnique({ where: { email } });
  },

  /** Crée un utilisateur complet + son profil acheteur (si nécessaire). */
  async creerUtilisateur(
    db: PrismaClient,
    params: auth.VerifyOtpSchema & { passwordFingerprint?: string | null },
  ) {
    return db.user.create({
      data: {
        email: params.email,
        ...(params.passwordFingerprint ? { passwordFingerprint: params.passwordFingerprint } : {}),
        ...(params.firstName ? { firstName: params.firstName } : {}),
        ...(params.lastName ? { lastName: params.lastName } : {}),
        ...(params.gender ? { gender: params.gender as never } : {}),
        ...(params.language ? { language: params.language } : {}),
        ...(params.birthDate ? { birthDate: params.birthDate } : {}),
        ...(params.phone ? { phone: params.phone } : {}),
        ...(params.photoUrl ? { photoUrl: params.photoUrl } : {}),
        ...(params.clothingPreferences && params.clothingPreferences.length > 0
          ? {
              buyerProfile: {
                create: {
                  clothingPreferences: params.clothingPreferences,
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
    userId: string,
    clothingPreferences: string[],
  ) {
    return db.buyerProfile.upsert({
      where: { userId },
      create: { userId, clothingPreferences },
      update: { clothingPreferences },
    });
  },

  /** Met à jour le mot de passe d'un utilisateur. */
  async definirMotDePasse(db: PrismaClient, userId: string, passwordFingerprint: string) {
    return db.user.update({
      where: { id: userId },
      data: { passwordFingerprint, passwordUpdatedAt: new Date() },
    });
  },

  /** Enregistre un code OTP haché. */
  async enregistrerCodeOtp(db: PrismaClient, email: string, codeHash: string, expiresAt: Date) {
    return db.otpCode.create({
      data: { email, codeHash, expiresAt },
    });
  },

  /** Récupère le dernier OTP actif pour un email. */
  async trouverDernierOtp(db: PrismaClient, email: string) {
    return db.otpCode.findFirst({
      where: { email, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  },

  /** Incrémente le compteur de tentatives d'un OTP. */
  async incrementerTentativeOtp(db: PrismaClient, id: string) {
    return db.otpCode.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  },

  /** Marque l'OTP comme consommé après vérification réussie. */
  async consommerOtp(db: PrismaClient, id: string) {
    return db.otpCode.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  },
} as const;
