/**
 * @jp/mobile — acheteuse, vendeuse, créatrice
 *
 * Une seule application, trois rôles sur un même compte *(F0.4)*.
 *
 * **Décision du 21/08/2026 : c'est le client PRINCIPAL.** La plupart des
 * acheteuses sont sur mobile, et le hors ligne y est vital — une acheteuse
 * arrivée au point relais sans réseau et sans son code de retrait repart sans
 * son colis, alors qu'elle a payé. `apps/web` ne porte plus que cinq pages
 * partageables, pour l'aperçu de lien.
 *
 * **Ce que ce fichier exporte est ÉPROUVABLE hors appareil.** Les liaisons
 * React Native — `noyau/stockage.ts` — n'y figurent pas volontairement : les
 * paquets Expo ne se chargent pas dans un test Node. L'application les importe
 * directement et les câble aux fonctions ci-dessous, qui reçoivent toutes leur
 * magasin en paramètre.
 *
 * C'est ce qui permet de tester la session, l'univers courant et la file hors
 * ligne **sans téléphone**.
 */
export * from './noyau/client-api.js';
export * from './noyau/hors-ligne.js';
export * from './noyau/langue.js';
export * from './noyau/magasin.js';
export * from './noyau/reseau.js';
export * from './noyau/session.js';
export * from './noyau/univers.js';
export * from './navigation/index.js';
