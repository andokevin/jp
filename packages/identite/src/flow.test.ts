/**
 * F0.1 — les règles du parcours, prouvées sans écran
 *
 * Ce qui est vérifié ici n'est pas « le composant s'affiche » mais les règles
 * que la maquette et EP00 imposent, et qu'un rendu ne prouverait pas : la
 * distribution d'un code collé, la conservation de ce qui a été tapé, et la
 * préséance du hors ligne sur l'erreur.
 *
 * Ces tests ont vécu dans `apps/web`. Ils suivent le code : la machine à états
 * n'appartient plus au web, et le mobile héritera de ces garanties sans qu'on
 * ait à les réécrire — c'est tout l'intérêt de la manœuvre.
 */
import { describe, expect, it } from 'vitest';

import { emptyBoxes, digitsOf, assembledCode, nextBox, setBox } from './otp-boxes.js';
import { initialState, canSubmit, canResend, reduce, type FlowState } from './flow.js';

const SESSION_NOUVELLE = {
  jeton: 'sess_9f2c',
  expireLe: 1_800_000_000_000,
  utilisateur: {
    id: '0b8f4c1e-7c3a-4b1d-9f61-2a5e8c7d0a11',
    email: 'hanta.r@gmail.com',
    prenom: null,
    hasPassword: false,
    isNew: true,
  },
};

describe('F0.1 — les six cases du code', () => {
  it('COLLE six chiffres dans la première case et remplit les six', () => {
    // L'affordance proprement web : sur un ordinateur, le code se copie depuis
    // la boîte mail. Sans distribution, la personne colle, voit un seul
    // chiffre, et retape tout à la main.
    expect(assembledCode(setBox(emptyBoxes(), 0, '482153'))).toBe('482153');
  });

  it('accepte un collage sale — espaces, préfixe, retour à la ligne', () => {
    expect(digitsOf('Code : 482 153\n')).toBe('482153');
    expect(assembledCode(setBox(emptyBoxes(), 0, 'Code : 482 153\n'))).toBe('482153');
  });

  it('ne déborde jamais au-delà de six chiffres', () => {
    expect(digitsOf('4821534821')).toBe('482153');
    // Collé sur l'avant-dernière case, il ne reste que deux places : les
    // chiffres en trop sont abandonnés, pas repliés sur le début.
    expect(assembledCode(setBox(emptyBoxes(), 4, '482153'))).toBe('48');
  });

  it('avance le curseur d’une case à la frappe, jusqu’à la dernière au collage', () => {
    expect(nextBox(0, '4')).toBe(1);
    expect(nextBox(0, '482153')).toBe(5);
    expect(nextBox(5, '3')).toBe(5);
  });
});

describe('F0.1 — ce qui a été tapé n’est jamais perdu', () => {
  const avecCode = (): FlowState => {
    let e = reduce(initialState(), { type: 'setEmail', value: 'hanta.r@gmail.com' });
    e = reduce(e, { type: 'codeRequested', expiresInS: 600, now: 0 });
    return reduce(e, { type: 'setCodeBox', index: 0, text: '482153' });
  };

  it('GARDE les six chiffres après un code refusé (US-AUTH-02 CA4)', () => {
    const apres = reduce(avecCode(), {
      type: 'failed',
      failure: { code: 'OTP_INVALIDE', message: 'Diso ny kaody. Andramo indray.' },
    });
    expect(assembledCode(apres.boxes)).toBe('482153');
    expect(apres.pending).toBe(false);
  });

  it('GARDE les six chiffres quand le réseau tombe', () => {
    const apres = reduce(avecCode(), { type: 'wentOffline' });
    expect(assembledCode(apres.boxes)).toBe('482153');
  });

  it('GARDE l’adresse quand on revient la corriger', () => {
    // « Modifier » sert à réparer une faute de frappe. Vider le champ
    // obligerait à tout retaper pour un caractère.
    const apres = reduce(avecCode(), { type: 'changeEmail' });
    expect(apres.email).toBe('hanta.r@gmail.com');
    expect(apres.step).toBe('email');
    expect(assembledCode(apres.boxes)).toBe('');
  });
});

describe('F0.1 — hors ligne passe AVANT erreur', () => {
  it('une coupure efface le message d’erreur du serveur', () => {
    // Les deux affichés ensemble se contredisent : « code incorrect » accuse
    // la personne d'une faute alors que la requête n'est jamais partie.
    let e = reduce(initialState(), {
      type: 'failed',
      failure: { code: 'OTP_INVALIDE', message: 'Code incorrect. Réessayez.' },
    });
    e = reduce(e, { type: 'wentOffline' });
    expect(e.offline).toBe(true);
    expect(e.failure).toBeNull();
  });

  it('DÉSACTIVE le bouton hors ligne, même avec une saisie valide', () => {
    let e = reduce(initialState(), { type: 'setEmail', value: 'hanta.r@gmail.com' });
    expect(canSubmit(e)).toBe(true);
    e = reduce(e, { type: 'wentOffline' });
    expect(canSubmit(e)).toBe(false);
    // …et la valeur reste visible : c'est ce que l'état « hors ligne » exige.
    expect(e.email).toBe('hanta.r@gmail.com');
  });
});

describe('F0.1 — le renvoi de code', () => {
  it('reste fermé une minute, puis s’ouvre', () => {
    // Le serveur n'accepte qu'un code par minute : proposer le renvoi plus tôt
    // ne produirait qu'un 429 et une explication à donner.
    const e = reduce(initialState(), { type: 'codeRequested', expiresInS: 600, now: 0 });
    expect(canResend(e, 59_000)).toBe(false);
    expect(canResend(e, 60_000)).toBe(true);
  });

  it('remet six cases vides — sinon l’ancien code ferait échouer le nouveau', () => {
    let e = reduce(initialState(), { type: 'codeRequested', expiresInS: 600, now: 0 });
    e = reduce(e, { type: 'setCodeBox', index: 0, text: '111111' });
    e = reduce(e, { type: 'codeRequested', expiresInS: 600, now: 90_000 });
    expect(assembledCode(e.boxes)).toBe('');
  });
});

describe('F0.1 — l’écran prénom ne s’ouvre que pour un compte sans prénom', () => {
  it('un compte tout juste créé passe par le prénom', () => {
    const e = reduce(initialState(), { type: 'sessionOpened', session: SESSION_NOUVELLE });
    expect(e.step).toBe('firstName');
  });

  it('un retour d’une personne déjà connue va droit au but', () => {
    const connue = {
      ...SESSION_NOUVELLE,
      utilisateur: { ...SESSION_NOUVELLE.utilisateur, prenom: 'Hanta', isNew: false },
    };
    const e = reduce(initialState(), { type: 'sessionOpened', session: connue });
    expect(e.step).toBe('done');
  });
});
