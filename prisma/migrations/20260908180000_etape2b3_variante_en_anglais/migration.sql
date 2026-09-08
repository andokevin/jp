-- ═══════════════════════════════════════════════════════════════════════════
-- Étape 2b3 — Table `variante` → `variant`
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── FK aval : `variante_id` → `variant_id` ──────────────────────────────

ALTER TABLE alerte_stock    RENAME COLUMN variante_id TO variant_id;
ALTER TABLE ligne_commande  RENAME COLUMN variante_id TO variant_id;
ALTER TABLE ligne_panier    RENAME COLUMN variante_id TO variant_id;
ALTER TABLE mouvement_stock RENAME COLUMN variante_id TO variant_id;
ALTER TABLE reservation     RENAME COLUMN variante_id TO variant_id;

-- ── Table `variante` : colonnes internes puis rename ────────────────────
-- `taille`, `couleur`, `sku` restent (`taille_unique` en valeur, cf. domaine).

ALTER TABLE variante RENAME COLUMN quantite_stock    TO stock_quantity;
ALTER TABLE variante RENAME COLUMN quantite_reservee TO reserved_quantity;
ALTER TABLE variante RENAME COLUMN seuil_alerte      TO alert_threshold;
ALTER TABLE variante RENAME COLUMN cree_le           TO created_at;
ALTER TABLE variante RENAME COLUMN maj_le            TO updated_at;
ALTER TABLE variante RENAME TO variant;

-- ── Trigger `verifier_piece_unique` — le corps PL/pgSQL référence
--    `NEW."quantite_stock"`. On recrée la fonction ET le trigger : la clause
--    `UPDATE OF` du trigger ne suit pas non plus le rename de colonne.

DROP TRIGGER IF EXISTS "variante_piece_unique" ON "variant";

CREATE OR REPLACE FUNCTION "verifier_piece_unique"() RETURNS trigger AS $$
BEGIN
  IF (SELECT "piece_unique" FROM "article" WHERE "id" = NEW."article_id")
     AND NEW."stock_quantity" > 1 THEN
    RAISE EXCEPTION 'Article en piece unique (F1.14) : stock maximal 1, recu %',
      NEW."stock_quantity";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "variante_piece_unique"
  BEFORE INSERT OR UPDATE OF "stock_quantity" ON "variant"
  FOR EACH ROW EXECUTE FUNCTION "verifier_piece_unique"();

COMMIT;
