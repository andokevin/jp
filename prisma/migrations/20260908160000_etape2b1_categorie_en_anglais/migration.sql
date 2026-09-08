-- ═══════════════════════════════════════════════════════════════════════════
-- Étape 2b1 — Table `categorie` → `category`
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Renomme la table, ses colonnes internes et les FK qui la référencent dans
-- les tables aval (`article`, `promotion`). Les contraintes FK côté Postgres
-- restent valides — leur nom porte encore la référence textuelle à l'ancien
-- nom de table, sans conséquence fonctionnelle.

BEGIN;

-- ── Colonnes FK aval — à faire AVANT le rename de la table ──────────────
--    (l'ordre inverse fonctionne aussi, mais celui-ci reste lisible :
--     on lit encore `categorie` dans le nom de la table amont pendant qu'on
--     traite les FK.)

ALTER TABLE article   RENAME COLUMN categorie_id TO category_id;
ALTER TABLE promotion RENAME COLUMN categorie_id TO category_id;

-- ── Table `categorie` : colonnes internes puis rename final ─────────────
--    `parent_id` et `position` sont déjà universels — on ne touche pas.
--    `nom_fr` et `nom_en` sont des étiquettes bilingues du modèle : les
--    passer en anglais = `name_fr`, `name_en`.

ALTER TABLE categorie RENAME COLUMN nom_fr TO name_fr;
ALTER TABLE categorie RENAME COLUMN nom_en TO name_en;
ALTER TABLE categorie RENAME TO category;

COMMIT;
