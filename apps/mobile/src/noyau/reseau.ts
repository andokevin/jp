/**
 * Le réseau — S8.4
 *
 * **Une décision, sortie du module natif pour être vérifiable.** NetInfo est
 * une dépendance native : `vitest` ne sait pas la charger, et une règle
 * enfermée dedans ne serait jamais mise à l'épreuve. Ici, elle l'est.
 *
 * La règle tient en une phrase : **le doute n'est pas une coupure.**
 */

/** La part de l'état NetInfo dont dépend la décision. */
export interface EtatReseau {
  readonly isConnected: boolean | null;
  readonly isInternetReachable: boolean | null;
}

/**
 * Sommes-nous en ligne ?
 *
 * `isInternetReachable` vaut `null` pendant que NetInfo VÉRIFIE — au premier
 * instant après le lancement, et à chaque changement de réseau. Le lire comme
 * un « non » ferait clignoter « pas de connexion » à l'ouverture de
 * l'application, sur un téléphone parfaitement connecté, et désactiverait le
 * bouton sous les doigts de quelqu'un qui vient de le viser.
 *
 * D'où le `!== false` plutôt qu'un `=== true` : on n'exige pas la preuve que
 * ça marche, on exige la preuve que ça ne marche PAS. `isConnected`, lui, est
 * lu strictement — il répond sur l'interface, pas sur Internet, et son `null`
 * signifie qu'on ne sait même pas s'il y a une carte réseau.
 */
export function estEnLigne(etat: EtatReseau): boolean {
  return etat.isConnected === true && etat.isInternetReachable !== false;
}
