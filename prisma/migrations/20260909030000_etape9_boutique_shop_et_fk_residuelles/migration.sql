-- ═══════════════════════════════════════════════════════════════════════════
-- Étape 9 — Boutique → Shop + FK résiduelles (utilisateur_id, auteur_id,
--          direct_id, commande_id, contenu_id) en anglais
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── FK boutique_id → shop_id (17 tables) ────────────────────────────────
ALTER TABLE article            RENAME COLUMN boutique_id TO shop_id;
ALTER TABLE confirmed_sale_log RENAME COLUMN boutique_id TO shop_id;
ALTER TABLE customer_note      RENAME COLUMN boutique_id TO shop_id;
ALTER TABLE customer_rank      RENAME COLUMN boutique_id TO shop_id;
ALTER TABLE delivery_rate      RENAME COLUMN boutique_id TO shop_id;
ALTER TABLE featured           RENAME COLUMN boutique_id TO shop_id;
ALTER TABLE live_stream        RENAME COLUMN boutique_id TO shop_id;
ALTER TABLE loyalty_tier       RENAME COLUMN boutique_id TO shop_id;
ALTER TABLE order_line         RENAME COLUMN boutique_id TO shop_id;
ALTER TABLE promotion          RENAME COLUMN boutique_id TO shop_id;
ALTER TABLE review             RENAME COLUMN boutique_id TO shop_id;
ALTER TABLE shipment           RENAME COLUMN boutique_id TO shop_id;
ALTER TABLE shop_aggregate     RENAME COLUMN boutique_id TO shop_id;
ALTER TABLE shop_snippet       RENAME COLUMN boutique_id TO shop_id;
ALTER TABLE shop_subscription  RENAME COLUMN boutique_id TO shop_id;
ALTER TABLE team_member        RENAME COLUMN boutique_id TO shop_id;
ALTER TABLE trust_score        RENAME COLUMN boutique_id TO shop_id;

-- ── FK utilisateur_id → user_id (30+ tables) ────────────────────────────
ALTER TABLE address                 RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE affiliate_click         RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE blocked_word            RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE buyer_profile           RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE cart                    RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE club_membership         RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE confirmed_sale_log      RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE creator_profile         RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE customer_note           RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE customer_rank           RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE email_change_request    RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE event_reminder          RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE external_identity       RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE idempotency_key         RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE identity_document       RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE interaction             RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE look                    RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE notification_counter    RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE notification_preference RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE promotion_beneficiary   RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE reservation             RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE sanction                RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE session                 RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE stock_alert             RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE team_member             RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE usage_event             RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE wallet                  RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE wallet_movement         RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE wardrobe_item           RENAME COLUMN utilisateur_id TO user_id;
ALTER TABLE boutique                RENAME COLUMN utilisateur_id TO user_id;

-- ── FK auteur_id → author_id ────────────────────────────────────────────
ALTER TABLE content RENAME COLUMN auteur_id TO author_id;

-- ── FK direct_id → live_stream_id ───────────────────────────────────────
ALTER TABLE reservation  RENAME COLUMN direct_id TO live_stream_id;
ALTER TABLE sales_order  RENAME COLUMN direct_id TO live_stream_id;
ALTER TABLE shop_snippet RENAME COLUMN direct_id TO live_stream_id;

-- ── FK contenu_id → content_id ──────────────────────────────────────────
ALTER TABLE look RENAME COLUMN contenu_id TO content_id;

-- ── FK commande_id → sales_order_id ─────────────────────────────────────
ALTER TABLE gift_cart     RENAME COLUMN commande_id TO sales_order_id;
ALTER TABLE wardrobe_item RENAME COLUMN commande_id TO sales_order_id;

-- ── Table boutique + colonnes internes ──────────────────────────────────
ALTER TABLE boutique RENAME COLUMN nom                      TO name;
ALTER TABLE boutique RENAME COLUMN statut_verification      TO verification_status;
ALTER TABLE boutique RENAME COLUMN msisdn_mobile_money      TO mobile_money_msisdn;
ALTER TABLE boutique RENAME COLUMN supprimee_le             TO deleted_at;
ALTER TABLE boutique RENAME COLUMN cree_le                  TO created_at;
ALTER TABLE boutique RENAME COLUMN maj_le                   TO updated_at;
ALTER TABLE boutique RENAME COLUMN affiliation_autorisee    TO affiliation_allowed;
ALTER TABLE boutique RENAME COLUMN delai_expedition_moyen   TO average_shipping_delay;
ALTER TABLE boutique RENAME COLUMN directs_du_mois          TO monthly_live_streams;
ALTER TABLE boutique RENAME COLUMN fidelite_activee         TO loyalty_enabled;
ALTER TABLE boutique RENAME COLUMN nb_abonnes               TO followers_count;
ALTER TABLE boutique RENAME COLUMN score_confiance          TO trust_score;
ALTER TABLE boutique RENAME COLUMN taux_commission_createur TO creator_commission_rate;
ALTER TABLE boutique RENAME COLUMN taux_signalement         TO report_rate;
ALTER TABLE boutique RENAME COLUMN vente_gelee              TO sales_frozen;
ALTER TABLE boutique RENAME COLUMN ventes_du_mois           TO monthly_sales;
ALTER TABLE boutique RENAME TO shop;

COMMIT;
