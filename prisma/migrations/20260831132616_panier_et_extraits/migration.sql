-- CreateEnum
CREATE TYPE "statut_panier" AS ENUM ('actif', 'valide', 'abandonne');

-- CreateEnum
CREATE TYPE "type_extrait" AS ENUM ('extrait', 'publicite', 'annonce');

-- CreateTable
CREATE TABLE "panier" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "statut" "statut_panier" NOT NULL DEFAULT 'actif',
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "panier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ligne_panier" (
    "id" UUID NOT NULL,
    "panier_id" UUID NOT NULL,
    "variante_id" UUID NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,
    "ajoute_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ligne_panier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extrait_boutique" (
    "id" UUID NOT NULL,
    "boutique_id" UUID NOT NULL,
    "type" "type_extrait" NOT NULL DEFAULT 'extrait',
    "titre" TEXT,
    "legende" TEXT,
    "video_url" TEXT NOT NULL,
    "affiche_url" TEXT,
    "duree_s" INTEGER,
    "publie_le" TIMESTAMPTZ(6),
    "supprime_le" TIMESTAMPTZ(6),
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extrait_boutique_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "panier_utilisateur_id_statut_idx" ON "panier"("utilisateur_id", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "ligne_panier_panier_id_variante_id_key" ON "ligne_panier"("panier_id", "variante_id");

-- CreateIndex
CREATE INDEX "extrait_boutique_boutique_id_publie_le_idx" ON "extrait_boutique"("boutique_id", "publie_le");

-- AddForeignKey
ALTER TABLE "panier" ADD CONSTRAINT "panier_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ligne_panier" ADD CONSTRAINT "ligne_panier_panier_id_fkey" FOREIGN KEY ("panier_id") REFERENCES "panier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ligne_panier" ADD CONSTRAINT "ligne_panier_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extrait_boutique" ADD CONSTRAINT "extrait_boutique_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Un seul panier ACTIF par personne.
--
-- Index unique PARTIEL : la contrainte ne porte que sur les lignes
-- `statut = 'actif'`. Un `@@unique` Prisma classique porterait sur toutes les
-- lignes et interdirait de garder l'historique des paniers validés ou
-- abandonnes. Prisma ne sait pas exprimer le `WHERE`, d'où ce SQL écrit à la
-- main.
CREATE UNIQUE INDEX "panier_actif_unique"
  ON "panier" ("utilisateur_id")
  WHERE "statut" = 'actif';

-- Une quantité de panier est au moins 1. Zéro, c'est un retrait de ligne.
ALTER TABLE "ligne_panier"
  ADD CONSTRAINT "ligne_panier_quantite_positive"
  CHECK ("quantite" >= 1);
