/**
 * universe.test.ts — les règles qui distinguent un universe d'une catégorie
 *
 * Chaque test répond à : « qu'est-ce qui casse si on traite les universe comme
 * un simple filtre ? »
 */
import { describe, expect, it } from 'vitest';
import {
  missingFields,
  shippingAllowed,
  reasonAcceptable,
  UNIVERSES,
  universe,
  openUniverses,
} from './universes.js';

describe('les trois universe', () => {
  it('trois universe, deux ouverts, Tech déclaré', () => {
    // L'abstraction est construite maintenant ; l'ouverture est une ligne de
    // configuration. La rétrofitter voudrait dire migrer chaque article.
    expect(UNIVERSES.map((u) => u.key)).toEqual(['mode', 'beaute', 'tech']);
    expect(openUniverses().map((u) => u.key)).toEqual(['mode', 'beaute']);
  });

  it('LES TROIS PARTAGENT LA MÊME LOGISTIQUE', () => {
    // C'est ce qui rend l'application identique dans les trois universe : ce
    // qui varie n'est pas le flux, ce sont trois listes — champs de fiche,
    // motifs de litige, taux de commission.
    //
    // Un universe plus lourd — du mobilier — aurait exigé le camion et deux
    // personnes, donc un second parcours de livraison. Il a été écarté pour
    // cette raison.
    const references = [...universe('mode')!.shipping].sort();
    for (const u of UNIVERSES) {
      expect([...u.shipping].sort(), u.key).toEqual(references);
    }
  });

  it('chacun porte un nom, une signature et une raison d’être', () => {
    for (const u of UNIVERSES) {
      expect(u.name, u.key).toMatch(/^JP /);
      expect(u.signature.length, u.key).toBeGreaterThan(10);
      // Un universe dont personne ne sait pourquoi il existe finit vide.
      expect(u.reason.length, u.key).toBeGreaterThan(40);
    }
  });

  it('l’onglet est court — il doit tenir dans une puce', () => {
    for (const u of UNIVERSES) {
      expect(u.tab.length, `${u.key} : ${u.tab}`).toBeLessThanOrEqual(7);
    }
  });

  it('les clés techniques sont uniques et sans accent', () => {
    // Elles vivent en base et dans les URL : elles ne changent jamais.
    const cles = UNIVERSES.map((u) => u.key);
    expect(new Set(cles).size).toBe(cles.length);
    for (const c of cles) expect(c, c).toMatch(/^[a-z_]+$/);
  });
});

describe('LA commission diffère — c’est ce qui empêche un universe vide', () => {
  it('Tech est nettement moins cher que Mode', () => {
    // Un revendeur de téléphones gagne ~5 % sur un appareil. Lui en prendre 8
    // rendrait JP Tech vide, quel que soit le reste du produit.
    expect(universe('tech')!.commissionPerMille).toBeLessThan(
      universe('mode')!.commissionPerMille / 2,
    );
    expect(universe('tech')!.commissionPerMille).toBe(30); // 3 %
    expect(universe('mode')!.commissionPerMille).toBe(80); // 8 %
  });

  it('aucun taux ne dépasse 30 %', () => {
    for (const u of UNIVERSES) {
      expect(u.commissionPerMille, u.key).toBeGreaterThan(0);
      expect(u.commissionPerMille, u.key).toBeLessThanOrEqual(300);
    }
  });
});

describe('LA livraison est la MÊME partout — c\u2019est un choix de périmètre', () => {
  it('les trois universe acceptent le point relais', () => {
    for (const u of UNIVERSES) {
      expect(shippingAllowed(u.key, 'point_relais'), u.key).toBe(true);
      expect(shippingAllowed(u.key, 'domicile'), u.key).toBe(true);
    }
  });

  it('Mode et Beauté acceptent le point relais', () => {
    expect(shippingAllowed('mode', 'point_relais')).toBe(true);
    expect(shippingAllowed('beaute', 'point_relais')).toBe(true);
  });

  it('aucun universe n\u2019exige de camion — le mobilier a été écarté', () => {
    // Le camion aurait imposé un second parcours de livraison et un second
    // métier. C'est la seule chose qui aurait changé le fonctionnement de
    // l'application d'un universe à l'autre.
    for (const u of UNIVERSES) {
      expect(u.shipping as readonly string[], u.key).not.toContain('camion');
    }
  });

  it('un universe inconnu ne permet rien', () => {
    // Un identifiant forgé ne doit pas ouvrir de porte.
    expect(shippingAllowed('inexistant', 'point_relais')).toBe(false);
  });
});

