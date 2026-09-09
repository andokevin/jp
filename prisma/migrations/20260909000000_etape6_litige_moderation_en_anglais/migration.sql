-- ═══════════════════════════════════════════════════════════════════════════
-- Étape 6 — Litige / modération / signalement en anglais
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ═════════════════════════ ENUMS ══════════════════════════════════════════

-- motif_litige → dispute_reason
ALTER TYPE motif_litige RENAME VALUE 'non_recu'        TO 'not_received';
ALTER TYPE motif_litige RENAME VALUE 'abime'           TO 'damaged';
ALTER TYPE motif_litige RENAME VALUE 'non_conforme'    TO 'not_as_described';
ALTER TYPE motif_litige RENAME VALUE 'mauvaise_taille' TO 'wrong_size';
ALTER TYPE motif_litige RENAME VALUE 'autre'           TO 'other';
ALTER TYPE motif_litige RENAME TO dispute_reason;

-- statut_signalement_commande → order_dispute_status
ALTER TYPE statut_signalement_commande RENAME VALUE 'ouvert'        TO 'open';
ALTER TYPE statut_signalement_commande RENAME VALUE 'en_discussion' TO 'discussing';
ALTER TYPE statut_signalement_commande RENAME VALUE 'resolu'        TO 'resolved';
ALTER TYPE statut_signalement_commande RENAME TO order_dispute_status;

-- conformite_taille → size_fit
ALTER TYPE conformite_taille RENAME VALUE 'conforme' TO 'true_to_size';
ALTER TYPE conformite_taille RENAME VALUE 'petit'    TO 'runs_small';
ALTER TYPE conformite_taille RENAME VALUE 'grand'    TO 'runs_large';
ALTER TYPE conformite_taille RENAME TO size_fit;

-- niveau_signalement → report_level
ALTER TYPE niveau_signalement RENAME VALUE 'ordinaire' TO 'ordinary';
ALTER TYPE niveau_signalement RENAME VALUE 'urgence'   TO 'urgent';
ALTER TYPE niveau_signalement RENAME TO report_level;

-- statut_signalement → report_status
ALTER TYPE statut_signalement RENAME VALUE 'nouveau'  TO 'new';
ALTER TYPE statut_signalement RENAME VALUE 'en_cours' TO 'in_progress';
ALTER TYPE statut_signalement RENAME VALUE 'traite'   TO 'handled';
ALTER TYPE statut_signalement RENAME VALUE 'classe'   TO 'archived';
ALTER TYPE statut_signalement RENAME TO report_status;

-- type_sanction → sanction_type
ALTER TYPE type_sanction RENAME VALUE 'avertissement' TO 'warning';
ALTER TYPE type_sanction RENAME VALUE 'retrait'       TO 'removal';
ALTER TYPE type_sanction RENAME VALUE 'exclusion'     TO 'ban';
ALTER TYPE type_sanction RENAME TO sanction_type;

-- statut_republication → repost_status
ALTER TYPE statut_republication RENAME VALUE 'a_examiner' TO 'to_review';
ALTER TYPE statut_republication RENAME VALUE 'confirmee'  TO 'confirmed';
ALTER TYPE statut_republication RENAME VALUE 'ecartee'    TO 'dismissed';
ALTER TYPE statut_republication RENAME TO repost_status;

-- ═════════════════════════ TABLES ═════════════════════════════════════════

-- ── signalement_commande → order_dispute ─────────────────────────────────
ALTER TABLE signalement_commande RENAME COLUMN commande_id          TO order_id;
ALTER TABLE signalement_commande RENAME COLUMN ouvert_par_id        TO opened_by_id;
ALTER TABLE signalement_commande RENAME COLUMN motif                TO reason;
ALTER TABLE signalement_commande RENAME COLUMN statut               TO status;
ALTER TABLE signalement_commande RENAME COLUMN compte_dans_le_score TO counts_in_score;
ALTER TABLE signalement_commande RENAME COLUMN resolu_le            TO resolved_at;
ALTER TABLE signalement_commande RENAME COLUMN cree_le              TO created_at;
ALTER TABLE signalement_commande RENAME COLUMN maj_le               TO updated_at;
ALTER TABLE signalement_commande RENAME TO order_dispute;

-- ── message_litige → dispute_message ─────────────────────────────────────
ALTER TABLE message_litige RENAME COLUMN signalement_id TO dispute_id;
ALTER TABLE message_litige RENAME COLUMN auteur_id      TO author_id;
ALTER TABLE message_litige RENAME COLUMN texte          TO text;
ALTER TABLE message_litige RENAME COLUMN pieces_jointes TO attachments;
ALTER TABLE message_litige RENAME COLUMN cree_le        TO created_at;
ALTER TABLE message_litige RENAME TO dispute_message;

