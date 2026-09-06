import { describe, expect, it } from 'vitest';
import {
  accorder,
  CATALOGUES,
  CLES,
  date,
  dateCourte,
  duree,
  entier,
  estLangue,
  forme,
  heure,
  LANGUE_PAR_DEFAUT,
  LANGUES,
  langueDepuisEnTete,
  RALLONGEMENT_FRANCAIS,
  RALLONGEMENT_MALGACHE,
  traduire,
  variablesDe,
} from './index.js';

describe('les langues', () => {
  it('sont anglais, français et malgache — français par défaut', () => {
    expect(LANGUES).toEqual(['en', 'fr', 'mg']);
    // Le défaut reste le FRANÇAIS, même si les écrans proposent le malgache en
    // premier : c'est le repli d'un en-tête `Accept-Language` illisible, et il
    // doit tomber sur ce que le serveur sait rendre partout.
    expect(LANGUE_PAR_DEFAUT).toBe('fr');
  });

  it('reconnaît une langue, refuse le reste', () => {
    expect(estLangue('fr')).toBe(true);
    expect(estLangue('en')).toBe(true);
    expect(estLangue('mg')).toBe(true);
    for (const x of ['MG', 'FR', '', null, undefined, 42, {}]) {
      expect(estLangue(x), String(x)).toBe(false);
    }
  });
});

describe('Accept-Language', () => {
  it.each([
    ['en-US,en;q=0.9', 'en'],
    ['fr', 'fr'],
    ['fr-FR,fr;q=0.9,en;q=0.8', 'fr'],
    ['EN', 'en'],
    ['  en  ', 'en'],
    ['pt-BR,pt;q=0.9,en;q=0.5', 'en'],
    ['mg-MG,mg;q=0.9,fr;q=0.8', 'mg'],
    ['mg', 'mg'],
  ])('« %s » → %s', (enTete, attendu) => {
    expect(langueDepuisEnTete(enTete)).toBe(attendu);
  });

  it('retombe sur le français plutôt que d’échouer', () => {
    // Un en-tête absent ou incompréhensible ne doit JAMAIS empêcher
    // quelqu'un d'utiliser l'application.
    for (const x of ['', null, undefined, 'zzz', 'pt-BR', ';;;', ',,,']) {
      expect(langueDepuisEnTete(x), String(x)).toBe('fr');
    }
  });
});

describe('le pluriel', () => {
  const f = { un: 'article', plusieurs: 'articles' } as const;
  const e = { un: 'item', plusieurs: 'items' } as const;

  it('le français met 0 au SINGULIER, l’anglais au pluriel', () => {
    // Le détail qui trahit une traduction faite à la hâte.
    expect(accorder('fr', 0, f)).toBe('0 article');
    expect(accorder('en', 0, e)).toBe('0 items');
  });

  it('accorde à partir de 2 en français, de 2 en anglais', () => {
    expect(accorder('fr', 1, f)).toBe('1 article');
    expect(accorder('fr', 2, f)).toBe('2 articles');
    expect(accorder('en', 1, e)).toBe('1 item');
    expect(accorder('en', 2, e)).toBe('2 items');
  });

  it('traite les négatifs par leur valeur absolue', () => {
    expect(forme('fr', -3, f)).toBe('articles');
    expect(forme('en', -1, e)).toBe('item');
  });
});

describe('les formats', () => {
  // 19 août 2026, 14:05 à Antananarivo (UTC+3) = 11:05 UTC
  const instant = new Date('2026-08-19T11:05:00Z');

  it('affiche la date en toutes lettres dans les deux langues', () => {
    expect(date(instant, 'fr')).toContain('19');
    expect(date(instant, 'fr')).toContain('2026');
    expect(date(instant, 'en')).toContain('2026');
  });

  it('affiche la date courte sur deux chiffres', () => {
    expect(dateCourte(instant, 'fr')).toBe('19/08/2026');
  });

  it('affiche l’heure d’Antananarivo, sur 24 h, jamais celle de l’appareil', () => {
    // Le fuseau est FIXÉ : une commande passée à 23 h 30 doit apparaître le
    // même jour pour tout le monde, même consultée depuis Paris.
    expect(heure(instant, 'fr')).toBe('14:05');
    expect(heure(instant, 'en')).toBe('14:05');
  });

  it('sépare les milliers', () => {
    expect(entier(1_250_000, 'fr')).toMatch(/1.250.000/);
    expect(entier(0, 'en')).toBe('0');
  });

  it('refuse un décimal — c’est le signe qu’un calcul a dérapé ailleurs', () => {
    expect(() => entier(1.5, 'fr')).toThrow(TypeError);
  });

  it('met les durées en mots', () => {
    expect(duree(1800, 'fr')).toBe('30 min');
    expect(duree(600, 'fr')).toBe('10 min');
    expect(duree(3600, 'fr')).toBe('1 h');
    expect(duree(5400, 'fr')).toBe('1 h 30');
    expect(duree(86_400, 'fr')).toBe('24 h');
    expect(() => duree(-1, 'fr')).toThrow(TypeError);
  });
});

