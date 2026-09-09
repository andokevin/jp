-- ═══════════════════════════════════════════════════════════════════════════
-- Étape 3 — Commande / paiement / livraison / séquestre en anglais
-- ═══════════════════════════════════════════════════════════════════════════
--
-- 10 enums + 10 tables : ordre/paiement/livraison. Aucune FK entrante
-- provenant des étapes 4-8 n'existe encore côté SQL (elles seront gérées
-- à leur propre étape).

BEGIN;

-- ═════════════════════════ ENUMS ══════════════════════════════════════════

-- 1. statut_commande → order_status
ALTER TYPE statut_commande RENAME VALUE 'brouillon'           TO 'draft';
ALTER TYPE statut_commande RENAME VALUE 'en_attente_paiement' TO 'awaiting_payment';
ALTER TYPE statut_commande RENAME VALUE 'payee'               TO 'paid';
ALTER TYPE statut_commande RENAME VALUE 'en_attente_seuil'    TO 'awaiting_threshold';
ALTER TYPE statut_commande RENAME VALUE 'en_preparation'      TO 'preparing';
ALTER TYPE statut_commande RENAME VALUE 'expediee'            TO 'shipped';
ALTER TYPE statut_commande RENAME VALUE 'livree'              TO 'delivered';
ALTER TYPE statut_commande RENAME VALUE 'confirmee'           TO 'confirmed';
ALTER TYPE statut_commande RENAME VALUE 'annulee'             TO 'cancelled';
ALTER TYPE statut_commande RENAME VALUE 'remboursee'          TO 'refunded';
ALTER TYPE statut_commande RENAME TO order_status;

-- 2. mode_livraison → delivery_mode
ALTER TYPE mode_livraison RENAME VALUE 'domicile' TO 'home';
ALTER TYPE mode_livraison RENAME VALUE 'relais'   TO 'pickup_point';
ALTER TYPE mode_livraison RENAME TO delivery_mode;

-- 3. mode_remuneration → payment_terms_mode
ALTER TYPE mode_remuneration RENAME VALUE 'abonnement' TO 'subscription';
ALTER TYPE mode_remuneration RENAME TO payment_terms_mode;

-- 4. rang_paiement → payment_rank
ALTER TYPE rang_paiement RENAME VALUE 'secondaire' TO 'secondary';
ALTER TYPE rang_paiement RENAME TO payment_rank;

-- 5. beneficiaire_type → beneficiary_type
ALTER TYPE beneficiaire_type RENAME VALUE 'boutique' TO 'shop';
ALTER TYPE beneficiaire_type RENAME VALUE 'createur' TO 'creator';
ALTER TYPE beneficiaire_type RENAME TO beneficiary_type;

-- 6. moyen_paiement → payment_method (mvola/orange/airtel déjà universels)
ALTER TYPE moyen_paiement RENAME VALUE 'carte' TO 'card';
ALTER TYPE moyen_paiement RENAME TO payment_method;

-- 7. statut_paiement → payment_status
ALTER TYPE statut_paiement RENAME VALUE 'initie'               TO 'initiated';
ALTER TYPE statut_paiement RENAME VALUE 'en_attente_operateur' TO 'awaiting_operator';
ALTER TYPE statut_paiement RENAME VALUE 'confirme'             TO 'confirmed';
ALTER TYPE statut_paiement RENAME VALUE 'echoue'               TO 'failed';
ALTER TYPE statut_paiement RENAME VALUE 'expire'               TO 'expired';
ALTER TYPE statut_paiement RENAME VALUE 'rembourse'            TO 'refunded';
ALTER TYPE statut_paiement RENAME TO payment_status;

-- 8. sens_ecriture → ledger_direction  (débit/crédit déjà universels)
ALTER TYPE sens_ecriture RENAME TO ledger_direction;

-- 9. compte_ecriture → ledger_account
ALTER TYPE compte_ecriture RENAME VALUE 'boutique'      TO 'shop';
ALTER TYPE compte_ecriture RENAME VALUE 'createur'      TO 'creator';
ALTER TYPE compte_ecriture RENAME VALUE 'cagnotte'      TO 'wallet';
ALTER TYPE compte_ecriture RENAME VALUE 'commission_jp' TO 'jp_commission';
ALTER TYPE compte_ecriture RENAME VALUE 'abonnement_jp' TO 'jp_subscription';
ALTER TYPE compte_ecriture RENAME TO ledger_account;

