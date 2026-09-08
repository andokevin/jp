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
  'erreur.requete_invalide': 'Some information is missing or incorrect.',
  'erreur.non_authentifie': 'Please sign in to continue.',
  'erreur.non_autorise': 'You do not have access to this.',
  'erreur.introuvable': 'This no longer exists.',
  'erreur.conflit': 'Someone changed this while you were working on it.',
  'erreur.debit_depasse': 'Too many attempts. Try again in {duree}.',
  'erreur.hors_ligne': 'No connection. Your changes are saved and will be sent.',
  'erreur.indisponible': 'The service is briefly unavailable. Try again shortly.',

  // ── Idempotence (RB10) ────────────────────────────────────────────────────
  'erreur.cle_idempotence_manquante': 'This request must carry an idempotency key.',
  'erreur.cle_idempotence_reutilisee': 'This key was already used for another request.',

  // ── Code à usage unique (R-C5 à R-C10) ───────────────────────────────────
  'otp.envoye': 'We sent a 6-digit code to {email}.',
  'otp.expire': 'This code has expired. Request a new one.',
  'otp.invalide': 'This code is not correct. {restantes} attempts left.',
  'otp.epuise': 'Too many wrong attempts. Request a new code.',

  // ── États d'écran (les quatre, imposés par le design system) ──────────────
  'etat.chargement': 'Loading…',
  'etat.vide': 'Nothing here yet.',
  'etat.erreur': 'Could not load. Tap to retry.',
  'etat.hors_ligne': 'Offline — showing what we last saved.',

  // ── Erreurs spécifiques à l'identité (Ajouté pour F0.1) ───────────────────
  'erreur.otp_invalide': 'This code is not correct. {restantes} attempts left.',
  'erreur.otp_expire': 'This code has expired. Request a new one.',
  'erreur.otp_tentatives_depassees': 'Too many wrong attempts. Request a new code.',
  'erreur.otp_debit_depasse': 'Too many requests. Try again in {duree}.',
  'erreur.email_deja_utilise': 'This email is already in use.',
  'erreur.identifiants_incorrects': 'Email or password is incorrect.',
  'erreur.token_externe_invalide': 'The external token is invalid.',
  'erreur.email_non_verifie': 'Please verify your email before continuing.',
} as const;

type Messages = Record<keyof typeof EN, string>;

const FR: Messages = {
  // ── Transverse ────────────────────────────────────────────────────────────
  'erreur.requete_invalide': 'Une information manque ou est incorrecte.',
  'erreur.non_authentifie': 'Connectez-vous pour continuer.',
  'erreur.non_autorise': "Vous n'avez pas accès à ceci.",
  'erreur.introuvable': "Ceci n'existe plus.",
  'erreur.conflit': "Quelqu'un a modifié ceci pendant que vous y travailliez.",
  'erreur.debit_depasse': 'Trop de tentatives. Réessayez dans {duree}.',
  'erreur.hors_ligne': 'Pas de connexion. Vos modifications sont gardées.',
  'erreur.indisponible': 'Service indisponible un instant. Réessayez.',

  // ── Idempotence (RB10) ────────────────────────────────────────────────────
  'erreur.cle_idempotence_manquante': "Cette requête doit porter une clé d'idempotence.",
  'erreur.cle_idempotence_reutilisee': 'Cette clé a déjà servi pour une autre requête.',

  // ── Code à usage unique (R-C5 à R-C10) ───────────────────────────────────
  'otp.envoye': 'Code à 6 chiffres envoyé à {email}.',
  'otp.expire': 'Ce code a expiré. Demandez-en un nouveau.',
  'otp.invalide': 'Ce code est incorrect. {restantes} essais restants.',
  'otp.epuise': 'Trop d’essais incorrects. Demandez un nouveau code.',

  // ── États d'écran ─────────────────────────────────────────────────────────
  'etat.chargement': 'Chargement…',
  'etat.vide': 'Rien ici pour le moment.',
  'etat.erreur': 'Chargement échoué. Réessayer.',
  'etat.hors_ligne': 'Hors ligne — voici ce qui était enregistré.',

  // ── Erreurs spécifiques à l'identité (Ajouté pour F0.1) ───────────────────
  'erreur.otp_invalide': 'Ce code est incorrect. {restantes} essais restants.',
  'erreur.otp_expire': 'Ce code a expiré. Demandez-en un nouveau.',
  'erreur.otp_tentatives_depassees': 'Trop d’essais incorrects. Demandez un nouveau code.',
  'erreur.otp_debit_depasse': 'Trop de requêtes. Réessayez dans {duree}.',
  'erreur.email_deja_utilise': 'Adresse e-mail déjà utilisée.',
  'erreur.identifiants_incorrects': 'E-mail ou mot de passe incorrect.',
  'erreur.token_externe_invalide': 'Le jeton externe est invalide.',
  'erreur.email_non_verifie': 'Vérifiez votre e-mail avant de continuer.',
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
  'erreur.requete_invalide': 'Misy tsy feno na diso ny fampahalalana.',
  'erreur.non_authentifie': 'Midira aloha vao manohy.',
  'erreur.non_autorise': 'Tsy manana alalana amin’ity ianao.',
  'erreur.introuvable': 'Tsy misy intsony ity.',
  'erreur.conflit': 'Nisy nanova ity raha mbola niasa ianao.',
  'erreur.debit_depasse': 'Be loatra ny andrana. Andramo indray afaka {duree}.',
  'erreur.hors_ligne': 'Tsy misy fifandraisana. Voatahiry ny fanovanao.',
  'erreur.indisponible': 'Tsy mandeha vetivety ny serivisy. Andramo indray.',

  // ── Idempotence (RB10) ────────────────────────────────────────────────────
  'erreur.cle_idempotence_manquante': 'Mila fanalahidy idempotence ity fangatahana ity.',
  'erreur.cle_idempotence_reutilisee': 'Efa nampiasaina io fanalahidy io taloha.',

  // ── Code à usage unique (R-C5 à R-C10) ───────────────────────────────────
  'otp.envoye': 'Kaody miisa 6 nalefa tany amin’ny {email}.',
  'otp.expire': 'Lany daty ity kaody ity. Mangataha vaovao.',
  'otp.invalide': 'Diso ity kaody ity. {restantes} andrana sisa.',
  'otp.epuise': 'Be loatra ny diso. Mangataha kaody vaovao.',

  // ── États d'écran (les quatre, imposés par le design system) ──────────────
  'etat.chargement': 'Eo am-pakana…',
  'etat.vide': 'Mbola tsy misy na inona na inona.',
  'etat.erreur': 'Tsy tafiditra. Tsindrio hanandrana.',
  'etat.hors_ligne': 'Tsy misy fifandraisana — ity ny voatahiry.',

  // ── Erreurs spécifiques à l'identité (Ajouté pour F0.1) ───────────────────
  'erreur.otp_invalide': 'Diso ny kaody. Andramo indray. {restantes} sisa.',
  'erreur.otp_expire': 'Lany daty ity kaody ity. Mangataha vaovao.',
  'erreur.otp_tentatives_depassees': 'Be loatra ny diso. Mangataha kaody vaovao.',
  'erreur.otp_debit_depasse': 'Be loatra ny fangatahana. Andramo afaka {duree}.',
  'erreur.email_deja_utilise': 'Efa ampiasaina io adiresy mailaka io.',
  'erreur.identifiants_incorrects': 'Diso ny mailaka na ny tenimiafina.',
  'erreur.token_externe_invalide': 'Tsy mety ny jeton ivelany.',
  'erreur.email_non_verifie': 'Hamarino aloha ny mailakao vao manohy.',
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
