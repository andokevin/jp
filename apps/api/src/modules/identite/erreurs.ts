// apps/api/src/modules/identite/erreurs.ts

/**
 * Identite — codes d'erreur stables
 */

import { ErreurMetier } from '../../plateforme/erreurs.js';

export const ERREURS = {
  // Le nom de la variable est celui du GABARIT (« {remaining} »), pas celui du
  // paramètre TypeScript. `traduire` substitue par nom : « essais » ne
  // remplaçait rien, et le jeton partait tel quel jusqu'à l'écran.
  OTP_INVALIDE: (essaisRestants: number) =>
    new ErreurMetier('OTP_INVALIDE', 400, 'error.otp_invalid', {
      variables: { remaining: essaisRestants },
    }),

  OTP_EXPIRE: () => new ErreurMetier('OTP_EXPIRE', 410, 'error.otp_expired'),

  OTP_TENTATIVES_DEPASSEES: () =>
    new ErreurMetier('OTP_TENTATIVES_DEPASSEES', 400, 'error.otp_attempts_exhausted'),

  OTP_DEBIT_DEPASSE: (duration: string) =>
    new ErreurMetier('OTP_DEBIT_DEPASSE', 429, 'error.otp_rate_limited', {
      variables: { duration },
    }),

  EMAIL_DEJA_UTILISE: () => new ErreurMetier('EMAIL_DEJA_UTILISE', 409, 'error.email_already_used'),

  IDENTIFIANTS_INCORRECTS: () =>
    new ErreurMetier('IDENTIFIANTS_INCORRECTS', 401, 'error.invalid_credentials'),

  TOKEN_EXTERNE_INVALIDE: () =>
    new ErreurMetier('TOKEN_EXTERNE_INVALIDE', 401, 'error.invalid_external_token'),

  EMAIL_NON_VERIFIE: () => new ErreurMetier('EMAIL_NON_VERIFIE', 403, 'error.email_unverified'),
} as const;

export type CodeErreur = keyof typeof ERREURS;
