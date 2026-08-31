-- CreateEnum
CREATE TYPE "fournisseur_externe" AS ENUM ('google');

-- CreateEnum
CREATE TYPE "etat_demande" AS ENUM ('en_attente', 'en_cours', 'acceptee', 'refusee');

-- CreateEnum
CREATE TYPE "etape_changement_email" AS ENUM ('ancienne_verifiee', 'terminee');

-- CreateEnum
CREATE TYPE "role_equipe" AS ENUM ('proprietaire', 'gestionnaire', 'preparateur');

-- AlterTable
ALTER TABLE "boutique" ADD COLUMN     "affiliation_autorisee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "delai_expedition_moyen" INTEGER,
ADD COLUMN     "directs_du_mois" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fidelite_activee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nb_abonnes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "score_confiance" DECIMAL(4,2) NOT NULL DEFAULT 0,
ADD COLUMN     "taux_commission_createur" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "taux_signalement" DECIMAL(5,4) NOT NULL DEFAULT 0,
ADD COLUMN     "vente_gelee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ventes_du_mois" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "code_otp" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "code_empreinte" TEXT NOT NULL,
    "tentatives" INTEGER NOT NULL DEFAULT 0,
    "expire_le" TIMESTAMPTZ(6) NOT NULL,
    "consomme_le" TIMESTAMPTZ(6),
    "adresse_ip" INET,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "code_otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identite_externe" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "fournisseur" "fournisseur_externe" NOT NULL,
    "sujet_externe" TEXT NOT NULL,
    "email_verifie" BOOLEAN NOT NULL DEFAULT false,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "identite_externe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profil_createur" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "nom_public" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "reseaux" JSONB,
    "statut_verification" "statut_verification" NOT NULL DEFAULT 'non_verifiee',
    "palier" INTEGER NOT NULL DEFAULT 0,
    "badge_verifie" BOOLEAN NOT NULL DEFAULT false,
    "nb_abonnes" INTEGER NOT NULL DEFAULT 0,
    "nb_ventes_generees" INTEGER NOT NULL DEFAULT 0,
    "supprime_le" TIMESTAMPTZ(6),
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profil_createur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membre_equipe" (
    "id" UUID NOT NULL,
    "boutique_id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "role" "role_equipe" NOT NULL DEFAULT 'preparateur',
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membre_equipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demande_verification" (
    "id" UUID NOT NULL,
    "demandeur_id" UUID NOT NULL,
    "statut" "etat_demande" NOT NULL DEFAULT 'en_attente',
    "motif_decision" TEXT,
    "decide_par_id" UUID,
    "decide_le" TIMESTAMPTZ(6),
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demande_verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demande_recuperation" (
    "id" UUID NOT NULL,
    "numero" TEXT NOT NULL,
    "utilisateur_cible_id" UUID NOT NULL,
    "email_ancien" TEXT NOT NULL,
    "email_nouveau" TEXT NOT NULL,
    "statut" "etat_demande" NOT NULL DEFAULT 'en_attente',
    "motif_decision" TEXT,
    "decide_par_id" UUID,
    "decide_le" TIMESTAMPTZ(6),
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demande_recuperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demande_changement_email" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "nouvel_email" TEXT NOT NULL,
    "etape" "etape_changement_email" NOT NULL DEFAULT 'ancienne_verifiee',
    "expire_le" TIMESTAMPTZ(6) NOT NULL,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demande_changement_email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adresse" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "libelle" TEXT NOT NULL,
    "quartier" TEXT NOT NULL,
    "reperes" TEXT,
    "telephone_destinataire" TEXT,
    "supprimee_le" TIMESTAMPTZ(6),
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adresse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "code_otp_email_expire_le_idx" ON "code_otp"("email", "expire_le");

-- CreateIndex
CREATE UNIQUE INDEX "identite_externe_fournisseur_sujet_externe_key" ON "identite_externe"("fournisseur", "sujet_externe");

-- CreateIndex
CREATE UNIQUE INDEX "profil_createur_utilisateur_id_key" ON "profil_createur"("utilisateur_id");

-- CreateIndex
CREATE UNIQUE INDEX "profil_createur_slug_key" ON "profil_createur"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "membre_equipe_boutique_id_utilisateur_id_key" ON "membre_equipe"("boutique_id", "utilisateur_id");

-- CreateIndex
CREATE INDEX "demande_verification_statut_cree_le_idx" ON "demande_verification"("statut", "cree_le");

-- CreateIndex
CREATE UNIQUE INDEX "demande_recuperation_numero_key" ON "demande_recuperation"("numero");

-- CreateIndex
CREATE INDEX "demande_recuperation_statut_cree_le_idx" ON "demande_recuperation"("statut", "cree_le");

-- CreateIndex
CREATE INDEX "demande_changement_email_utilisateur_id_expire_le_idx" ON "demande_changement_email"("utilisateur_id", "expire_le");

-- CreateIndex
CREATE INDEX "adresse_utilisateur_id_idx" ON "adresse"("utilisateur_id");

-- AddForeignKey
ALTER TABLE "identite_externe" ADD CONSTRAINT "identite_externe_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_createur" ADD CONSTRAINT "profil_createur_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_equipe" ADD CONSTRAINT "membre_equipe_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_equipe" ADD CONSTRAINT "membre_equipe_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_verification" ADD CONSTRAINT "demande_verification_demandeur_id_fkey" FOREIGN KEY ("demandeur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_verification" ADD CONSTRAINT "demande_verification_decide_par_id_fkey" FOREIGN KEY ("decide_par_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_recuperation" ADD CONSTRAINT "demande_recuperation_utilisateur_cible_id_fkey" FOREIGN KEY ("utilisateur_cible_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_recuperation" ADD CONSTRAINT "demande_recuperation_decide_par_id_fkey" FOREIGN KEY ("decide_par_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_changement_email" ADD CONSTRAINT "demande_changement_email_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adresse" ADD CONSTRAINT "adresse_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