describe('les catalogues', () => {
  it('les trois langues portent EXACTEMENT les mêmes clés', () => {
    // Le typage l'impose déjà à la compilation ; ce test le prouve à
    // l'exécution, au cas où un catalogue arriverait un jour d'ailleurs.
    const reference = Object.keys(CATALOGUES.en).sort();
    for (const langue of LANGUES) {
      expect(Object.keys(CATALOGUES[langue]).sort(), langue).toEqual(reference);
    }
  });

  it('aucun message n’est vide', () => {
    for (const langue of LANGUES) {
      for (const cle of CLES) {
        expect(CATALOGUES[langue][cle].trim().length, `${langue}/${cle}`).toBeGreaterThan(0);
      }
    }
  });

  it('les variables {nom} sont les mêmes dans les trois langues', () => {
    // Une traduction qui perd un {email} affiche une phrase amputée.
    const variables = (texte: string) => [...texte.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const cle of CLES) {
      const attendu = variables(CATALOGUES.en[cle]);
      for (const langue of LANGUES) {
        expect(variables(CATALOGUES[langue][cle]), `${langue}/${cle}`).toEqual(attendu);
      }
    }
  });

  it('LE TEST DE LARGEUR : chaque langue tient dans la marge annoncée', () => {
    // C'est la contrainte de maquette, appliquée. Un libellé trop long déborde
    // d'un bouton dessiné à la largeur de l'anglais — et on le découvre ici,
    // pas sur un écran de 5 pouces. Chaque langue a SA marge : le français
    // rallonge de 20 %, le malgache de 30 %.
    const marges = [
      ['fr', RALLONGEMENT_FRANCAIS],
      ['mg', RALLONGEMENT_MALGACHE],
    ] as const;

    const debordent: string[] = [];
    for (const [langue, marge] of marges) {
      for (const cle of CLES) {
        const en = CATALOGUES.en[cle].length;
        const traduit = CATALOGUES[langue][cle].length;
        // Les messages courts échappent à la règle : « 0 » contre « 0 » n'a
        // aucun sens à mesurer, et un mot de 8 lettres peut légitimement en
        // faire 12.
        if (en < 20) continue;
        const max = Math.ceil(en * marge);
        if (traduit > max) {
          debordent.push(`${cle} : en ${en} → ${langue} ${traduit} (max ${max})`);
        }
      }
    }
    expect(debordent, debordent.join('\n')).toEqual([]);
  });
});

describe('traduire', () => {
  it('rend la chaîne de la langue demandée', () => {
    expect(traduire('etat.chargement', 'fr')).toBe('Chargement…');
    expect(traduire('etat.chargement', 'en')).toBe('Loading…');
  });

  it('utilise le français sans langue précisée', () => {
    expect(traduire('etat.vide')).toBe('Rien ici pour le moment.');
  });

  it('remplace les variables', () => {
    expect(traduire('otp.envoye', 'fr', { email: 'a@jp.mg' })).toBe(
      'Code à 6 chiffres envoyé à a@jp.mg.',
    );
    expect(traduire('otp.invalide', 'en', { restantes: 3 })).toBe(
      'This code is not correct. 3 attempts left.',
    );
  });

  it('laisse la variable visible si elle n’est pas fournie', () => {
    // Mieux vaut un « {email} » visible à l'écran qu'un « undefined » : le
    // premier se voit en recette, le second passe pour du contenu.
    expect(traduire('otp.envoye', 'fr')).toContain('{email}');
  });

  it('déclare les variables attendues par un message', () => {
    expect(variablesDe('otp.envoye')).toEqual(['email']);
    expect(variablesDe('otp.invalide')).toEqual(['restantes']);
    expect(variablesDe('etat.vide')).toEqual([]);
  });
});
