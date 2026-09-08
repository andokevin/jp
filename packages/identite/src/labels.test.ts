/**
 * F0.1 — ce qu'on peut PROUVER sur les libellés
 *
 * Ces chaînes ne sont pas dans `@jp/i18n` : elles n'ont pas d'équivalent
 * anglais, et le test de largeur de ce paquet mesure tout contre l'anglais.
 * Elles sont donc arrivées ici **sans aucun filet**. Ce fichier en pose un —
 * pas sur la justesse du malgache, qu'un test ne saura jamais juger, mais sur
 * les trois choses qui se vérifient : les deux catalogues portent les mêmes
 * clés, les mêmes jetons, et tiennent dans les boîtes.
 */
import { describe, expect, it } from 'vitest';

import { SCREEN_LANGUAGES, LABELS, screenLanguage } from './labels.js';

const chaines = (langue: 'mg' | 'fr'): Record<string, string> =>
  Object.fromEntries(
    Object.entries(LABELS[langue]).filter(([, v]) => typeof v === 'string'),
  ) as Record<string, string>;

const MG = chaines('mg');
const FR = chaines('fr');

describe('F0.1 — les deux catalogues disent la même chose', () => {
  it('portent exactement les mêmes clés', () => {
    // Une clé présente d'un seul côté rendrait `undefined` à l'écran dans une
    // langue et rien du tout dans l'autre — sans que le typage bronche, les
    // deux objets étant typés par la même interface.
    expect(Object.keys(MG).sort()).toEqual(Object.keys(FR).sort());
  });

  it.each(Object.keys(MG))('« %s » porte les mêmes jetons dans les deux langues', (cle) => {
    /*
     * Le défaut déjà vécu sur ce dépôt : `OTP_INVALIDE` passait `{essais}` à
     * un gabarit qui réclamait `{remaining}`. `traduire` ne substitue que par
     * nom et laisse le jeton visible sinon — le nombre n'arrivait jamais, et
     * le désaccord n'était pas ENTRE les catalogues mais entre un catalogue et
     * son appelant. Ici, on ferme au moins la moitié de la classe.
     */
    const jetons = (s: string) => (s.match(/\{[a-zA-Z]+\}/g) ?? []).sort();
    expect(jetons(MG[cle] as string)).toEqual(jetons(FR[cle] as string));
  });

  it('aucune chaîne n’est vide', () => {
    for (const [cle, valeur] of Object.entries({ ...MG, ...FR })) {
      expect(valeur.trim(), cle).not.toBe('');
    }
  });
});

/**
 * Le budget des titres.
 *
 * Les trois titres tombent dans une boîte de HAUTEUR FIXE — 88 dp, soit
 * exactement deux lignes — pour que le malgache et le français aient le même
 * rythme vertical. Une troisième ligne ne serait pas coupée : elle serait
 * TRONQUÉE, en silence.
 *
 * Le budget est estimé, et l'estimation est dite : sur le plus étroit des
 * écrans visés (360 dp, moins 2 × 16 de marge = 328 dp utiles), une serif à
 * 27 px avance d'environ 13,5 dp par caractère — soit ~24 par ligne, ~48 pour
 * deux. Ce n'est pas un moteur de rendu, c'est un garde-fou : il ne dira pas
 * qu'un titre de 47 caractères est joli, il dira qu'un titre de 60 déborde.
 */
const BUDGET_TITRE = 48;

describe('F0.1 — les titres tiennent dans leurs deux lignes', () => {
  it.each(['screen1Title', 'screen2Title', 'screen3Title'])('%s, dans les deux langues', (cle) => {
    expect((MG[cle] as string).length, `mg.${cle}`).toBeLessThanOrEqual(BUDGET_TITRE);
    expect((FR[cle] as string).length, `fr.${cle}`).toBeLessThanOrEqual(BUDGET_TITRE);
  });
});

describe('F0.1 — la bascule de langue', () => {
  it('n’offre que le malgache et le français', () => {
    expect(SCREEN_LANGUAGES).toEqual(['mg', 'fr']);
  });

  it('renvoie l’anglais vers le français, jamais vers un écran vide', () => {
    // Le français est la langue ÉCRITE courante à Madagascar. Une personne
    // arrivée en anglais la lit ; lui rendre `undefined` la laisserait devant
    // un écran sans mots.
    expect(screenLanguage('en')).toBe('fr');
    expect(screenLanguage('fr')).toBe('fr');
    expect(screenLanguage('mg')).toBe('mg');
  });
});
