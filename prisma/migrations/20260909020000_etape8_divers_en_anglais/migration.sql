-- ═══════════════════════════════════════════════════════════════════════════
-- Étape 8 — Divers (paramètre, journal, panier, cagnotte, dressing…) EN
-- ═══════════════════════════════════════════════════════════════════════════
--
-- 8 enums restants et toutes les tables encore nommées en français, sauf
-- `boutique` (trop de FK aval — sera renommé en étape 9). Les FK `boutique_id`,
-- `utilisateur_id`, `auteur_id`, `direct_id`, `commande_id`, `contenu_id`
-- conservent leur nom SQL — ce sont des étapes séparées.

BEGIN;

-- ═════════════════════════ ENUMS ══════════════════════════════════════════

ALTER TYPE statut_panier RENAME VALUE 'actif'      TO 'active';
ALTER TYPE statut_panier RENAME VALUE 'valide'     TO 'checked_out';
ALTER TYPE statut_panier RENAME VALUE 'abandonne'  TO 'abandoned';
ALTER TYPE statut_panier RENAME TO cart_status;

ALTER TYPE type_extrait RENAME VALUE 'extrait'   TO 'excerpt';
ALTER TYPE type_extrait RENAME VALUE 'publicite' TO 'ad';
ALTER TYPE type_extrait RENAME VALUE 'annonce'   TO 'announcement';
ALTER TYPE type_extrait RENAME TO snippet_type;

ALTER TYPE etat_demande RENAME VALUE 'en_attente' TO 'pending';
ALTER TYPE etat_demande RENAME VALUE 'en_cours'   TO 'in_progress';
ALTER TYPE etat_demande RENAME VALUE 'acceptee'   TO 'accepted';
ALTER TYPE etat_demande RENAME VALUE 'refusee'    TO 'rejected';
ALTER TYPE etat_demande RENAME TO request_state;

ALTER TYPE statut_ecart RENAME VALUE 'ouvert' TO 'open';
ALTER TYPE statut_ecart RENAME VALUE 'resolu' TO 'resolved';
ALTER TYPE statut_ecart RENAME VALUE 'ignore' TO 'ignored';
ALTER TYPE statut_ecart RENAME TO discrepancy_status;

ALTER TYPE type_mouvement_cagnotte RENAME VALUE 'credit_parrainage' TO 'referral_credit';
ALTER TYPE type_mouvement_cagnotte RENAME VALUE 'utilisation'       TO 'spend';
ALTER TYPE type_mouvement_cagnotte RENAME VALUE 'reprise'           TO 'reclaim';
ALTER TYPE type_mouvement_cagnotte RENAME TO wallet_movement_type;

ALTER TYPE origine_piece_dressing RENAME VALUE 'achat_jp'     TO 'jp_purchase';
ALTER TYPE origine_piece_dressing RENAME VALUE 'ajout_manuel' TO 'manual';
ALTER TYPE origine_piece_dressing RENAME TO wardrobe_item_origin;

ALTER TYPE statut_panier_cadeau RENAME VALUE 'compose' TO 'composed';
ALTER TYPE statut_panier_cadeau RENAME VALUE 'partage' TO 'shared';
ALTER TYPE statut_panier_cadeau RENAME VALUE 'paye'    TO 'paid';
ALTER TYPE statut_panier_cadeau RENAME VALUE 'expire'  TO 'expired';
ALTER TYPE statut_panier_cadeau RENAME TO gift_cart_status;

ALTER TYPE type_parametre RENAME VALUE 'entier'     TO 'integer';
ALTER TYPE type_parametre RENAME VALUE 'texte'      TO 'text';
ALTER TYPE type_parametre RENAME VALUE 'booleen'    TO 'boolean';
ALTER TYPE type_parametre RENAME VALUE 'duree_s'    TO 'duration_s';
ALTER TYPE type_parametre RENAME VALUE 'pour_mille' TO 'per_mille';
ALTER TYPE type_parametre RENAME TO setting_type;

-- ═════════════════════════ TABLES ═════════════════════════════════════════

-- parametre → setting
ALTER TABLE parametre RENAME COLUMN cle            TO key;
ALTER TABLE parametre RENAME COLUMN valeur         TO value;
ALTER TABLE parametre RENAME COLUMN modifie_par_id TO modified_by_id;
ALTER TABLE parametre RENAME COLUMN modifie_le     TO modified_at;
ALTER TABLE parametre RENAME TO setting;

