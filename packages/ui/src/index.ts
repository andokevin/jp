/**
 * @jp/ui — le design system
 *
 * Jetons, les quatre états, et les sept primitives partagées.
 *
 * Ce paquet ne contient **aucun composant React**. Il porte les décisions —
 * valeurs, comportements, règles — que `apps/mobile` rend en React Native et
 * `apps/admin`/`apps/web` en HTML. React Native et le DOM n'ont ni les mêmes
 * éléments ni les mêmes styles ; une abstraction qui prétendrait les unifier
 * coûterait plus qu'elle ne rapporte.
 */
export * from './tokens.js';
export * from './states.js';
export * from './primitives.js';
export * from './universes.js';
