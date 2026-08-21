/**
 * univers.test.ts — les règles qui distinguent un univers d'une catégorie
 *
 * Chaque test répond à : « qu'est-ce qui casse si on traite les univers comme
 * un simple filtre ? »
 */
import { describe, expect, it } from 'vitest';
import {
  champsManquants,
  livraisonPermise,
  motifRecevable,
  UNIVERS,
  univers,
  universOuverts,
} from './univers.js';

describe('les trois univers', () => {
  it('trois univers, deux ouverts, Tech déclaré', () => {
    // L'abstraction est construite maintenant ; l'ouverture est une ligne de
    // configuration. La rétrofitter voudrait dire migrer chaque article.
    expect(UNIVERS.map((u) => u.cle)).toEqual(['mode', 'beaute', 'tech']);
    expect(universOuverts().map((u) => u.cle)).toEqual(['mode', 'beaute']);
  });

  it('LES TROIS PARTAGENT LA MÊME LOGISTIQUE', () => {
    // C'est ce qui rend l'application identique dans les trois univers : ce
    // qui varie n'est pas le flux, ce sont trois listes — champs de fiche,
    // motifs de litige, taux de commission.
    //
    // Un univers plus lourd — du mobilier — aurait exigé le camion et deux
    // personnes, donc un second parcours de livraison. Il a été écarté pour
    // cette raison.
    const references = [...univers('mode')!.livraisons].sort();
    for (const u of UNIVERS) {
      expect([...u.livraisons].sort(), u.cle).toEqual(references);
    }
  });

  it('chacun porte un nom, une signature et une raison d’être', () => {
    for (const u of UNIVERS) {
      expect(u.nom, u.cle).toMatch(/^JP /);
      expect(u.signature.length, u.cle).toBeGreaterThan(10);
      // Un univers dont personne ne sait pourquoi il existe finit vide.
      expect(u.raison.length, u.cle).toBeGreaterThan(40);
    }
  });

  it('l’onglet est court — il doit tenir dans une puce', () => {
    for (const u of UNIVERS) {
      expect(u.onglet.length, `${u.cle} : ${u.onglet}`).toBeLessThanOrEqual(7);
    }
  });

  it('les clés techniques sont uniques et sans accent', () => {
    // Elles vivent en base et dans les URL : elles ne changent jamais.
    const cles = UNIVERS.map((u) => u.cle);
    expect(new Set(cles).size).toBe(cles.length);
    for (const c of cles) expect(c, c).toMatch(/^[a-z_]+$/);
  });
});

describe('LA commission diffère — c’est ce qui empêche un univers vide', () => {
  it('Tech est nettement moins cher que Mode', () => {
    // Un revendeur de téléphones gagne ~5 % sur un appareil. Lui en prendre 8
    // rendrait JP Tech vide, quel que soit le reste du produit.
    expect(univers('tech')!.commissionPourMille).toBeLessThan(
      univers('mode')!.commissionPourMille / 2,
    );
    expect(univers('tech')!.commissionPourMille).toBe(30); // 3 %
    expect(univers('mode')!.commissionPourMille).toBe(80); // 8 %
  });

  it('aucun taux ne dépasse 30 %', () => {
    for (const u of UNIVERS) {
      expect(u.commissionPourMille, u.cle).toBeGreaterThan(0);
      expect(u.commissionPourMille, u.cle).toBeLessThanOrEqual(300);
    }
  });
});

describe('LA livraison est la MÊME partout — c\u2019est un choix de périmètre', () => {
  it('les trois univers acceptent le point relais', () => {
    for (const u of UNIVERS) {
      expect(livraisonPermise(u.cle, 'point_relais'), u.cle).toBe(true);
      expect(livraisonPermise(u.cle, 'domicile'), u.cle).toBe(true);
    }
  });

  it('Mode et Beauté acceptent le point relais', () => {
    expect(livraisonPermise('mode', 'point_relais')).toBe(true);
    expect(livraisonPermise('beaute', 'point_relais')).toBe(true);
  });

  it('aucun univers n\u2019exige de camion — le mobilier a été écarté', () => {
    // Le camion aurait imposé un second parcours de livraison et un second
    // métier. C'est la seule chose qui aurait changé le fonctionnement de
    // l'application d'un univers à l'autre.
    for (const u of UNIVERS) {
      expect(u.livraisons as readonly string[], u.cle).not.toContain('camion');
    }
  });

  it('un univers inconnu ne permet rien', () => {
    // Un identifiant forgé ne doit pas ouvrir de porte.
    expect(livraisonPermise('inexistant', 'point_relais')).toBe(false);
  });
});

