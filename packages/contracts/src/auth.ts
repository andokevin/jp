import { z } from 'zod';

import { languageSchema } from './common.js';

/**
 * Schémas Zod pour l'authentification
 * Source unique du contrat API
 */

/**
 * La longueur du code à usage unique — **la source unique**.
 *
 * Elle est déclarée ICI, en haut, et non avec les autres constantes en bas :
 * `otpCode` l'évalue au chargement du module, et un `const` n'existe pas avant
 * sa ligne. La ranger plus bas lèverait une `ReferenceError` à l'import.
 *
 * Les clients l'importent au lieu de recopier `6`. Le jour où le serveur passe
 * à huit chiffres, cette ligne suffit — sinon il faut le savoir dans trois
 * fichiers, dont un qui le cache derrière un `===` littéral.
 */
export const OTP_LENGTH = 6;

// -- schémas de base --
// ⚠ Les IDENTIFIANTS de schéma sont anglais ; les CLÉS JSON restent françaises
// (voir clés d'objet dans les schémas d'objet ci-dessous — réservées à 1b).

export const email = z.string().email({ message: "L'adresse e-mail n'est pas valide." });
export const otpCode = z.string().length(OTP_LENGTH, {
  message: `Le code OTP doit contenir exactement ${OTP_LENGTH} caractères.`,
});
export const password = z
  .string()
  .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' });
export const firstName = z.string().min(1, { message: 'Le prénom est requis.' });
export const lastName = z.string().min(1, { message: 'Le nom est requis.' });
export const gender = z.enum(['femme', 'homme', 'autre'], {
  message: "Le genre doit être 'femme', 'homme' ou 'autre'.",
});

// ⬇️ Téléphone (contact de livraison, PAS un identifiant)
export const phone = z
  .string()
  .regex(/^0[0-9]{9}$/, { message: 'Le téléphone doit contenir 10 chiffres et commencer par 0.' });

// ⬇️ Date de naissance (obligatoire pour publier des vidéos — RB6)
export const birthDate = z.coerce
  .date({
    message: 'La date de naissance est invalide.',
  })
  .refine((date) => date <= new Date(), {
    message: 'La date de naissance ne peut pas être dans le futur.',
  })
  .refine(
    (date) => {
      const age = new Date().getFullYear() - date.getFullYear();
      const monthDiff = new Date().getMonth() - date.getMonth();
      const verifiedAge =
        age - (monthDiff < 0 || (monthDiff === 0 && new Date().getDate() < date.getDate()) ? 1 : 0);
      return verifiedAge >= 18;
    },
    { message: 'Vous devez avoir au moins 18 ans.' },
  );

//  Préférences de vêtements (profil_acheteur)
export const clothingPreferences = z.array(z.string()).max(3, {
  message: 'Maximum 3 préférences de vêtements.',
});

// ⬇️ Photo de profil (URL)
export const photoUrl = z.string().url({ message: "L'URL de la photo est invalide." }).optional();

// -- schémas d'objet (contrat API) --
// ⛔ Les CLÉS ci-dessous voyagent en JSON : `finalite`, `motDePasse`, `prenom`,
// `nom`, `genre`, `langue`, `dateNaissance`, `telephone`, `preferencesVetement`,
// `jeton`, `expireLe`, `utilisateur`, `expireDansS`. Elles restent françaises
// tant que l'étape 1b n'a pas décidé d'une rupture d'API v2.

export const requestOtpSchema = z.object({
  email,
  purpose: z.enum(['signup', 'login']).optional().default('signup'),
});
export type RequestOtpSchema = z.infer<typeof requestOtpSchema>;

// ⬇️ Étape d'inscription complète (souvent appelée après l'OTP)
export const verifyOtpSchema = z.object({
  email,
  code: otpCode,
  // Données du profil utilisateur
  firstName: firstName.optional(),
  lastName: lastName.optional(),
  gender: gender.optional(),
  // Dérivé de `LANGUAGES` (@jp/i18n) : une langue ajoutée là-bas vaut ici sans
  // qu'on ait à y penser. Une énumération recopiée finit toujours par diverger.
  language: languageSchema.default('fr'),
  birthDate: birthDate.optional(),
  phone: phone.optional(),
  photoUrl: photoUrl,
  // Mot de passe optionnel (défini à l'inscription ou plus tard)
  password: password.optional(),
  // Préférences acheteur (stockées dans profil_acheteur)
  clothingPreferences: clothingPreferences.optional(),
});
export type VerifyOtpSchema = z.infer<typeof verifyOtpSchema>;

export const emailLoginSchema = z.object({
  email,
  password: password,
});
export type EmailLoginSchema = z.infer<typeof emailLoginSchema>;

/* Connexion via fournisseur externe (Google/Facebook) */
export const ExternalLoginSchema = z.object({
  provider: z.enum(['google', 'facebook']),
  token: z.string().min(1, { message: 'Le token du fournisseur est requis' }),
});
export type ExternalLogin = z.infer<typeof ExternalLoginSchema>;

// Réponse

/**
 * Réponse de session après authentification.
 *
 * **Décrit ce que le serveur renvoie vraiment**, pas ce qu'on aurait aimé
 * qu'il renvoie : `service.verifyCode` et `service.emailPasswordLogin`
 * rendent des clés françaises, comme le reste de `contracts`. Le schéma
 * annonçait `{ token, user, expiresAt }` ; aucun client ne pouvait l'utiliser
 * pour lire une réponse réelle — un contrat qu'on ne peut pas parser n'est pas
 * un contrat, c'est un commentaire.
 *
 * `genre` et `langue` n'y figurent pas : le serveur ne les renvoie pas. Les
 * déclarer obligerait chaque client à gérer un champ qui n'arrive jamais.
 */
export const SessionResponseSchema = z.object({
  token: z.string(),
  /** Horodatage epoch en millisecondes — `Date.now() + SESSION_TTL_MS`. */
  expiresAt: z.number(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string().nullable(),
    /** Un compte créé par code n'a pas de mot de passe tant qu'il n'en pose pas. */
    hasPassword: z.boolean(),
    /** Vrai si ce parcours vient de créer le compte — l'écran prénom en dépend. */
    isNew: z.boolean(),
  }),
});
export type SessionResponse = z.infer<typeof SessionResponseSchema>;

/**
 * Réponse à la demande de code.
 *
 * **Identique que le compte existe ou non** *(R-C9)* : c'est la raison d'être
 * de sa pauvreté. Elle ne porte ni message ni délai de renvoi — seulement la
 * durée de validité du code, la même pour tout le monde.
 */
export const OtpResponseSchema = z.object({
  ok: z.boolean(),
  /** Durée de validité en secondes — `OTP_TTL_SECONDS`. */
  expiresInS: z.number(),
});
export type OtpResponse = z.infer<typeof OtpResponseSchema>;

/** Réponse d'erreur */
export const ErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  action: z.string().optional(),
  fields: z.record(z.string(), z.string()).optional(),
  correlation: z.string().optional(),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// ── Constantes ──

export const OTP_TTL_SECONDS = 600; // 10 minutes
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RATE_LIMITS = {
  perMinute: 1,
  perHour: 5,
  perDay: 10,
} as const;

export const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 jours
