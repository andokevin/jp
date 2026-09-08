-- ═══════════════════════════════════════════════════════════════════════════
-- Étape 2b4 — Colonnes internes du modèle `article` en anglais
-- ═══════════════════════════════════════════════════════════════════════════
--
-- La table `article` est déjà nommée en anglais. On ne touche que ses
-- colonnes internes en français. Les FK (`boutique_id`, `universe_key`,
-- `category_id`) sont déjà anglaises ou renommées dans les étapes précédentes.

BEGIN;

ALTER TABLE article RENAME COLUMN nom                TO name;
ALTER TABLE article RENAME COLUMN prix_ariary        TO price_ariary;
ALTER TABLE article RENAME COLUMN prix_barre_ariary  TO original_price_ariary;
ALTER TABLE article RENAME COLUMN statut             TO status;
ALTER TABLE article RENAME COLUMN type_vente         TO sale_type;
ALTER TABLE article RENAME COLUMN piece_unique       TO one_of_a_kind;
ALTER TABLE article RENAME COLUMN etat_vetement      TO clothing_condition;
ALTER TABLE article RENAME COLUMN mesures            TO measurements;
ALTER TABLE article RENAME COLUMN a_mesures          TO has_measurements;
ALTER TABLE article RENAME COLUMN achat_direct_actif TO live_purchase_enabled;
ALTER TABLE article RENAME COLUMN supprime_le        TO deleted_at;
ALTER TABLE article RENAME COLUMN cree_le            TO created_at;
ALTER TABLE article RENAME COLUMN maj_le             TO updated_at;
ALTER TABLE article RENAME COLUMN attributs          TO attributes;
ALTER TABLE article RENAME COLUMN epingle            TO pinned;
ALTER TABLE article RENAME COLUMN marque             TO brand;
ALTER TABLE article RENAME COLUMN matiere            TO material;
ALTER TABLE article RENAME COLUMN peremption_le      TO expiry_date;
ALTER TABLE article RENAME COLUMN position_vitrine   TO showcase_position;

-- ── Trigger `verifier_piece_unique` : le corps référence
--    `SELECT "piece_unique" FROM "article"`. On recrée avec le nouveau nom.

CREATE OR REPLACE FUNCTION "verifier_piece_unique"() RETURNS trigger AS $$
BEGIN
  IF (SELECT "one_of_a_kind" FROM "article" WHERE "id" = NEW."article_id")
     AND NEW."stock_quantity" > 1 THEN
    RAISE EXCEPTION 'Article en piece unique (F1.14) : stock maximal 1, recu %',
      NEW."stock_quantity";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;
