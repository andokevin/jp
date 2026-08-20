-- CreateTable
CREATE TABLE "univers" (
    "cle" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "onglet" TEXT NOT NULL,
    "ouvert" BOOLEAN NOT NULL DEFAULT false,
    "commission_pour_mille" INTEGER NOT NULL,
    "rang" INTEGER NOT NULL DEFAULT 0,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "univers_pkey" PRIMARY KEY ("cle")
);

-- CreateIndex
CREATE INDEX "univers_ouvert_rang_idx" ON "univers"("ouvert", "rang");

-- ═══════════════════════════════════════════════════════════════════════════
-- Les garanties de la table univers
-- ═══════════════════════════════════════════════════════════════════════════

-- Le taux de commission est un levier économique du pilote, pas une valeur
-- libre. 0 signifierait « gratuit », et 300 (30 %) est déjà au-delà de ce
-- qu'un vendeur accepte. Les bornes sont AUSSI dans le code
-- (packages/contracts/src/univers.ts) — ici, c'est le dernier filet.
ALTER TABLE "univers"
  ADD CONSTRAINT "commission_dans_les_bornes"
  CHECK (commission_pour_mille > 0 AND commission_pour_mille <= 300);

-- La clé est dans les URL et les lignes de commande : elle ne doit jamais
-- porter d'accent ni de majuscule, sinon un lien partagé casse selon l'outil
-- qui l'a encodé.
ALTER TABLE "univers"
  ADD CONSTRAINT "cle_technique_stable"
  CHECK (cle ~ '^[a-z_]+$');

COMMENT ON TABLE "univers" IS
  'JP Mode, JP Beaute, JP Tech, JP Maison, JP Enfant. Un univers n''est pas un '
  'filtre de categorie : c''est un jeu de regles. Les regles structurelles '
  '(fiche article, livraisons, motifs de litige) vivent dans le CODE, '
  'packages/contracts/src/univers.ts. Cette table ne porte que ce qui doit '
  'etre modifiable sans deploiement : l''ouverture et le taux de commission.';

COMMENT ON COLUMN "univers"."ouvert" IS
  'Un univers ferme garde ses regles et n''apparait nulle part. L''ouvrir est '
  'un UPDATE, pas un chantier.';
