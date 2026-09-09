-- ═══════════════════════════════════════════════════════════════════════════
-- Étape 2b2 — Table `univers` → `universe`
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Renomme la table, ses colonnes internes, sa PK (`cle` → `key`) et les FK
-- aval qui la référencent dans les 5 tables aval : `article`, `commande`,
-- `signalement_commande`, `bareme_commission`, `agregat_boutique`.
--
-- Les valeurs de la PK (`mode`, `beaute`, `tech`) restent inchangées — ce
-- sont des identifiants d'univers, pas du vocabulaire.

BEGIN;

-- ── Colonnes FK aval — `univers_cle` → `universe_key` ────────────────────
--    Le schéma Prisma déclare 5 tables aval mais la base n'en porte que 4 :
--    `agregat_boutique` n'a pas de colonne `univers_cle` (le champ Prisma est
--    hors-schéma, à réconcilier ailleurs). On ne renomme que ce qui existe.

ALTER TABLE article              RENAME COLUMN univers_cle TO universe_key;
ALTER TABLE commande             RENAME COLUMN univers_cle TO universe_key;
ALTER TABLE signalement_commande RENAME COLUMN univers_cle TO universe_key;
ALTER TABLE bareme_commission    RENAME COLUMN univers_cle TO universe_key;

-- ── Table `univers` : colonnes puis rename final ────────────────────────

ALTER TABLE univers RENAME COLUMN cle                   TO key;
ALTER TABLE univers RENAME COLUMN nom                   TO name;
ALTER TABLE univers RENAME COLUMN onglet                TO tab;
ALTER TABLE univers RENAME COLUMN ouvert                TO is_open;
ALTER TABLE univers RENAME COLUMN commission_pour_mille TO commission_per_mille;
ALTER TABLE univers RENAME COLUMN rang                  TO rank;
ALTER TABLE univers RENAME COLUMN cree_le               TO created_at;
ALTER TABLE univers RENAME COLUMN maj_le                TO updated_at;
-- `signature` est identique en français et en anglais — inchangée.
ALTER TABLE univers RENAME TO universe;

-- ── Trigger `bareme_cloture_seule` : PL/pgSQL référence les noms de colonnes
--    en texte, jamais mis à jour par RENAME COLUMN. On recrée la fonction.

CREATE OR REPLACE FUNCTION "bareme_cloture_seule"() RETURNS trigger AS $$
BEGIN
  IF NEW."universe_key" <> OLD."universe_key"
     OR NEW."palier" <> OLD."palier"
     OR NEW."taux_pour_mille" <> OLD."taux_pour_mille"
     OR NEW."debut_le" <> OLD."debut_le" THEN
    RAISE EXCEPTION
      'Bareme historise (DP-15) : seule `fin_le` est modifiable. Cloturez la version et insérez-en une nouvelle.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;
