/**
 * index.test.ts — S7
 *
 * Les deux tests qui comptent : le contraste et la cible tactile. Ils
 * viennent du terrain — un téléphone d'entrée de gamme en plein soleil, un
 * doigt sur un écran de cinq pouces —, pas du goût.
 */
import { describe, expect, it } from 'vitest';
import { ariary } from '@jp/money';
import {
  aQuelqueChoseAMontrer,
  badge,
  BOUTON_PRINCIPAL,
  CIBLE_TACTILE_MIN,
  contraste,
  CONTRASTE_MIN,
  COULEURS,
  etatDepuis,
  etatVide,
  imageProgressive,
  ligneListe,
  luminance,
  messageEtat,
  minuteurReservation,
  PRIMITIVES,
  prixAriary,
  TYPOGRAPHIE,
  ACCENTS,
  accent,
  selecteurUnivers,
  enteteUnivers,
  pastilleUnivers,
} from './index.js';

describe('S7.1 — les jetons, vérifiés par test et non par relecture', () => {
  it('tout texte sur son fond atteint 4,5:1', () => {
    // Un téléphone d'entrée de gamme en plein soleil d'Antananarivo n'est
    // pas un écran de bureau.
    const paires: readonly [string, string, string][] = [
      ['texte sur fond', COULEURS.texte, COULEURS.fond],
      ['texte secondaire sur fond', COULEURS.texteSecondaire, COULEURS.fond],
      ['texte sur fond secondaire', COULEURS.texte, COULEURS.fondSecondaire],
      ['texte inverse sur action', COULEURS.texteInverse, COULEURS.action],
      ['texte inverse sur action pressée', COULEURS.texteInverse, COULEURS.actionPressee],
      ['texte inverse sur succès', COULEURS.texteInverse, COULEURS.succes],
      ['texte inverse sur danger', COULEURS.texteInverse, COULEURS.danger],
      ['texte inverse sur attention', COULEURS.texteInverse, COULEURS.attention],
      ['montant sur fond', COULEURS.montant, COULEURS.fond],
    ];
    const insuffisants: string[] = [];
    for (const [nom, a, b] of paires) {
      const r = contraste(a, b);
      // Pas de `toFixed` : la règle « aucun flottant » vaut ici aussi, même
      // pour un rapport de contraste. Arrondi à la main, en entier.
      if (r < CONTRASTE_MIN) insuffisants.push(`${nom} : ${Math.round(r * 100) / 100}:1`);
    }
    expect(insuffisants, insuffisants.join('\n')).toEqual([]);
  });

  it('calcule le contraste comme WCAG', () => {
    expect(contraste('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
    expect(contraste('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 2);
    expect(luminance('#FFFFFF')).toBeCloseTo(1, 2);
    expect(luminance('#000000')).toBeCloseTo(0, 2);
  });

  it('une seule couleur d’action — deux, c’est aucune', () => {
    expect(COULEURS.action).not.toBe(COULEURS.succes);
    // Le montant n'a PAS la couleur de l'action : un prix ne se touche pas.
    expect(COULEURS.montant).not.toBe(COULEURS.action);
  });

  it('trois tailles de texte, pas huit', () => {
    expect(Object.keys(TYPOGRAPHIE)).toHaveLength(3);
  });
});

describe('S7.2 — les sept primitives', () => {
  it('il y en a exactement sept', () => {
    expect(PRIMITIVES).toHaveLength(7);
  });

  it('le bouton principal fait la cible tactile minimale, pleine largeur, en bas', () => {
    // Une main qui tient un téléphone atteint le bas de l'écran.
    expect(BOUTON_PRINCIPAL.hauteur).toBeGreaterThanOrEqual(CIBLE_TACTILE_MIN);
    expect(BOUTON_PRINCIPAL.largeur).toBe('100%');
    expect(BOUTON_PRINCIPAL.ancrage).toBe('bas');
    expect(BOUTON_PRINCIPAL.desactiveePendantEnvoi).toBe(true);
  });

  it('une ligne de liste ne descend jamais sous la cible tactile', () => {
    expect(ligneListe({ touchable: true }).hauteurMin).toBeGreaterThanOrEqual(CIBLE_TACTILE_MIN);
  });

  it('le prix passe par @jp/money, jamais par une concaténation', () => {
    // `formater` sépare par une espace FINE INSÉCABLE (U+202F), pas une
    // espace ordinaire : un montant ne doit pas se couper en fin de ligne.
    expect(prixAriary(ariary(50_000), 'fr').texte).toBe('50\u202F000\u202FAr');
    expect(prixAriary(ariary(50_000)).couleur).toBe(COULEURS.montant);
  });

  it('l’image garde son substitut en mode économie de données', () => {
    const eco = imageProgressive({
      url: 'grande.jpg',
      substitut: 'flou.jpg',
      economieDonnees: true,
    });
    expect(eco.afficher).toBe('flou.jpg');
    expect(eco.chargerPleineResolution).toBe(false);

    const normal = imageProgressive({
      url: 'grande.jpg',
      substitut: 'flou.jpg',
      economieDonnees: false,
    });
    expect(normal.afficher).toBe('grande.jpg');
  });

  it('l’état vide propose une action — « aucun résultat » seul est un cul-de-sac', () => {
    const avec = etatVide({
      langue: 'fr',
      action: { libelle: 'Publier', cible: '/articles/neuf' },
    });
    expect(avec.action).not.toBeNull();
    expect(etatVide({ langue: 'fr' }).action).toBeNull();
  });

  it('le minuteur ne ment jamais — RB9', () => {
    // Il calcule depuis l'échéance rendue par le SERVEUR, jamais une durée
    // décidée côté client, qui dériverait avec l'horloge du téléphone.
    const maintenant = new Date('2026-08-19T10:00:00Z');
    const dans30min = new Date('2026-08-19T10:30:00Z');
    expect(minuteurReservation(dans30min, maintenant).libelle).toBe('30:00');
    expect(minuteurReservation(dans30min, maintenant).expire).toBe(false);

    const dans30s = new Date('2026-08-19T10:00:30Z');
    expect(minuteurReservation(dans30s, maintenant).couleur).toBe(COULEURS.danger);

    const passe = new Date('2026-08-19T09:00:00Z');
    expect(minuteurReservation(passe, maintenant).expire).toBe(true);
    expect(minuteurReservation(passe, maintenant).restantS).toBe(0); // jamais négatif
  });

  it('le badge lisible dans les quatre tons', () => {
    for (const ton of ['neutre', 'succes', 'attention', 'danger'] as const) {
      const b = badge(ton, 'Payée');
      expect(contraste(b.couleurTexte, b.fond), ton).toBeGreaterThanOrEqual(CONTRASTE_MIN);
    }
  });
});

describe('S7.3 — les quatre états', () => {
  it('hors ligne passe AVANT erreur', () => {
    // Une requête qui échoue faute de réseau n'est pas une panne du serveur,
    // et ne se raconte pas pareil.
    const e = etatDepuis({
      enCours: false,
      horsLigne: true,
      erreur: { code: 'X', message: 'boum' },
      donnees: [1],
    });
    expect(e.nom).toBe('hors-ligne');
  });

  it('garde les données périmées quand le réseau tombe', () => {
    const e = etatDepuis({ enCours: false, horsLigne: true, donnees: [1, 2] });
    expect(aQuelqueChoseAMontrer(e)).toBe(true); // on montre ce qu'on avait
  });

  it('une liste vide est « vide », pas « en chargement »', () => {
    expect(etatDepuis({ enCours: false, horsLigne: false, donnees: [] }).nom).toBe('vide');
    expect(etatDepuis({ enCours: false, horsLigne: false, donnees: [1] }).nom).toBe('charge');
  });

  it('rend un message traduit pour chaque état sauf « chargé »', () => {
    expect(messageEtat({ nom: 'chargement' }, 'fr')).toBe('Chargement…');
    expect(messageEtat({ nom: 'vide' }, 'en')).toBe('Nothing here yet.');
    expect(messageEtat({ nom: 'hors-ligne' }, 'fr')).toContain('Hors ligne');
    expect(messageEtat({ nom: 'charge', donnees: [1] }, 'fr')).toBeNull();
  });

  it('sans données ni erreur, on est en chargement', () => {
    expect(etatDepuis({ enCours: true, horsLigne: false }).nom).toBe('chargement');
    expect(etatDepuis({ enCours: false, horsLigne: false }).nom).toBe('chargement');
  });
});

describe('les univers dans l’interface — les décisions UX', () => {
  const deuxOuverts = [
    { cle: 'mode', onglet: 'Mode' },
    { cle: 'beaute', onglet: 'Beauté' },
  ];

  it('chaque accent d’univers est lisible sur texte blanc', () => {
    // Un seul design system, un seul accent qui change : assez pour savoir où
    // l'on est, trop peu pour se sentir ailleurs.
    const insuffisants: string[] = [];
    for (const [cle, couleur] of Object.entries(ACCENTS)) {
      const r = contraste(COULEURS.texteInverse, couleur);
      if (r < CONTRASTE_MIN) insuffisants.push(`${cle} : ${Math.round(r * 100) / 100}:1`);
    }
    expect(insuffisants, insuffisants.join('\n')).toEqual([]);
  });

  it('un univers inconnu retombe sur l’accent de la marque', () => {
    expect(accent('inexistant')).toBe(COULEURS.action);
  });

  it('le sélecteur ne s’affiche PAS s’il n’y a qu’un univers', () => {
    // Un sélecteur à une entrée n'est pas une aide : c'est du bruit qui
    // occupe 48 dp de hauteur utile.
    expect(selecteurUnivers({ ouverts: [deuxOuverts[0]!], courant: 'mode' }).visible).toBe(false);
    expect(selecteurUnivers({ ouverts: deuxOuverts, courant: 'mode' }).visible).toBe(true);
  });

  it('le sélecteur marque l’univers courant', () => {
    const s = selecteurUnivers({ ouverts: deuxOuverts, courant: 'beaute' });
    expect(s.entrees.find((e) => e.cle === 'beaute')!.actif).toBe(true);
    expect(s.entrees.find((e) => e.cle === 'mode')!.actif).toBe(false);
  });

  it('la signature ne s’affiche qu’à la première visite', () => {
    // La répéter à chaque ouverture la rendrait invisible.
    const params = { nom: 'JP Beauté', signature: 'Vrai produit, prix vrai', cle: 'beaute' };
    expect(enteteUnivers({ ...params, premiereVisite: true }).signature).toBe(
      'Vrai produit, prix vrai',
    );
    expect(enteteUnivers({ ...params, premiereVisite: false }).signature).toBeNull();
  });

  it('la pastille ne s’affiche que HORS de l’univers courant', () => {
    // Dans son propre univers, elle n'apprendrait rien et volerait la place.
    expect(
      pastilleUnivers({ cle: 'beaute', onglet: 'Beauté', universCourant: 'mode' }).visible,
    ).toBe(true);
    expect(pastilleUnivers({ cle: 'mode', onglet: 'Mode', universCourant: 'mode' }).visible).toBe(
      false,
    );
  });

  it('les cinq univers ont leur accent, y compris les fermés', () => {
    // Un univers fermé garde ses règles ET son identité visuelle : l'ouvrir
    // ne doit pas demander de travail de design.
    for (const cle of ['mode', 'beaute', 'tech', 'maison', 'enfant']) {
      expect(ACCENTS[cle], cle).toBeTruthy();
    }
  });
});
