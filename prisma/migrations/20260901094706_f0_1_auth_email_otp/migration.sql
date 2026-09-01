-- AlterEnum
ALTER TYPE "fournisseur_externe" ADD VALUE 'facebook';

-- AlterTable
ALTER TABLE "utilisateur" ADD COLUMN     "motDePasseHash" TEXT,
ADD COLUMN     "nom" TEXT;
