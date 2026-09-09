-- ═══════════════════════════════════════════════════════════════════════════
-- Étape 7 — Notification / direct / abonnement en anglais
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ═════════════════════════ ENUMS ══════════════════════════════════════════

-- statut_abonnement_boutique → shop_subscription_status
ALTER TYPE statut_abonnement_boutique RENAME VALUE 'actif'     TO 'active';
ALTER TYPE statut_abonnement_boutique RENAME VALUE 'en_retard' TO 'overdue';
ALTER TYPE statut_abonnement_boutique RENAME VALUE 'suspendu'  TO 'suspended';
ALTER TYPE statut_abonnement_boutique RENAME VALUE 'resilie'   TO 'cancelled';
ALTER TYPE statut_abonnement_boutique RENAME TO shop_subscription_status;

-- canal_notification → notification_channel  (push/sms/email déjà universels)
ALTER TYPE canal_notification RENAME VALUE 'dans_app' TO 'in_app';
ALTER TYPE canal_notification RENAME TO notification_channel;

-- statut_notification → notification_status
ALTER TYPE statut_notification RENAME VALUE 'en_attente' TO 'pending';
ALTER TYPE statut_notification RENAME VALUE 'envoyee'    TO 'sent';
ALTER TYPE statut_notification RENAME VALUE 'echouee'    TO 'failed';
ALTER TYPE statut_notification RENAME VALUE 'lue'        TO 'read';
ALTER TYPE statut_notification RENAME TO notification_status;

-- type_mise_en_avant → featured_type
ALTER TYPE type_mise_en_avant RENAME VALUE 'fil'         TO 'feed';
ALTER TYPE type_mise_en_avant RENAME VALUE 'recherche'   TO 'search';
ALTER TYPE type_mise_en_avant RENAME VALUE 'univers'     TO 'universe';
ALTER TYPE type_mise_en_avant RENAME VALUE 'evenement'   TO 'event';
ALTER TYPE type_mise_en_avant RENAME TO featured_type;

-- type_abonnement → subscription_type
ALTER TYPE type_abonnement RENAME VALUE 'boutique' TO 'shop';
ALTER TYPE type_abonnement RENAME VALUE 'createur' TO 'creator';
ALTER TYPE type_abonnement RENAME TO subscription_type;

-- statut_direct → live_status
ALTER TYPE statut_direct RENAME VALUE 'planifie' TO 'scheduled';
ALTER TYPE statut_direct RENAME VALUE 'en_cours' TO 'ongoing';
ALTER TYPE statut_direct RENAME VALUE 'en_pause' TO 'paused';
ALTER TYPE statut_direct RENAME VALUE 'termine'  TO 'ended';
ALTER TYPE statut_direct RENAME TO live_status;

-- statut_message → message_status
ALTER TYPE statut_message RENAME VALUE 'publie' TO 'published';
ALTER TYPE statut_message RENAME VALUE 'masque' TO 'hidden';
ALTER TYPE statut_message RENAME TO message_status;

-- ═════════════════════════ TABLES ═════════════════════════════════════════

-- ── abonnement → follow ─────────────────────────────────────────────────
ALTER TABLE abonnement RENAME COLUMN suiveur_id          TO follower_id;
ALTER TABLE abonnement RENAME COLUMN suivi_id            TO followed_id;
ALTER TABLE abonnement RENAME COLUMN notifications_promo TO promo_notifications;
ALTER TABLE abonnement RENAME COLUMN cree_le             TO created_at;
ALTER TABLE abonnement RENAME TO follow;

-- ── direct → live_stream ────────────────────────────────────────────────
ALTER TABLE direct RENAME COLUMN titre                TO title;
ALTER TABLE direct RENAME COLUMN affiche_url          TO poster_url;
ALTER TABLE direct RENAME COLUMN statut               TO status;
ALTER TABLE direct RENAME COLUMN debut_prevu_le       TO scheduled_start_at;
ALTER TABLE direct RENAME COLUMN debut_le             TO started_at;
ALTER TABLE direct RENAME COLUMN fin_le               TO ended_at;
ALTER TABLE direct RENAME COLUMN lecture_url          TO playback_url;
ALTER TABLE direct RENAME COLUMN enregistrement_url   TO recording_url;
ALTER TABLE direct RENAME COLUMN article_a_lecran_id  TO onscreen_article_id;
ALTER TABLE direct RENAME COLUMN nb_spectateurs_pic   TO peak_viewer_count;
ALTER TABLE direct RENAME COLUMN rediffusion_facebook TO facebook_rebroadcast;
ALTER TABLE direct RENAME COLUMN cree_le              TO created_at;
ALTER TABLE direct RENAME COLUMN maj_le               TO updated_at;
ALTER TABLE direct RENAME TO live_stream;

