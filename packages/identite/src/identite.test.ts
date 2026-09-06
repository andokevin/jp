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

import { casesVides, chiffresDe, codeAssemble, caseSuivante, poser } from './code-otp.js';
import { etatInitial, peutEnvoyer, peutRenvoyer, reduire, type EtatParcours } from './parcours.js';

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
    expect(codeAssemble(poser(casesVides(), 0, '482153'))).toBe('482153');
  });

  it('accepte un collage sale — espaces, préfixe, retour à la ligne', () => {
    expect(chiffresDe('Code : 482 153\n')).toBe('482153');
    expect(codeAssemble(poser(casesVides(), 0, 'Code : 482 153\n'))).toBe('482153');
  });

  it('ne déborde jamais au-delà de six chiffres', () => {
    expect(chiffresDe('4821534821')).toBe('482153');
    // Collé sur l'avant-dernière case, il ne reste que deux places : les
    // chiffres en trop sont abandonnés, pas repliés sur le début.
    expect(codeAssemble(poser(casesVides(), 4, '482153'))).toBe('48');
  });

  it('avance le curseur d’une case à la frappe, jusqu’à la dernière au collage', () => {
    expect(caseSuivante(0, '4')).toBe(1);
    expect(caseSuivante(0, '482153')).toBe(5);
    expect(caseSuivante(5, '3')).toBe(5);
  });
});

describe('F0.1 — ce qui a été tapé n’est jamais perdu', () => {
  const avecCode = (): EtatParcours => {
    let e = reduire(etatInitial(), { type: 'saisirEmail', valeur: 'hanta.r@gmail.com' });
    e = reduire(e, { type: 'codeDemande', expireDansS: 600, maintenant: 0 });
    return reduire(e, { type: 'poserCode', index: 0, texte: '482153' });
  };

  it('GARDE les six chiffres après un code refusé (US-AUTH-02 CA4)', () => {
    const apres = reduire(avecCode(), {
      type: 'echec',
      panne: { code: 'OTP_INVALIDE', message: 'Diso ny kaody. Andramo indray.' },
    });
    expect(codeAssemble(apres.cases)).toBe('482153');
    expect(apres.enCours).toBe(false);
  });

  it('GARDE les six chiffres quand le réseau tombe', () => {
    const apres = reduire(avecCode(), { type: 'coupure' });
    expect(codeAssemble(apres.cases)).toBe('482153');
  });

  it('GARDE l’adresse quand on revient la corriger', () => {
    // « Modifier » sert à réparer une faute de frappe. Vider le champ
    // obligerait à tout retaper pour un caractère.
    const apres = reduire(avecCode(), { type: 'changerEmail' });
    expect(apres.email).toBe('hanta.r@gmail.com');
    expect(apres.etape).toBe('email');
    expect(codeAssemble(apres.cases)).toBe('');
  });
});

describe('F0.1 — hors ligne passe AVANT erreur', () => {
  it('une coupure efface le message d’erreur du serveur', () => {
    // Les deux affichés ensemble se contredisent : « code incorrect » accuse
    // la personne d'une faute alors que la requête n'est jamais partie.
    let e = reduire(etatInitial(), {
      type: 'echec',
      panne: { code: 'OTP_INVALIDE', message: 'Code incorrect. Réessayez.' },
    });
    e = reduire(e, { type: 'coupure' });
    expect(e.horsLigne).toBe(true);
    expect(e.panne).toBeNull();
  });

  it('DÉSACTIVE le bouton hors ligne, même avec une saisie valide', () => {
    let e = reduire(etatInitial(), { type: 'saisirEmail', valeur: 'hanta.r@gmail.com' });
    expect(peutEnvoyer(e)).toBe(true);
    e = reduire(e, { type: 'coupure' });
    expect(peutEnvoyer(e)).toBe(false);
    // …et la valeur reste visible : c'est ce que l'état « hors ligne » exige.
    expect(e.email).toBe('hanta.r@gmail.com');
  });
});

describe('F0.1 — le renvoi de code', () => {
  it('reste fermé une minute, puis s’ouvre', () => {
    // Le serveur n'accepte qu'un code par minute : proposer le renvoi plus tôt
    // ne produirait qu'un 429 et une explication à donner.
    const e = reduire(etatInitial(), { type: 'codeDemande', expireDansS: 600, maintenant: 0 });
    expect(peutRenvoyer(e, 59_000)).toBe(false);
    expect(peutRenvoyer(e, 60_000)).toBe(true);
  });

  it('remet six cases vides — sinon l’ancien code ferait échouer le nouveau', () => {
    let e = reduire(etatInitial(), { type: 'codeDemande', expireDansS: 600, maintenant: 0 });
    e = reduire(e, { type: 'poserCode', index: 0, texte: '111111' });
    e = reduire(e, { type: 'codeDemande', expireDansS: 600, maintenant: 90_000 });
    expect(codeAssemble(e.cases)).toBe('');
  });
});

describe('F0.1 — l’écran prénom ne s’ouvre que pour un compte sans prénom', () => {
  it('un compte tout juste créé passe par le prénom', () => {
    const e = reduire(etatInitial(), { type: 'sessionOuverte', session: SESSION_NOUVELLE });
    expect(e.etape).toBe('prenom');
  });

  it('un retour d’une personne déjà connue va droit au but', () => {
    const connue = {
      ...SESSION_NOUVELLE,
      utilisateur: { ...SESSION_NOUVELLE.utilisateur, prenom: 'Hanta', isNew: false },
    };
    const e = reduire(etatInitial(), { type: 'sessionOuverte', session: connue });
    expect(e.etape).toBe('termine');
  });
});
