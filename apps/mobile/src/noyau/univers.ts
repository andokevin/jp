/**
 * L'univers courant sur l'appareil — R-Y8, R-Y9, R-Y10
 *
 * L'univers est un état **de l'appareil**, pas du compte : il ne dépend pas de
 * qui est connecté et change plus souvent qu'une préférence. Il ne monte donc
 * jamais au serveur.
 *
 * Trois comportements, et le troisième est celui qu'on oublie :
 *
 *   1. **mémorisé** entre deux ouvertures *(R-Y9)* — quelqu'un qui vient pour
 *      la beauté ne veut pas rechoisir à chaque fois ;
 *   2. **imposé par un lien profond** *(R-Y8)* — sinon on ouvre un article
 *      invisible dans le contexte courant ;
 *   3. **vérifié à l'ouverture**. L'univers mémorisé peut avoir été fermé
 *      entre-temps. On bascule alors sur le premier ouvert **et on le dit** :
 *      basculer en silence serait déroutant.
 */
import { CLES, type MagasinEcriture, type MagasinLecture } from './magasin.js';

export interface UniversDisponible {
  readonly cle: string;
  readonly onglet: string;
}

export type Resolution =
  | { readonly cle: string; readonly change: false }
  /** L'univers mémorisé n'est plus ouvert : on a basculé, il faut le dire. */
  | { readonly cle: string; readonly change: true; readonly ancien: string };

/**
 * Résout l'univers à afficher au démarrage.
 *
 * `ouverts` vient de `GET /univers`. La liste ne peut pas être vide : un
 * produit sans univers ouvert n'a rien à montrer, et c'est une erreur de
 * déploiement, pas un cas d'usage.
 */
export async function resoudreUnivers(
  ouverts: readonly UniversDisponible[],
  magasin: MagasinEcriture,
): Promise<Resolution> {
  if (ouverts.length === 0) {
    throw new Error('Aucun univers ouvert : erreur de déploiement, pas un cas d’usage.');
  }
  const premier = ouverts[0]!.cle;
  const memorise = await magasin.lire(CLES.universCourant);

  if (!memorise) {
    await magasin.ecrire(CLES.universCourant, premier);
    return { cle: premier, change: false };
  }
  if (ouverts.some((u) => u.cle === memorise)) return { cle: memorise, change: false };

  await magasin.ecrire(CLES.universCourant, premier);
  return { cle: premier, change: true, ancien: memorise };
}

/**
 * Un lien profond impose son univers *(R-Y8)*.
 *
 * Rend `true` si l'univers a changé — l'écran appelant sait alors qu'il doit
 * recharger son contenu.
 */
export async function imposerUnivers(cle: string, magasin: MagasinEcriture): Promise<boolean> {
  const actuel = await magasin.lire(CLES.universCourant);
  if (actuel === cle) return false;
  await magasin.ecrire(CLES.universCourant, cle);
  return true;
}

/** La signature d'univers ne s'affiche qu'une fois : la répéter la rendrait invisible. */
export async function estPremiereVisite(cle: string, magasin: MagasinLecture): Promise<boolean> {
  const brut = await magasin.lire(CLES.universVus);
  const vus: string[] = brut ? (JSON.parse(brut) as string[]) : [];
  return !vus.includes(cle);
}

export async function marquerVu(cle: string, magasin: MagasinEcriture): Promise<void> {
  const brut = await magasin.lire(CLES.universVus);
  const vus: string[] = brut ? (JSON.parse(brut) as string[]) : [];
  if (!vus.includes(cle)) {
    vus.push(cle);
    await magasin.ecrire(CLES.universVus, JSON.stringify(vus));
  }
}
