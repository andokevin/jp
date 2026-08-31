-- CreateEnum
CREATE TYPE "type_mouvement_stock" AS ENUM ('entree', 'vente', 'retour', 'correction', 'expiration');

-- CreateEnum
CREATE TYPE "statut_question" AS ENUM ('publiee', 'masquee');

-- AlterTable
ALTER TABLE "article" ADD COLUMN     "attributs" JSONB,
ADD COLUMN     "categorie_id" UUID,
ADD COLUMN     "epingle" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marque" TEXT,
ADD COLUMN     "matiere" TEXT,
ADD COLUMN     "peremption_le" DATE,
ADD COLUMN     "position_vitrine" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "categorie" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "nom_fr" TEXT NOT NULL,
    "nom_en" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "categorie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouvement_stock" (
    "id" UUID NOT NULL,
    "variante_id" UUID NOT NULL,
    "type" "type_mouvement_stock" NOT NULL,
    "quantite_delta" INTEGER NOT NULL,
    "reference" TEXT,
    "auteur_id" UUID,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mouvement_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_article" (
    "id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "auteur_id" UUID NOT NULL,
    "texte" TEXT NOT NULL,
    "reponse_texte" TEXT,
    "statut" "statut_question" NOT NULL DEFAULT 'publiee',
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerte_stock" (
    "variante_id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "notifie_le" TIMESTAMPTZ(6),
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerte_stock_pkey" PRIMARY KEY ("variante_id","utilisateur_id")
);

-- CreateIndex
CREATE INDEX "categorie_parent_id_position_idx" ON "categorie"("parent_id", "position");

-- CreateIndex
CREATE INDEX "mouvement_stock_variante_id_cree_le_idx" ON "mouvement_stock"("variante_id", "cree_le");

-- CreateIndex
CREATE INDEX "question_article_article_id_statut_cree_le_idx" ON "question_article"("article_id", "statut", "cree_le");

-- CreateIndex
CREATE INDEX "article_peremption_le_idx" ON "article"("peremption_le");

-- AddForeignKey
ALTER TABLE "article" ADD CONSTRAINT "article_categorie_id_fkey" FOREIGN KEY ("categorie_id") REFERENCES "categorie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorie" ADD CONSTRAINT "categorie_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categorie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvement_stock" ADD CONSTRAINT "mouvement_stock_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_article" ADD CONSTRAINT "question_article_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_article" ADD CONSTRAINT "question_article_auteur_id_fkey" FOREIGN KEY ("auteur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerte_stock" ADD CONSTRAINT "alerte_stock_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerte_stock" ADD CONSTRAINT "alerte_stock_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
