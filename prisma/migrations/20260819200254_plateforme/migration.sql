-- CreateTable
CREATE TABLE "cle_idempotence" (
    "cle" TEXT NOT NULL,
    "utilisateur_id" UUID,
    "methode" TEXT NOT NULL,
    "chemin" TEXT NOT NULL,
    "empreinte_requete" TEXT NOT NULL,
    "statut" INTEGER,
    "reponse" JSONB,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_le" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cle_idempotence_pkey" PRIMARY KEY ("cle")
);

-- CreateTable
CREATE TABLE "session" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "jeton_empreinte" TEXT NOT NULL,
    "famille" UUID NOT NULL,
    "appareil" TEXT,
    "adresse_ip" INET,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_le" TIMESTAMPTZ(6) NOT NULL,
    "revoquee_le" TIMESTAMPTZ(6),

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cle_idempotence_expire_le_idx" ON "cle_idempotence"("expire_le");

-- CreateIndex
CREATE UNIQUE INDEX "session_jeton_empreinte_key" ON "session"("jeton_empreinte");

-- CreateIndex
CREATE INDEX "session_utilisateur_id_expire_le_idx" ON "session"("utilisateur_id", "expire_le");

-- CreateIndex
CREATE INDEX "session_famille_idx" ON "session"("famille");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════
-- Droits sur les tables de plateforme
-- ═══════════════════════════════════════════════════════════════════════════
-- ALTER DEFAULT PRIVILEGES (migration `socle`) a déjà accordé les quatre
-- droits à jp_app sur ces deux tables. On ne réaccorde rien.
--
-- Ni l'une ni l'autre n'est en ajout seul :
--   · `cle_idempotence` est ÉCRITE DEUX FOIS — insérée « en cours », puis
--     complétée avec la réponse. Elle a donc besoin d'UPDATE.
--   · `session` est révoquée et purgée, donc besoin d'UPDATE et de DELETE.
--
-- Le journal d'audit reste la seule table verrouillée, avec
-- `ecriture_financiere` qui le sera à la migration n° 12.

-- Un rejeu ne doit pas pouvoir écraser une réponse déjà enregistrée : une
-- ligne complétée est définitive. Le contrôle est applicatif (la mise à jour
-- filtre sur `statut IS NULL`), mais cette contrainte interdit au moins
-- l'incohérence « réponse sans statut » et « statut sans réponse ».
ALTER TABLE "cle_idempotence"
  ADD CONSTRAINT "reponse_complete"
  CHECK ((statut IS NULL) = (reponse IS NULL));

COMMENT ON TABLE "cle_idempotence" IS
  'RB10. statut NULL = requete EN COURS. Une ligne completee est definitive.';

COMMENT ON TABLE "session" IS
  'Le jeton n''est jamais stocke en clair, seulement son empreinte. famille = chaine de rotation (F0.2).';
