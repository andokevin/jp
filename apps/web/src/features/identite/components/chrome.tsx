/**
 * Le cadre commun aux trois écrans : bandeau, bascule de language, carte.
 *
 * Rien de spécifique à une étape ici — ces trois pièces sont identiques du
 * premier écran au dernier, et c'est ce qui fait qu'on reconnaît le même
 * produit d'un écran à l'autre.
 */
import type { ReactNode } from 'react';

import { SCREEN_LANGUAGES, LABELS, type ScreenLanguage } from '@jp/identite';
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
 * **Il prend le pas sur le message d'error** : une requête qui n'est jamais
 * partie n'est pas un refus du serveur, et afficher les deux ferait accuser la
 * personne d'une faute qu'elle n'a pas commise.
 *
 * `role="status"` plutôt que `alert` : c'est un changement d'état de
 * l'environnement, pas une urgence à interrompre la saisie en cours.
 */
export function BandeauHorsLigne({ language }: { readonly language: ScreenLanguage }) {
  return (
    <div className="jp-bandeau" role="status">
      <IconeHorsLigne />
      <span>{LABELS[language].offline}</span>
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
  language,
  surChangement,
}: {
  readonly language: ScreenLanguage;
  readonly surChangement: (l: ScreenLanguage) => void;
}) {
  return (
    <div className="jp-langues">
      {SCREEN_LANGUAGES.map((l) => (
        <button
          key={l}
          type="button"
          className="jp-language"
          lang={l}
          aria-current={l === language}
          onClick={() => surChangement(l)}
        >
          {LABELS[language].languageOf[l]}
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
  language,
  offline,
  onLanguage,
  children,
}: {
  readonly language: ScreenLanguage;
  readonly offline: boolean;
  readonly onLanguage: (l: ScreenLanguage) => void;
  readonly children: ReactNode;
}) {
  return (
    <div className="jp-auth" style={styleRacine()} lang={language}>
      {offline ? <BandeauHorsLigne language={language} /> : null}
      <header className="jp-entete">
        <BasculeLangue language={language} surChangement={onLanguage} />
      </header>
      <main className="jp-centre">
        <div className="jp-marque">
          JP<span>{LABELS[language].brandTail}</span>
        </div>
        <div className="jp-carte">{children}</div>
      </main>
    </div>
  );
}