describe('LES MOTIFS DE LITIGE diffèrent — un litige mal qualifié est mal arbitré', () => {
  it('« pas ma taille » n’existe pas pour un téléphone', () => {
    expect(reasonAcceptable('mode', 'pas_la_bonne_taille')).toBe(true);
    expect(reasonAcceptable('tech', 'pas_la_bonne_taille')).toBe(false);
  });

  it('« batterie hors service » n’existe pas pour une robe', () => {
    expect(reasonAcceptable('tech', 'batterie_hors_service')).toBe(true);
    expect(reasonAcceptable('mode', 'batterie_hors_service')).toBe(false);
  });

  it('la péremption et la réaction cutanée sont propres à Beauté', () => {
    expect(reasonAcceptable('beaute', 'peremption_depassee')).toBe(true);
    expect(reasonAcceptable('beaute', 'reaction_cutanee')).toBe(true);
    expect(reasonAcceptable('mode', 'peremption_depassee')).toBe(false);
  });

  it('quatre motifs sont recevables PARTOUT', () => {
    // Non reçu, différent de la photo, endommagé au transport, contrefaçon :
    // ceux-là ne dépendent pas de ce qu'on vend.
    for (const u of UNIVERSES) {
      for (const m of [
        'non_recu',
        'different_de_la_photo',
        'endommage_au_transport',
        'contrefacon',
      ] as const) {
        expect(reasonAcceptable(u.key, m), `${u.key}/${m}`).toBe(true);
      }
    }
  });
});

describe('LA FICHE ARTICLE diffère', () => {
  it('Beauté EXIGE la péremption et le scellé', () => {
    // Un cosmétique contrefait ou périmé ne déçoit pas : il blesse. C'est la
    // différence de nature avec la mode, et elle justifie l'universe séparé.
    const manquants = missingFields('beaute', { marque: 'X' });
    expect(manquants).toContain('date_peremption');
    expect(manquants).toContain('scelle');
  });

  it('Mode n’exige pas de péremption', () => {
    expect(missingFields('mode', { taille: 'M', etat_vetement: 'bon' })).toEqual([]);
  });

  it('Tech exige l’IMEI', () => {
    expect(missingFields('tech', {})).toContain('imei');
  });

  it('rend la LISTE des champs manquants, pas un booléen', () => {
    // Un refus doit dire ce qui manque (R-V3, principe général).
    const manquants = missingFields('beaute', {});
    expect(manquants.length).toBeGreaterThan(1);
  });

  it('traite la chaîne vide comme manquante', () => {
    expect(missingFields('mode', { taille: '', etat_vetement: 'bon' })).toContain('taille');
  });

  it('tout champ obligatoire figure dans la fiche de son universe', () => {
    // Un champ exigé mais absent de la fiche serait impossible à renseigner.
    for (const u of UNIVERSES) {
      for (const c of u.requiredFields) {
        expect(u.listingFields, `${u.key}/${c}`).toContain(c);
      }
    }
  });
});

describe('la provenance', () => {
  it('est exigée là où le vol et la contrefaçon sont le sujet', () => {
    expect(universe('tech')!.sourceRequired).toBe(true); // téléphone volé
    expect(universe('beaute')!.sourceRequired).toBe(true); // contrefaçon dangereuse
    expect(universe('mode')!.sourceRequired).toBe(false); // une friperie n'a pas de facture
  });

  it('Tech est déclaré, pas ouvert', () => {
    // Il existe en base avec ses règles et son taux à 3 %, et n'apparaît
    // nulle part. L'ouvrir sera un UPDATE, quand le contrôle de provenance et
    // l'IMEI seront éprouvés sur de vrais dossiers.
    expect(universe('tech')!.open).toBe(false);
    expect(openUniverses().map((u) => u.key)).not.toContain('tech');
  });
});
