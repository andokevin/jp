-- CreateEnum
CREATE TYPE "type_abonnement" AS ENUM ('boutique', 'createur');

-- CreateEnum
CREATE TYPE "statut_direct" AS ENUM ('planifie', 'en_cours', 'en_pause', 'termine');

-- CreateEnum
CREATE TYPE "statut_message" AS ENUM ('publie', 'masque');

-- CreateEnum
CREATE TYPE "portee_evenement" AS ENUM ('jp', 'boutique');

-- CreateEnum
CREATE TYPE "statut_evenement" AS ENUM ('brouillon', 'annonce', 'en_cours', 'termine', 'annule');

-- CreateEnum
CREATE TYPE "role_participation" AS ENUM ('boutique', 'createur');

-- CreateEnum
CREATE TYPE "statut_participation" AS ENUM ('candidate', 'acceptee', 'refusee', 'refusee_sans_reponse');

-- CreateEnum
CREATE TYPE "type_promotion" AS ENUM ('pourcentage', 'montant', 'livraison_offerte');

-- CreateEnum
CREATE TYPE "perimetre_promotion" AS ENUM ('boutique', 'categorie', 'selection');

-- CreateEnum
CREATE TYPE "cible_promotion" AS ENUM ('tous', 'abonnes', 'palier', 'clients_nommes');

-- CreateEnum
CREATE TYPE "statut_promotion" AS ENUM ('brouillon', 'programmee', 'active', 'terminee', 'annulee');

-- AlterTable
ALTER TABLE "extrait_boutique" ADD COLUMN     "direct_id" UUID;

-- CreateTable
CREATE TABLE "abonnement" (
    "suiveur_id" UUID NOT NULL,
    "suivi_id" UUID NOT NULL,
    "type" "type_abonnement" NOT NULL,
    "notifications_promo" BOOLEAN NOT NULL DEFAULT true,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abonnement_pkey" PRIMARY KEY ("suiveur_id","suivi_id")
);

-- CreateTable
CREATE TABLE "direct" (
    "id" UUID NOT NULL,
    "boutique_id" UUID NOT NULL,
    "titre" TEXT NOT NULL,
    "affiche_url" TEXT,
    "statut" "statut_direct" NOT NULL DEFAULT 'planifie',
    "debut_prevu_le" TIMESTAMPTZ(6) NOT NULL,
    "debut_le" TIMESTAMPTZ(6),
    "fin_le" TIMESTAMPTZ(6),
    "ingest_ref" TEXT,
    "lecture_url" TEXT,
    "enregistrement_url" TEXT,
    "article_a_lecran_id" UUID,
    "nb_spectateurs_pic" INTEGER NOT NULL DEFAULT 0,
    "rediffusion_facebook" BOOLEAN NOT NULL DEFAULT false,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direct_article" (
    "direct_id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "a_lecran_le" TIMESTAMPTZ(6),

    CONSTRAINT "direct_article_pkey" PRIMARY KEY ("direct_id","article_id")
);

-- CreateTable
CREATE TABLE "message_direct" (
    "id" UUID NOT NULL,
    "direct_id" UUID NOT NULL,
    "auteur_id" UUID NOT NULL,
    "texte" TEXT NOT NULL,
    "statut" "statut_message" NOT NULL DEFAULT 'publie',
    "epingle" BOOLEAN NOT NULL DEFAULT false,
    "automatique" BOOLEAN NOT NULL DEFAULT false,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_direct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direct_bilan" (
    "direct_id" UUID NOT NULL,
    "duree_s" INTEGER NOT NULL DEFAULT 0,
    "spectateurs_uniques" INTEGER NOT NULL DEFAULT 0,
    "pic_audience" INTEGER NOT NULL DEFAULT 0,
    "nb_vendus" INTEGER NOT NULL DEFAULT 0,
    "ca" INTEGER NOT NULL DEFAULT 0,
    "taux_conversion" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "nb_expirees" INTEGER NOT NULL DEFAULT 0,
    "articles_sans_vente" JSONB,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direct_bilan_pkey" PRIMARY KEY ("direct_id")
);

-- CreateTable
CREATE TABLE "evenement" (
    "id" UUID NOT NULL,
    "portee" "portee_evenement" NOT NULL DEFAULT 'boutique',
    "proprietaire_id" UUID,
    "nom" TEXT NOT NULL,
    "theme" TEXT,
    "slug" TEXT NOT NULL,
    "visuel_url" TEXT,
    "couleur_accent" TEXT,
    "hashtag" TEXT,
    "debut_le" TIMESTAMPTZ(6) NOT NULL,
    "fin_le" TIMESTAMPTZ(6) NOT NULL,
    "statut" "statut_evenement" NOT NULL DEFAULT 'brouillon',
    "candidatures_ouvertes" BOOLEAN NOT NULL DEFAULT false,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evenement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evenement_participation" (
    "id" UUID NOT NULL,
    "evenement_id" UUID NOT NULL,
    "participant_id" UUID NOT NULL,
    "role" "role_participation" NOT NULL,
    "statut" "statut_participation" NOT NULL DEFAULT 'candidate',
    "motif_refus" TEXT,
    "decide_par_id" UUID,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evenement_participation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evenement_element" (
    "evenement_id" UUID NOT NULL,
    "cible_type" TEXT NOT NULL,
    "cible_id" UUID NOT NULL,
    "participation_id" UUID,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "evenement_element_pkey" PRIMARY KEY ("evenement_id","cible_type","cible_id")
);

