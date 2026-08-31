-- DP-05 · DP-15 — le litige devient un signalement, et le barème revient
--
-- Prisma proposait `DROP TABLE litige` puis `CREATE TABLE signalement_commande`.
-- C'est réécrit à la main en RENAME : le SQL généré aurait effacé les lignes.
-- Ici la table est vide, mais une migration se relit sur un environnement où
-- elle ne l'est pas — et une migration destructrice qui n'a « jamais posé de
-- problème en développement » est exactement celle qui casse la production.

-- ── 1. Le renommage ────────────────────────────────────────────────────────
ALTER TABLE "litige" RENAME TO "signalement_commande";
ALTER TABLE "signalement_commande" RENAME CONSTRAINT "litige_pkey" TO "signalement_commande_pkey";

ALTER INDEX "litige_commande_id_idx"     RENAME TO "signalement_commande_commande_id_idx";
ALTER INDEX "litige_statut_cree_le_idx"  RENAME TO "signalement_commande_statut_cree_le_idx";

ALTER TABLE "signalement_commande"
  RENAME CONSTRAINT "litige_commande_id_fkey" TO "signalement_commande_commande_id_fkey";
ALTER TABLE "signalement_commande"
  RENAME CONSTRAINT "litige_ouvert_par_id_fkey" TO "signalement_commande_ouvert_par_id_fkey";

-- ── 2. L'arbitrage disparaît (DP-05) ───────────────────────────────────────
--
-- Personne n'instruit, personne ne tranche. `decision_texte` et `decide_par_id`
-- décrivaient un rôle qui n'existe plus ; les garder aurait laissé croire qu'un
-- recours interne subsiste.
--
-- **RB4 ne disparaît pas, il se déplace** : « pas de sanction sans motif écrit »
-- porte désormais sur `sanction.motif_texte`, contraint plus bas.
ALTER TABLE "signalement_commande" DROP CONSTRAINT "litige_decision_motivee";

-- Le CHECK du compteur tombe ici et renaît en section 5. Il ne peut pas
-- survivre au changement de type de `statut` : un CHECK est compilé avec le
-- type de la colonne, et PostgreSQL refuse de comparer l'ancien énuméré au
-- nouveau. C'est le piège classique du renommage d'un type énuméré.
ALTER TABLE "signalement_commande" DROP CONSTRAINT "litige_score_suit_le_statut";
ALTER TABLE "signalement_commande" DROP CONSTRAINT "litige_decide_par_id_fkey";
ALTER TABLE "signalement_commande" DROP COLUMN "decision_texte";
ALTER TABLE "signalement_commande" DROP COLUMN "decide_par_id";

-- ── 3. Le motif est filtré par univers ─────────────────────────────────────
--
-- « Pas ma taille » n'a aucun sens pour un téléphone, « batterie morte » aucun
-- pour une robe. L'univers est recopié depuis la commande et figé : les motifs
-- recevables ne doivent pas changer après coup.
ALTER TABLE "signalement_commande" ADD COLUMN "univers_cle" TEXT;
UPDATE "signalement_commande" s
   SET "univers_cle" = c."univers_cle"
  FROM "commande" c
 WHERE c."id" = s."commande_id";
ALTER TABLE "signalement_commande" ALTER COLUMN "univers_cle" SET NOT NULL;

-- ── 4. Le type énuméré suit le nom de la table ─────────────────────────────
CREATE TYPE "statut_signalement_commande" AS ENUM ('ouvert', 'en_discussion', 'resolu');

ALTER TABLE "signalement_commande" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "signalement_commande"
  ALTER COLUMN "statut" TYPE "statut_signalement_commande"
  USING "statut"::text::"statut_signalement_commande";
ALTER TABLE "signalement_commande" ALTER COLUMN "statut" SET DEFAULT 'ouvert';

DROP TYPE "statut_litige";

-- ── 5. Le compteur, qui EST la sanction (R-T8) ─────────────────────────────
-- Ce que le compteur doit garantir : un signalement ouvert pèse, toujours.
ALTER TABLE "signalement_commande" ADD CONSTRAINT "compteur_coherent"
  CHECK ("compte_dans_le_score" = ("statut" <> 'resolu'));

-- ── 6. Le fil de messages suit ─────────────────────────────────────────────
ALTER TABLE "message_litige" RENAME COLUMN "litige_id" TO "signalement_id";
ALTER TABLE "message_litige"
  RENAME CONSTRAINT "message_litige_litige_id_fkey" TO "message_litige_signalement_id_fkey";
ALTER INDEX "message_litige_litige_id_cree_le_idx"
  RENAME TO "message_litige_signalement_id_cree_le_idx";

-- ── 7. RB4 se déplace sur la sanction ──────────────────────────────────────
--
-- « La clôture silencieuse est impossible » portait sur le litige ; l'arbitrage
-- ayant disparu, la règle porte maintenant sur les sanctions automatiques
-- (R-T2). Une sanction sans motif écrit est une exclusion sans explication.
ALTER TABLE "sanction" ADD CONSTRAINT "sanction_motif_ecrit"
  CHECK (length(btrim("motif_texte")) > 0);

-- ── 8. Le barème de commission, rétabli (DP-15) ────────────────────────────
CREATE TABLE "bareme_commission" (
    "id" UUID NOT NULL,
    "univers_cle" TEXT NOT NULL,
    "palier" "palier_abonnement" NOT NULL DEFAULT 'gratuit',
    "taux_pour_mille" INTEGER NOT NULL,
    "debut_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fin_le" TIMESTAMPTZ(6),
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bareme_commission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bareme_commission_univers_cle_palier_debut_le_idx"
  ON "bareme_commission"("univers_cle", "palier", "debut_le");

-- Un taux de zéro pour mille est un taux ; un taux négatif est une erreur.
ALTER TABLE "bareme_commission" ADD CONSTRAINT "bareme_taux_borne"
  CHECK ("taux_pour_mille" >= 0 AND "taux_pour_mille" <= 1000);

-- Une seule version EN VIGUEUR par univers et par palier. L'index partiel porte
-- sur `fin_le IS NULL` : les versions closes s'accumulent, c'est le but.
CREATE UNIQUE INDEX "bareme_en_vigueur_unique"
  ON "bareme_commission" ("univers_cle", "palier")
  WHERE "fin_le" IS NULL;

-- **Jamais d'UPDATE** (DP-15, R-G3) : on clôt la version en cours et on en
-- insère une nouvelle. Un taux modifié en place réécrirait le passé, et une
-- commande ne pourrait plus prouver le taux qu'elle a subi.
--
-- `UPDATE` reste nécessaire pour poser `fin_le` — c'est la seule modification
-- légitime, et elle est bornée par le déclencheur ci-dessous.
CREATE OR REPLACE FUNCTION "bareme_cloture_seule"() RETURNS trigger AS $$
BEGIN
  IF NEW."univers_cle" <> OLD."univers_cle"
     OR NEW."palier" <> OLD."palier"
     OR NEW."taux_pour_mille" <> OLD."taux_pour_mille"
     OR NEW."debut_le" <> OLD."debut_le" THEN
    RAISE EXCEPTION
      'Bareme historise (DP-15) : seule `fin_le` est modifiable. Cloturez la version et insérez-en une nouvelle.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "bareme_commission_historise"
  BEFORE UPDATE ON "bareme_commission"
  FOR EACH ROW EXECUTE FUNCTION "bareme_cloture_seule"();

REVOKE DELETE ON "bareme_commission" FROM jp_app;