-- ── avis → review ────────────────────────────────────────────────────────
ALTER TABLE avis RENAME COLUMN commande_id         TO order_id;
ALTER TABLE avis RENAME COLUMN auteur_id           TO author_id;
ALTER TABLE avis RENAME COLUMN texte               TO text;
-- `photo_url` déjà en anglais.
ALTER TABLE avis RENAME COLUMN conformite_taille   TO size_fit;
ALTER TABLE avis RENAME COLUMN morphologie_autrice TO author_body_shape;
ALTER TABLE avis RENAME COLUMN contenu_id          TO content_id;
ALTER TABLE avis RENAME COLUMN reponse_texte       TO reply_text;
ALTER TABLE avis RENAME COLUMN reponse_le          TO replied_at;
ALTER TABLE avis RENAME COLUMN cree_le             TO created_at;
ALTER TABLE avis RENAME TO review;

-- ── score_confiance → trust_score ────────────────────────────────────────
ALTER TABLE score_confiance RENAME COLUMN nb_ventes_honorees     TO honored_sales_count;
ALTER TABLE score_confiance RENAME COLUMN delai_expedition_reel_h TO actual_shipping_delay_h;
ALTER TABLE score_confiance RENAME COLUMN taux_annulation        TO cancellation_rate;
ALTER TABLE score_confiance RENAME COLUMN taux_litige            TO dispute_rate;
ALTER TABLE score_confiance RENAME COLUMN decomposition          TO breakdown;
ALTER TABLE score_confiance RENAME COLUMN calcule_le             TO computed_at;
ALTER TABLE score_confiance RENAME TO trust_score;

-- ── signalement → report ─────────────────────────────────────────────────
ALTER TABLE signalement RENAME COLUMN cible_type      TO target_type;
ALTER TABLE signalement RENAME COLUMN cible_id        TO target_id;
ALTER TABLE signalement RENAME COLUMN signale_par_id  TO reported_by_id;
ALTER TABLE signalement RENAME COLUMN motif           TO reason;
ALTER TABLE signalement RENAME COLUMN niveau          TO level;
ALTER TABLE signalement RENAME COLUMN statut          TO status;
ALTER TABLE signalement RENAME COLUMN affecte_a_id    TO assigned_to_id;
ALTER TABLE signalement RENAME COLUMN traite_par_id   TO handled_by_id;
ALTER TABLE signalement RENAME COLUMN cree_le         TO created_at;
ALTER TABLE signalement RENAME TO report;

-- ── sanction (nom identique — colonnes) ──────────────────────────────────
-- `type` déjà en anglais.
ALTER TABLE sanction RENAME COLUMN motif_texte           TO reason_text;
ALTER TABLE sanction RENAME COLUMN duree                 TO duration;
ALTER TABLE sanction RENAME COLUMN applique_par_id       TO applied_by_id;
ALTER TABLE sanction RENAME COLUMN conteste              TO contested;
ALTER TABLE sanction RENAME COLUMN resultat_contestation TO contestation_outcome;
ALTER TABLE sanction RENAME COLUMN instruit_par_id       TO investigated_by_id;
ALTER TABLE sanction RENAME COLUMN cree_le               TO created_at;

-- ── blocage → user_block ─────────────────────────────────────────────────
ALTER TABLE blocage RENAME COLUMN bloqueur_id TO blocker_id;
ALTER TABLE blocage RENAME COLUMN bloque_id   TO blocked_id;
ALTER TABLE blocage RENAME COLUMN cree_le     TO created_at;
ALTER TABLE blocage RENAME TO user_block;

-- ── mot_bloque_personnel → blocked_word ──────────────────────────────────
ALTER TABLE mot_bloque_personnel RENAME COLUMN mot TO word;
ALTER TABLE mot_bloque_personnel RENAME TO blocked_word;

-- ── republication_suspectee → suspected_repost ───────────────────────────
ALTER TABLE republication_suspectee RENAME COLUMN contenu_id         TO content_id;
ALTER TABLE republication_suspectee RENAME COLUMN contenu_origine_id TO original_content_id;
ALTER TABLE republication_suspectee RENAME COLUMN proximite          TO similarity;
ALTER TABLE republication_suspectee RENAME COLUMN statut             TO status;
ALTER TABLE republication_suspectee RENAME COLUMN cree_le            TO created_at;
ALTER TABLE republication_suspectee RENAME TO suspected_repost;

COMMIT;
