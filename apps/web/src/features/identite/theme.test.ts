/**
 * F0.1 — le thème tient ses promesses
 *
 * Deux garde-fous que seule une machine peut tenir : que la feuille de style
 * ne réclame pas une variable que personne ne fournit, et que les couleurs de
 * texte restent lisibles. Une relecture laisse passer les deux.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { contraste, CONTRASTE_MIN } from '@jp/ui';

import { ACTION, IDENTITE, VARIABLES_CSS } from './theme.js';

const CSS = readFileSync(fileURLToPath(new URL('./auth.css', import.meta.url)), 'utf-8');

describe('F0.1 — les variables du thème', () => {
  it('la feuille de style ne demande AUCUNE variable qui n’existe pas', () => {
    // Une `var(--jp-…)` inconnue ne casse rien : elle rend simplement
    // l'élément transparent ou sans marge, et ça ne se voit qu'à l'œil, sur
    // un écran, un jour où personne ne regarde.
    const demandees = [...CSS.matchAll(/var\((--jp-[\w-]+)\)/g)].map((m) => m[1] as string);
    const fournies = new Set(Object.keys(VARIABLES_CSS));
    const manquantes = [...new Set(demandees)].filter((v) => !fournies.has(v));
    expect(manquantes, manquantes.join(', ')).toEqual([]);
  });

  it('aucune couleur n’est écrite en dur dans la feuille de style', () => {
    // Sauf le blanc translucide de la rondelle, qui n'est pas une couleur de
    // marque mais un voile sur l'aplat du bouton.
    const enDur = [...CSS.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
    expect(enDur).toEqual([]);
  });
});

describe('F0.1 — l’accessibilité des couleurs', () => {
  it('chaque texte reste au-dessus du seuil du design system', () => {
    const paires: readonly (readonly [string, string, string])[] = [
      ['texte sur fond', VARIABLES_CSS['--jp-texte'], VARIABLES_CSS['--jp-fond']],
      ['texte secondaire', VARIABLES_CSS['--jp-texte-2'], VARIABLES_CSS['--jp-fond']],
      ['libellé du bouton', VARIABLES_CSS['--jp-texte-inverse'], ACTION],
      ['erreur', VARIABLES_CSS['--jp-danger'], VARIABLES_CSS['--jp-fond']],
      ['lien framboise', ACTION, VARIABLES_CSS['--jp-fond']],
      ['wordmark violet', IDENTITE, VARIABLES_CSS['--jp-fond']],
      ['bandeau hors ligne', VARIABLES_CSS['--jp-texte'], VARIABLES_CSS['--jp-fond-2']],
    ];
    const faibles = paires
      .map(([quoi, a, b]) => [quoi, contraste(a, b)] as const)
      .filter(([, r]) => r < CONTRASTE_MIN)
      .map(([quoi, r]) => `${quoi} : ${Math.round(r * 100) / 100}:1`);
    expect(faibles, faibles.join('\n')).toEqual([]);
  });

  it('LES DEUX COULEURS DE MARQUE SONT INDISCERNABLES ENTRE ELLES', () => {
    // 1,08:1. C'est la raison pour laquelle aucun état de cet écran n'est dit
    // par la couleur seule : la langue active porte un soulignement et une
    // graisse, le bouton désactivé change de forme, l'erreur porte une icône.
    // Ce test échouerait si quelqu'un croyait pouvoir opposer les deux.
    // D'ABORD : ce sont bien DEUX couleurs. Sans cette ligne, l'assertion de
    // contraste ci-dessous est satisfaite par le pire des cas — deux jetons
    // identiques donnent 1,00, donc « moins de 1,5 ». Le test passait pendant
    // que `IDENTITE` valait le framboise.
    expect(IDENTITE).not.toBe(ACTION);
    expect(contraste(ACTION, IDENTITE)).toBeLessThan(1.5);
  });

  it('la cible tactile ne descend jamais sous celle du design system', () => {
    expect(Number.parseInt(VARIABLES_CSS['--jp-cible'], 10)).toBeGreaterThanOrEqual(48);
    expect(Number.parseInt(VARIABLES_CSS['--jp-hauteur-controle'], 10)).toBeGreaterThanOrEqual(48);
  });
});
