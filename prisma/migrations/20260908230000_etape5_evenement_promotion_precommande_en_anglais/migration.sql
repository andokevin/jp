-- ═══════════════════════════════════════════════════════════════════════════
-- Étape 5 — Événement / promotion / précommande / fidélité en anglais
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ═════════════════════════ ENUMS ══════════════════════════════════════════

-- palier_abonnement → subscription_tier
ALTER TYPE palier_abonnement RENAME VALUE 'gratuit'   TO 'free';
ALTER TYPE palier_abonnement RENAME VALUE 'essentiel' TO 'essential';
ALTER TYPE palier_abonnement RENAME TO subscription_tier;

-- statut_precommande → preorder_status
ALTER TYPE statut_precommande RENAME VALUE 'ouverte'       TO 'open';
ALTER TYPE statut_precommande RENAME VALUE 'seuil_atteint' TO 'threshold_reached';
ALTER TYPE statut_precommande RENAME VALUE 'expiree'       TO 'expired';
ALTER TYPE statut_precommande RENAME VALUE 'remboursee'    TO 'refunded';
ALTER TYPE statut_precommande RENAME VALUE 'livree'        TO 'delivered';
ALTER TYPE statut_precommande RENAME TO preorder_status;

-- statut_engagement → commitment_status
ALTER TYPE statut_engagement RENAME VALUE 'engage'    TO 'committed';
ALTER TYPE statut_engagement RENAME VALUE 'converti'  TO 'converted';
ALTER TYPE statut_engagement RENAME VALUE 'annule'    TO 'cancelled';
ALTER TYPE statut_engagement RENAME VALUE 'rembourse' TO 'refunded';
ALTER TYPE statut_engagement RENAME TO commitment_status;

-- portee_evenement → event_scope
ALTER TYPE portee_evenement RENAME VALUE 'boutique' TO 'shop';
ALTER TYPE portee_evenement RENAME TO event_scope;

-- statut_evenement → event_status
ALTER TYPE statut_evenement RENAME VALUE 'brouillon' TO 'draft';
ALTER TYPE statut_evenement RENAME VALUE 'annonce'   TO 'announced';
ALTER TYPE statut_evenement RENAME VALUE 'en_cours'  TO 'ongoing';
ALTER TYPE statut_evenement RENAME VALUE 'termine'   TO 'ended';
ALTER TYPE statut_evenement RENAME VALUE 'annule'    TO 'cancelled';
ALTER TYPE statut_evenement RENAME TO event_status;

-- role_participation → participation_role
ALTER TYPE role_participation RENAME VALUE 'boutique' TO 'shop';
ALTER TYPE role_participation RENAME VALUE 'createur' TO 'creator';
ALTER TYPE role_participation RENAME TO participation_role;

-- statut_participation → participation_status
ALTER TYPE statut_participation RENAME VALUE 'acceptee'             TO 'accepted';
ALTER TYPE statut_participation RENAME VALUE 'refusee'              TO 'rejected';
ALTER TYPE statut_participation RENAME VALUE 'refusee_sans_reponse' TO 'auto_rejected';
ALTER TYPE statut_participation RENAME TO participation_status;

-- type_promotion → promotion_type
ALTER TYPE type_promotion RENAME VALUE 'pourcentage'       TO 'percentage';
ALTER TYPE type_promotion RENAME VALUE 'montant'           TO 'amount';
ALTER TYPE type_promotion RENAME VALUE 'livraison_offerte' TO 'free_shipping';
ALTER TYPE type_promotion RENAME TO promotion_type;

-- perimetre_promotion → promotion_scope
ALTER TYPE perimetre_promotion RENAME VALUE 'boutique'  TO 'shop';
ALTER TYPE perimetre_promotion RENAME VALUE 'categorie' TO 'category';
ALTER TYPE perimetre_promotion RENAME TO promotion_scope;

-- cible_promotion → promotion_audience
ALTER TYPE cible_promotion RENAME VALUE 'tous'           TO 'everyone';
ALTER TYPE cible_promotion RENAME VALUE 'abonnes'        TO 'followers';
ALTER TYPE cible_promotion RENAME VALUE 'palier'         TO 'loyalty_tier';
ALTER TYPE cible_promotion RENAME VALUE 'clients_nommes' TO 'named_customers';
ALTER TYPE cible_promotion RENAME TO promotion_audience;