-- 10. statut_expedition → shipment_status
ALTER TYPE statut_expedition RENAME VALUE 'en_preparation' TO 'preparing';
ALTER TYPE statut_expedition RENAME VALUE 'expediee'       TO 'shipped';
ALTER TYPE statut_expedition RENAME VALUE 'livree'         TO 'delivered';
ALTER TYPE statut_expedition RENAME VALUE 'confirmee'      TO 'confirmed';
ALTER TYPE statut_expedition RENAME TO shipment_status;

-- ═════════════════════════ TABLES & COLONNES ══════════════════════════════

-- ── commande (nom conservé pour cette étape ; colonnes traduites) ────────
ALTER TABLE commande RENAME COLUMN acheteur_id             TO buyer_id;
ALTER TABLE commande RENAME COLUMN createur_id             TO attributed_creator_id;
ALTER TABLE commande RENAME COLUMN evenement_id            TO event_id;
ALTER TABLE commande RENAME COLUMN donateur_ref            TO donor_ref;
ALTER TABLE commande RENAME COLUMN statut                  TO status;
ALTER TABLE commande RENAME COLUMN origine                 TO origin;
ALTER TABLE commande RENAME COLUMN mode_livraison          TO delivery_mode;
ALTER TABLE commande RENAME COLUMN adresse_id              TO address_id;
ALTER TABLE commande RENAME COLUMN code_promo              TO promo_code;
ALTER TABLE commande RENAME COLUMN sous_total              TO subtotal;
ALTER TABLE commande RENAME COLUMN frais_livraison         TO shipping_fee;
ALTER TABLE commande RENAME COLUMN remise                  TO discount;
ALTER TABLE commande RENAME COLUMN remise_livraison        TO shipping_discount;
ALTER TABLE commande RENAME COLUMN credit_cagnotte_utilise TO wallet_credit_used;
ALTER TABLE commande RENAME COLUMN note_acheteur           TO buyer_note;
ALTER TABLE commande RENAME COLUMN cree_le                 TO created_at;
ALTER TABLE commande RENAME COLUMN maj_le                  TO updated_at;
-- `order` est un mot-clé réservé Postgres — on préfixe `sales_` selon la
-- convention déjà retenue pour `app_user`.
ALTER TABLE commande RENAME TO sales_order;

-- ── ligne_commande → order_line ──────────────────────────────────────────
ALTER TABLE ligne_commande RENAME COLUMN commande_id                TO order_id;
ALTER TABLE ligne_commande RENAME COLUMN quantite                   TO quantity;
ALTER TABLE ligne_commande RENAME COLUMN prix_unitaire              TO unit_price;
ALTER TABLE ligne_commande RENAME COLUMN remise_ligne               TO line_discount;
ALTER TABLE ligne_commande RENAME COLUMN part_createur              TO creator_share;
ALTER TABLE ligne_commande RENAME COLUMN taux_commission_pour_mille TO commission_per_mille;
ALTER TABLE ligne_commande RENAME COLUMN mode_remuneration          TO payment_terms_mode;
ALTER TABLE ligne_commande RENAME COLUMN cree_le                    TO created_at;
ALTER TABLE ligne_commande RENAME TO order_line;

-- ── paiement → payment ───────────────────────────────────────────────────
ALTER TABLE paiement RENAME COLUMN commande_id             TO order_id;
ALTER TABLE paiement RENAME COLUMN rang                    TO rank;
ALTER TABLE paiement RENAME COLUMN beneficiaire_type       TO beneficiary_type;
ALTER TABLE paiement RENAME COLUMN beneficiaire_id         TO beneficiary_id;
ALTER TABLE paiement RENAME COLUMN msisdn_destination      TO destination_msisdn;
ALTER TABLE paiement RENAME COLUMN moyen                   TO method;
ALTER TABLE paiement RENAME COLUMN montant                 TO amount;
ALTER TABLE paiement RENAME COLUMN statut                  TO status;
ALTER TABLE paiement RENAME COLUMN reference_externe       TO external_reference;
ALTER TABLE paiement RENAME COLUMN cle_idempotence         TO idempotency_key;
ALTER TABLE paiement RENAME COLUMN motif_echec             TO failure_reason;
ALTER TABLE paiement RENAME COLUMN nb_rejeux               TO retry_count;
ALTER TABLE paiement RENAME COLUMN prochain_rejeu_le       TO next_retry_at;
ALTER TABLE paiement RENAME COLUMN payeur_utilisateur_id   TO payer_user_id;
ALTER TABLE paiement RENAME COLUMN payeur_pays             TO payer_country;
ALTER TABLE paiement RENAME COLUMN montant_devise_origine  TO amount_source_currency;
ALTER TABLE paiement RENAME COLUMN devise_origine          TO source_currency;
ALTER TABLE paiement RENAME COLUMN taux_indicatif          TO indicative_rate;
ALTER TABLE paiement RENAME COLUMN cree_le                 TO created_at;
ALTER TABLE paiement RENAME COLUMN maj_le                  TO updated_at;
ALTER TABLE paiement RENAME TO payment;

