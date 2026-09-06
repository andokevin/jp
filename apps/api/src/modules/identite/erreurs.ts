// apps/api/src/modules/identite/erreurs.ts

/**
 * Identite — codes d'erreur stables
 */

import { ErreurMetier } from '../../plateforme/erreurs.js';

export const ERREURS = {
  // Le nom de la variable est celui du GABARIT (« {restantes} »), pas celui du
  // paramètre TypeScript. `traduire` substitue par nom : « essais » ne
  // remplaçait rien, et le jeton partait tel quel jusqu'à l'écran.
  OTP_INVALIDE: (essaisRestants: number) =>
    new ErreurMetier('OTP_INVALIDE', 400, 'erreur.otp_invalide', {
      variables: { restantes: essaisRestants },
    }),

  OTP_EXPIRE: () => new ErreurMetier('OTP_EXPIRE', 410, 'erreur.otp_expire'),

  OTP_TENTATIVES_DEPASSEES: () =>
    new ErreurMetier('OTP_TENTATIVES_DEPASSEES', 400, 'erreur.otp_tentatives_depassees'),

  OTP_DEBIT_DEPASSE: (duree: string) =>
    new ErreurMetier('OTP_DEBIT_DEPASSE', 429, 'erreur.otp_debit_depasse', {
      variables: { duree },
    }),

  EMAIL_DEJA_UTILISE: () =>
    new ErreurMetier('EMAIL_DEJA_UTILISE', 409, 'erreur.email_deja_utilise'),

  IDENTIFIANTS_INCORRECTS: () =>
    new ErreurMetier('IDENTIFIANTS_INCORRECTS', 401, 'erreur.identifiants_incorrects'),

  TOKEN_EXTERNE_INVALIDE: () =>
    new ErreurMetier('TOKEN_EXTERNE_INVALIDE', 401, 'erreur.token_externe_invalide'),

  EMAIL_NON_VERIFIE: () => new ErreurMetier('EMAIL_NON_VERIFIE', 403, 'erreur.email_non_verifie'),
} as const;

export type CodeErreur = keyof typeof ERREURS;
