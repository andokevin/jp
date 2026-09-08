/**
 * F0.1 — les messages d'erreur arrivent ENTIERS
 *
 * Le serveur traduit lui-même ses messages : les clients remontent l'enveloppe
 * telle quelle et refusent par principe de retraduire. Personne en aval ne
 * peut donc rattraper un gabarit mal rempli — ce qui sort d'ici est ce que
 * l'utilisatrice lit.
 *
 * `translate` ne remplace que les jetons dont le nom est présent dans
 * `variables`, et **laisse le jeton visible sinon** — un choix délibéré, pour
 * qu'un « {remaining} » se remarque en recette plutôt qu'un « undefined » qui
 * passerait pour du contenu. Encore faut-il que quelqu'un regarde. C'est le
 * rôle de ce fichier.
 *
 * Ce que les tests existants ne pouvaient pas voir : `packages/i18n` compare
 * les catalogues ENTRE EUX (en ↔ fr ↔ mg), et ils sont parfaitement d'accord.
 * Le désaccord est ailleurs — entre le catalogue et celui qui l'appelle — et
 * le typage ne peut rien y faire, `variables` étant un `Record<string, …>` qui
 * accepte n'importe quelle clé.
 */
import { describe, expect, it } from 'vitest';
import { LANGUAGES, variablesOf, type MessageKey } from '@jp/i18n';

import { ERREURS } from '../src/modules/identite/erreurs.js';
import { erreurs, ErreurMetier } from '../src/plateforme/erreurs.js';

/** Toutes les erreurs du dépôt, construites avec des arguments plausibles. */
const TOUTES: readonly (readonly [string, ErreurMetier])[] = [
  ['OTP_INVALIDE', ERREURS.OTP_INVALIDE(3)],
  ['OTP_EXPIRE', ERREURS.OTP_EXPIRE()],
  ['OTP_TENTATIVES_DEPASSEES', ERREURS.OTP_TENTATIVES_DEPASSEES()],
  ['OTP_DEBIT_DEPASSE', ERREURS.OTP_DEBIT_DEPASSE('60s')],
  ['EMAIL_DEJA_UTILISE', ERREURS.EMAIL_DEJA_UTILISE()],
  ['IDENTIFIANTS_INCORRECTS', ERREURS.IDENTIFIANTS_INCORRECTS()],
  ['TOKEN_EXTERNE_INVALIDE', ERREURS.TOKEN_EXTERNE_INVALIDE()],
  ['EMAIL_NON_VERIFIE', ERREURS.EMAIL_NON_VERIFIE()],
  ['REQUETE_INVALIDE', erreurs.requeteInvalide()],
  ['NON_AUTHENTIFIE', erreurs.nonAuthentifie()],
  ['NON_AUTORISE', erreurs.nonAutorise()],
  ['INTROUVABLE', erreurs.introuvable()],
  ['CONFLIT', erreurs.conflit()],
  ['DEBIT_DEPASSE', erreurs.debitDepasse('4 min')],
  ['CLE_IDEMPOTENCE_MANQUANTE', erreurs.cleIdempotenceManquante()],
  ['CLE_IDEMPOTENCE_REUTILISEE', erreurs.cleIdempotenceReutilisee()],
  ['REQUETE_EN_COURS', erreurs.requeteEnCours()],
];

describe('F0.1 — aucun message ne part avec un trou dedans', () => {
  it('AUCUN jeton {nom} ne survit à la mise en forme, dans AUCUNE langue', () => {
    // Le test qui compte. Il ne connaît pas les noms de variables et n'a pas
    // à les connaître : il regarde ce qui sort. Une erreur ajoutée demain avec
    // un nom de variable approximatif tombera ici, sans que personne ait à y
    // penser.
    const troues: string[] = [];
    for (const [nom, erreur] of TOUTES) {
      for (const langue of LANGUAGES) {
        const message = erreur.versReponse(langue).message;
        const restes = [...message.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
        if (restes.length > 0) {
          troues.push(`${nom} / ${langue} : « ${message} » — non substitué : ${restes.join(', ')}`);
        }
      }
    }
    expect(troues, troues.join('\n')).toEqual([]);
  });

  it('chaque erreur fournit EXACTEMENT les variables que son gabarit réclame', () => {
    // Le même défaut, dit à l'endroit où il naît plutôt qu'à l'endroit où il
    // se voit. Une variable en trop est inoffensive mais signale une confusion
    // — on la refuse aussi.
    const desaccords: string[] = [];
    for (const [nom, erreur] of TOUTES) {
      const attendues = [...variablesOf(erreur.cleMessage as MessageKey)].sort();
      const fournies = Object.keys(erreur.options.variables ?? {}).sort();
      if (attendues.join(',') !== fournies.join(',')) {
        desaccords.push(
          `${nom} (${erreur.cleMessage}) : attend [${attendues.join(', ')}], reçoit [${fournies.join(', ')}]`,
        );
      }
    }
    expect(desaccords, desaccords.join('\n')).toEqual([]);
  });

  it('le compte d’essais restants arrive bien jusqu’au message', () => {
    // Le cas concret : c'est ce nombre qui dit à quelqu'un s'il lui reste une
    // chance ou quatre. Un « {remaining} » à sa place transforme un refus
    // utile en charabia, sur l'écran le plus fragile du parcours.
    for (const langue of LANGUAGES) {
      expect(ERREURS.OTP_INVALIDE(3).versReponse(langue).message, langue).toContain('3');
    }
  });
});
