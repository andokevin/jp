import {z} from "zod";

/**
 * Schémas Zod pour l'authentification
 * Source unique du contrat API
 */

// -- type de base --

export const email = z.string().email({message: "L'adresse e-mail n'est pas valide."});
export const codeOtp = z.string().length(6, {message: "Le code OTP doit contenir exactement 6 caractères."});
export const password = z.string().min(8, {message: "Le mot de passe doit contenir au moins 8 caractères."});
export const prenom = z.string().min(1, {message: "Le prénom est requis."});
export const genre = z.enum(["Homme", "Femme", "Autre"], {message: "Le genre doit être 'Homme', 'Femme' ou 'Autre'."});

// -- fonctions de validation --
export const demanderCodeOptSchema = z.object({ email, });
export type DemanderCodeOptSchema = z.infer<typeof demanderCodeOptSchema>;
export const verifierCodeOptSchema = z.object({
    email,
    code: codeOtp,
    prenom: prenom.optional(),
    genre: genre.optional(),
    langue: z.enum(["fr", "en"]).default("fr"),
});
export type VerifierCodeOptSchema = z.infer<typeof verifierCodeOptSchema>;

export const connexionEmailSchema = z.object({
    email,
    password,
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
 * Réponse  de session aprés authentification
 */
export const ReponseSessionSchema = z.object({
    token: z.string(),
    user: z.object({
        id: z.string(),
        email: z.string().email(),
        prenom: z.string().nullable(),
        genre: z.enum(["Homme", "Femme", "Autre"]).nullable(),
        langue: z.enum(["fr", "en"]),
        isNew: z.boolean(),
    }),
    expiresAt: z.number(),
});
export type ReponseSession = z.infer<typeof ReponseSessionSchema>;

/** Réponse après la demande de code OTP */
export const ReponseOtpSchema = z.object({
    message: z.string(),
    resendAfter: z.number(),
});
export type ReponseOtp = z.infer<typeof ReponseOtpSchema>;

/** Réponse  d'erreur */
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