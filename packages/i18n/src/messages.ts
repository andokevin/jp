/**
 * Les catalogues de messages
 *
 * **Un seul objet, les trois langues côte à côte.** Deux fichiers séparés
 * dérivent : on ajoute une clé dans l'un, on oublie l'autre, et le trou ne se
 * voit qu'en production. Ici, une clé manquante fait échouer la compilation —
 * `CATALOGS` est contraint à `Record<Language, Messages>`.
 *
 * Le contenu est volontairement maigre : ce sont les messages transverses dont
 * la plateforme (`S3`) a besoin. Chaque domaine apportera les siens avec sa
 * fonctionnalité. Un message sans code qui l'affiche est du poids mort.
 *
 * **Convention de clé** : `domaine.chose_precise`. Jamais de message générique
 * du genre « une erreur est survenue » : un refus sans motif ni action possible
 * est un défaut, pas une simplification.
 */
import { DEFAULT_LANGUAGE, type Language } from './languages.js';

const EN = {
  // ── Transverse ────────────────────────────────────────────────────────────
  'error.invalid_request': 'Some information is missing or incorrect.',
  'error.unauthenticated': 'Please sign in to continue.',
  'error.unauthorized': 'You do not have access to this.',
  'error.not_found': 'This no longer exists.',
  'error.conflict': 'Someone changed this while you were working on it.',
  'error.rate_limited': 'Too many attempts. Try again in {duration}.',
  'error.offline': 'No connection. Your changes are saved and will be sent.',
  'error.unavailable': 'The service is briefly unavailable. Try again shortly.',

  // ── Idempotence (RB10) ────────────────────────────────────────────────────
  'error.idempotency_key_missing': 'This request must carry an idempotency key.',
  'error.idempotency_key_reused': 'This key was already used for another request.',

  // ── Code à usage unique (R-C5 à R-C10) ───────────────────────────────────
  'otp.sent': 'We sent a 6-digit code to {email}.',
  'otp.expired': 'This code has expired. Request a new one.',
  'otp.invalid': 'This code is not correct. {remaining} attempts left.',
  'otp.exhausted': 'Too many wrong attempts. Request a new code.',

  // ── États d'écran (les quatre, imposés par le design system) ──────────────
  'state.loading': 'Loading…',
  'state.empty': 'Nothing here yet.',
  'state.error': 'Could not load. Tap to retry.',
  'state.offline': 'Offline — showing what we last saved.',

  // ── Erreurs spécifiques à l'identité (Ajouté pour F0.1) ───────────────────
  'error.otp_invalid': 'This code is not correct. {remaining} attempts left.',
  'error.otp_expired': 'This code has expired. Request a new one.',
  'error.otp_attempts_exhausted': 'Too many wrong attempts. Request a new code.',
  'error.otp_rate_limited': 'Too many requests. Try again in {duration}.',
  'error.email_already_used': 'This email is already in use.',
  'error.invalid_credentials': 'Email or password is incorrect.',
  'error.invalid_external_token': 'The external token is invalid.',
  'error.email_unverified': 'Please verify your email before continuing.',
} as const;

type Messages = Record<keyof typeof EN, string>;

const FR: Messages = {
  // ── Transverse ────────────────────────────────────────────────────────────
  'error.invalid_request': 'Une information manque ou est incorrecte.',
  'error.unauthenticated': 'Connectez-vous pour continuer.',
  'error.unauthorized': "Vous n'avez pas accès à ceci.",
  'error.not_found': "Ceci n'existe plus.",
  'error.conflict': "Quelqu'un a modifié ceci pendant que vous y travailliez.",
  'error.rate_limited': 'Trop de tentatives. Réessayez dans {duration}.',
  'error.offline': 'Pas de connexion. Vos modifications sont gardées.',
  'error.unavailable': 'Service indisponible un instant. Réessayez.',

  // ── Idempotence (RB10) ────────────────────────────────────────────────────
  'error.idempotency_key_missing': "Cette requête doit porter une clé d'idempotence.",
  'error.idempotency_key_reused': 'Cette clé a déjà servi pour une autre requête.',

  // ── Code à usage unique (R-C5 à R-C10) ───────────────────────────────────
  'otp.sent': 'Code à 6 chiffres envoyé à {email}.',
  'otp.expired': 'Ce code a expiré. Demandez-en un nouveau.',
  'otp.invalid': 'Ce code est incorrect. {remaining} essais restants.',
  'otp.exhausted': 'Trop d’essais incorrects. Demandez un nouveau code.',

  // ── États d'écran ─────────────────────────────────────────────────────────
  'state.loading': 'Chargement…',
  'state.empty': 'Rien ici pour le moment.',
  'state.error': 'Chargement échoué. Réessayer.',
  'state.offline': 'Hors ligne — voici ce qui était enregistré.',

  // ── Erreurs spécifiques à l'identité (Ajouté pour F0.1) ───────────────────
  'error.otp_invalid': 'Ce code est incorrect. {remaining} essais restants.',
  'error.otp_expired': 'Ce code a expiré. Demandez-en un nouveau.',
  'error.otp_attempts_exhausted': 'Trop d’essais incorrects. Demandez un nouveau code.',
  'error.otp_rate_limited': 'Trop de requêtes. Réessayez dans {duration}.',
  'error.email_already_used': 'Adresse e-mail déjà utilisée.',
  'error.invalid_credentials': 'E-mail ou mot de passe incorrect.',
  'error.invalid_external_token': 'Le jeton externe est invalide.',
  'error.email_unverified': 'Vérifiez votre e-mail avant de continuer.',
};

