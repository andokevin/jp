/**
 * Pagination par curseur — S3.6
 *
 * Le curseur est **opaque** pour le client : il le renvoie tel quel sans
 * l'interpréter. Cela nous laisse changer sa composition sans casser un seul
 * client déjà installé — et sur mobile, un client installé met des mois à se
 * mettre à jour.
 *
 * Les fonctions d'encodage vivent dans `@jp/contracts`, parce que les clients
 * en ont besoin aussi. Ici, ce qui est propre au serveur : transformer une
 * requête et un tri en page.
 */
import { decodeCursor, encodeCursor, type Page } from '@jp/contracts';

/**
 * Découpe un lot en page.
 *
 * On demande volontairement **`taille + 1`** éléments à la base : si le lot en
 * ramène un de plus que demandé, c'est qu'il y a une suite. Sans cette
 * astuce, il faudrait un `COUNT(*)` séparé — coûteux sur une grande table, et
 * inexact dès que quelqu'un écrit entre les deux requêtes.
 */
export function enPage<T>(
  lot: readonly T[],
  taille: number,
  position: (element: T) => Record<string, string | number>,
): Page<T> {
  const aUneSuite = lot.length > taille;
  const elements = aUneSuite ? lot.slice(0, taille) : [...lot];
  const dernier = elements[elements.length - 1];
  return {
    elements,
    curseurSuivant: aUneSuite && dernier ? encodeCursor(position(dernier)) : null,
  };
}

/**
 * Lit un curseur reçu. Un curseur illisible rend `null`, donc la première
 * page — jamais une erreur. Un lien partagé qui a vieilli doit continuer à
 * fonctionner, même dégradé.
 */
export function depuisCurseur(curseur: string | undefined): Record<string, string | number> | null {
  return curseur ? decodeCursor(curseur) : null;
}