describe('LES MOTIFS DE LITIGE diffèrent — un litige mal qualifié est mal arbitré', () => {
  it('« pas ma taille » n’existe pas pour un téléphone', () => {
    expect(motifRecevable('mode', 'pas_la_bonne_taille')).toBe(true);
    expect(motifRecevable('tech', 'pas_la_bonne_taille')).toBe(false);
  });

  it('« batterie hors service » n’existe pas pour une robe', () => {
    expect(motifRecevable('tech', 'batterie_hors_service')).toBe(true);
    expect(motifRecevable('mode', 'batterie_hors_service')).toBe(false);
  });

  it('la péremption et la réaction cutanée sont propres à Beauté', () => {
    expect(motifRecevable('beaute', 'peremption_depassee')).toBe(true);
    expect(motifRecevable('beaute', 'reaction_cutanee')).toBe(true);
    expect(motifRecevable('mode', 'peremption_depassee')).toBe(false);
  });

  it('quatre motifs sont recevables PARTOUT', () => {
    // Non reçu, différent de la photo, endommagé au transport, contrefaçon :
    // ceux-là ne dépendent pas de ce qu'on vend.
    for (const u of UNIVERS) {
      for (const m of [
        'non_recu',
        'different_de_la_photo',
        'endommage_au_transport',
        'contrefacon',
      ] as const) {
        expect(motifRecevable(u.cle, m), `${u.cle}/${m}`).toBe(true);
      }
    }
  });
});

describe('LA FICHE ARTICLE diffère', () => {
  it('Beauté EXIGE la péremption et le scellé', () => {
    // Un cosmétique contrefait ou périmé ne déçoit pas : il blesse. C'est la
    // différence de nature avec la mode, et elle justifie l'univers séparé.
    const manquants = champsManquants('beaute', { marque: 'X' });
    expect(manquants).toContain('date_peremption');
    expect(manquants).toContain('scelle');
  });

  it('Mode n’exige pas de péremption', () => {
    expect(champsManquants('mode', { taille: 'M', etat_vetement: 'bon' })).toEqual([]);
  });

  it('Tech exige l’IMEI', () => {
    expect(champsManquants('tech', {})).toContain('imei');
  });

  it('rend la LISTE des champs manquants, pas un booléen', () => {
    // Un refus doit dire ce qui manque (R-V3, principe général).
    const manquants = champsManquants('beaute', {});
    expect(manquants.length).toBeGreaterThan(1);
  });

  it('traite la chaîne vide comme manquante', () => {
    expect(champsManquants('mode', { taille: '', etat_vetement: 'bon' })).toContain('taille');
  });

  it('tout champ obligatoire figure dans la fiche de son univers', () => {
    // Un champ exigé mais absent de la fiche serait impossible à renseigner.
    for (const u of UNIVERS) {
      for (const c of u.champsObligatoires) {
        expect(u.champsFiche, `${u.cle}/${c}`).toContain(c);
      }
    }
  });
});

describe('la provenance', () => {
  it('est exigée là où le vol et la contrefaçon sont le sujet', () => {
    expect(univers('tech')!.provenanceExigee).toBe(true); // téléphone volé
    expect(univers('beaute')!.provenanceExigee).toBe(true); // contrefaçon dangereuse
    expect(univers('mode')!.provenanceExigee).toBe(false); // une friperie n'a pas de facture
  });

  it('Tech est déclaré, pas ouvert', () => {
    // Il existe en base avec ses règles et son taux à 3 %, et n'apparaît
    // nulle part. L'ouvrir sera un UPDATE, quand le contrôle de provenance et
    // l'IMEI seront éprouvés sur de vrais dossiers.
    expect(univers('tech')!.ouvert).toBe(false);
    expect(universOuverts().map((u) => u.cle)).not.toContain('tech');
  });
});