/**
 * Le malgache — la language parlée, celle que les écrans proposent en premier.
 *
 * Traductions à FAIRE RELIRE par un locuteur avant mise en production : elles
 * sont proposées ici pour que le type tienne et que les écrans aient de quoi
 * s'afficher, pas certifiées.
 */
const MG: Messages = {
  // ── Transverse ────────────────────────────────────────────────────────────
  'error.invalid_request': 'Misy tsy feno na diso ny fampahalalana.',
  'error.unauthenticated': 'Midira aloha vao manohy.',
  'error.unauthorized': 'Tsy manana alalana amin’ity ianao.',
  'error.not_found': 'Tsy misy intsony ity.',
  'error.conflict': 'Nisy nanova ity raha mbola niasa ianao.',
  'error.rate_limited': 'Be loatra ny andrana. Andramo indray afaka {duration}.',
  'error.offline': 'Tsy misy fifandraisana. Voatahiry ny fanovanao.',
  'error.unavailable': 'Tsy mandeha vetivety ny serivisy. Andramo indray.',

  // ── Idempotence (RB10) ────────────────────────────────────────────────────
  'error.idempotency_key_missing': 'Mila fanalahidy idempotence ity fangatahana ity.',
  'error.idempotency_key_reused': 'Efa nampiasaina io fanalahidy io taloha.',

  // ── Code à usage unique (R-C5 à R-C10) ───────────────────────────────────
  'otp.sent': 'Kaody miisa 6 nalefa tany amin’ny {email}.',
  'otp.expired': 'Lany daty ity kaody ity. Mangataha vaovao.',
  'otp.invalid': 'Diso ity kaody ity. {remaining} andrana sisa.',
  'otp.exhausted': 'Be loatra ny diso. Mangataha kaody vaovao.',

  // ── États d'écran (les quatre, imposés par le design system) ──────────────
  'state.loading': 'Eo am-pakana…',
  'state.empty': 'Mbola tsy misy na inona na inona.',
  'state.error': 'Tsy tafiditra. Tsindrio hanandrana.',
  'state.offline': 'Tsy misy fifandraisana — ity ny voatahiry.',

  // ── Erreurs spécifiques à l'identité (Ajouté pour F0.1) ───────────────────
  'error.otp_invalid': 'Diso ny kaody. Andramo indray. {remaining} sisa.',
  'error.otp_expired': 'Lany daty ity kaody ity. Mangataha vaovao.',
  'error.otp_attempts_exhausted': 'Be loatra ny diso. Mangataha kaody vaovao.',
  'error.otp_rate_limited': 'Be loatra ny fangatahana. Andramo afaka {duration}.',
  'error.email_already_used': 'Efa ampiasaina io adiresy mailaka io.',
  'error.invalid_credentials': 'Diso ny mailaka na ny tenimiafina.',
  'error.invalid_external_token': 'Tsy mety ny jeton ivelany.',
  'error.email_unverified': 'Hamarino aloha ny mailakao vao manohy.',
};

export const CATALOGS: Record<Language, Messages> = { en: EN, fr: FR, mg: MG };

export type MessageKey = keyof typeof EN;

export const KEYS = Object.keys(EN) as readonly MessageKey[];

/**
 * Traduit une clé, en remplaçant les variables `{name}` par leur valeur.
 *
 * Ne renvoie JAMAIS `undefined` : une clé inconnue retombe sur le français,
 * puis sur la clé elle-même. Un écran doit afficher quelque chose de moche
 * plutôt que rien — mais le typage de `MessageKey` rend le cas presque
 * impossible à atteindre depuis notre propre code.
 */
export function translate(
  key: MessageKey,
  language: Language = DEFAULT_LANGUAGE,
  variables: Readonly<Record<string, string | number>> = {},
): string {
  const template = CATALOGS[language][key] ?? CATALOGS[DEFAULT_LANGUAGE][key] ?? key;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in variables ? String(variables[name]) : whole,
  );
}

/** Les variables `{name}` attendues par un message donné. */
export function variablesOf(key: MessageKey): readonly string[] {
  return [...CATALOGS.en[key].matchAll(/\{(\w+)\}/g)].map((m) => m[1] as string);
}
