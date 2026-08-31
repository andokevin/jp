-- CreateEnum
CREATE TYPE "type_contenu" AS ENUM ('story', 'clip', 'photo', 'unboxing');

-- CreateEnum
CREATE TYPE "statut_contenu" AS ENUM ('brouillon', 'publie', 'retire');

-- CreateEnum
CREATE TYPE "commentaires_ouverts" AS ENUM ('tous', 'abonnes', 'aucun');

-- CreateEnum
CREATE TYPE "type_interaction" AS ENUM ('vue', 'reaction', 'commentaire', 'partage', 'favori');

-- CreateEnum
CREATE TYPE "statut_interaction" AS ENUM ('publie', 'masque_auto', 'masque_autrice');

-- CreateEnum
CREATE TYPE "motif_litige" AS ENUM ('non_recu', 'abime', 'non_conforme', 'mauvaise_taille', 'autre');

-- CreateEnum
CREATE TYPE "statut_litige" AS ENUM ('ouvert', 'en_discussion', 'resolu');

-- CreateEnum
CREATE TYPE "conformite_taille" AS ENUM ('conforme', 'petit', 'grand');

-- CreateEnum
CREATE TYPE "niveau_signalement" AS ENUM ('ordinaire', 'urgence');

-- CreateEnum
CREATE TYPE "statut_signalement" AS ENUM ('nouveau', 'en_cours', 'traite', 'classe');

-- CreateEnum
CREATE TYPE "type_sanction" AS ENUM ('avertissement', 'retrait', 'restriction', 'suspension', 'exclusion');

-- CreateEnum
CREATE TYPE "statut_republication" AS ENUM ('a_examiner', 'confirmee', 'ecartee');

-- CreateTable
CREATE TABLE "contenu" (
    "id" UUID NOT NULL,
    "auteur_id" UUID NOT NULL,
    "type" "type_contenu" NOT NULL,
    "media_url" TEXT NOT NULL,
    "miniature_url" TEXT,
    "duree_s" INTEGER,
    "statut" "statut_contenu" NOT NULL DEFAULT 'brouillon',
    "commande_source_id" UUID,
    "commentaires_ouverts" "commentaires_ouverts" NOT NULL DEFAULT 'tous',
    "publie_le" TIMESTAMPTZ(6),
    "expire_le" TIMESTAMPTZ(6),
    "empreinte_video" TEXT,
    "partenariat_id" UUID,
    "campagne_id" UUID,
    "sponsorise_declare" BOOLEAN NOT NULL DEFAULT false,
    "auteur_majeur" BOOLEAN NOT NULL DEFAULT false,
    "supprime_le" TIMESTAMPTZ(6),
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contenu_article" (
    "contenu_id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "createur_id" UUID,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "contenu_article_pkey" PRIMARY KEY ("contenu_id","article_id")
);

-- CreateTable
CREATE TABLE "statistique_contenu" (
    "contenu_id" UUID NOT NULL,
    "vues" INTEGER NOT NULL DEFAULT 0,
    "duree_moyenne_s" INTEGER NOT NULL DEFAULT 0,
    "clics_article" INTEGER NOT NULL DEFAULT 0,
    "je_prends" INTEGER NOT NULL DEFAULT 0,
    "ventes" INTEGER NOT NULL DEFAULT 0,
    "gains" INTEGER NOT NULL DEFAULT 0,
    "calcule_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "statistique_contenu_pkey" PRIMARY KEY ("contenu_id")
);

-- CreateTable
CREATE TABLE "interaction" (
    "id" UUID NOT NULL,
    "contenu_id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "type" "type_interaction" NOT NULL,
    "texte" TEXT,
    "statut" "statut_interaction" NOT NULL DEFAULT 'publie',
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hashtag" (
    "id" UUID NOT NULL,
    "mot" TEXT NOT NULL,
    "nb_contenus" INTEGER NOT NULL DEFAULT 0,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hashtag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contenu_hashtag" (
    "contenu_id" UUID NOT NULL,
    "hashtag_id" UUID NOT NULL,

    CONSTRAINT "contenu_hashtag_pkey" PRIMARY KEY ("contenu_id","hashtag_id")
);