-- ── direct_article → live_stream_article ────────────────────────────────
ALTER TABLE direct_article RENAME COLUMN direct_id     TO live_stream_id;
ALTER TABLE direct_article RENAME COLUMN a_lecran_le   TO onscreen_at;
ALTER TABLE direct_article RENAME TO live_stream_article;

-- ── message_direct → live_stream_message ────────────────────────────────
ALTER TABLE message_direct RENAME COLUMN direct_id   TO live_stream_id;
ALTER TABLE message_direct RENAME COLUMN auteur_id   TO author_id;
ALTER TABLE message_direct RENAME COLUMN texte       TO text;
ALTER TABLE message_direct RENAME COLUMN statut      TO status;
ALTER TABLE message_direct RENAME COLUMN epingle     TO pinned;
ALTER TABLE message_direct RENAME COLUMN automatique TO automated;
ALTER TABLE message_direct RENAME COLUMN cree_le     TO created_at;
ALTER TABLE message_direct RENAME TO live_stream_message;

-- ── direct_bilan → live_stream_report ───────────────────────────────────
ALTER TABLE direct_bilan RENAME COLUMN direct_id           TO live_stream_id;
ALTER TABLE direct_bilan RENAME COLUMN duree_s             TO duration_s;
ALTER TABLE direct_bilan RENAME COLUMN spectateurs_uniques TO unique_viewers;
ALTER TABLE direct_bilan RENAME COLUMN pic_audience        TO peak_audience;
ALTER TABLE direct_bilan RENAME COLUMN nb_vendus           TO sold_count;
ALTER TABLE direct_bilan RENAME COLUMN ca                  TO revenue;
ALTER TABLE direct_bilan RENAME COLUMN taux_conversion     TO conversion_rate;
ALTER TABLE direct_bilan RENAME COLUMN nb_expirees         TO expired_count;
ALTER TABLE direct_bilan RENAME COLUMN articles_sans_vente TO unsold_articles;
ALTER TABLE direct_bilan RENAME COLUMN cree_le             TO created_at;
ALTER TABLE direct_bilan RENAME TO live_stream_report;

-- ── rang_client → customer_rank ─────────────────────────────────────────
ALTER TABLE rang_client RENAME COLUMN palier_id            TO tier_id;
ALTER TABLE rang_client RENAME COLUMN montant_cumule       TO total_amount;
ALTER TABLE rang_client RENAME COLUMN nb_commandes         TO order_count;
ALTER TABLE rang_client RENAME COLUMN derniere_commande_le TO last_order_at;
ALTER TABLE rang_client RENAME COLUMN nb_litiges_perdus    TO lost_disputes_count;
ALTER TABLE rang_client RENAME COLUMN nb_annulations       TO cancellations_count;
ALTER TABLE rang_client RENAME COLUMN calcule_le           TO computed_at;
ALTER TABLE rang_client RENAME TO customer_rank;

-- ── note_client → customer_note ─────────────────────────────────────────
ALTER TABLE note_client RENAME COLUMN texte  TO text;
ALTER TABLE note_client RENAME COLUMN maj_le TO updated_at;
ALTER TABLE note_client RENAME TO customer_note;

-- ── abonnement_boutique → shop_subscription ─────────────────────────────
ALTER TABLE abonnement_boutique RENAME COLUMN palier         TO tier;
ALTER TABLE abonnement_boutique RENAME COLUMN statut         TO status;
ALTER TABLE abonnement_boutique RENAME COLUMN quota_ventes   TO sales_quota;
ALTER TABLE abonnement_boutique RENAME COLUMN quota_directs  TO live_stream_quota;
ALTER TABLE abonnement_boutique RENAME COLUMN montant        TO amount;
ALTER TABLE abonnement_boutique RENAME COLUMN debut_le       TO starts_at;
ALTER TABLE abonnement_boutique RENAME COLUMN echeance_le    TO due_at;
ALTER TABLE abonnement_boutique RENAME COLUMN resilie_le     TO cancelled_at;
ALTER TABLE abonnement_boutique RENAME COLUMN cree_le        TO created_at;
ALTER TABLE abonnement_boutique RENAME COLUMN maj_le         TO updated_at;
ALTER TABLE abonnement_boutique RENAME TO shop_subscription;

-- ── adhesion_club → club_membership ─────────────────────────────────────
ALTER TABLE adhesion_club RENAME COLUMN montant       TO amount;
ALTER TABLE adhesion_club RENAME COLUMN seuil_offert  TO free_shipping_threshold;
ALTER TABLE adhesion_club RENAME COLUMN debut_le      TO starts_at;
ALTER TABLE adhesion_club RENAME COLUMN echeance_le   TO due_at;
ALTER TABLE adhesion_club RENAME COLUMN reconduction  TO auto_renew;
ALTER TABLE adhesion_club RENAME TO club_membership;