-- statut_promotion → promotion_status
ALTER TYPE statut_promotion RENAME VALUE 'brouillon'  TO 'draft';
ALTER TYPE statut_promotion RENAME VALUE 'programmee' TO 'scheduled';
ALTER TYPE statut_promotion RENAME VALUE 'terminee'   TO 'ended';
ALTER TYPE statut_promotion RENAME VALUE 'annulee'    TO 'cancelled';
ALTER TYPE statut_promotion RENAME TO promotion_status;

-- ═════════════════════════ TABLES ═════════════════════════════════════════

-- ── evenement → event ────────────────────────────────────────────────────
ALTER TABLE evenement RENAME COLUMN portee                TO scope;
ALTER TABLE evenement RENAME COLUMN proprietaire_id       TO owner_id;
ALTER TABLE evenement RENAME COLUMN nom                   TO name;
ALTER TABLE evenement RENAME COLUMN visuel_url            TO visual_url;
ALTER TABLE evenement RENAME COLUMN couleur_accent        TO accent_color;
ALTER TABLE evenement RENAME COLUMN debut_le              TO starts_at;
ALTER TABLE evenement RENAME COLUMN fin_le                TO ends_at;
ALTER TABLE evenement RENAME COLUMN statut                TO status;
ALTER TABLE evenement RENAME COLUMN candidatures_ouvertes TO applications_open;
ALTER TABLE evenement RENAME COLUMN cree_le               TO created_at;
ALTER TABLE evenement RENAME COLUMN maj_le                TO updated_at;
ALTER TABLE evenement RENAME TO event;

-- ── evenement_participation → event_participation ────────────────────────
ALTER TABLE evenement_participation RENAME COLUMN evenement_id TO event_id;
-- `role` déjà nommé — pas de RENAME.
ALTER TABLE evenement_participation RENAME COLUMN statut       TO status;
ALTER TABLE evenement_participation RENAME COLUMN motif_refus  TO rejection_reason;
ALTER TABLE evenement_participation RENAME COLUMN decide_par_id TO decided_by_id;
ALTER TABLE evenement_participation RENAME COLUMN cree_le      TO created_at;
ALTER TABLE evenement_participation RENAME TO event_participation;

-- ── evenement_element → event_element ────────────────────────────────────
ALTER TABLE evenement_element RENAME COLUMN evenement_id      TO event_id;
ALTER TABLE evenement_element RENAME COLUMN cible_type        TO target_type;
ALTER TABLE evenement_element RENAME COLUMN cible_id          TO target_id;
-- `participation_id` déjà nommé — pas de RENAME.
ALTER TABLE evenement_element RENAME TO event_element;

-- ── evenement_rappel → event_reminder ────────────────────────────────────
ALTER TABLE evenement_rappel RENAME COLUMN evenement_id           TO event_id;
ALTER TABLE evenement_rappel RENAME COLUMN notifications_envoyees TO notifications_sent;
ALTER TABLE evenement_rappel RENAME TO event_reminder;

-- ── evenement_bilan → event_report ───────────────────────────────────────
ALTER TABLE evenement_bilan RENAME COLUMN evenement_id      TO event_id;
ALTER TABLE evenement_bilan RENAME COLUMN nb_articles_vendus TO articles_sold_count;
ALTER TABLE evenement_bilan RENAME COLUMN ca_ariary           TO revenue_ariary;
ALTER TABLE evenement_bilan RENAME COLUMN ca_reference_ariary TO reference_revenue_ariary;
ALTER TABLE evenement_bilan RENAME COLUMN nouveaux_abonnes    TO new_followers;
ALTER TABLE evenement_bilan RENAME COLUMN trafic_page         TO page_traffic;
ALTER TABLE evenement_bilan RENAME COLUMN calcule_le          TO computed_at;
ALTER TABLE evenement_bilan RENAME TO event_report;

-- ── palier_fidelite → loyalty_tier ───────────────────────────────────────
ALTER TABLE palier_fidelite RENAME COLUMN nom             TO name;
ALTER TABLE palier_fidelite RENAME COLUMN rang_ordre      TO rank_order;
ALTER TABLE palier_fidelite RENAME COLUMN seuil_montant   TO amount_threshold;
ALTER TABLE palier_fidelite RENAME COLUMN seuil_commandes TO orders_threshold;
ALTER TABLE palier_fidelite RENAME COLUMN avantage_texte  TO benefit_text;
ALTER TABLE palier_fidelite RENAME COLUMN cree_le         TO created_at;
ALTER TABLE palier_fidelite RENAME TO loyalty_tier;

