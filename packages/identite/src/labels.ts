/**
 * Les libellés des trois écrans — repris de la maquette, mot pour mot
 *
 * **Pourquoi ils ne sont pas dans `@jp/i18n`.** Les catalogues partagés
 * imposent deux choses que ces chaînes-là ne peuvent pas tenir : un équivalent
 * ANGLAIS pour chaque clé, et une longueur mesurée contre lui. Or ces textes
 * n'existent qu'en malgache et en français — ce sont les mots de la maquette,
 * et les traduire en anglais pour satisfaire un test inventerait une langue
 * que personne ne lira sur cet écran. Les messages d'ERREUR, eux, restent dans
 * `@jp/i18n` : c'est le serveur qui les rend, déjà traduits.
 *
 * La bascule n'offre que MG et FR. Une personne arrivée en anglais lit le
 * français — la langue écrite courante à Madagascar.
 */
import type { Language } from '@jp/i18n';

export const SCREEN_LANGUAGES = ['mg', 'fr'] as const;
export type ScreenLanguage = (typeof SCREEN_LANGUAGES)[number];

export function screenLanguage(language: Language): ScreenLanguage {
  return language === 'mg' ? 'mg' : 'fr';
}

interface Labels {
  readonly brandTail: string;
  readonly screen1Title: string;
  readonly screen1Support: string;
  readonly screen1Label: string;
  readonly screen1Example: string;
  readonly screen1Help: string;
  readonly screen1Button: string;
  readonly screen2Title: string;
  readonly screen2Sent: string;
  readonly screen2Label: string;
  readonly screen2Validity: string;
  readonly screen2Resend: string;
  readonly screen2Button: string;
  readonly screen3Title: string;
  readonly screen3Label: string;
  readonly screen3Example: string;
  readonly screen3Help: string;
  readonly screen3Button: string;
  /**
   * Prend la place de `ecran1Soutien` quand on revient d'une session périmée.
   *
   * Les deux ne sont jamais utiles ensemble : « nous vous enverrons un code »
   * explique ce qui va se passer, « votre session a expiré » explique pourquoi
   * vous êtes là — et sous-entend la même suite. La boîte de soutien réserve
   * déjà deux lignes, donc l'échange ne décale rien.
   */
  readonly sessionExpired: string;
  readonly waiting: string;
  readonly edit: string;
  readonly offline: string;
  readonly languageOf: Readonly<Record<ScreenLanguage, string>>;
}

const MG: Labels = {
  brandTail: ' — Je prends',
  screen1Title: 'Ampidiro ny mailakao',
  screen1Support: 'Handefasanay kaody miisa 6',
  screen1Label: 'ADIRESY MAILAKA',
  screen1Example: 'anarana@ohatra.mg',
  screen1Help: 'Raha tsy mbola manana kaonty ianao, hoforonina ho anao izy',
  screen1Button: 'Tohizana',
  screen2Title: 'Ampidiro ny kaody',
  screen2Sent: 'Nalefa tany amin’ny',
  screen2Label: 'KAODY MIISA 6',
  screen2Validity: 'Manan-kery mandra-pahatongan’ny {time}',
  screen2Resend: 'Alefaso indray ny kaody',
  screen2Button: 'Hamarino',
  screen3Title: 'Iza no anaranao ?',
  screen3Label: 'ANARANA',
  screen3Example: 'Hanta',
  screen3Help: 'Ho hitan’ny fivarotana io anarana io amin’ny baiko ataonao',
  screen3Button: 'Manomboka',
  // ⚠ NON CERTIFIÉE — proposée, en attente de relecture par un locuteur, au
  // même titre que les vingt-et-une autres.
  sessionExpired: 'Lany daty ny fidiranao. Ampidiro indray ny mailakao.',
  waiting: 'Andrasana...',
  edit: 'Hanova',
  offline: 'Tsy misy fifandraisana',
  languageOf: { mg: 'MG', fr: 'FR' },
};

const FR: Labels = {
  brandTail: ' — Je prends',
  screen1Title: 'Entrez votre email',
  screen1Support: 'Nous vous enverrons un code à 6 chiffres',
  screen1Label: 'ADRESSE EMAIL',
  screen1Example: 'nom@exemple.mg',
  screen1Help: 'Si vous n’avez pas encore de compte, il sera créé pour vous',
  screen1Button: 'Continuer',
  screen2Title: 'Entrez le code',
  screen2Sent: 'Envoyé à',
  screen2Label: 'CODE À 6 CHIFFRES',
  screen2Validity: 'Valide encore {time}',
  screen2Resend: 'Renvoyer le code',
  screen2Button: 'Vérifier',
  screen3Title: 'Comment vous appelez-vous ?',
  screen3Label: 'PRÉNOM',
  screen3Example: 'Hanta',
  screen3Help: 'Les boutiques verront ce prénom sur vos commandes',
  screen3Button: 'Commencer',
  sessionExpired: 'Votre session a expiré. Entrez à nouveau votre adresse.',
  waiting: 'Veuillez patienter...',
  edit: 'Changer',
  offline: 'Pas de connexion',
  languageOf: { mg: 'MG', fr: 'FR' },
};

export const LABELS: Readonly<Record<ScreenLanguage, Labels>> = { mg: MG, fr: FR };

/** Remplace `{time}` — même convention que `translate` de `@jp/i18n`. */
export function withTime(template: string, time: string): string {
  return template.replace('{time}', time);
}
