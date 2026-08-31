-- CreateEnum
CREATE TYPE "statut_article" AS ENUM ('brouillon', 'en_ligne', 'masque', 'epuise');

-- CreateEnum
CREATE TYPE "type_vente" AS ENUM ('stock', 'precommande');

-- CreateEnum
CREATE TYPE "etat_vetement" AS ENUM ('neuf_etiquette', 'tres_bon', 'bon', 'correct');

-- CreateTable
CREATE TABLE "article" (
    "id" UUID NOT NULL,
    "boutique_id" UUID NOT NULL,
    "univers_cle" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "prix_ariary" INTEGER NOT NULL,
    "prix_barre_ariary" INTEGER,
    "statut" "statut_article" NOT NULL DEFAULT 'brouillon',
    "type_vente" "type_vente" NOT NULL DEFAULT 'stock',
    "piece_unique" BOOLEAN NOT NULL DEFAULT false,
    "etat_vetement" "etat_vetement",
    "mesures" JSONB,
    "a_mesures" BOOLEAN NOT NULL DEFAULT false,
    "achat_direct_actif" BOOLEAN NOT NULL DEFAULT true,
    "supprime_le" TIMESTAMPTZ(6),
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variante" (
    "id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "taille" TEXT NOT NULL DEFAULT 'taille_unique',
    "couleur" TEXT NOT NULL DEFAULT '',
    "sku" TEXT,
    "quantite_stock" INTEGER NOT NULL DEFAULT 0,
    "quantite_reservee" INTEGER NOT NULL DEFAULT 0,
    "seuil_alerte" INTEGER NOT NULL DEFAULT 0,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "variante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "article_boutique_id_statut_idx" ON "article"("boutique_id", "statut");

-- CreateIndex
CREATE INDEX "article_univers_cle_statut_idx" ON "article"("univers_cle", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "variante_article_id_taille_couleur_key" ON "variante"("article_id", "taille", "couleur");

-- AddForeignKey
ALTER TABLE "article" ADD CONSTRAINT "article_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article" ADD CONSTRAINT "article_univers_cle_fkey" FOREIGN KEY ("univers_cle") REFERENCES "univers"("cle") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variante" ADD CONSTRAINT "variante_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Le dernier filet contre la survente.
--
-- Ces deux contraintes valent même si l'application a un bogue, même si un
-- script de reprise se trompe, même en écriture concurrente. Elles ne
-- remplacent pas le verrou `FOR UPDATE` de la transaction de réservation :
-- elles garantissent que si le verrou est mal posé, la base refuse la ligne
-- au lieu de vendre un article qui n'existe pas.
ALTER TABLE "variante"
  ADD CONSTRAINT "variante_quantite_stock_positive"
  CHECK ("quantite_stock" >= 0);

ALTER TABLE "variante"
  ADD CONSTRAINT "variante_reservee_positive"
  CHECK ("quantite_reservee" >= 0);

ALTER TABLE "variante"
  ADD CONSTRAINT "variante_reservee_sous_stock"
  CHECK ("quantite_reservee" <= "quantite_stock");

-- Le prix est un entier en Ariary (D6). Zéro n'est pas un prix.
ALTER TABLE "article"
  ADD CONSTRAINT "article_prix_positif"
  CHECK ("prix_ariary" > 0);

-- Une pièce unique n'a qu'un exemplaire, par définition. Sans ce déclencheur,
-- `piece_unique = true` ne serait qu'un libellé d'affichage — et la rareté
-- affichée doit être vraie (RB9).
CREATE OR REPLACE FUNCTION "verifier_piece_unique"() RETURNS trigger AS $$
BEGIN
  IF (SELECT "piece_unique" FROM "article" WHERE "id" = NEW."article_id")
     AND NEW."quantite_stock" > 1 THEN
    RAISE EXCEPTION 'Article en piece unique (F1.14) : stock maximal 1, recu %',
      NEW."quantite_stock";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "variante_piece_unique"
  BEFORE INSERT OR UPDATE OF "quantite_stock" ON "variante"
  FOR EACH ROW EXECUTE FUNCTION "verifier_piece_unique"();
