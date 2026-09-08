import { describe, expect, it } from 'vitest';
import {
  agree,
  CATALOGS,
  KEYS,
  date,
  shortDate,
  duration,
  integer,
  isLanguage,
  form,
  time,
  DEFAULT_LANGUAGE,
  LANGUAGES,
  languageFromHeader,
  FRENCH_EXPANSION,
  MALAGASY_EXPANSION,
  translate,
  variablesOf,
} from './index.js';

describe('les langues', () => {
  it('sont anglais, français et malgache — français par défaut', () => {
    expect(LANGUAGES).toEqual(['en', 'fr', 'mg']);
    // Le défaut reste le FRANÇAIS, même si les écrans proposent le malgache en
    // premier : c'est le repli d'un en-tête `Accept-Language` illisible, et il
    // doit tomber sur ce que le serveur sait rendre partout.
    expect(DEFAULT_LANGUAGE).toBe('fr');
  });

  it('reconnaît une language, refuse le reste', () => {
    expect(isLanguage('fr')).toBe(true);
    expect(isLanguage('en')).toBe(true);
    expect(isLanguage('mg')).toBe(true);
    for (const x of ['MG', 'FR', '', null, undefined, 42, {}]) {
      expect(isLanguage(x), String(x)).toBe(false);
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
  ])('« %s » → %s', (header, expected) => {
    expect(languageFromHeader(header)).toBe(expected);
  });

  it('retombe sur le français plutôt que d’échouer', () => {
    // Un en-tête absent ou incompréhensible ne doit JAMAIS empêcher
    // quelqu'un d'utiliser l'application.
    for (const x of ['', null, undefined, 'zzz', 'pt-BR', ';;;', ',,,']) {
      expect(languageFromHeader(x), String(x)).toBe('fr');
    }
  });
});

describe('le pluriel', () => {
  const f = { one: 'article', many: 'articles' } as const;
  const e = { one: 'item', many: 'items' } as const;

  it('le français met 0 au SINGULIER, l’anglais au pluriel', () => {
    // Le détail qui trahit une traduction faite à la hâte.
    expect(agree('fr', 0, f)).toBe('0 article');
    expect(agree('en', 0, e)).toBe('0 items');
  });

  it('accorde à partir de 2 en français, de 2 en anglais', () => {
    expect(agree('fr', 1, f)).toBe('1 article');
    expect(agree('fr', 2, f)).toBe('2 articles');
    expect(agree('en', 1, e)).toBe('1 item');
    expect(agree('en', 2, e)).toBe('2 items');
  });

  it('traite les négatifs par leur valeur absolue', () => {
    expect(form('fr', -3, f)).toBe('articles');
    expect(form('en', -1, e)).toBe('item');
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
    expect(shortDate(instant, 'fr')).toBe('19/08/2026');
  });

  it('affiche l’time d’Antananarivo, sur 24 h, jamais celle de l’appareil', () => {
    // Le fuseau est FIXÉ : une commande passée à 23 h 30 doit apparaître le
    // même jour pour tout le monde, même consultée depuis Paris.
    expect(time(instant, 'fr')).toBe('14:05');
    expect(time(instant, 'en')).toBe('14:05');
  });

  it('sépare les milliers', () => {
    expect(integer(1_250_000, 'fr')).toMatch(/1.250.000/);
    expect(integer(0, 'en')).toBe('0');
  });

  it('refuse un décimal — c’est le signe qu’un calcul a dérapé ailleurs', () => {
    expect(() => integer(1.5, 'fr')).toThrow(TypeError);
  });

  it('met les durées en mots', () => {
    expect(duration(1800, 'fr')).toBe('30 min');
    expect(duration(600, 'fr')).toBe('10 min');
    expect(duration(3600, 'fr')).toBe('1 h');
    expect(duration(5400, 'fr')).toBe('1 h 30');
    expect(duration(86_400, 'fr')).toBe('24 h');
    expect(() => duration(-1, 'fr')).toThrow(TypeError);
  });
});

describe('les catalogues', () => {
  it('les trois langues portent EXACTEMENT les mêmes clés', () => {
    // Le typage l'impose déjà à la compilation ; ce test le prouve à
    // l'exécution, au cas où un catalogue arriverait un jour d'ailleurs.
    const reference = Object.keys(CATALOGS.en).sort();
    for (const language of LANGUAGES) {
      expect(Object.keys(CATALOGS[language]).sort(), language).toEqual(reference);
    }
  });

  it('aucun message n’est vide', () => {
    for (const language of LANGUAGES) {
      for (const key of KEYS) {
        expect(CATALOGS[language][key].trim().length, `${language}/${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('les variables {nom} sont les mêmes dans les trois langues', () => {
    // Une traduction qui perd un {email} affiche une phrase amputée.
    const variables = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const key of KEYS) {
      const expected = variables(CATALOGS.en[key]);
      for (const language of LANGUAGES) {
        expect(variables(CATALOGS[language][key]), `${language}/${key}`).toEqual(expected);
      }
    }
  });

  it('LE TEST DE LARGEUR : chaque language tient dans la margin annoncée', () => {
    // C'est la contrainte de maquette, appliquée. Un libellé trop long déborde
    // d'un bouton dessiné à la largeur de l'anglais — et on le découvre ici,
    // pas sur un écran de 5 pouces. Chaque language a SA margin : le français
    // rallonge de 20 %, le malgache de 30 %.
    const margins = [
      ['fr', FRENCH_EXPANSION],
      ['mg', MALAGASY_EXPANSION],
    ] as const;

    const overflow: string[] = [];
    for (const [language, margin] of margins) {
      for (const key of KEYS) {
        const en = CATALOGS.en[key].length;
        const translated = CATALOGS[language][key].length;
        // Les messages courts échappent à la règle : « 0 » contre « 0 » n'a
        // aucun sens à mesurer, et un mot de 8 lettres peut légitimement en
        // faire 12.
        if (en < 20) continue;
        const max = Math.ceil(en * margin);
        if (translated > max) {
          overflow.push(`${key} : en ${en} → ${language} ${translated} (max ${max})`);
        }
      }
    }
    expect(overflow, overflow.join('\n')).toEqual([]);
  });
});

describe('translate', () => {
  it('rend la chaîne de la language demandée', () => {
    expect(translate('state.loading', 'fr')).toBe('Chargement…');
    expect(translate('state.loading', 'en')).toBe('Loading…');
  });

  it('utilise le français sans language précisée', () => {
    expect(translate('state.empty')).toBe('Rien ici pour le moment.');
  });

  it('remplace les variables', () => {
    expect(translate('otp.sent', 'fr', { email: 'a@jp.mg' })).toBe(
      'Code à 6 chiffres envoyé à a@jp.mg.',
    );
    expect(translate('otp.invalid', 'en', { remaining: 3 })).toBe(
      'This code is not correct. 3 attempts left.',
    );
  });

  it('laisse la variable visible si elle n’est pas fournie', () => {
    // Mieux vaut un « {email} » visible à l'écran qu'un « undefined » : le
    // premier se voit en recette, le second passe pour du contenu.
    expect(translate('otp.sent', 'fr')).toContain('{email}');
  });

  it('déclare les variables attendues par un message', () => {
    expect(variablesOf('otp.sent')).toEqual(['email']);
    expect(variablesOf('otp.invalid')).toEqual(['remaining']);
    expect(variablesOf('state.empty')).toEqual([]);
  });
});
