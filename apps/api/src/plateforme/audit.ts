/**
 * Journal d’audit
 *
 * `journal_audit` est en **ajout seul**, imposé par la base. Toute action
 * de back-office y passe, nominativement — y compris la simple consultation
 * d’une pièce d’identité *(R-V5)*.
 */

export const journaliser = {} as const;
