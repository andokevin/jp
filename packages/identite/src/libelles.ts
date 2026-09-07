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
import type { Langue } from '@jp/i18n';

export const LANGUES_ECRAN = ['mg', 'fr'] as const;
export type LangueEcran = (typeof LANGUES_ECRAN)[number];

export function langueEcran(langue: Langue): LangueEcran {
  return langue === 'mg' ? 'mg' : 'fr';
}

interface Libelles {
  readonly marqueSuite: string;
  readonly ecran1Titre: string;
  readonly ecran1Soutien: string;
  readonly ecran1Label: string;
  readonly ecran1Exemple: string;
  readonly ecran1Aide: string;
  readonly ecran1Bouton: string;
  readonly ecran2Titre: string;
  readonly ecran2Envoye: string;
  readonly ecran2Label: string;
  readonly ecran2Validite: string;
  readonly ecran2Renvoi: string;
  readonly ecran2Bouton: string;
  readonly ecran3Titre: string;
  readonly ecran3Label: string;
  readonly ecran3Exemple: string;
  readonly ecran3Aide: string;
  readonly ecran3Bouton: string;
  /**
   * Prend la place de `ecran1Soutien` quand on revient d'une session périmée.
   *
   * Les deux ne sont jamais utiles ensemble : « nous vous enverrons un code »
   * explique ce qui va se passer, « votre session a expiré » explique pourquoi
   * vous êtes là — et sous-entend la même suite. La boîte de soutien réserve
   * déjà deux lignes, donc l'échange ne décale rien.
   */
  readonly sessionExpiree: string;
  readonly attente: string;
  readonly modifier: string;
  readonly horsLigne: string;
  readonly langueDe: Readonly<Record<LangueEcran, string>>;
}

const MG: Libelles = {
  marqueSuite: ' — Je prends',
  ecran1Titre: 'Ampidiro ny mailakao',
  ecran1Soutien: 'Handefasanay kaody miisa 6',
  ecran1Label: 'ADIRESY MAILAKA',
  ecran1Exemple: 'anarana@ohatra.mg',
  ecran1Aide: 'Raha tsy mbola manana kaonty ianao, hoforonina ho anao izy',
  ecran1Bouton: 'Tohizana',
  ecran2Titre: 'Ampidiro ny kaody',
  ecran2Envoye: 'Nalefa tany amin’ny',
  ecran2Label: 'KAODY MIISA 6',
  ecran2Validite: 'Manan-kery mandra-pahatongan’ny {temps}',
  ecran2Renvoi: 'Alefaso indray ny kaody',
  ecran2Bouton: 'Hamarino',
  ecran3Titre: 'Iza no anaranao ?',
  ecran3Label: 'ANARANA',
  ecran3Exemple: 'Hanta',
  ecran3Aide: 'Ho hitan’ny fivarotana io anarana io amin’ny baiko ataonao',
  ecran3Bouton: 'Manomboka',
  // ⚠ NON CERTIFIÉE — proposée, en attente de relecture par un locuteur, au
  // même titre que les vingt-et-une autres.
  sessionExpiree: 'Lany daty ny fidiranao. Ampidiro indray ny mailakao.',
  attente: 'Andrasana...',
  modifier: 'Hanova',
  horsLigne: 'Tsy misy fifandraisana',
  langueDe: { mg: 'MG', fr: 'FR' },
};

const FR: Libelles = {
  marqueSuite: ' — Je prends',
  ecran1Titre: 'Entrez votre email',
  ecran1Soutien: 'Nous vous enverrons un code à 6 chiffres',
  ecran1Label: 'ADRESSE EMAIL',
  ecran1Exemple: 'nom@exemple.mg',
  ecran1Aide: 'Si vous n’avez pas encore de compte, il sera créé pour vous',
  ecran1Bouton: 'Continuer',
  ecran2Titre: 'Entrez le code',
  ecran2Envoye: 'Envoyé à',
  ecran2Label: 'CODE À 6 CHIFFRES',
  ecran2Validite: 'Valide encore {temps}',
  ecran2Renvoi: 'Renvoyer le code',
  ecran2Bouton: 'Vérifier',
  ecran3Titre: 'Comment vous appelez-vous ?',
  ecran3Label: 'PRÉNOM',
  ecran3Exemple: 'Hanta',
  ecran3Aide: 'Les boutiques verront ce prénom sur vos commandes',
  ecran3Bouton: 'Commencer',
  sessionExpiree: 'Votre session a expiré. Entrez à nouveau votre adresse.',
  attente: 'Veuillez patienter...',
  modifier: 'Changer',
  horsLigne: 'Pas de connexion',
  langueDe: { mg: 'MG', fr: 'FR' },
};

export const LIBELLES: Readonly<Record<LangueEcran, Libelles>> = { mg: MG, fr: FR };

/** Remplace `{temps}` — même convention que `traduire` de `@jp/i18n`. */
export function avecTemps(gabarit: string, temps: string): string {
  return gabarit.replace('{temps}', temps);
}
