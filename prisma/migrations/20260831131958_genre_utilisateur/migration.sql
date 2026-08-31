-- CreateEnum
CREATE TYPE "genre" AS ENUM ('femme', 'homme', 'autre');

-- AlterTable
ALTER TABLE "utilisateur" ADD COLUMN     "genre" "genre";
