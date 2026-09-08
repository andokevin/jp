/**
 * F0.1 — le thème natif tient les deux contraintes du terrain
 *
 * Ce fichier ne vérifie pas « les couleurs sont jolies » mais les deux
 * promesses que `@jp/ui` fait au nom du terrain malgache *(C1, C2)* : 48 dp
 * de cible tactile, 4,5:1 de contrast. Une maquette peut proposer plus
 * serré ; ce test refuse qu'on descende en dessous.
 */
import { describe, expect, it } from 'vitest';
import { MIN_TAP_TARGET, MIN_CONTRAST, contrast } from '@jp/ui';

import { ACTION, CASE, HAUTEUR_CONTROLE, IDENTITE, PALETTE } from './theme.js';

describe('F0.1 natif — les cibles tactiles', () => {
  it('aucun contrôle ne descend sous les 48 dp du design system', () => {
    // La maquette dessine 56 : au-dessus du minimum, donc accepté. Le test
    // porte sur le PLANCHER, pas sur la valeur — pour qu'une retouche qui
    // resserrerait les contrôles échoue ici plutôt qu'en recette.
    expect(HAUTEUR_CONTROLE).toBeGreaterThanOrEqual(MIN_TAP_TARGET);
    expect(CASE.hauteur).toBeGreaterThanOrEqual(MIN_TAP_TARGET);
  });

  it('les six cases tiennent sur le plus étroit des écrans visés', () => {
    // 360 dp de large, 16 de marge de chaque côté : il reste 328 dp pour six
    // cases et cinq écarts. Des cases à 56 comme sur le web déborderaient —
    // c'est la raison d'être des 48 de la maquette native.
    const largeurUtile = 360 - 2 * 16;
    const occupe = 6 * CASE.largeur + 5 * CASE.ecart;
    expect(occupe).toBeLessThanOrEqual(largeurUtile);
  });
});

describe('F0.1 natif — le contrast et la règle R-Z1', () => {
  it.each([
    ['texte principal', PALETTE.texte, PALETTE.fond],
    ['texte secondaire', PALETTE.texteSecondaire, PALETTE.fond],
    ['libellé du bouton actif', PALETTE.texteInverse, PALETTE.action],
    ['message d’erreur', PALETTE.danger, PALETTE.fond],
    ['wordmark violet', PALETTE.identite, PALETTE.fond],
    ['texte du bandeau hors ligne', PALETTE.texte, PALETTE.fondBandeau],
  ])('%s passe 4,5:1', (_nom, avant, arriere) => {
    expect(contrast(avant, arriere)).toBeGreaterThanOrEqual(MIN_CONTRAST);
  });

  it('action et identité sont DEUX couleurs, indiscernables par la luminance', () => {
    // L'ordre des deux assertions compte. Sans la première, la seconde est
    // satisfaite par le pire cas : deux jetons identiques donnent 1,00, donc
    // bien « moins de 1,5 ». C'est exactement ce qui a laissé passer un
    // wordmark framboise côté web.
    expect(IDENTITE).not.toBe(ACTION);
    expect(contrast(ACTION, IDENTITE)).toBeLessThan(1.5);
    // D'où R-Z1 : aucun état ne se dit par la couleur seule. Le bouton
    // désactivé porte un cadenas, l'erreur porte un triangle.
  });
});
