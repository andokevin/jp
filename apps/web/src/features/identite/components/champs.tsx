/**
 * Le champ, le message d'erreur et le bouton.
 *
 * Aucun de ces trois ne dit son état par la seule couleur : le champ fautif
 * gagne une icône, le message porte la sienne, et le bouton désactivé change
 * de FORME — contour vide au lieu d'aplat plein. C'est la règle qui compte le
 * plus ici, parce que le framboise et le violet de la marque sont
 * indiscernables en niveaux de gris.
 */
import type { ChangeEvent } from 'react';

/** Triangle d'alerte — accompagne toujours un texte, jamais seul. */
export function IconeAlerte({ taille = 17 }: { readonly taille?: number }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 7.5v5M12 16.2h.01" />
    </svg>
  );
}

/** Une horloge — pour un décompte, qui n'est pas une alerte. */
export function IconeHorloge({ taille = 15 }: { readonly taille?: number }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function MessageErreur({ id, texte }: { readonly id: string; readonly texte: string }) {
  return (
    <p className="jp-erreur" id={id} role="alert">
      <IconeAlerte />
      <span>{texte}</span>
    </p>
  );
}

export function ChampTexte(props: {
  readonly id: string;
  readonly label: string;
  readonly valeur: string;
  readonly exemple: string;
  readonly type: 'email' | 'text';
  readonly autoComplete: string;
  readonly enErreur: boolean;
  readonly decritPar?: string;
  readonly surSaisie: (valeur: string) => void;
}) {
  return (
    <div className="jp-champ">
      <label className="jp-label" htmlFor={props.id}>
        {props.label}
      </label>
      <input
        id={props.id}
        className="jp-saisie"
        type={props.type}
        value={props.valeur}
        placeholder={props.exemple}
        autoComplete={props.autoComplete}
        aria-invalid={props.enErreur}
        {...(props.decritPar ? { 'aria-describedby': props.decritPar } : {})}
        onChange={(e: ChangeEvent<HTMLInputElement>) => props.surSaisie(e.target.value)}
      />
    </div>
  );
}

/**
 * Le bouton principal — un seul par écran.
 *
 * En chargement, il **garde sa taille** et échange son libellé contre
 * « Andrasana... / Veuillez patienter... » : une mise en page qui saute au
 * moment de l'envoi donne l'impression que l'appui a raté.
 */
export function BoutonPrincipal(props: {
  readonly libelle: string;
  readonly libelleAttente: string;
  readonly enCours: boolean;
  readonly actif: boolean;
  readonly surAppui: () => void;
}) {
  return (
    <button
      type="submit"
      className="jp-bouton"
      disabled={!props.actif}
      aria-busy={props.enCours}
      onClick={props.surAppui}
    >
      {props.enCours ? <span className="jp-rondelle" aria-hidden="true" /> : null}
      <span>{props.enCours ? props.libelleAttente : props.libelle}</span>
    </button>
  );
}
