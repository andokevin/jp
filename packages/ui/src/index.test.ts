/**
 * index.test.ts — S7
 *
 * Les deux tests qui comptent : le contrast et la target tactile. Ils
 * viennent du terrain — un téléphone d'entrée de gamme en plein soleil, un
 * doigt sur un écran de cinq pouces —, pas du goût.
 */
import { describe, expect, it } from 'vitest';
import { ariary } from '@jp/money';
import {
  hasSomethingToShow,
  badge,
  PRIMARY_BUTTON,
  MIN_TAP_TARGET,
  contrast,
  MIN_CONTRAST,
  COLORS,
  COLORS_D22,
  stateFrom,
  emptyState,
  progressiveImage,
  listRow,
  luminance,
  stateMessage,
  reservationTimer,
  PRIMITIVES,
  ariaryPrice,
  respectsRZ1,
  TYPOGRAPHY,
  ACCENTS,
  accent,
  universeSelector,
  universeHeader,
  universePill,
} from './index.js';

describe('S7.1 — les jetons, vérifiés par test et non par relecture', () => {
  it('tout text sur son fond atteint 4,5:1', () => {
    // Un téléphone d'entrée de gamme en plein soleil d'Antananarivo n'est
    // pas un écran de bureau.
    const paires: readonly [string, string, string][] = [
      ['text sur fond', COLORS.text, COLORS.background],
      ['text secondaire sur fond', COLORS.textSecondary, COLORS.background],
      ['text sur fond secondaire', COLORS.text, COLORS.backgroundSecondary],
      ['text inverse sur action', COLORS.textInverse, COLORS.action],
      ['text inverse sur action pressée', COLORS.textInverse, COLORS.actionPressed],
      // `D-22` — les deux couleurs de la marque portent du text blanc : le
      // framboise sur un bouton, le violet sur un badge vérifié et un fond de
      // facture. Les deux se vérifient, et sur blanc, et en inverse.
      ['action sur fond', COLORS.action, COLORS.background],
      ['text inverse sur identité', COLORS.textInverse, COLORS.identity],
      ['text inverse sur identité foncée', COLORS.textInverse, COLORS.identityDeep],
      ['identité sur fond', COLORS.identity, COLORS.background],
      ['text inverse sur succès', COLORS.textInverse, COLORS.success],
      ['text inverse sur danger', COLORS.textInverse, COLORS.danger],
      ['text inverse sur attention', COLORS.textInverse, COLORS.warning],
      ['amount sur fond', COLORS.amount, COLORS.background],
    ];
    const insuffisants: string[] = [];
    for (const [nom, a, b] of paires) {
      const r = contrast(a, b);
      // Pas de `toFixed` : la règle « aucun flottant » vaut ici aussi, même
      // pour un rapport de contrast. Arrondi à la main, en entier.
      if (r < MIN_CONTRAST) insuffisants.push(`${nom} : ${Math.round(r * 100) / 100}:1`);
    }
    expect(insuffisants, insuffisants.join('\n')).toEqual([]);
  });

  it('calcule le contrast comme WCAG', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
    expect(contrast('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 2);
    expect(luminance('#FFFFFF')).toBeCloseTo(1, 2);
    expect(luminance('#000000')).toBeCloseTo(0, 2);
  });

  it('une color d’action, une color d’identité — jamais deux couleurs d’action (D-22)', () => {
    expect(COLORS.action).not.toBe(COLORS.success);
    // Le amount n'a PAS la color de l'action : un prix ne se touche pas.
    expect(COLORS.amount).not.toBe(COLORS.action);
    // `D-22` : deux jetons, deux rôles. Le violet a cessé d'être le bouton, il
    // n'est pas devenu un doublon du framboise pour autant.
    expect(COLORS.action).toBe('#A31A5B');
    expect(COLORS.identity).toBe('#7C2D92');
    expect(COLORS.identity).not.toBe(COLORS.action);
  });

  it('R-Z1 — le framboise et le violet ne portent jamais seuls une différence de sens', () => {
    // La raison d'être de la règle, mesurée : 1,08:1 entre les deux. Elles se
    // distinguent par la teinte, jamais par la luminance — donc pas du tout sur
    // un écran délavé par le soleil, ni pour un œil daltonien.
    expect(contrast(COLORS.action, COLORS.identity)).toBeLessThan(1.2);
    expect(COLORS_D22).toHaveLength(2);

    // Deux états que SEULE la color sépare : refusé.
    expect(respectsRZ1({ color: COLORS.action }, { color: COLORS.identity })).toBe(false);

    // La même paire, doublée par un libellé, une icône ou une forme : acceptée.
    expect(
      respectsRZ1(
        { color: COLORS.action, label: 'En direct' },
        { color: COLORS.identity, label: 'Vérifiée' },
      ),
    ).toBe(true);
    expect(
      respectsRZ1(
        { color: COLORS.action, icon: 'point' },
        { color: COLORS.identity, icon: 'coche' },
      ),
    ).toBe(true);
    expect(
      respectsRZ1(
        { color: COLORS.action, shape: 'pastille' },
        { color: COLORS.identity, shape: 'ecusson' },
      ),
    ).toBe(true);

    // La règle ne vise QUE ce couple : un vert de succès contre un rouge
    // d'alerte se distingue déjà de 3,4:1, et n'est pas concerné.
    expect(respectsRZ1({ color: COLORS.success }, { color: COLORS.danger })).toBe(true);
  });

  it('trois tailles de text, pas huit', () => {
    expect(Object.keys(TYPOGRAPHY)).toHaveLength(3);
  });
});

describe('S7.2 — les sept primitives', () => {
  it('il y en a exactement sept', () => {
    expect(PRIMITIVES).toHaveLength(7);
  });

  it('le bouton principal fait la target tactile minimale, pleine width, en bottom', () => {
    // Une main qui tient un téléphone atteint le bottom de l'écran.
    expect(PRIMARY_BUTTON.height).toBeGreaterThanOrEqual(MIN_TAP_TARGET);
    expect(PRIMARY_BUTTON.width).toBe('100%');
    expect(PRIMARY_BUTTON.anchor).toBe('bottom');
    expect(PRIMARY_BUTTON.disabledWhileSubmitting).toBe(true);
  });

  it('une ligne de liste ne descend jamais sous la target tactile', () => {
    expect(listRow({ touchable: true }).minHeight).toBeGreaterThanOrEqual(MIN_TAP_TARGET);
  });

  it('le prix past par @jp/money, jamais par une concaténation', () => {
    // `format` sépare par une espace FINE INSÉCABLE (U+202F), pas une
    // espace ordinaire : un amount ne doit pas se couper en fin de ligne.
    expect(ariaryPrice(ariary(50_000), 'fr').text).toBe('50\u202F000\u202FAr');
    expect(ariaryPrice(ariary(50_000)).color).toBe(COLORS.amount);
  });

  it('l’image garde son placeholder en mode économie de données', () => {
    const eco = progressiveImage({
      url: 'grande.jpg',
      placeholder: 'flou.jpg',
      dataSaver: true,
    });
    expect(eco.show).toBe('flou.jpg');
    expect(eco.loadFullResolution).toBe(false);

    const normal = progressiveImage({
      url: 'grande.jpg',
      placeholder: 'flou.jpg',
      dataSaver: false,
    });
    expect(normal.show).toBe('grande.jpg');
  });

  it('l’état vide propose une action — « aucun résultat » seul est un cul-de-sac', () => {
    const avec = emptyState({
      language: 'fr',
      action: { label: 'Publier', target: '/articles/neuf' },
    });
    expect(avec.action).not.toBeNull();
    expect(emptyState({ language: 'fr' }).action).toBeNull();
  });

  it('le minuteur ne ment jamais — RB9', () => {
    // Il calcule depuis l'échéance rendue par le SERVEUR, jamais une durée
    // décidée côté client, qui dériverait avec l'horloge du téléphone.
    const now = new Date('2026-08-19T10:00:00Z');
    const dans30min = new Date('2026-08-19T10:30:00Z');
    expect(reservationTimer(dans30min, now).label).toBe('30:00');
    expect(reservationTimer(dans30min, now).expired).toBe(false);

    const dans30s = new Date('2026-08-19T10:00:30Z');
    expect(reservationTimer(dans30s, now).color).toBe(COLORS.danger);

    const past = new Date('2026-08-19T09:00:00Z');
    expect(reservationTimer(past, now).expired).toBe(true);
    expect(reservationTimer(past, now).remainingS).toBe(0); // jamais négatif
  });

  it('le badge lisible dans les quatre tons', () => {
    for (const tone of ['neutral', 'success', 'warning', 'danger'] as const) {
      const b = badge(tone, 'Payée');
      expect(contrast(b.textColor, b.background), tone).toBeGreaterThanOrEqual(MIN_CONTRAST);
    }
  });
});

describe('S7.3 — les quatre états', () => {
  it('hors ligne past AVANT error', () => {
    // Une requête qui échoue faute de réseau n'est pas une panne du serveur,
    // et ne se raconte pas pareil.
    const e = stateFrom({
      pending: false,
      offline: true,
      error: { code: 'X', message: 'boum' },
      data: [1],
    });
    expect(e.name).toBe('hors-ligne');
  });

  it('garde les données périmées quand le réseau tombe', () => {
    const e = stateFrom({ pending: false, offline: true, data: [1, 2] });
    expect(hasSomethingToShow(e)).toBe(true); // on montre ce qu'on avait
  });

  it('une liste vide est « vide », pas « en chargement »', () => {
    expect(stateFrom({ pending: false, offline: false, data: [] }).name).toBe('vide');
    expect(stateFrom({ pending: false, offline: false, data: [1] }).name).toBe('charge');
  });

  it('rend un message traduit pour chaque état sauf « chargé »', () => {
    expect(stateMessage({ name: 'chargement' }, 'fr')).toBe('Chargement…');
    expect(stateMessage({ name: 'vide' }, 'en')).toBe('Nothing here yet.');
    expect(stateMessage({ name: 'hors-ligne' }, 'fr')).toContain('Hors ligne');
    expect(stateMessage({ name: 'charge', data: [1] }, 'fr')).toBeNull();
  });

  it('sans données ni error, on est en chargement', () => {
    expect(stateFrom({ pending: true, offline: false }).name).toBe('chargement');
    expect(stateFrom({ pending: false, offline: false }).name).toBe('chargement');
  });
});

describe('les univers dans l’interface — les décisions UX', () => {
  const deuxOuverts = [
    { key: 'mode', tab: 'Mode' },
    { key: 'beaute', tab: 'Beauté' },
  ];

  it('chaque accent d’univers est lisible sur text blanc', () => {
    // Un seul design system, un seul accent qui change : assez pour savoir où
    // l'on est, trop peu pour se sentir ailleurs.
    const insuffisants: string[] = [];
    for (const [cle, color] of Object.entries(ACCENTS)) {
      const r = contrast(COLORS.textInverse, color);
      if (r < MIN_CONTRAST) insuffisants.push(`${cle} : ${Math.round(r * 100) / 100}:1`);
    }
    expect(insuffisants, insuffisants.join('\n')).toEqual([]);
  });

  it('un univers inconnu retombe sur l’accent de la marque', () => {
    // L'accent d'univers est un repère d'identité, pas un bouton : depuis
    // `D-22`, le repli est le jeton d'identité, et sa valeur rendue est la même
    // qu'avant la scission.
    expect(accent('inexistant')).toBe(COLORS.identity);
    expect(accent('inexistant')).toBe('#7C2D92');
  });

  it('le sélecteur ne s’affiche PAS s’il n’y a qu’un univers', () => {
    // Un sélecteur à une entrée n'est pas une aide : c'est du bruit qui
    // occupe 48 dp de height utile.
    expect(universeSelector({ open: [deuxOuverts[0]!], current: 'mode' }).visible).toBe(false);
    expect(universeSelector({ open: deuxOuverts, current: 'mode' }).visible).toBe(true);
  });

  it('le sélecteur marque l’univers current', () => {
    const s = universeSelector({ open: deuxOuverts, current: 'beaute' });
    expect(s.entrees.find((e) => e.key === 'beaute')!.active).toBe(true);
    expect(s.entrees.find((e) => e.key === 'mode')!.active).toBe(false);
  });

  it('la signature ne s’affiche qu’à la première visite', () => {
    // La répéter à chaque ouverture la rendrait invisible.
    const params = { name: 'JP Beauté', signature: 'Vrai produit, prix vrai', key: 'beaute' };
    expect(universeHeader({ ...params, firstVisit: true }).signature).toBe(
      'Vrai produit, prix vrai',
    );
    expect(universeHeader({ ...params, firstVisit: false }).signature).toBeNull();
  });

  it('la pastille ne s’affiche que HORS de l’univers current', () => {
    // Dans son propre univers, elle n'apprendrait rien et volerait la place.
    expect(universePill({ key: 'beaute', tab: 'Beauté', currentUniverse: 'mode' }).visible).toBe(
      true,
    );
    expect(universePill({ key: 'mode', tab: 'Mode', currentUniverse: 'mode' }).visible).toBe(false);
  });

  it('les trois univers ont leur accent, y compris Tech qui est fermé', () => {
    // Un univers fermé garde ses règles ET son identité visuelle : l'ouvrir
    // ne doit pas demander de travail de design.
    expect(Object.keys(ACCENTS).sort()).toEqual(['beaute', 'mode', 'tech']);
  });
});