-- parametre_modification → setting_change
ALTER TABLE parametre_modification RENAME COLUMN cle             TO setting_key;
ALTER TABLE parametre_modification RENAME COLUMN ancienne_valeur TO old_value;
ALTER TABLE parametre_modification RENAME COLUMN nouvelle_valeur TO new_value;
ALTER TABLE parametre_modification RENAME COLUMN motif           TO reason;
ALTER TABLE parametre_modification RENAME COLUMN propose_par_id  TO proposed_by_id;
ALTER TABLE parametre_modification RENAME COLUMN propose_le      TO proposed_at;
ALTER TABLE parametre_modification RENAME COLUMN confirme_par_id TO confirmed_by_id;
ALTER TABLE parametre_modification RENAME COLUMN confirme_le     TO confirmed_at;
ALTER TABLE parametre_modification RENAME TO setting_change;

-- journal_audit → audit_log
ALTER TABLE journal_audit RENAME COLUMN acteur_id  TO actor_id;
ALTER TABLE journal_audit RENAME COLUMN cible_type TO target_type;
ALTER TABLE journal_audit RENAME COLUMN cible_id   TO target_id;
ALTER TABLE journal_audit RENAME COLUMN avant      TO before;
ALTER TABLE journal_audit RENAME COLUMN apres      TO after;
ALTER TABLE journal_audit RENAME COLUMN adresse_ip TO ip_address;
ALTER TABLE journal_audit RENAME COLUMN horodatage TO occurred_at;
ALTER TABLE journal_audit RENAME TO audit_log;

-- cle_idempotence → idempotency_key
ALTER TABLE cle_idempotence RENAME COLUMN cle               TO key;
ALTER TABLE cle_idempotence RENAME COLUMN methode           TO method;
ALTER TABLE cle_idempotence RENAME COLUMN chemin            TO path;
ALTER TABLE cle_idempotence RENAME COLUMN empreinte_requete TO request_fingerprint;
ALTER TABLE cle_idempotence RENAME COLUMN statut            TO status;
ALTER TABLE cle_idempotence RENAME COLUMN reponse           TO response;
ALTER TABLE cle_idempotence RENAME COLUMN expire_le         TO expires_at;
ALTER TABLE cle_idempotence RENAME COLUMN cree_le           TO created_at;
ALTER TABLE cle_idempotence RENAME TO idempotency_key;

-- adresse → address
ALTER TABLE adresse RENAME COLUMN libelle                TO label;
ALTER TABLE adresse RENAME COLUMN quartier               TO neighborhood;
ALTER TABLE adresse RENAME COLUMN reperes                TO landmarks;
ALTER TABLE adresse RENAME COLUMN telephone_destinataire TO recipient_phone;
ALTER TABLE adresse RENAME COLUMN supprimee_le           TO deleted_at;
ALTER TABLE adresse RENAME COLUMN cree_le                TO created_at;
ALTER TABLE adresse RENAME COLUMN maj_le                 TO updated_at;
ALTER TABLE adresse RENAME TO address;

-- panier → cart
ALTER TABLE panier RENAME COLUMN statut  TO status;
ALTER TABLE panier RENAME COLUMN cree_le TO created_at;
ALTER TABLE panier RENAME COLUMN maj_le  TO updated_at;
ALTER TABLE panier RENAME TO cart;

-- ligne_panier → cart_line
ALTER TABLE ligne_panier RENAME COLUMN panier_id TO cart_id;
ALTER TABLE ligne_panier RENAME COLUMN quantite  TO quantity;
ALTER TABLE ligne_panier RENAME COLUMN ajoute_le TO added_at;
ALTER TABLE ligne_panier RENAME TO cart_line;

-- panier_cadeau → gift_cart
ALTER TABLE panier_cadeau RENAME COLUMN compositrice_id TO composer_id;
ALTER TABLE panier_cadeau RENAME COLUMN lien_partage    TO share_link;
ALTER TABLE panier_cadeau RENAME COLUMN statut          TO status;
ALTER TABLE panier_cadeau RENAME COLUMN expire_le       TO expires_at;
ALTER TABLE panier_cadeau RENAME COLUMN cree_le         TO created_at;
ALTER TABLE panier_cadeau RENAME TO gift_cart;

