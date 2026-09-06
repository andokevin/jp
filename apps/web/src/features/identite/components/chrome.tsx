/**
 * Le cadre commun aux trois écrans : bandeau, bascule de langue, carte.
 *
 * Rien de spécifique à une étape ici — ces trois pièces sont identiques du
 * premier écran au dernier, et c'est ce qui fait qu'on reconnaît le même
 * produit d'un écran à l'autre.
 */
import type { ReactNode } from 'react';

import { LANGUES_ECRAN, LIBELLES, type LangueEcran } from '@jp/identite';
import { styleRacine } from '../theme.js';

/** Le pictogramme « pas de réseau » — l'icône EN PLUS du texte, jamais à la place. */
function IconeHorsLigne() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M2 2l20 20M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 4-2.6M1.4 9.4a15 15 0 0 1 5-3.3M22.6 9.4a15 15 0 0 0-9.3-3.2M12 20h.01" />
    </svg>
  );
}

/**
 * Le bandeau hors ligne, épinglé en haut de la page.
 *
 * **Il prend le pas sur le message d'erreur** : une requête qui n'est jamais
 * partie n'est pas un refus du serveur, et afficher les deux ferait accuser la
 * personne d'une faute qu'elle n'a pas commise.
 *
 * `role="status"` plutôt que `alert` : c'est un changement d'état de
 * l'environnement, pas une urgence à interrompre la saisie en cours.
 */
export function BandeauHorsLigne({ langue }: { readonly langue: LangueEcran }) {
  return (
    <div className="jp-bandeau" role="status">
      <IconeHorsLigne />
      <span>{LIBELLES[langue].horsLigne}</span>
    </div>
  );
}

/**
 * La bascule MG / FR, en haut à droite.
 *
 * L'active est marquée par un soulignement ET une graisse — voir `auth.css`
 * pour la raison, qui tient en un chiffre : 1,08:1 entre les deux couleurs de
 * la marque.
 */
export function BasculeLangue({
  langue,
  surChangement,
}: {
  readonly langue: LangueEcran;
  readonly surChangement: (l: LangueEcran) => void;
}) {
  return (
    <div className="jp-langues">
      {LANGUES_ECRAN.map((l) => (
        <button
          key={l}
          type="button"
          className="jp-langue"
          lang={l}
          aria-current={l === langue}
          onClick={() => surChangement(l)}
        >
          {LIBELLES[langue].langueDe[l]}
        </button>
      ))}
    </div>
  );
}

/**
 * La page : bandeau, bascule, wordmark, carte.
 *
 * La carte plafonne à 480px et se centre. Sous 480px de fenêtre elle perd sa
 * bordure et prend toute la largeur — un lien ouvert depuis WhatsApp doit
 * donner exactement l'application native, pas une carte flottante rétrécie.
 */
export function PageAuth({
  langue,
  horsLigne,
  surLangue,
  children,
}: {
  readonly langue: LangueEcran;
  readonly horsLigne: boolean;
  readonly surLangue: (l: LangueEcran) => void;
  readonly children: ReactNode;
}) {
  return (
    <div className="jp-auth" style={styleRacine()} lang={langue}>
      {horsLigne ? <BandeauHorsLigne langue={langue} /> : null}
      <header className="jp-entete">
        <BasculeLangue langue={langue} surChangement={surLangue} />
      </header>
      <main className="jp-centre">
        <div className="jp-marque">
          JP<span>{LIBELLES[langue].marqueSuite}</span>
        </div>
        <div className="jp-carte">{children}</div>
      </main>
    </div>
  );
}
