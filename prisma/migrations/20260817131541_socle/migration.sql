-- ═══════════════════════════════════════════════════════════════════════════
-- Extensions — objets de cluster, installés une fois pour tout le projet
-- ═══════════════════════════════════════════════════════════════════════════

-- Recherche par similarité : « robe fleurie » doit trouver « robe à fleurs ».
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Distance entre deux coordonnées : le point relais le plus proche (F5.3).
-- `earthdistance` DÉPEND de `cube` — cet ordre est obligatoire.
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- ═══════════════════════════════════════════════════════════════════════════
-- Le rôle applicatif
-- ═══════════════════════════════════════════════════════════════════════════
-- L'API se connecte AVEC CE RÔLE, jamais en propriétaire. En PostgreSQL, le
-- propriétaire d'une table contourne ses propres révocations : une garantie
-- « ajout seul » appliquée par une connexion propriétaire ne garantit rien.
--
-- Bloc idempotent, parce qu'un rôle est un objet de CLUSTER et non de base :
-- il survit à la base fantôme que Prisma crée et détruit à chaque migration.
-- Sans la garde, la deuxième exécution échouerait sur « role already exists ».
--
-- AUCUN MOT DE PASSE ICI. Une migration est versionnée et identique dans tous
-- les environnements : un secret dedans se retrouve dans l'historique Git pour
-- toujours, et serait le même en développement et en production.
--   · en développement : `pnpm db:role` le pose depuis .env ;
--   · en production : l'administrateur crée le rôle avec un vrai secret, et la
--     garde IF NOT EXISTS garantit que cette migration n'y touchera pas.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'jp_app') THEN
    CREATE ROLE jp_app LOGIN;
  END IF;
END
$$;

-- CreateEnum
CREATE TYPE "langue" AS ENUM ('mg', 'fr');

-- CreateEnum
CREATE TYPE "statut_utilisateur" AS ENUM ('actif', 'suspendu', 'supprime');

-- CreateEnum
CREATE TYPE "type_parametre" AS ENUM ('entier', 'texte', 'booleen', 'duree_s', 'pour_mille');

-- CreateTable
CREATE TABLE "utilisateur" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "email_verifie_le" TIMESTAMPTZ(6),
    "telephone" TEXT,
    "telephone_verifie_le" TIMESTAMPTZ(6),
    "prenom" TEXT,
    "photo_url" TEXT,
    "langue" "langue" NOT NULL DEFAULT 'mg',
    "date_naissance" DATE,
    "statut" "statut_utilisateur" NOT NULL DEFAULT 'actif',
    "classements_publics" BOOLEAN NOT NULL DEFAULT true,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametre" (
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "type" "type_parametre" NOT NULL,
    "description" TEXT NOT NULL,
    "modifie_par_id" UUID,
    "modifie_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parametre_pkey" PRIMARY KEY ("cle")
);

-- CreateTable
CREATE TABLE "parametre_modification" (
    "id" UUID NOT NULL,
    "cle" TEXT NOT NULL,
    "ancienne_valeur" TEXT NOT NULL,
    "nouvelle_valeur" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "propose_par_id" UUID NOT NULL,
    "propose_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirme_par_id" UUID,
    "confirme_le" TIMESTAMPTZ(6),

    CONSTRAINT "parametre_modification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_audit" (
    "id" UUID NOT NULL,
    "acteur_id" UUID,
    "action" TEXT NOT NULL,
    "cible_type" TEXT NOT NULL,
    "cible_id" TEXT,
    "avant" JSONB,
    "apres" JSONB,
    "adresse_ip" INET,
    "horodatage" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_key" ON "utilisateur"("email");

-- CreateIndex
CREATE INDEX "parametre_modification_cle_propose_le_idx" ON "parametre_modification"("cle", "propose_le");

-- CreateIndex
CREATE INDEX "journal_audit_cible_type_cible_id_horodatage_idx" ON "journal_audit"("cible_type", "cible_id", "horodatage");

-- CreateIndex
CREATE INDEX "journal_audit_acteur_id_horodatage_idx" ON "journal_audit"("acteur_id", "horodatage");

-- AddForeignKey
ALTER TABLE "parametre" ADD CONSTRAINT "parametre_modifie_par_id_fkey" FOREIGN KEY ("modifie_par_id") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parametre_modification" ADD CONSTRAINT "parametre_modification_cle_fkey" FOREIGN KEY ("cle") REFERENCES "parametre"("cle") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parametre_modification" ADD CONSTRAINT "parametre_modification_propose_par_id_fkey" FOREIGN KEY ("propose_par_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parametre_modification" ADD CONSTRAINT "parametre_modification_confirme_par_id_fkey" FOREIGN KEY ("confirme_par_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_audit" ADD CONSTRAINT "journal_audit_acteur_id_fkey" FOREIGN KEY ("acteur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════
-- Les garanties que le code ne peut pas contourner
-- ═══════════════════════════════════════════════════════════════════════════

-- Double validation : personne ne modifie seul un taux de commission.
-- Un contrôle applicatif se contourne par une nouvelle route ; une contrainte
-- de base, non.
ALTER TABLE "parametre_modification"
  ADD CONSTRAINT "confirmation_par_un_autre"
  CHECK (confirme_par_id IS NULL OR confirme_par_id <> propose_par_id);

-- Confirmé, c'est confirmé PAR quelqu'un À un moment. Les deux champs vont
-- ensemble ou pas du tout — sinon on obtient des demi-confirmations dont
-- personne ne sait quoi faire.
ALTER TABLE "parametre_modification"
  ADD CONSTRAINT "confirmation_complete"
  CHECK ((confirme_par_id IS NULL) = (confirme_le IS NULL));

-- ═══════════════════════════════════════════════════════════════════════════
-- Droits — APRÈS les tables : « ON ALL TABLES » ne couvre que l'existant
-- ═══════════════════════════════════════════════════════════════════════════

GRANT USAGE ON SCHEMA public TO jp_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA public TO jp_app;
GRANT USAGE,  SELECT                 ON ALL SEQUENCES IN SCHEMA public TO jp_app;

-- Les 31 migrations suivantes créeront d'autres tables. Sans ces deux lignes,
-- il faudrait répéter le GRANT dans chacune — et l'oublier une seule fois
-- suffirait à faire échouer l'API en production, sur une seule table, le jour
-- du déploiement.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO jp_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO jp_app;

-- ═══════════════════════════════════════════════════════════════════════════
-- LE JOURNAL D'AUDIT N'ACCEPTE QUE DES INSERTIONS  (décision D3)
-- ═══════════════════════════════════════════════════════════════════════════
-- Une correction est une écriture inverse, jamais une modification. La
-- garantie n'est pas une convention d'équipe : c'est un droit retiré.
--
-- Ce REVOKE vient APRÈS le GRANT ci-dessus : on accorde large, puis on retire
-- sur la table qui ne doit pas bouger. L'ordre inverse serait annulé.
--
-- ATTENTION pour la suite : ALTER DEFAULT PRIVILEGES accordera UPDATE et
-- DELETE aux tables FUTURES. `ecriture_financiere` (migration n° 12) devra
-- donc porter son propre REVOKE. C'est le piège de ce dispositif.

REVOKE UPDATE, DELETE ON "journal_audit" FROM jp_app;

COMMENT ON TABLE "journal_audit" IS
  'AJOUT SEUL (D3). Ne JAMAIS accorder UPDATE ni DELETE a jp_app. '
  'Une correction se fait par une nouvelle ligne, pas par une modification.';
