/**
 * Les six cases du code — la logique, sans le DOM
 *
 * Le collage est la seule affordance vraiment WEB de ce parcours : sur mobile,
 * le code arrive par notification et se tape ; sur un ordinateur, il se copie
 * depuis la boîte mail et se colle. **Coller six chiffres dans la première
 * case doit remplir les six**, sinon la personne colle, ne voit qu'un chiffre,
 * et recommence à la main.
 *
 * Tout est pur : aucun `document`, aucun état React. C'est ce qui rend ces
 * règles testables sans navigateur.
 */

/** Six, comme `auth.codeOtp` l'impose côté contrat. */
export const NB_CHIFFRES = 6;

export type Cases = readonly string[];

/** Six cases vides. */
export function casesVides(): Cases {
  return Array.from({ length: NB_CHIFFRES }, () => '');
}

/**
 * Ne garde que les chiffres d'un texte collé, et pas plus que six.
 *
 * Une boîte mail rend rarement « 482153 » tout nu : on récupère « 482 153 »,
 * « Code : 482153 » ou un retour à la ligne. Filtrer plutôt que refuser évite
 * de renvoyer la personne à sa souris.
 */
export function chiffresDe(texte: string): string {
  return [...texte]
    .filter((c) => c >= '0' && c <= '9')
    .join('')
    .slice(0, NB_CHIFFRES);
}

/**
 * Écrit un texte à partir d'une case donnée, en débordant sur les suivantes.
 *
 * Sert aux deux gestes : une frappe (un caractère) et un collage (six). Le
 * même chemin de code pour les deux, donc pas de divergence entre eux.
 */
export function poser(cases: Cases, index: number, texte: string): Cases {
  const chiffres = chiffresDe(texte);
  const suite = [...cases];
  for (let i = 0; i < chiffres.length && index + i < NB_CHIFFRES; i += 1) {
    suite[index + i] = chiffres[i] as string;
  }
  return suite;
}

/** Vide une case. Le retour arrière ne doit pas décaler les autres. */
export function effacer(cases: Cases, index: number): Cases {
  const suite = [...cases];
  suite[index] = '';
  return suite;
}

/** La case qui doit recevoir le curseur après une saisie à `index`. */
export function caseSuivante(index: number, texte: string): number {
  const avance = Math.max(1, chiffresDe(texte).length);
  return Math.min(index + avance, NB_CHIFFRES - 1);
}

/** Le code tel qu'il part au serveur — vide tant qu'il n'est pas complet. */
export function codeAssemble(cases: Cases): string {
  return cases.join('');
}

export function estComplet(cases: Cases): boolean {
  return codeAssemble(cases).length === NB_CHIFFRES;
}
