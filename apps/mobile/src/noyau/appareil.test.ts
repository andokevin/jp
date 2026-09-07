/**
 * S8 — ce que l'appareil nous dit, et comment on l'interprète
 *
 * Deux lectures, deux pièges, et les deux tombent du même côté : **ne jamais
 * prendre un « je ne sais pas » pour un « non ».**
 */
import { describe, expect, it } from 'vitest';

import { langueDepuisEtiquettes } from './langue.js';
import { estEnLigne } from './reseau.js';

describe('S8 — la langue de l’appareil', () => {
  it('prend la PREMIÈRE locale qu’on sait rendre, pas la première tout court', () => {
    // Une personne peut avoir l'italien en tête de liste et le français
    // ensuite. Retomber sur le défaut parce que la première est inconnue
    // ignorerait un choix explicite.
    expect(langueDepuisEtiquettes(['it-IT', 'fr-FR'])).toBe('fr');
    expect(langueDepuisEtiquettes(['mg-MG', 'fr-FR'])).toBe('mg');
    expect(langueDepuisEtiquettes(['en-US'])).toBe('en');
  });

  it('retombe sur le français quand rien n’est reconnu, ou quand la liste est vide', () => {
    // Un appareil sans locale exploitable ne doit pas empêcher quelqu'un
    // d'ouvrir un compte.
    expect(langueDepuisEtiquettes([])).toBe('fr');
    expect(langueDepuisEtiquettes(['ja-JP', 'ko-KR'])).toBe('fr');
  });

  it('ne réécrit pas l’analyseur d’`Accept-Language` — il lui donne la même forme', () => {
    // La preuve que la réutilisation tient : une liste ordonnée d'étiquettes
    // se comporte comme l'en-tête HTTP correspondant, poids `q=` en moins.
    expect(langueDepuisEtiquettes(['mg-MG', 'fr-FR', 'en-US'])).toBe('mg');
  });
});

describe('S8 — le réseau : le doute n’est pas une coupure', () => {
  it('ne bascule PAS hors ligne pendant que NetInfo vérifie encore', () => {
    // `isInternetReachable: null` au premier instant après le lancement.
    // Le lire comme un « non » ferait clignoter le bandeau sur un téléphone
    // parfaitement connecté, et désactiverait le bouton sous le doigt.
    expect(estEnLigne({ isConnected: true, isInternetReachable: null })).toBe(true);
  });

  it('bascule sur un `false` franc, et sur lui seul', () => {
    expect(estEnLigne({ isConnected: true, isInternetReachable: false })).toBe(false);
  });

  it('exige une interface connectée — son `null` à elle vaut non', () => {
    // `isConnected` répond sur la carte réseau, pas sur Internet : ne pas
    // savoir s'il y a une interface, c'est ne pas pouvoir émettre.
    expect(estEnLigne({ isConnected: null, isInternetReachable: true })).toBe(false);
    expect(estEnLigne({ isConnected: false, isInternetReachable: null })).toBe(false);
  });

  it('est en ligne quand les deux sont vrais', () => {
    expect(estEnLigne({ isConnected: true, isInternetReachable: true })).toBe(true);
  });
});
