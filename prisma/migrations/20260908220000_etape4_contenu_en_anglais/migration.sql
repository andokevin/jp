-- ═══════════════════════════════════════════════════════════════════════════
-- Étape 4 — Contenu / créateur en anglais
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ═════════════════════════ ENUMS ══════════════════════════════════════════

-- type_contenu → content_type  (valeurs déjà universelles : story, clip, photo, unboxing)
ALTER TYPE type_contenu RENAME TO content_type;

-- statut_contenu → content_status
ALTER TYPE statut_contenu RENAME VALUE 'brouillon' TO 'draft';
ALTER TYPE statut_contenu RENAME VALUE 'publie'    TO 'published';
ALTER TYPE statut_contenu RENAME VALUE 'retire'    TO 'withdrawn';
ALTER TYPE statut_contenu RENAME TO content_status;

-- commentaires_ouverts → comments_open
ALTER TYPE commentaires_ouverts RENAME VALUE 'tous'    TO 'everyone';
ALTER TYPE commentaires_ouverts RENAME VALUE 'abonnes' TO 'followers';
ALTER TYPE commentaires_ouverts RENAME VALUE 'aucun'   TO 'none';
ALTER TYPE commentaires_ouverts RENAME TO comments_open;

-- type_interaction → interaction_type
ALTER TYPE type_interaction RENAME VALUE 'vue'          TO 'view';
ALTER TYPE type_interaction RENAME VALUE 'commentaire'  TO 'comment';
ALTER TYPE type_interaction RENAME VALUE 'partage'      TO 'share';
ALTER TYPE type_interaction RENAME VALUE 'favori'       TO 'favorite';
ALTER TYPE type_interaction RENAME TO interaction_type;

-- statut_interaction → interaction_status
ALTER TYPE statut_interaction RENAME VALUE 'publie'         TO 'published';
ALTER TYPE statut_interaction RENAME VALUE 'masque_auto'    TO 'auto_hidden';
ALTER TYPE statut_interaction RENAME VALUE 'masque_autrice' TO 'author_hidden';
ALTER TYPE statut_interaction RENAME TO interaction_status;

-- ═════════════════════════ TABLES & COLONNES ══════════════════════════════

-- ── contenu → content ────────────────────────────────────────────────────
ALTER TABLE contenu RENAME COLUMN miniature_url       TO thumbnail_url;
ALTER TABLE contenu RENAME COLUMN duree_s             TO duration_s;
ALTER TABLE contenu RENAME COLUMN statut              TO status;
ALTER TABLE contenu RENAME COLUMN commande_source_id  TO source_order_id;
ALTER TABLE contenu RENAME COLUMN commentaires_ouverts TO comments_open;
ALTER TABLE contenu RENAME COLUMN publie_le           TO published_at;
ALTER TABLE contenu RENAME COLUMN expire_le           TO expires_at;
ALTER TABLE contenu RENAME COLUMN empreinte_video     TO video_fingerprint;
ALTER TABLE contenu RENAME COLUMN partenariat_id      TO partnership_id;
ALTER TABLE contenu RENAME COLUMN campagne_id         TO campaign_id;
ALTER TABLE contenu RENAME COLUMN sponsorise_declare  TO declared_sponsored;
ALTER TABLE contenu RENAME COLUMN auteur_majeur       TO author_adult;
ALTER TABLE contenu RENAME COLUMN supprime_le         TO deleted_at;
ALTER TABLE contenu RENAME COLUMN cree_le             TO created_at;
ALTER TABLE contenu RENAME COLUMN maj_le              TO updated_at;
ALTER TABLE contenu RENAME TO content;

-- ── contenu_article → content_article ────────────────────────────────────
ALTER TABLE contenu_article RENAME COLUMN contenu_id  TO content_id;
ALTER TABLE contenu_article RENAME COLUMN createur_id TO creator_id;
ALTER TABLE contenu_article RENAME TO content_article;

-- ── statistique_contenu → content_statistic ──────────────────────────────
ALTER TABLE statistique_contenu RENAME COLUMN contenu_id      TO content_id;
ALTER TABLE statistique_contenu RENAME COLUMN vues            TO views;
ALTER TABLE statistique_contenu RENAME COLUMN duree_moyenne_s TO avg_duration_s;
ALTER TABLE statistique_contenu RENAME COLUMN clics_article   TO article_clicks;
ALTER TABLE statistique_contenu RENAME COLUMN je_prends       TO take_it_clicks;
ALTER TABLE statistique_contenu RENAME COLUMN ventes          TO sales;
ALTER TABLE statistique_contenu RENAME COLUMN gains           TO earnings;
ALTER TABLE statistique_contenu RENAME COLUMN calcule_le      TO computed_at;
ALTER TABLE statistique_contenu RENAME TO content_statistic;

-- ── interaction (nom identique — colonnes) ───────────────────────────────
ALTER TABLE interaction RENAME COLUMN contenu_id TO content_id;
ALTER TABLE interaction RENAME COLUMN texte      TO text;
ALTER TABLE interaction RENAME COLUMN statut     TO status;
ALTER TABLE interaction RENAME COLUMN cree_le    TO created_at;

-- ── hashtag (nom identique — colonnes) ───────────────────────────────────
ALTER TABLE hashtag RENAME COLUMN mot         TO word;
ALTER TABLE hashtag RENAME COLUMN nb_contenus TO content_count;
ALTER TABLE hashtag RENAME COLUMN cree_le     TO created_at;

-- ── contenu_hashtag → content_hashtag ────────────────────────────────────
ALTER TABLE contenu_hashtag RENAME COLUMN contenu_id TO content_id;
ALTER TABLE contenu_hashtag RENAME TO content_hashtag;

-- ── Trigger `verifier_contenu_a_article` — corps PL/pgSQL référence
--    `NEW."statut" = 'publie'` et `FROM "contenu_article"`.

CREATE OR REPLACE FUNCTION "verifier_contenu_a_article"() RETURNS trigger AS $$
BEGIN
  IF NEW."status" = 'published'
     AND NOT EXISTS (SELECT 1 FROM "content_article" WHERE "content_id" = NEW."id") THEN
    RAISE EXCEPTION 'Contenu publie sans article (RB5, R-K1) : id %', NEW."id";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;
