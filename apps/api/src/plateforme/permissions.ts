/**
 * Droits — les deux outils
 *
 * **Une garde de route ne suffit pas.** Elle dit qui entre, pas ce qu’il
 * voit. Une employée `VE` consulte une commande sans voir la marge du
 * vendeur. Il faut donc les deux : la garde **et** le filtre de projection.
 * Séparés dès le départ, sinon la fuite s’installe dans les premiers
 * modules et se recopie partout.
 */

/** Décide qui entre. */
export const garde = {} as const;

/** Décide ce qui sort. */
export const filtrerProjection = {} as const;
