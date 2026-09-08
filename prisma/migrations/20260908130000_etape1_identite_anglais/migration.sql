-- ═══════════════════════════════════════════════════════════════════════════
-- Étape 1b-② — Identité en anglais
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Renomme (sans perte de données) les 8 enums, 5 tables et leurs colonnes du
-- domaine identité. Prisma génère par défaut du DROP+CREATE pour un rename
-- d'enum, ce qui perd les données. Cette migration utilise ALTER TYPE RENAME
-- VALUE (non-bloquant depuis PostgreSQL 10) et ALTER TABLE RENAME.
--
-- Toutes les FK des tables aval (`utilisateur_id`, `code_otp_id`, etc.)
-- CONSERVENT leur nom de colonne SQL : elles seront renommées à leur propre
-- étape du chantier. Le mapping TypeScript est bidirectionnel via Prisma.

BEGIN;

-- ── ENUMS ────────────────────────────────────────────────────────────────

-- 1. langue → language  (valeurs déjà anglaises : en, fr, mg)
ALTER TYPE langue RENAME TO language;

-- 2. genre → gender
ALTER TYPE genre RENAME VALUE 'femme' TO 'female';
ALTER TYPE genre RENAME VALUE 'homme' TO 'male';
ALTER TYPE genre RENAME VALUE 'autre' TO 'other';
ALTER TYPE genre RENAME TO gender;

-- 3. fournisseur_externe → external_provider  (valeurs déjà anglaises)
ALTER TYPE fournisseur_externe RENAME TO external_provider;

-- 4. etape_changement_email → email_change_step
ALTER TYPE etape_changement_email RENAME VALUE 'ancienne_verifiee' TO 'old_verified';
ALTER TYPE etape_changement_email RENAME VALUE 'terminee' TO 'completed';
ALTER TYPE etape_changement_email RENAME TO email_change_step;

-- 5. role_equipe → team_role
ALTER TYPE role_equipe RENAME VALUE 'proprietaire' TO 'owner';
ALTER TYPE role_equipe RENAME VALUE 'gestionnaire' TO 'manager';
ALTER TYPE role_equipe RENAME VALUE 'preparateur' TO 'fulfiller';
ALTER TYPE role_equipe RENAME TO team_role;

-- 6. statut_utilisateur → user_status
ALTER TYPE statut_utilisateur RENAME VALUE 'actif' TO 'active';
ALTER TYPE statut_utilisateur RENAME VALUE 'suspendu' TO 'suspended';
ALTER TYPE statut_utilisateur RENAME VALUE 'supprime' TO 'deleted';
ALTER TYPE statut_utilisateur RENAME TO user_status;

-- 7. type_document_identite → identity_document_type  (sigles malgaches préservés)
ALTER TYPE type_document_identite RENAME TO identity_document_type;

-- 8. statut_verification → verification_status
ALTER TYPE statut_verification RENAME VALUE 'non_verifiee' TO 'unverified';
ALTER TYPE statut_verification RENAME VALUE 'en_attente' TO 'pending';
ALTER TYPE statut_verification RENAME VALUE 'verifiee' TO 'verified';
ALTER TYPE statut_verification RENAME VALUE 'refusee' TO 'rejected';
ALTER TYPE statut_verification RENAME TO verification_status;

-- ── TABLE utilisateur → app_user ────────────────────────────────────────
--    `user` est un mot réservé PostgreSQL — on préfixe `app_` selon la
--    convention Postgres pour éviter les échappements de tous les côtés.

ALTER TABLE utilisateur RENAME COLUMN email_verifie_le TO email_verified_at;
ALTER TABLE utilisateur RENAME COLUMN telephone_verifie_le TO phone_verified_at;
ALTER TABLE utilisateur RENAME COLUMN telephone TO phone;
ALTER TABLE utilisateur RENAME COLUMN prenom TO first_name;
ALTER TABLE utilisateur RENAME COLUMN nom TO last_name;
ALTER TABLE utilisateur RENAME COLUMN date_naissance TO birth_date;
ALTER TABLE utilisateur RENAME COLUMN "motDePasseHash" TO password_hash;
ALTER TABLE utilisateur RENAME COLUMN mot_de_passe_empreinte TO password_fingerprint;
ALTER TABLE utilisateur RENAME COLUMN mot_de_passe_maj_le TO password_updated_at;
ALTER TABLE utilisateur RENAME COLUMN classements_publics TO public_rankings;
ALTER TABLE utilisateur RENAME COLUMN cree_le TO created_at;
ALTER TABLE utilisateur RENAME COLUMN maj_le TO updated_at;
-- Ces trois-là avaient été oubliés : le TYPE enum a été renommé mais pas la
-- COLONNE qui le porte. Sans ces lignes, le client Prisma cherche `language`,
-- `status`, `gender` alors que la base garde `langue`, `statut`, `genre`.
ALTER TABLE utilisateur RENAME COLUMN genre TO gender;
ALTER TABLE utilisateur RENAME COLUMN langue TO language;
ALTER TABLE utilisateur RENAME COLUMN statut TO status;
ALTER TABLE utilisateur RENAME TO app_user;

-- ── TABLE session (nom inchangé, colonnes traduites) ─────────────────────

ALTER TABLE session RENAME COLUMN jeton_empreinte TO token_hash;
ALTER TABLE session RENAME COLUMN appareil TO device;
ALTER TABLE session RENAME COLUMN famille TO family;
ALTER TABLE session RENAME COLUMN adresse_ip TO ip_address;
ALTER TABLE session RENAME COLUMN cree_le TO created_at;
ALTER TABLE session RENAME COLUMN expire_le TO expires_at;
ALTER TABLE session RENAME COLUMN revoquee_le TO revoked_at;

-- ── TABLE code_otp → otp_code ────────────────────────────────────────────

ALTER TABLE code_otp RENAME COLUMN code_empreinte TO code_hash;
ALTER TABLE code_otp RENAME COLUMN tentatives TO attempts;
ALTER TABLE code_otp RENAME COLUMN expire_le TO expires_at;
ALTER TABLE code_otp RENAME COLUMN consomme_le TO consumed_at;
ALTER TABLE code_otp RENAME COLUMN adresse_ip TO ip_address;
ALTER TABLE code_otp RENAME COLUMN cree_le TO created_at;
ALTER TABLE code_otp RENAME TO otp_code;

-- ── TABLE profil_acheteur → buyer_profile ────────────────────────────────

ALTER TABLE profil_acheteur RENAME COLUMN preferences_vetement TO clothing_preferences;
ALTER TABLE profil_acheteur RENAME COLUMN cree_le TO created_at;
ALTER TABLE profil_acheteur RENAME COLUMN maj_le TO updated_at;
ALTER TABLE profil_acheteur RENAME TO buyer_profile;

-- ── TABLE profil_createur → creator_profile ──────────────────────────────

ALTER TABLE profil_createur RENAME COLUMN nom_public TO public_name;
ALTER TABLE profil_createur RENAME COLUMN statut_verification TO verification_status;
ALTER TABLE profil_createur RENAME COLUMN badge_verifie TO verified_badge;
ALTER TABLE profil_createur RENAME COLUMN nb_abonnes TO followers_count;
ALTER TABLE profil_createur RENAME COLUMN nb_ventes_generees TO generated_sales_count;
ALTER TABLE profil_createur RENAME COLUMN supprime_le TO deleted_at;
ALTER TABLE profil_createur RENAME COLUMN cree_le TO created_at;
ALTER TABLE profil_createur RENAME COLUMN maj_le TO updated_at;
ALTER TABLE profil_createur RENAME TO creator_profile;

COMMIT;