-- ── mise_en_avant → featured ────────────────────────────────────────────
ALTER TABLE mise_en_avant RENAME COLUMN cible_type  TO target_type;
ALTER TABLE mise_en_avant RENAME COLUMN cible_id    TO target_id;
ALTER TABLE mise_en_avant RENAME COLUMN montant     TO amount;
ALTER TABLE mise_en_avant RENAME COLUMN debut_le    TO starts_at;
ALTER TABLE mise_en_avant RENAME COLUMN fin_le      TO ends_at;
ALTER TABLE mise_en_avant RENAME COLUMN clics       TO clicks;
ALTER TABLE mise_en_avant RENAME COLUMN cree_le     TO created_at;
ALTER TABLE mise_en_avant RENAME TO featured;

-- ── lien_partage → share_link ───────────────────────────────────────────
ALTER TABLE lien_partage RENAME COLUMN createur_id  TO creator_id;
ALTER TABLE lien_partage RENAME COLUMN cible_type   TO target_type;
ALTER TABLE lien_partage RENAME COLUMN cible_id     TO target_id;
ALTER TABLE lien_partage RENAME COLUMN canal        TO channel;
ALTER TABLE lien_partage RENAME COLUMN clics        TO clicks;
ALTER TABLE lien_partage RENAME COLUMN inscriptions TO signups;
ALTER TABLE lien_partage RENAME COLUMN commandes    TO orders;
ALTER TABLE lien_partage RENAME COLUMN cree_le      TO created_at;
ALTER TABLE lien_partage RENAME TO share_link;

-- ── notification (nom identique) ────────────────────────────────────────
ALTER TABLE notification RENAME COLUMN destinataire_id TO recipient_id;
ALTER TABLE notification RENAME COLUMN canal           TO channel;
ALTER TABLE notification RENAME COLUMN statut          TO status;
ALTER TABLE notification RENAME COLUMN titre           TO title;
ALTER TABLE notification RENAME COLUMN corps           TO body;
ALTER TABLE notification RENAME COLUMN donnees         TO data;
ALTER TABLE notification RENAME COLUMN emetteur_id     TO sender_id;
ALTER TABLE notification RENAME COLUMN envoyee_le      TO sent_at;
ALTER TABLE notification RENAME COLUMN lue_le          TO read_at;
ALTER TABLE notification RENAME COLUMN cree_le         TO created_at;

-- ── notification_compteur → notification_counter ────────────────────────
ALTER TABLE notification_compteur RENAME COLUMN emetteur_id TO sender_id;
ALTER TABLE notification_compteur RENAME COLUMN jour        TO day;
ALTER TABLE notification_compteur RENAME COLUMN compte      TO count;
ALTER TABLE notification_compteur RENAME TO notification_counter;

-- ── preference_notification → notification_preference ───────────────────
ALTER TABLE preference_notification RENAME COLUMN canal TO channel;
ALTER TABLE preference_notification RENAME COLUMN actif TO enabled;
ALTER TABLE preference_notification RENAME TO notification_preference;

-- ── notification_sms (nom identique) ────────────────────────────────────
ALTER TABLE notification_sms RENAME COLUMN operateur  TO operator;
ALTER TABLE notification_sms RENAME COLUMN statut     TO status;
ALTER TABLE notification_sms RENAME COLUMN cout_ariary TO cost_ariary;
ALTER TABLE notification_sms RENAME COLUMN cree_le    TO created_at;

-- ── bareme_commission → commission_schedule ─────────────────────────────
ALTER TABLE bareme_commission RENAME COLUMN palier          TO tier;
ALTER TABLE bareme_commission RENAME COLUMN taux_pour_mille TO rate_per_mille;
ALTER TABLE bareme_commission RENAME COLUMN debut_le        TO starts_at;
ALTER TABLE bareme_commission RENAME COLUMN fin_le          TO ends_at;
ALTER TABLE bareme_commission RENAME COLUMN cree_le         TO created_at;
ALTER TABLE bareme_commission RENAME TO commission_schedule;

-- ── Trigger `bareme_cloture_seule` : le corps référencait `universe_key`,
--    `palier`, `taux_pour_mille`, `debut_le`. On recrée avec les nouveaux
--    noms de colonnes.

CREATE OR REPLACE FUNCTION "bareme_cloture_seule"() RETURNS trigger AS $$
BEGIN
  IF NEW."universe_key" <> OLD."universe_key"
     OR NEW."tier" <> OLD."tier"
     OR NEW."rate_per_mille" <> OLD."rate_per_mille"
     OR NEW."starts_at" <> OLD."starts_at" THEN
    RAISE EXCEPTION
      'Bareme historise (DP-15) : seule `fin_le` est modifiable. Cloturez la version et insérez-en une nouvelle.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;
