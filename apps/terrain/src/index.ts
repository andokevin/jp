/**
 * @jp/terrain — livreur et point relais
 *
 * Une application, deux rôles. **Hors ligne d’abord** : un livreur dans une
 * ruelle sans réseau ne doit pas être empêché de travailler. Les preuves de
 * remise se synchronisent au retour du réseau.
 */

export const ROLES = ['livreur', 'point-relais'] as const;

export type RoleTerrain = (typeof ROLES)[number];
