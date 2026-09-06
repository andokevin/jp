/**
 * F0.1 — le contrat d'authentification
 *
 * Un schéma de réponse ne vaut que s'il parse ce que le serveur envoie
 * réellement. Les objets de ce fichier sont copiés des `return` de
 * `apps/api/src/modules/identite/service.ts` : si le serveur change de forme,
 * c'est ICI que ça doit casser, pas dans un écran.
 */
import { describe, expect, it } from 'vitest';
import {
  demanderCodeOptSchema,
  OTP_MAX_ATTEMPTS,
  OTP_TTL_SECONDS,
  ReponseOtpSchema,
  ReponseSessionSchema,
  SESSION_TTL_MS,
  verifierCodeOptSchema,
} from './auth.js';

describe('F0.1 — la demande de code', () => {
  it('accepte une adresse seule et pose « inscription » par défaut', () => {
    const r = demanderCodeOptSchema.parse({ email: 'hanta.r@gmail.com' });
    expect(r.finalite).toBe('inscription');
  });

  it('PARSE la réponse réelle du serveur', () => {
    // service.demanderCode : `return { ok: true, expireDansS: OTP_TTL_SECONDS }`
    const reelle = { ok: true, expireDansS: OTP_TTL_SECONDS };
    expect(ReponseOtpSchema.parse(reelle)).toEqual(reelle);
  });

  it('la réponse ne dit RIEN du compte — ni message, ni délai propre à l’adresse', () => {
    // R-C9 : une réponse qui varierait selon l'existence du compte ferait de
    // l'écran de connexion un annuaire des personnes inscrites.
    expect(Object.keys(ReponseOtpSchema.shape).sort()).toEqual(['expireDansS', 'ok']);
  });
});

describe('F0.1 — la vérification du code', () => {
  it('exige six caractères, ni cinq ni sept', () => {
    const base = { email: 'hanta.r@gmail.com' };
    expect(verifierCodeOptSchema.safeParse({ ...base, code: '482153' }).success).toBe(true);
    expect(verifierCodeOptSchema.safeParse({ ...base, code: '48215' }).success).toBe(false);
    expect(verifierCodeOptSchema.safeParse({ ...base, code: '4821533' }).success).toBe(false);
  });

  it('accepte le malgache, désormais', () => {
    const r = verifierCodeOptSchema.parse({
      email: 'hanta.r@gmail.com',
      code: '482153',
      langue: 'mg',
    });
    expect(r.langue).toBe('mg');
  });

  it('PARSE la réponse réelle du serveur, clés françaises comprises', () => {
    // service.verifierCode : `return { jeton, expireLe, utilisateur: {…} }`.
    // Le schéma annonçait { token, user, expiresAt } — aucun client ne pouvait
    // lire une vraie réponse avec.
    const reelle = {
      jeton: 'sess_9f2c',
      expireLe: Date.now() + SESSION_TTL_MS,
      utilisateur: {
        id: '0b8f4c1e-7c3a-4b1d-9f61-2a5e8c7d0a11',
        email: 'hanta.r@gmail.com',
        prenom: null,
        hasPassword: false,
        isNew: true,
      },
    };
    const r = ReponseSessionSchema.parse(reelle);
    expect(r.utilisateur.isNew).toBe(true);
    // `prenom` NUL est le cas normal d'un compte tout juste créé : c'est lui qui
    // envoie l'écran prénom. Un schéma qui le refuserait casserait l'inscription.
    expect(r.utilisateur.prenom).toBeNull();
  });

  it('refuse une réponse à l’ancienne forme anglaise', () => {
    const ancienne = {
      token: 'sess_9f2c',
      expiresAt: 0,
      user: { id: 'x', email: 'a@b.mg', prenom: null, isNew: false },
    };
    expect(ReponseSessionSchema.safeParse(ancienne).success).toBe(false);
  });
});

describe('F0.1 — les constantes', () => {
  it('dix minutes de validité, cinq essais', () => {
    // Le décompte de l'écran code se cale sur OTP_TTL_SECONDS ; le message
    // « {restantes} essais » se cale sur OTP_MAX_ATTEMPTS.
    expect(OTP_TTL_SECONDS).toBe(600);
    expect(OTP_MAX_ATTEMPTS).toBe(5);
  });
});