-- CreateTable
CREATE TABLE "evenement_rappel" (
    "evenement_id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "notifications_envoyees" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "evenement_rappel_pkey" PRIMARY KEY ("evenement_id","utilisateur_id")
);

-- CreateTable
CREATE TABLE "evenement_bilan" (
    "id" UUID NOT NULL,
    "evenement_id" UUID NOT NULL,
    "participant_id" UUID,
    "nb_articles_vendus" INTEGER NOT NULL DEFAULT 0,
    "ca_ariary" INTEGER NOT NULL DEFAULT 0,
    "ca_reference_ariary" INTEGER NOT NULL DEFAULT 0,
    "nouveaux_abonnes" INTEGER NOT NULL DEFAULT 0,
    "trafic_page" INTEGER NOT NULL DEFAULT 0,
    "calcule_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evenement_bilan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "palier_fidelite" (
    "id" UUID NOT NULL,
    "boutique_id" UUID NOT NULL,
    "nom" TEXT NOT NULL,
    "rang_ordre" INTEGER NOT NULL,
    "seuil_montant" INTEGER NOT NULL DEFAULT 0,
    "seuil_commandes" INTEGER NOT NULL DEFAULT 0,
    "avantage_texte" TEXT,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "palier_fidelite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion" (
    "id" UUID NOT NULL,
    "boutique_id" UUID NOT NULL,
    "evenement_id" UUID,
    "type" "type_promotion" NOT NULL,
    "valeur" INTEGER NOT NULL,
    "perimetre" "perimetre_promotion" NOT NULL DEFAULT 'boutique',
    "categorie_id" UUID,
    "cible" "cible_promotion" NOT NULL DEFAULT 'tous',
    "palier_min_id" UUID,
    "code" TEXT,
    "plafond_utilisation" INTEGER,
    "utilisations" INTEGER NOT NULL DEFAULT 0,
    "debut_le" TIMESTAMPTZ(6) NOT NULL,
    "fin_le" TIMESTAMPTZ(6) NOT NULL,
    "statut" "statut_promotion" NOT NULL DEFAULT 'brouillon',
    "notifier_abonnes" BOOLEAN NOT NULL DEFAULT false,
    "notifiee_le" TIMESTAMPTZ(6),
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_article" (
    "promotion_id" UUID NOT NULL,
    "article_id" UUID NOT NULL,

    CONSTRAINT "promotion_article_pkey" PRIMARY KEY ("promotion_id","article_id")
);

-- CreateIndex
CREATE INDEX "abonnement_suivi_id_cree_le_idx" ON "abonnement"("suivi_id", "cree_le");

-- CreateIndex
CREATE INDEX "direct_boutique_id_debut_prevu_le_idx" ON "direct"("boutique_id", "debut_prevu_le");

-- CreateIndex
CREATE INDEX "direct_statut_debut_prevu_le_idx" ON "direct"("statut", "debut_prevu_le");

-- CreateIndex
CREATE INDEX "message_direct_direct_id_cree_le_idx" ON "message_direct"("direct_id", "cree_le");

-- CreateIndex
CREATE UNIQUE INDEX "evenement_slug_key" ON "evenement"("slug");

-- CreateIndex
CREATE INDEX "evenement_statut_debut_le_idx" ON "evenement"("statut", "debut_le");

-- CreateIndex
CREATE UNIQUE INDEX "evenement_participation_evenement_id_participant_id_key" ON "evenement_participation"("evenement_id", "participant_id");

-- CreateIndex
CREATE INDEX "evenement_element_cible_type_cible_id_idx" ON "evenement_element"("cible_type", "cible_id");

-- CreateIndex
CREATE UNIQUE INDEX "evenement_bilan_evenement_id_participant_id_key" ON "evenement_bilan"("evenement_id", "participant_id");

-- CreateIndex
CREATE UNIQUE INDEX "palier_fidelite_boutique_id_rang_ordre_key" ON "palier_fidelite"("boutique_id", "rang_ordre");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_code_key" ON "promotion"("code");

-- CreateIndex
CREATE INDEX "promotion_boutique_id_statut_debut_le_idx" ON "promotion"("boutique_id", "statut", "debut_le");

-- AddForeignKey
ALTER TABLE "extrait_boutique" ADD CONSTRAINT "extrait_boutique_direct_id_fkey" FOREIGN KEY ("direct_id") REFERENCES "direct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnement" ADD CONSTRAINT "abonnement_suiveur_id_fkey" FOREIGN KEY ("suiveur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnement" ADD CONSTRAINT "abonnement_suivi_id_fkey" FOREIGN KEY ("suivi_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct" ADD CONSTRAINT "direct_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct" ADD CONSTRAINT "direct_article_a_lecran_id_fkey" FOREIGN KEY ("article_a_lecran_id") REFERENCES "article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_article" ADD CONSTRAINT "direct_article_direct_id_fkey" FOREIGN KEY ("direct_id") REFERENCES "direct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_article" ADD CONSTRAINT "direct_article_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_direct" ADD CONSTRAINT "message_direct_direct_id_fkey" FOREIGN KEY ("direct_id") REFERENCES "direct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_direct" ADD CONSTRAINT "message_direct_auteur_id_fkey" FOREIGN KEY ("auteur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_bilan" ADD CONSTRAINT "direct_bilan_direct_id_fkey" FOREIGN KEY ("direct_id") REFERENCES "direct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenement" ADD CONSTRAINT "evenement_proprietaire_id_fkey" FOREIGN KEY ("proprietaire_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenement_participation" ADD CONSTRAINT "evenement_participation_evenement_id_fkey" FOREIGN KEY ("evenement_id") REFERENCES "evenement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenement_participation" ADD CONSTRAINT "evenement_participation_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenement_participation" ADD CONSTRAINT "evenement_participation_decide_par_id_fkey" FOREIGN KEY ("decide_par_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenement_element" ADD CONSTRAINT "evenement_element_evenement_id_fkey" FOREIGN KEY ("evenement_id") REFERENCES "evenement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenement_element" ADD CONSTRAINT "evenement_element_participation_id_fkey" FOREIGN KEY ("participation_id") REFERENCES "evenement_participation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenement_rappel" ADD CONSTRAINT "evenement_rappel_evenement_id_fkey" FOREIGN KEY ("evenement_id") REFERENCES "evenement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenement_rappel" ADD CONSTRAINT "evenement_rappel_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenement_bilan" ADD CONSTRAINT "evenement_bilan_evenement_id_fkey" FOREIGN KEY ("evenement_id") REFERENCES "evenement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palier_fidelite" ADD CONSTRAINT "palier_fidelite_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion" ADD CONSTRAINT "promotion_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion" ADD CONSTRAINT "promotion_evenement_id_fkey" FOREIGN KEY ("evenement_id") REFERENCES "evenement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion" ADD CONSTRAINT "promotion_palier_min_id_fkey" FOREIGN KEY ("palier_min_id") REFERENCES "palier_fidelite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_article" ADD CONSTRAINT "promotion_article_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Une remise de zéro n'est pas une remise, et une promotion qui finit avant de
-- commencer est une faute de saisie qu'aucun écran ne rattrapera.
ALTER TABLE "promotion" ADD CONSTRAINT "promotion_valeur_positive" CHECK ("valeur" > 0);
ALTER TABLE "promotion" ADD CONSTRAINT "promotion_fin_apres_debut" CHECK ("fin_le" > "debut_le");
ALTER TABLE "evenement" ADD CONSTRAINT "evenement_fin_apres_debut" CHECK ("fin_le" > "debut_le");

-- Un événement de portée `jp` n'a pas de propriétaire ; un événement de
-- boutique en a forcément un (R-W8). Sans ce CHECK, un événement de boutique
-- sans propriétaire serait modifiable par n'importe qui.
ALTER TABLE "evenement" ADD CONSTRAINT "evenement_proprietaire_coherent"
  CHECK (("portee" = 'jp' AND "proprietaire_id" IS NULL)
      OR ("portee" = 'boutique' AND "proprietaire_id" IS NOT NULL));

-- Un seul bilan GLOBAL par événement.
--
-- `UNIQUE(evenement_id, participant_id)` ne suffit pas : en SQL, deux NULL ne
-- sont jamais égaux, donc deux bilans globaux passeraient tous les deux. D'où
-- cet index partiel, qui porte précisément sur le cas NULL.
CREATE UNIQUE INDEX "evenement_bilan_global_unique"
  ON "evenement_bilan" ("evenement_id")
  WHERE "participant_id" IS NULL;

-- On ne supprime pas un direct terminé : son bilan, ses messages et les
-- commandes qu'il a produites y renvoient encore.
REVOKE DELETE ON "direct" FROM jp_app;
REVOKE DELETE ON "evenement" FROM jp_app;