-- ── promotion (nom identique, colonnes) ──────────────────────────────────
ALTER TABLE promotion RENAME COLUMN evenement_id         TO event_id;
ALTER TABLE promotion RENAME COLUMN valeur               TO value;
ALTER TABLE promotion RENAME COLUMN perimetre            TO scope;
ALTER TABLE promotion RENAME COLUMN cible                TO audience;
ALTER TABLE promotion RENAME COLUMN palier_min_id        TO min_tier_id;
ALTER TABLE promotion RENAME COLUMN plafond_utilisation  TO usage_cap;
ALTER TABLE promotion RENAME COLUMN utilisations         TO usage_count;
ALTER TABLE promotion RENAME COLUMN debut_le             TO starts_at;
ALTER TABLE promotion RENAME COLUMN fin_le               TO ends_at;
ALTER TABLE promotion RENAME COLUMN statut               TO status;
ALTER TABLE promotion RENAME COLUMN notifier_abonnes     TO notify_followers;
ALTER TABLE promotion RENAME COLUMN notifiee_le          TO notified_at;
ALTER TABLE promotion RENAME COLUMN cree_le              TO created_at;
ALTER TABLE promotion RENAME COLUMN maj_le               TO updated_at;

-- ── promotion_beneficiaire → promotion_beneficiary ──────────────────────
ALTER TABLE promotion_beneficiaire RENAME COLUMN code_personnel TO personal_code;
ALTER TABLE promotion_beneficiaire RENAME COLUMN utilise_le     TO used_at;
ALTER TABLE promotion_beneficiaire RENAME COLUMN commande_id    TO order_id;
ALTER TABLE promotion_beneficiaire RENAME TO promotion_beneficiary;

-- ── selection (nom identique, colonnes) ──────────────────────────────────
ALTER TABLE selection RENAME COLUMN createur_id TO creator_id;
ALTER TABLE selection RENAME COLUMN nom_theme   TO theme_name;
ALTER TABLE selection RENAME COLUMN cree_le     TO created_at;

-- ── clic_affiliation → affiliate_click ───────────────────────────────────
ALTER TABLE clic_affiliation RENAME COLUMN createur_id TO creator_id;
ALTER TABLE clic_affiliation RENAME COLUMN expire_le   TO expires_at;
ALTER TABLE clic_affiliation RENAME COLUMN cree_le     TO created_at;
ALTER TABLE clic_affiliation RENAME TO affiliate_click;

-- ── precommande → preorder ───────────────────────────────────────────────
ALTER TABLE precommande RENAME COLUMN organisateur_id      TO organizer_id;
ALTER TABLE precommande RENAME COLUMN seuil                TO threshold;
ALTER TABLE precommande RENAME COLUMN date_limite          TO deadline;
ALTER TABLE precommande RENAME COLUMN compteur_actuel      TO current_count;
ALTER TABLE precommande RENAME COLUMN statut               TO status;
ALTER TABLE precommande RENAME COLUMN avance_liberee       TO released_advance;
ALTER TABLE precommande RENAME COLUMN date_expedition_max  TO max_shipping_date;
ALTER TABLE precommande RENAME COLUMN cree_le              TO created_at;
ALTER TABLE precommande RENAME COLUMN maj_le               TO updated_at;
ALTER TABLE precommande RENAME TO preorder;

-- ── precommande_engagement → preorder_commitment ─────────────────────────
ALTER TABLE precommande_engagement RENAME COLUMN precommande_id TO preorder_id;
ALTER TABLE precommande_engagement RENAME COLUMN commande_id    TO order_id;
ALTER TABLE precommande_engagement RENAME COLUMN statut         TO status;
ALTER TABLE precommande_engagement RENAME COLUMN cree_le        TO created_at;
ALTER TABLE precommande_engagement RENAME TO preorder_commitment;

-- ── vente_confirmee_journal → confirmed_sale_log ─────────────────────────
ALTER TABLE vente_confirmee_journal RENAME COLUMN commande_id     TO order_id;
ALTER TABLE vente_confirmee_journal RENAME COLUMN montant_confirme TO confirmed_amount;
ALTER TABLE vente_confirmee_journal RENAME COLUMN confirme_le      TO confirmed_at;
ALTER TABLE vente_confirmee_journal RENAME TO confirmed_sale_log;

COMMIT;
