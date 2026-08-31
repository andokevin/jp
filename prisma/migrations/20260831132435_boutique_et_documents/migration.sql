-- CreateEnum
CREATE TYPE "statut_verification" AS ENUM ('non_verifiee', 'en_attente', 'verifiee', 'refusee');

-- CreateEnum
CREATE TYPE "type_document_identite" AS ENUM ('cin_recto', 'cin_verso', 'selfie', 'nif_stat');

-- CreateTable
CREATE TABLE "boutique" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "statut_verification" "statut_verification" NOT NULL DEFAULT 'non_verifiee',
    "msisdn_mobile_money" TEXT,
    "supprimee_le" TIMESTAMPTZ(6),
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boutique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_identite" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "type" "type_document_identite" NOT NULL,
    "url_chiffree" TEXT NOT NULL,
    "empreinte" TEXT NOT NULL,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_identite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "boutique_utilisateur_id_key" ON "boutique"("utilisateur_id");

-- CreateIndex
CREATE UNIQUE INDEX "boutique_slug_key" ON "boutique"("slug");

-- CreateIndex
CREATE INDEX "boutique_statut_verification_idx" ON "boutique"("statut_verification");

-- CreateIndex
CREATE UNIQUE INDEX "document_identite_utilisateur_id_type_key" ON "document_identite"("utilisateur_id", "type");

-- AddForeignKey
ALTER TABLE "boutique" ADD CONSTRAINT "boutique_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_identite" ADD CONSTRAINT "document_identite_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
