/**
 * Les six cases du code — F0.1
 *
 * Toute la logique (filtrage, distribution, curseur suivant) est dans
 * `code-otp.ts`, pur et testé sans navigateur. Ce composant ne fait que la
 * relier au clavier et au presse-papier.
 *
 * Ce qu'il apporte de proprement WEB :
 *
 *   · **Coller les six chiffres dans la première case remplit les six.** Sur
 *     un ordinateur, le code se copie depuis la boîte mail ; sans ça, on colle,
 *     on ne voit qu'un chiffre, et on retape tout.
 *   · **Retour arrière sur une case vide remonte à la précédente**, le geste
 *     attendu de quiconque corrige au clavier.
 *   · **Chaque case est un `<input>`**, donc atteignable au clavier et
 *     annoncée par un lecteur d'écran — six `<div>` ne le seraient pas.
 */
import { useEffect, useRef } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';

import { caseSuivante, chiffresDe, NB_CHIFFRES, type Cases } from '../code-otp.js';

export function OtpInputForm(props: {
  readonly cases: Cases;
  readonly label: string;
  readonly enErreur: boolean;
  readonly decritPar?: string;
  readonly surPose: (index: number, texte: string) => void;
  readonly surEffacement: (index: number) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  // Le curseur ouvre sur la première case : on arrive ici pour taper un code,
  // pas pour choisir où le taper.
  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const viser = (index: number) => refs.current[Math.min(index, NB_CHIFFRES - 1)]?.focus();

  const saisir = (index: number, brut: string) => {
    const chiffres = chiffresDe(brut);
    if (chiffres.length === 0) return;
    props.surPose(index, chiffres);
    viser(caseSuivante(index, chiffres));
  };

  const toucher = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (props.cases[index]) {
        props.surEffacement(index);
      } else if (index > 0) {
        // Case déjà vide : on remonte, et on efface là où il y a quelque chose.
        props.surEffacement(index - 1);
        viser(index - 1);
      }
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) viser(index - 1);
    if (e.key === 'ArrowRight') viser(index + 1);
  };

  const coller = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    // On intercepte : laissé au navigateur, le collage n'atterrirait que dans
    // la case visée, tronqué à un caractère par `maxLength`.
    e.preventDefault();
    saisir(index, e.clipboardData.getData('text'));
  };

  return (
    <div className="jp-champ">
      <span className="jp-label" id="jp-label-code">
        {props.label}
      </span>
      <div
        className="jp-cases"
        role="group"
        aria-labelledby="jp-label-code"
        {...(props.decritPar ? { 'aria-describedby': props.decritPar } : {})}
      >
        {props.cases.map((chiffre, index) => (
          <input
            // Les cases sont six positions fixes, jamais réordonnées : ici
            // l'index EST l'identité de la case.
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            className="jp-case"
            value={chiffre}
            // `inputMode` ouvre le pavé numérique sur mobile web sans interdire
            // le collage, ce que `type="number"` ferait.
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            aria-label={`${index + 1} / ${NB_CHIFFRES}`}
            aria-invalid={props.enErreur}
            onChange={(e) => saisir(index, e.target.value)}
            onKeyDown={(e) => toucher(index, e)}
            onPaste={(e) => coller(index, e)}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
    </div>
  );
}