-- CreateTable
CREATE TABLE "litige" (
    "id" UUID NOT NULL,
    "commande_id" UUID NOT NULL,
    "ouvert_par_id" UUID NOT NULL,
    "motif" "motif_litige" NOT NULL,
    "statut" "statut_litige" NOT NULL DEFAULT 'ouvert',
    "compte_dans_le_score" BOOLEAN NOT NULL DEFAULT true,
    "decision_texte" TEXT,
    "decide_par_id" UUID,
    "resolu_le" TIMESTAMPTZ(6),
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "litige_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_litige" (
    "id" UUID NOT NULL,
    "litige_id" UUID NOT NULL,
    "auteur_id" UUID NOT NULL,
    "texte" TEXT NOT NULL,
    "pieces_jointes" JSONB,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_litige_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avis" (
    "id" UUID NOT NULL,
    "commande_id" UUID NOT NULL,
    "auteur_id" UUID NOT NULL,
    "boutique_id" UUID NOT NULL,
    "article_id" UUID,
    "note" INTEGER NOT NULL,
    "texte" TEXT,
    "photo_url" TEXT,
    "conformite_taille" "conformite_taille",
    "morphologie_autrice" JSONB,
    "contenu_id" UUID,
    "reponse_texte" TEXT,
    "reponse_le" TIMESTAMPTZ(6),
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_confiance" (
    "boutique_id" UUID NOT NULL,
    "score" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "nb_ventes_honorees" INTEGER NOT NULL DEFAULT 0,
    "delai_expedition_reel_h" INTEGER,
    "taux_annulation" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "taux_litige" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "decomposition" JSONB,
    "calcule_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "score_confiance_pkey" PRIMARY KEY ("boutique_id")
);

-- CreateTable
CREATE TABLE "signalement" (
    "id" UUID NOT NULL,
    "cible_type" TEXT NOT NULL,
    "cible_id" UUID NOT NULL,
    "signale_par_id" UUID NOT NULL,
    "motif" TEXT NOT NULL,
    "niveau" "niveau_signalement" NOT NULL DEFAULT 'ordinaire',
    "statut" "statut_signalement" NOT NULL DEFAULT 'nouveau',
    "affecte_a_id" UUID,
    "traite_par_id" UUID,
    "decision" TEXT,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signalement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sanction" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "type" "type_sanction" NOT NULL,
    "motif_texte" TEXT NOT NULL,
    "duree" INTEGER,
    "applique_par_id" UUID NOT NULL,
    "conteste" BOOLEAN NOT NULL DEFAULT false,
    "resultat_contestation" TEXT,
    "instruit_par_id" UUID,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sanction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocage" (
    "bloqueur_id" UUID NOT NULL,
    "bloque_id" UUID NOT NULL,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocage_pkey" PRIMARY KEY ("bloqueur_id","bloque_id")
);

-- CreateTable
CREATE TABLE "mot_bloque_personnel" (
    "utilisateur_id" UUID NOT NULL,
    "mot" TEXT NOT NULL,

    CONSTRAINT "mot_bloque_personnel_pkey" PRIMARY KEY ("utilisateur_id","mot")
);

-- CreateTable
CREATE TABLE "republication_suspectee" (
    "id" UUID NOT NULL,
    "contenu_id" UUID NOT NULL,
    "contenu_origine_id" UUID NOT NULL,
    "proximite" DECIMAL(5,4) NOT NULL,
    "statut" "statut_republication" NOT NULL DEFAULT 'a_examiner',
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "republication_suspectee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contenu_auteur_id_publie_le_idx" ON "contenu"("auteur_id", "publie_le");

-- CreateIndex
CREATE INDEX "contenu_statut_publie_le_idx" ON "contenu"("statut", "publie_le");

-- CreateIndex
CREATE INDEX "interaction_contenu_id_type_cree_le_idx" ON "interaction"("contenu_id", "type", "cree_le");

-- CreateIndex
CREATE INDEX "interaction_utilisateur_id_type_idx" ON "interaction"("utilisateur_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "hashtag_mot_key" ON "hashtag"("mot");

-- CreateIndex
CREATE INDEX "litige_commande_id_idx" ON "litige"("commande_id");

-- CreateIndex
CREATE INDEX "litige_statut_cree_le_idx" ON "litige"("statut", "cree_le");

-- CreateIndex
CREATE INDEX "message_litige_litige_id_cree_le_idx" ON "message_litige"("litige_id", "cree_le");

-- CreateIndex
CREATE UNIQUE INDEX "avis_commande_id_key" ON "avis"("commande_id");

-- CreateIndex
CREATE INDEX "avis_boutique_id_cree_le_idx" ON "avis"("boutique_id", "cree_le");

-- CreateIndex
CREATE INDEX "signalement_niveau_statut_cree_le_idx" ON "signalement"("niveau", "statut", "cree_le");

-- CreateIndex
CREATE INDEX "signalement_cible_type_cible_id_idx" ON "signalement"("cible_type", "cible_id");

-- CreateIndex
CREATE INDEX "sanction_utilisateur_id_cree_le_idx" ON "sanction"("utilisateur_id", "cree_le");

-- CreateIndex
CREATE INDEX "blocage_bloque_id_idx" ON "blocage"("bloque_id");

-- CreateIndex
CREATE INDEX "republication_suspectee_statut_proximite_idx" ON "republication_suspectee"("statut", "proximite");

-- AddForeignKey
ALTER TABLE "contenu" ADD CONSTRAINT "contenu_auteur_id_fkey" FOREIGN KEY ("auteur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contenu" ADD CONSTRAINT "contenu_commande_source_id_fkey" FOREIGN KEY ("commande_source_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contenu_article" ADD CONSTRAINT "contenu_article_contenu_id_fkey" FOREIGN KEY ("contenu_id") REFERENCES "contenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contenu_article" ADD CONSTRAINT "contenu_article_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistique_contenu" ADD CONSTRAINT "statistique_contenu_contenu_id_fkey" FOREIGN KEY ("contenu_id") REFERENCES "contenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaction" ADD CONSTRAINT "interaction_contenu_id_fkey" FOREIGN KEY ("contenu_id") REFERENCES "contenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaction" ADD CONSTRAINT "interaction_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contenu_hashtag" ADD CONSTRAINT "contenu_hashtag_contenu_id_fkey" FOREIGN KEY ("contenu_id") REFERENCES "contenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contenu_hashtag" ADD CONSTRAINT "contenu_hashtag_hashtag_id_fkey" FOREIGN KEY ("hashtag_id") REFERENCES "hashtag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "litige" ADD CONSTRAINT "litige_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "litige" ADD CONSTRAINT "litige_ouvert_par_id_fkey" FOREIGN KEY ("ouvert_par_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "litige" ADD CONSTRAINT "litige_decide_par_id_fkey" FOREIGN KEY ("decide_par_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_litige" ADD CONSTRAINT "message_litige_litige_id_fkey" FOREIGN KEY ("litige_id") REFERENCES "litige"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_litige" ADD CONSTRAINT "message_litige_auteur_id_fkey" FOREIGN KEY ("auteur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_auteur_id_fkey" FOREIGN KEY ("auteur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_contenu_id_fkey" FOREIGN KEY ("contenu_id") REFERENCES "contenu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_confiance" ADD CONSTRAINT "score_confiance_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalement" ADD CONSTRAINT "signalement_signale_par_id_fkey" FOREIGN KEY ("signale_par_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalement" ADD CONSTRAINT "signalement_affecte_a_id_fkey" FOREIGN KEY ("affecte_a_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalement" ADD CONSTRAINT "signalement_traite_par_id_fkey" FOREIGN KEY ("traite_par_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanction" ADD CONSTRAINT "sanction_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sanction" ADD CONSTRAINT "sanction_applique_par_id_fkey" FOREIGN KEY ("applique_par_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocage" ADD CONSTRAINT "blocage_bloqueur_id_fkey" FOREIGN KEY ("bloqueur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocage" ADD CONSTRAINT "blocage_bloque_id_fkey" FOREIGN KEY ("bloque_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mot_bloque_personnel" ADD CONSTRAINT "mot_bloque_personnel_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "republication_suspectee" ADD CONSTRAINT "republication_suspectee_contenu_id_fkey" FOREIGN KEY ("contenu_id") REFERENCES "contenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "republication_suspectee" ADD CONSTRAINT "republication_suspectee_contenu_origine_id_fkey" FOREIGN KEY ("contenu_origine_id") REFERENCES "contenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── RB5 : un contenu publié porte au moins un article ──────────────────────
--
-- C'est la règle d'or du produit. Sans elle, le fil devient un réseau social de
-- plus et cesse d'être une boutique.
--
-- Le déclencheur est DIFFÉRÉ (`DEFERRABLE INITIALLY DEFERRED`) : il ne se
-- vérifie qu'à la validation de la transaction. C'est ce qui permet d'insérer
-- le contenu PUIS ses articles dans le même bloc — un déclencheur immédiat
-- refuserait la première ligne, alors que rien n'est encore incohérent.
CREATE OR REPLACE FUNCTION "verifier_contenu_a_article"() RETURNS trigger AS $$
BEGIN
  IF NEW."statut" = 'publie'
     AND NOT EXISTS (SELECT 1 FROM "contenu_article" WHERE "contenu_id" = NEW."id") THEN
    RAISE EXCEPTION 'Contenu publie sans article (RB5, R-K1) : id %', NEW."id";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER "contenu_doit_avoir_article"
  AFTER INSERT OR UPDATE ON "contenu"
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION "verifier_contenu_a_article"();

-- Un déballage sans commande est une publicité déguisée (R-K2).
ALTER TABLE "contenu" ADD CONSTRAINT "contenu_unboxing_a_une_commande"
  CHECK ("type" <> 'unboxing' OR "commande_source_id" IS NOT NULL);

-- ── RB4 : pas de clôture silencieuse ───────────────────────────────────────
ALTER TABLE "litige" ADD CONSTRAINT "litige_decision_motivee"
  CHECK ("statut" <> 'resolu'
     OR ("decision_texte" IS NOT NULL AND "decide_par_id" IS NOT NULL));

-- `compte_dans_le_score` ne peut pas diverger du statut : c'est TOUTE la
-- sanction depuis DP-07, et un code qui les désynchroniserait effacerait la
-- seule conséquence qu'un litige ait encore.
ALTER TABLE "litige" ADD CONSTRAINT "litige_score_suit_le_statut"
  CHECK ("compte_dans_le_score" = ("statut" <> 'resolu'));

-- ── Avis ───────────────────────────────────────────────────────────────────
ALTER TABLE "avis" ADD CONSTRAINT "avis_note_1_a_5" CHECK ("note" BETWEEN 1 AND 5);

-- Le droit de réponse s'exerce une seule fois (F6.9) : les deux colonnes vont
-- ensemble, ou aucune.
ALTER TABLE "avis" ADD CONSTRAINT "avis_reponse_complete"
  CHECK (("reponse_texte" IS NULL) = ("reponse_le" IS NULL));

-- ── Modération : on ne se bloque pas soi-même ──────────────────────────────
ALTER TABLE "blocage" ADD CONSTRAINT "blocage_pas_soi_meme"
  CHECK ("bloqueur_id" <> "bloque_id");

-- Un contenu ne peut pas être la republication de lui-même.
ALTER TABLE "republication_suspectee" ADD CONSTRAINT "republication_deux_contenus"
  CHECK ("contenu_id" <> "contenu_origine_id");

-- ── Ce qui ne s'efface pas ─────────────────────────────────────────────────
--
-- Un avis, un litige et une sanction sont des faits opposables. On les masque,
-- on les résout, on les conteste — on ne les supprime pas.
REVOKE DELETE ON "avis" FROM jp_app;
REVOKE DELETE ON "litige" FROM jp_app;
REVOKE DELETE ON "message_litige" FROM jp_app;
REVOKE DELETE ON "sanction" FROM jp_app;
REVOKE DELETE ON "signalement" FROM jp_app;
REVOKE DELETE ON "contenu" FROM jp_app;
