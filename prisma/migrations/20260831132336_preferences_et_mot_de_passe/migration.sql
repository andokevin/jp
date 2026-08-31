-- AlterTable
ALTER TABLE "utilisateur" ADD COLUMN     "mot_de_passe_empreinte" TEXT,
ADD COLUMN     "mot_de_passe_maj_le" TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "profil_acheteur" (
    "utilisateur_id" UUID NOT NULL,
    "preferences_vetement" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profil_acheteur_pkey" PRIMARY KEY ("utilisateur_id")
);

-- AddForeignKey
ALTER TABLE "profil_acheteur" ADD CONSTRAINT "profil_acheteur_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Trois préférences au maximum.
--
-- `cardinality()` compte les éléments d'un tableau. Le CHECK est le bon
-- endroit : une validation faite seulement dans l'API laisse passer tout ce
-- qui entre par un script de reprise, une tâche de fond ou psql.
ALTER TABLE "profil_acheteur"
  ADD CONSTRAINT "profil_acheteur_preferences_max_3"
  CHECK (cardinality("preferences_vetement") <= 3);
