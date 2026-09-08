-- ═══════════════════════════════════════════════════════════════════════════
-- Étape 2a — Enums du catalogue en anglais
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Renomme (sans perte de données) les 7 enums du domaine catalogue/stock.
-- Aucune table ni colonne n'est touchée — Postgres met à jour la référence
-- de type automatiquement. Les tables et colonnes catalogue seront traduites
-- en étape 2b.
--
-- `ALTER TYPE ... RENAME VALUE` : non bloquant depuis PostgreSQL 10.
-- `ALTER TYPE ... RENAME TO`    : ACCESS EXCLUSIVE LOCK bref sur les tables
--                                  utilisant le type. Négligeable en dev.

BEGIN;

-- 1. origine_vente → sale_origin
ALTER TYPE origine_vente RENAME VALUE 'evenement' TO 'event';
ALTER TYPE origine_vente RENAME TO sale_origin;

-- 2. statut_reservation → reservation_status
ALTER TYPE statut_reservation RENAME VALUE 'consommee' TO 'consumed';
ALTER TYPE statut_reservation RENAME VALUE 'expiree' TO 'expired';
ALTER TYPE statut_reservation RENAME VALUE 'annulee' TO 'cancelled';
ALTER TYPE statut_reservation RENAME VALUE 'en_file' TO 'queued';
ALTER TYPE statut_reservation RENAME TO reservation_status;

-- 3. type_mouvement_stock → stock_movement_type
ALTER TYPE type_mouvement_stock RENAME VALUE 'entree' TO 'intake';
ALTER TYPE type_mouvement_stock RENAME VALUE 'vente' TO 'sale';
ALTER TYPE type_mouvement_stock RENAME VALUE 'retour' TO 'return_movement';
ALTER TYPE type_mouvement_stock RENAME VALUE 'correction' TO 'adjustment';
ALTER TYPE type_mouvement_stock RENAME TO stock_movement_type;

-- 4. statut_question → question_status
ALTER TYPE statut_question RENAME VALUE 'publiee' TO 'published';
ALTER TYPE statut_question RENAME VALUE 'masquee' TO 'hidden';
ALTER TYPE statut_question RENAME TO question_status;

-- 5. statut_article → article_status
ALTER TYPE statut_article RENAME VALUE 'brouillon' TO 'draft';
ALTER TYPE statut_article RENAME VALUE 'en_ligne' TO 'online';
ALTER TYPE statut_article RENAME VALUE 'masque' TO 'hidden';
ALTER TYPE statut_article RENAME VALUE 'epuise' TO 'sold_out';
ALTER TYPE statut_article RENAME TO article_status;

-- 6. type_vente → sale_type  (`stock` déjà en anglais)
ALTER TYPE type_vente RENAME VALUE 'precommande' TO 'preorder';
ALTER TYPE type_vente RENAME TO sale_type;

-- 7. etat_vetement → clothing_condition
ALTER TYPE etat_vetement RENAME VALUE 'neuf_etiquette' TO 'new_with_tags';
ALTER TYPE etat_vetement RENAME VALUE 'tres_bon' TO 'excellent';
ALTER TYPE etat_vetement RENAME VALUE 'bon' TO 'good';
ALTER TYPE etat_vetement RENAME VALUE 'correct' TO 'fair';
ALTER TYPE etat_vetement RENAME TO clothing_condition;

COMMIT;
