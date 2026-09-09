-- ═══════════════════════════════════════════════════════════════════════════
-- Étape 2c — Tables aval du catalogue en anglais
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Renomme les 4 tables aval du catalogue et leurs colonnes en français :
-- `mouvement_stock`, `alerte_stock`, `question_article`, `reservation`.
--
-- Aucune FK entrante — ce sont des feuilles du domaine. `utilisateur_id`
-- et `direct_id` conservés : renommés à leur propre étape.

BEGIN;

-- ── mouvement_stock → stock_movement ─────────────────────────────────────
ALTER TABLE mouvement_stock RENAME COLUMN quantite_delta TO quantity_delta;
ALTER TABLE mouvement_stock RENAME COLUMN auteur_id      TO author_id;
ALTER TABLE mouvement_stock RENAME COLUMN cree_le        TO created_at;
ALTER TABLE mouvement_stock RENAME TO stock_movement;

-- ── alerte_stock → stock_alert ───────────────────────────────────────────
ALTER TABLE alerte_stock RENAME COLUMN notifie_le TO notified_at;
ALTER TABLE alerte_stock RENAME COLUMN cree_le    TO created_at;
ALTER TABLE alerte_stock RENAME TO stock_alert;

-- ── question_article → article_question ──────────────────────────────────
ALTER TABLE question_article RENAME COLUMN auteur_id     TO author_id;
ALTER TABLE question_article RENAME COLUMN texte         TO text;
ALTER TABLE question_article RENAME COLUMN reponse_texte TO reply_text;
ALTER TABLE question_article RENAME COLUMN statut        TO status;
ALTER TABLE question_article RENAME COLUMN cree_le       TO created_at;
ALTER TABLE question_article RENAME TO article_question;

-- ── reservation (table déjà en anglais) — colonnes ───────────────────────
ALTER TABLE reservation RENAME COLUMN session_invitee_id TO guest_session_id;
ALTER TABLE reservation RENAME COLUMN quantite           TO quantity;
ALTER TABLE reservation RENAME COLUMN statut             TO status;
ALTER TABLE reservation RENAME COLUMN origine            TO origin;
ALTER TABLE reservation RENAME COLUMN rang               TO rank;
ALTER TABLE reservation RENAME COLUMN expire_le          TO expires_at;
ALTER TABLE reservation RENAME COLUMN suspendu_depuis    TO suspended_since;
ALTER TABLE reservation RENAME COLUMN cree_le            TO created_at;
ALTER TABLE reservation RENAME COLUMN maj_le             TO updated_at;

COMMIT;
