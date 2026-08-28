/*
  Warnings:

  - The values [mg] on the enum `langue` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "langue_new" AS ENUM ('en', 'fr');
ALTER TABLE "public"."utilisateur" ALTER COLUMN "langue" DROP DEFAULT;
ALTER TABLE "utilisateur" ALTER COLUMN "langue" TYPE "langue_new" USING ("langue"::text::"langue_new");
ALTER TYPE "langue" RENAME TO "langue_old";
ALTER TYPE "langue_new" RENAME TO "langue";
DROP TYPE "public"."langue_old";
ALTER TABLE "utilisateur" ALTER COLUMN "langue" SET DEFAULT 'fr';
COMMIT;

-- AlterTable
ALTER TABLE "utilisateur" ALTER COLUMN "langue" SET DEFAULT 'fr';