-- cagnotte → wallet
ALTER TABLE cagnotte RENAME COLUMN solde  TO balance;
ALTER TABLE cagnotte RENAME COLUMN maj_le TO updated_at;
ALTER TABLE cagnotte RENAME TO wallet;

-- mouvement_cagnotte → wallet_movement
ALTER TABLE mouvement_cagnotte RENAME COLUMN montant TO amount;
ALTER TABLE mouvement_cagnotte RENAME COLUMN cree_le TO created_at;
ALTER TABLE mouvement_cagnotte RENAME TO wallet_movement;

-- piece_dressing → wardrobe_item
ALTER TABLE piece_dressing RENAME COLUMN origine   TO origin;
ALTER TABLE piece_dressing RENAME COLUMN categorie TO category;
ALTER TABLE piece_dressing RENAME COLUMN cree_le   TO created_at;
ALTER TABLE piece_dressing RENAME TO wardrobe_item;

-- look (identique)
ALTER TABLE look RENAME COLUMN nom     TO name;
ALTER TABLE look RENAME COLUMN cree_le TO created_at;

-- look_piece
ALTER TABLE look_piece RENAME COLUMN piece_id TO wardrobe_item_id;

-- ecart → discrepancy
ALTER TABLE ecart RENAME COLUMN reference_externe      TO external_reference;
ALTER TABLE ecart RENAME COLUMN montant_ecart          TO discrepancy_amount;
ALTER TABLE ecart RENAME COLUMN statut                 TO status;
ALTER TABLE ecart RENAME COLUMN commentaire            TO comment;
ALTER TABLE ecart RENAME COLUMN ecriture_corrective_id TO corrective_entry_id;
ALTER TABLE ecart RENAME COLUMN resolu_le              TO resolved_at;
ALTER TABLE ecart RENAME COLUMN cree_le                TO created_at;
ALTER TABLE ecart RENAME TO discrepancy;

-- evenement_usage → usage_event
ALTER TABLE evenement_usage RENAME COLUMN nom        TO name;
ALTER TABLE evenement_usage RENAME COLUMN proprietes TO properties;
ALTER TABLE evenement_usage RENAME COLUMN horodatage TO occurred_at;
ALTER TABLE evenement_usage RENAME TO usage_event;

-- agregat_quotidien → daily_aggregate
ALTER TABLE agregat_quotidien RENAME COLUMN jour             TO day;
ALTER TABLE agregat_quotidien RENAME COLUMN visiteurs        TO visitors;
ALTER TABLE agregat_quotidien RENAME COLUMN inscriptions     TO signups;
ALTER TABLE agregat_quotidien RENAME COLUMN commandes_payees TO paid_orders;
ALTER TABLE agregat_quotidien RENAME COLUMN ca_ariary        TO revenue_ariary;
ALTER TABLE agregat_quotidien RENAME COLUMN calcule_le       TO computed_at;
ALTER TABLE agregat_quotidien RENAME TO daily_aggregate;

-- agregat_boutique → shop_aggregate
ALTER TABLE agregat_boutique RENAME COLUMN jour             TO day;
ALTER TABLE agregat_boutique RENAME COLUMN origine          TO origin;
ALTER TABLE agregat_boutique RENAME COLUMN vues             TO views;
ALTER TABLE agregat_boutique RENAME COLUMN commandes_payees TO paid_orders;
ALTER TABLE agregat_boutique RENAME COLUMN ca_ariary        TO revenue_ariary;
ALTER TABLE agregat_boutique RENAME COLUMN calcule_le       TO computed_at;
ALTER TABLE agregat_boutique RENAME TO shop_aggregate;

-- extrait_boutique → shop_snippet
ALTER TABLE extrait_boutique RENAME COLUMN titre       TO title;
ALTER TABLE extrait_boutique RENAME COLUMN legende     TO caption;
ALTER TABLE extrait_boutique RENAME COLUMN affiche_url TO poster_url;
ALTER TABLE extrait_boutique RENAME COLUMN duree_s     TO duration_s;
ALTER TABLE extrait_boutique RENAME COLUMN publie_le   TO published_at;
ALTER TABLE extrait_boutique RENAME COLUMN supprime_le TO deleted_at;
ALTER TABLE extrait_boutique RENAME COLUMN cree_le     TO created_at;
ALTER TABLE extrait_boutique RENAME COLUMN maj_le      TO updated_at;
ALTER TABLE extrait_boutique RENAME TO shop_snippet;

