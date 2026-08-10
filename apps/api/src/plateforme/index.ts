/**
 * Plateforme — le transverse, écrit une fois
 *
 * Tout ce qui est ici est écrit **une seule fois** et jamais réimplémenté
 * dans un module.
 *
 * **La plateforme ne connaît aucun domaine.** Si elle importe un module
 * métier, ce n’est plus une plateforme — la règle est appliquée par ESLint.
 */

export * from './erreurs.js';
export * from './auth.js';
export * from './permissions.js';
export * from './idempotence.js';
export * from './pagination.js';
export * from './debit.js';
export * from './audit.js';
export * from './contexte.js';
