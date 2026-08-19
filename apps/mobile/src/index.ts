/**
 * @jp/mobile — acheteuse, vendeuse, créatrice — S8
 *
 * Une seule application, trois rôles sur un même compte *(F0.4)*.
 *
 * Ce paquet contient la **logique** de la coquille : client API, file hors
 * ligne, liens profonds. Le rendu React Native arrive avec les écrans — il ne
 * sert à rien d'installer Expo avant d'avoir un écran à montrer, et sur ce
 * réseau l'installation coûte cher.
 */
export * from './noyau/client-api.js';
export * from './noyau/hors-ligne.js';
export * from './navigation/index.js';
