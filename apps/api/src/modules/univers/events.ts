/**
 * Univers — événements
 *
 * Nommage `domaine.chose.fait` au passé.
 */
export const EMIS = [
  // Ouvrir un univers engage un recrutement de vendeurs et une promesse
  // publique. La notification et l'audit y réagissent (R-Y12).
  'univers.ouvert',
  'univers.ferme',
  'univers.commission.modifiee',
] as const;

export const CONSOMMES = [] as const;
