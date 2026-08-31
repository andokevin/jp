-- CreateEnum
CREATE TYPE "statut_precommande" AS ENUM ('ouverte', 'seuil_atteint', 'expiree', 'remboursee', 'livree');

-- CreateEnum
CREATE TYPE "statut_engagement" AS ENUM ('engage', 'converti', 'annule', 'rembourse');

-- CreateEnum
CREATE TYPE "type_mouvement_cagnotte" AS ENUM ('credit_unboxing', 'credit_parrainage', 'utilisation', 'reprise');

-- CreateEnum
CREATE TYPE "origine_piece_dressing" AS ENUM ('achat_jp', 'ajout_manuel');

-- CreateEnum
CREATE TYPE "statut_panier_cadeau" AS ENUM ('compose', 'partage', 'paye', 'expire');

-- CreateTable
CREATE TABLE "selection" (
    "id" UUID NOT NULL,
    "createur_id" UUID NOT NULL,
    "nom_theme" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "selection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "selection_article" (
    "selection_id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "selection_article_pkey" PRIMARY KEY ("selection_id","article_id")
);

-- CreateTable
CREATE TABLE "clic_affiliation" (
    "id" UUID NOT NULL,
    "createur_id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "utilisateur_id" UUID,
    "expire_le" TIMESTAMPTZ(6) NOT NULL,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clic_affiliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "precommande" (
    "id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "organisateur_id" UUID NOT NULL,
    "seuil" INTEGER NOT NULL,
    "date_limite" TIMESTAMPTZ(6) NOT NULL,
    "compteur_actuel" INTEGER NOT NULL DEFAULT 0,
    "statut" "statut_precommande" NOT NULL DEFAULT 'ouverte',
    "avance_liberee" INTEGER NOT NULL DEFAULT 0,
    "date_expedition_max" TIMESTAMPTZ(6) NOT NULL,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "precommande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "precommande_engagement" (
    "id" UUID NOT NULL,
    "precommande_id" UUID NOT NULL,
    "commande_id" UUID NOT NULL,
    "statut" "statut_engagement" NOT NULL DEFAULT 'engage',
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "precommande_engagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vente_confirmee_journal" (
    "id" UUID NOT NULL,
    "boutique_id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "commande_id" UUID NOT NULL,
    "montant_confirme" INTEGER NOT NULL,
    "confirme_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vente_confirmee_journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rang_client" (
    "id" UUID NOT NULL,
    "boutique_id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "palier_id" UUID,
    "score" INTEGER NOT NULL DEFAULT 0,
    "montant_cumule" INTEGER NOT NULL DEFAULT 0,
    "nb_commandes" INTEGER NOT NULL DEFAULT 0,
    "derniere_commande_le" TIMESTAMPTZ(6),
    "nb_litiges_perdus" INTEGER NOT NULL DEFAULT 0,
    "nb_annulations" INTEGER NOT NULL DEFAULT 0,
    "calcule_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rang_client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_client" (
    "boutique_id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "texte" TEXT NOT NULL,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_client_pkey" PRIMARY KEY ("boutique_id","utilisateur_id")
);

-- CreateTable
CREATE TABLE "cagnotte" (
    "utilisateur_id" UUID NOT NULL,
    "solde" INTEGER NOT NULL DEFAULT 0,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cagnotte_pkey" PRIMARY KEY ("utilisateur_id")
);

-- CreateTable
CREATE TABLE "mouvement_cagnotte" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "type" "type_mouvement_cagnotte" NOT NULL,
    "montant" INTEGER NOT NULL,
    "reference" TEXT,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mouvement_cagnotte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "piece_dressing" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "origine" "origine_piece_dressing" NOT NULL DEFAULT 'ajout_manuel',
    "commande_id" UUID,
    "article_id" UUID,
    "photo_url" TEXT,
    "categorie" TEXT,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "piece_dressing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "look" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "nom" TEXT NOT NULL,
    "contenu_id" UUID,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "look_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "look_piece" (
    "look_id" UUID NOT NULL,
    "piece_id" UUID NOT NULL,
    "position" JSONB,

    CONSTRAINT "look_piece_pkey" PRIMARY KEY ("look_id","piece_id")
);

-- CreateTable
CREATE TABLE "panier_cadeau" (
    "id" UUID NOT NULL,
    "compositrice_id" UUID NOT NULL,
    "commande_id" UUID,
    "lien_partage" TEXT NOT NULL,
    "statut" "statut_panier_cadeau" NOT NULL DEFAULT 'compose',
    "message" TEXT,
    "expire_le" TIMESTAMPTZ(6) NOT NULL,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "panier_cadeau_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "selection_createur_id_position_idx" ON "selection"("createur_id", "position");

-- CreateIndex
CREATE INDEX "clic_affiliation_utilisateur_id_article_id_expire_le_idx" ON "clic_affiliation"("utilisateur_id", "article_id", "expire_le");

-- CreateIndex
CREATE UNIQUE INDEX "precommande_article_id_key" ON "precommande"("article_id");

-- CreateIndex
CREATE UNIQUE INDEX "precommande_engagement_commande_id_key" ON "precommande_engagement"("commande_id");

-- CreateIndex
CREATE INDEX "precommande_engagement_precommande_id_statut_idx" ON "precommande_engagement"("precommande_id", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "vente_confirmee_journal_commande_id_key" ON "vente_confirmee_journal"("commande_id");

-- CreateIndex
CREATE INDEX "vente_confirmee_journal_boutique_id_utilisateur_id_idx" ON "vente_confirmee_journal"("boutique_id", "utilisateur_id");

-- CreateIndex
CREATE INDEX "rang_client_boutique_id_score_idx" ON "rang_client"("boutique_id", "score");

-- CreateIndex
CREATE INDEX "rang_client_boutique_id_derniere_commande_le_idx" ON "rang_client"("boutique_id", "derniere_commande_le");

-- CreateIndex
CREATE UNIQUE INDEX "rang_client_boutique_id_utilisateur_id_key" ON "rang_client"("boutique_id", "utilisateur_id");

-- CreateIndex
CREATE INDEX "mouvement_cagnotte_utilisateur_id_cree_le_idx" ON "mouvement_cagnotte"("utilisateur_id", "cree_le");

-- CreateIndex
CREATE INDEX "piece_dressing_utilisateur_id_categorie_idx" ON "piece_dressing"("utilisateur_id", "categorie");

-- CreateIndex
CREATE INDEX "look_utilisateur_id_idx" ON "look"("utilisateur_id");

-- CreateIndex
CREATE UNIQUE INDEX "panier_cadeau_commande_id_key" ON "panier_cadeau"("commande_id");

-- CreateIndex
CREATE UNIQUE INDEX "panier_cadeau_lien_partage_key" ON "panier_cadeau"("lien_partage");

-- CreateIndex
CREATE INDEX "panier_cadeau_statut_expire_le_idx" ON "panier_cadeau"("statut", "expire_le");

-- AddForeignKey
ALTER TABLE "selection" ADD CONSTRAINT "selection_createur_id_fkey" FOREIGN KEY ("createur_id") REFERENCES "profil_createur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selection_article" ADD CONSTRAINT "selection_article_selection_id_fkey" FOREIGN KEY ("selection_id") REFERENCES "selection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selection_article" ADD CONSTRAINT "selection_article_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clic_affiliation" ADD CONSTRAINT "clic_affiliation_createur_id_fkey" FOREIGN KEY ("createur_id") REFERENCES "profil_createur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clic_affiliation" ADD CONSTRAINT "clic_affiliation_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clic_affiliation" ADD CONSTRAINT "clic_affiliation_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precommande" ADD CONSTRAINT "precommande_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precommande" ADD CONSTRAINT "precommande_organisateur_id_fkey" FOREIGN KEY ("organisateur_id") REFERENCES "profil_createur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precommande_engagement" ADD CONSTRAINT "precommande_engagement_precommande_id_fkey" FOREIGN KEY ("precommande_id") REFERENCES "precommande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precommande_engagement" ADD CONSTRAINT "precommande_engagement_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vente_confirmee_journal" ADD CONSTRAINT "vente_confirmee_journal_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vente_confirmee_journal" ADD CONSTRAINT "vente_confirmee_journal_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vente_confirmee_journal" ADD CONSTRAINT "vente_confirmee_journal_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rang_client" ADD CONSTRAINT "rang_client_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rang_client" ADD CONSTRAINT "rang_client_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rang_client" ADD CONSTRAINT "rang_client_palier_id_fkey" FOREIGN KEY ("palier_id") REFERENCES "palier_fidelite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_client" ADD CONSTRAINT "note_client_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_client" ADD CONSTRAINT "note_client_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cagnotte" ADD CONSTRAINT "cagnotte_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvement_cagnotte" ADD CONSTRAINT "mouvement_cagnotte_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piece_dressing" ADD CONSTRAINT "piece_dressing_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piece_dressing" ADD CONSTRAINT "piece_dressing_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piece_dressing" ADD CONSTRAINT "piece_dressing_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "look" ADD CONSTRAINT "look_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "look_piece" ADD CONSTRAINT "look_piece_look_id_fkey" FOREIGN KEY ("look_id") REFERENCES "look"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "look_piece" ADD CONSTRAINT "look_piece_piece_id_fkey" FOREIGN KEY ("piece_id") REFERENCES "piece_dressing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "panier_cadeau" ADD CONSTRAINT "panier_cadeau_compositrice_id_fkey" FOREIGN KEY ("compositrice_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "panier_cadeau" ADD CONSTRAINT "panier_cadeau_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Une précommande sans seuil est une vente ordinaire, et une date limite après
-- la date d'expédition promise n'a aucun sens (RB3).
ALTER TABLE "precommande" ADD CONSTRAINT "precommande_seuil_positif" CHECK ("seuil" > 0);
ALTER TABLE "precommande" ADD CONSTRAINT "precommande_expedition_apres_limite"
  CHECK ("date_expedition_max" > "date_limite");

-- La file des précommandes à surveiller : seules les ouvertes expirent.
CREATE INDEX "precommande_ouverte_limite" ON "precommande" ("date_limite")
  WHERE "statut" = 'ouverte';

-- ── Cagnotte : un crédit de déballage n'est versé qu'une fois ──────────────
--
-- Index unique PARTIEL : la référence n'est unique que pour `credit_unboxing`.
-- Les autres types la réutilisent librement — une utilisation référence la
-- commande qu'elle paie, et plusieurs utilisations peuvent porter dessus.
CREATE UNIQUE INDEX "mouvement_cagnotte_unboxing_unique"
  ON "mouvement_cagnotte" ("reference")
  WHERE "type" = 'credit_unboxing' AND "reference" IS NOT NULL;

-- Un mouvement de cagnotte est une écriture : elle s'annule par une reprise,
-- elle ne se réécrit pas.
REVOKE UPDATE, DELETE ON "mouvement_cagnotte" FROM jp_app;
COMMENT ON TABLE "mouvement_cagnotte" IS
  'AJOUT SEUL. Le solde de `cagnotte` en est DERIVE : une correction se fait par un mouvement de type `reprise`.';

-- Le journal des ventes confirmées porte l'historique de fidélité (R-R11).
-- Le rattrapage doit rester idempotent : on n'efface jamais une ligne.
REVOKE UPDATE, DELETE ON "vente_confirmee_journal" FROM jp_app;

REVOKE DELETE ON "precommande" FROM jp_app;
REVOKE DELETE ON "precommande_engagement" FROM jp_app;