-- membre_equipe → team_member
ALTER TABLE membre_equipe RENAME COLUMN cree_le TO created_at;
ALTER TABLE membre_equipe RENAME TO team_member;

-- document_identite → identity_document
ALTER TABLE document_identite RENAME COLUMN url_chiffree TO encrypted_url;
ALTER TABLE document_identite RENAME COLUMN empreinte    TO fingerprint;
ALTER TABLE document_identite RENAME COLUMN cree_le      TO created_at;
ALTER TABLE document_identite RENAME TO identity_document;

-- identite_externe → external_identity
ALTER TABLE identite_externe RENAME COLUMN fournisseur   TO provider;
ALTER TABLE identite_externe RENAME COLUMN sujet_externe TO external_subject;
ALTER TABLE identite_externe RENAME COLUMN email_verifie TO email_verified;
ALTER TABLE identite_externe RENAME COLUMN cree_le       TO created_at;
ALTER TABLE identite_externe RENAME TO external_identity;

-- demande_verification → verification_request
ALTER TABLE demande_verification RENAME COLUMN demandeur_id   TO requester_id;
ALTER TABLE demande_verification RENAME COLUMN statut         TO state;
ALTER TABLE demande_verification RENAME COLUMN motif_decision TO decision_reason;
ALTER TABLE demande_verification RENAME COLUMN decide_par_id  TO decided_by_id;
ALTER TABLE demande_verification RENAME COLUMN decide_le      TO decided_at;
ALTER TABLE demande_verification RENAME COLUMN cree_le        TO created_at;
ALTER TABLE demande_verification RENAME TO verification_request;

-- demande_recuperation → password_recovery_request
ALTER TABLE demande_recuperation RENAME COLUMN numero               TO number;
ALTER TABLE demande_recuperation RENAME COLUMN utilisateur_cible_id TO target_user_id;
ALTER TABLE demande_recuperation RENAME COLUMN email_ancien         TO old_email;
ALTER TABLE demande_recuperation RENAME COLUMN email_nouveau        TO new_email;
ALTER TABLE demande_recuperation RENAME COLUMN statut               TO state;
ALTER TABLE demande_recuperation RENAME COLUMN motif_decision       TO decision_reason;
ALTER TABLE demande_recuperation RENAME COLUMN decide_par_id        TO decided_by_id;
ALTER TABLE demande_recuperation RENAME COLUMN decide_le            TO decided_at;
ALTER TABLE demande_recuperation RENAME COLUMN cree_le              TO created_at;
ALTER TABLE demande_recuperation RENAME TO password_recovery_request;

-- demande_changement_email → email_change_request
ALTER TABLE demande_changement_email RENAME COLUMN nouvel_email TO new_email;
ALTER TABLE demande_changement_email RENAME COLUMN etape        TO step;
ALTER TABLE demande_changement_email RENAME COLUMN expire_le    TO expires_at;
ALTER TABLE demande_changement_email RENAME COLUMN cree_le      TO created_at;
ALTER TABLE demande_changement_email RENAME TO email_change_request;

-- taux_change → exchange_rate
ALTER TABLE taux_change RENAME COLUMN devise      TO currency;
ALTER TABLE taux_change RENAME COLUMN vers_ariary TO to_ariary;
ALTER TABLE taux_change RENAME COLUMN constate_le TO observed_at;
ALTER TABLE taux_change RENAME TO exchange_rate;

-- reconciliation (identique) — colonnes
ALTER TABLE reconciliation RENAME COLUMN operateur         TO operator;
ALTER TABLE reconciliation RENAME COLUMN periode_le        TO period_at;
ALTER TABLE reconciliation RENAME COLUMN nb_lignes         TO line_count;
ALTER TABLE reconciliation RENAME COLUMN montant_operateur TO operator_amount;
ALTER TABLE reconciliation RENAME COLUMN montant_jp        TO jp_amount;
ALTER TABLE reconciliation RENAME COLUMN close_le          TO closed_at;
ALTER TABLE reconciliation RENAME COLUMN cree_le           TO created_at;

COMMIT;
