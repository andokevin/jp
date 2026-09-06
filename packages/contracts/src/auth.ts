import { z } from 'zod';

import { langueSchema } from './commun.js';

/**
 * Schémas Zod pour l'authentification
 * Source unique du contrat API
 */

// -- type de base --

export const email = z.string().email({ message: "L'adresse e-mail n'est pas valide." });
export const codeOtp = z
  .string()
  .length(6, { message: 'Le code OTP doit contenir exactement 6 caractères.' });
export const motDePasse = z
  .string()
  .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' });
export const prenom = z.string().min(1, { message: 'Le prénom est requis.' });
export const nom = z.string().min(1, { message: 'Le nom est requis.' });
export const genre = z.enum(['femme', 'homme', 'autre'], {
  message: "Le genre doit être 'femme', 'homme' ou 'autre'.",
});

// ⬇️ Téléphone (contact de livraison, PAS un identifiant)
export const telephone = z
  .string()
  .regex(/^0[0-9]{9}$/, { message: 'Le téléphone doit contenir 10 chiffres et commencer par 0.' });

// ⬇️ Date de naissance (obligatoire pour publier des vidéos — RB6)
export const dateDeNaissance = z.coerce
  .date({
    // Ici, on utilise simplement `message` (ou rien du tout)
    message: 'La date de naissance est invalide.',
  })
  .refine((date) => date <= new Date(), {
    message: 'La date de naissance ne peut pas être dans le futur.',
  })
  .refine((date) => {
    const age = new Date().getFullYear() - date.getFullYear();
    const mois = new Date().getMonth() - date.getMonth();
    const ageVerifie = age - (mois < 0 || (mois === 0 && new Date().getDate() < date.getDate()) ? 1 : 0);
    return ageVerifie >= 18;
  }, { message: 'Vous devez avoir au moins 18 ans.' });
  
//  Préférences de vêtements (profil_acheteur)
export const preferencesVetement = z.array(z.string()).max(3, {
  message: 'Maximum 3 préférences de vêtements.',
});

// ⬇️ Photo de profil (URL)
export const photoUrl = z.string().url({ message: "L'URL de la photo est invalide." }).optional();

// -- fonctions de validation --

export const demanderCodeOptSchema = z.object({
  email,
  finalite: z.enum(['inscription', 'connexion']).optional().default('inscription'),
});
export type DemanderCodeOptSchema = z.infer<typeof demanderCodeOptSchema>;

// ⬇️ Étape d'inscription complète (souvent appelée après l'OTP)
export const verifierCodeOptSchema = z.object({
  email,
  code: codeOtp,
  // Données du profil utilisateur
  prenom: prenom.optional(),
  nom: nom.optional(),
  genre: genre.optional(),
  // Dérivé de `LANGUES` (@jp/i18n) : une langue ajoutée là-bas vaut ici sans
  // qu'on ait à y penser. Une énumération recopiée finit toujours par diverger.
  langue: langueSchema.default('fr'),
  dateNaissance: dateDeNaissance.optional(),
  telephone: telephone.optional(),
  photoUrl: photoUrl,
  // Mot de passe optionnel (défini à l'inscription ou plus tard)
  motDePasse: motDePasse.optional(),
  // Préférences acheteur (stockées dans profil_acheteur)
  preferencesVetement: preferencesVetement.optional(),
});
export type VerifierCodeOptSchema = z.infer<typeof verifierCodeOptSchema>;

export const connexionEmailSchema = z.object({
  email,
  motDePasse,
});
export type ConnexionEmailSchema = z.infer<typeof connexionEmailSchema>;

/* Connexion via fournisseur externe (Google/Facebook) */
export const ConnexionExterneSchema = z.object({
  provider: z.enum(['google', 'facebook']),
  token: z.string().min(1, { message: 'Le token du fournisseur est requis' }),
});
export type ConnexionExterne = z.infer<typeof ConnexionExterneSchema>;

// Réponse

/**
 * Réponse de session après authentification.
 *
 * **Décrit ce que le serveur renvoie vraiment**, pas ce qu'on aurait aimé
 * qu'il renvoie : `service.verifierCode` et `service.connexionEmailMotDePasse`
 * rendent des clés françaises, comme le reste de `contracts`. Le schéma
 * annonçait `{ token, user, expiresAt }` ; aucun client ne pouvait l'utiliser
 * pour lire une réponse réelle — un contrat qu'on ne peut pas parser n'est pas
 * un contrat, c'est un commentaire.
 *
 * `genre` et `langue` n'y figurent pas : le serveur ne les renvoie pas. Les
 * déclarer obligerait chaque client à gérer un champ qui n'arrive jamais.
 */
export const ReponseSessionSchema = z.object({
  jeton: z.string(),
  /** Horodatage epoch en millisecondes — `Date.now() + SESSION_TTL_MS`. */
  expireLe: z.number(),
  utilisateur: z.object({
    id: z.string(),
    email: z.string().email(),
    prenom: z.string().nullable(),
    /** Un compte créé par code n'a pas de mot de passe tant qu'il n'en pose pas. */
    hasPassword: z.boolean(),
    /** Vrai si ce parcours vient de créer le compte — l'écran prénom en dépend. */
    isNew: z.boolean(),
  }),
});
export type ReponseSession = z.infer<typeof ReponseSessionSchema>;

/**
 * Réponse à la demande de code.
 *
 * **Identique que le compte existe ou non** *(R-C9)* : c'est la raison d'être
 * de sa pauvreté. Elle ne porte ni message ni délai de renvoi — seulement la
 * durée de validité du code, la même pour tout le monde.
 */
export const ReponseOtpSchema = z.object({
  ok: z.boolean(),
  /** Durée de validité en secondes — `OTP_TTL_SECONDS`. */
  expireDansS: z.number(),
});
export type ReponseOtp = z.infer<typeof ReponseOtpSchema>;

/** Réponse d'erreur */
export const ReponseErreurSchema = z.object({
  code: z.string(),
  message: z.string(),
  action: z.string().optional(),
  fields: z.record(z.string(), z.string()).optional(),
  correlation: z.string().optional(),
});
export type ReponseErreur = z.infer<typeof ReponseErreurSchema>;

// ── Constantes ──

export const OTP_TTL_SECONDS = 600; // 10 minutes
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RATE_LIMITS = {
  perMinute: 1,
  perHour: 5,
  perDay: 10,
} as const;

export const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 jours