-- ── ecriture_financiere → ledger_entry ───────────────────────────────────
ALTER TABLE ecriture_financiere RENAME COLUMN paiement_id  TO payment_id;
ALTER TABLE ecriture_financiere RENAME COLUMN montant      TO amount;
ALTER TABLE ecriture_financiere RENAME COLUMN sens         TO direction;
ALTER TABLE ecriture_financiere RENAME COLUMN compte       TO account;
ALTER TABLE ecriture_financiere RENAME COLUMN titulaire_id TO holder_id;
ALTER TABLE ecriture_financiere RENAME COLUMN cree_le      TO created_at;
ALTER TABLE ecriture_financiere RENAME TO ledger_entry;

-- ── facture → invoice ────────────────────────────────────────────────────
ALTER TABLE facture RENAME COLUMN commande_id TO order_id;
ALTER TABLE facture RENAME COLUMN numero      TO number;
ALTER TABLE facture RENAME COLUMN url_pdf     TO pdf_url;
ALTER TABLE facture RENAME COLUMN emise_le    TO issued_at;
ALTER TABLE facture RENAME TO invoice;

-- ── expedition → shipment ────────────────────────────────────────────────
ALTER TABLE expedition RENAME COLUMN commande_id      TO order_id;
ALTER TABLE expedition RENAME COLUMN statut           TO status;
ALTER TABLE expedition RENAME COLUMN moyen_declare    TO declared_method;
ALTER TABLE expedition RENAME COLUMN telephone_verifie TO verified_phone;
ALTER TABLE expedition RENAME COLUMN nb_tentatives    TO attempt_count;
ALTER TABLE expedition RENAME COLUMN motif_echec      TO failure_reason;
ALTER TABLE expedition RENAME COLUMN cree_le          TO created_at;
ALTER TABLE expedition RENAME COLUMN maj_le           TO updated_at;
ALTER TABLE expedition RENAME TO shipment;

-- ── evenement_livraison → shipment_event ─────────────────────────────────
ALTER TABLE evenement_livraison RENAME COLUMN expedition_id TO shipment_id;
ALTER TABLE evenement_livraison RENAME COLUMN statut        TO status;
ALTER TABLE evenement_livraison RENAME COLUMN auteur_id     TO author_id;
ALTER TABLE evenement_livraison RENAME COLUMN horodatage    TO occurred_at;
ALTER TABLE evenement_livraison RENAME COLUMN commentaire   TO comment;
ALTER TABLE evenement_livraison RENAME TO shipment_event;

-- ── fil_remise → handover_thread ────────────────────────────────────────
ALTER TABLE fil_remise RENAME COLUMN commande_id    TO order_id;
ALTER TABLE fil_remise RENAME COLUMN point_convenu  TO agreed_location;
ALTER TABLE fil_remise RENAME COLUMN moment_convenu TO agreed_time;
ALTER TABLE fil_remise RENAME COLUMN accord_le      TO agreed_at;
ALTER TABLE fil_remise RENAME COLUMN cree_le        TO created_at;
ALTER TABLE fil_remise RENAME TO handover_thread;

-- ── zone_livraison → delivery_zone ──────────────────────────────────────
ALTER TABLE zone_livraison RENAME COLUMN nom               TO name;
ALTER TABLE zone_livraison RENAME COLUMN quartiers         TO neighborhoods;
ALTER TABLE zone_livraison RENAME COLUMN delai_transport_j TO transit_days;
ALTER TABLE zone_livraison RENAME COLUMN cree_le           TO created_at;
ALTER TABLE zone_livraison RENAME TO delivery_zone;

-- ── tarif_livraison → delivery_rate ──────────────────────────────────────
ALTER TABLE tarif_livraison RENAME COLUMN montant TO amount;
ALTER TABLE tarif_livraison RENAME COLUMN maj_le  TO updated_at;
ALTER TABLE tarif_livraison RENAME TO delivery_rate;

COMMIT;
