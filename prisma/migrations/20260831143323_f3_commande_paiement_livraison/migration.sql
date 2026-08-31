-- CreateEnum
CREATE TYPE "origine_vente" AS ENUM ('direct', 'catalogue', 'clip', 'story', 'evenement');

-- CreateEnum
CREATE TYPE "statut_reservation" AS ENUM ('active', 'consommee', 'expiree', 'annulee', 'en_file');

-- CreateEnum
CREATE TYPE "statut_commande" AS ENUM ('brouillon', 'en_attente_paiement', 'payee', 'en_attente_seuil', 'en_preparation', 'expediee', 'livree', 'confirmee', 'annulee', 'remboursee');

-- CreateEnum
CREATE TYPE "mode_livraison" AS ENUM ('domicile', 'relais');

-- CreateEnum
CREATE TYPE "mode_remuneration" AS ENUM ('abonnement', 'commission');

-- CreateEnum
CREATE TYPE "rang_paiement" AS ENUM ('pivot', 'secondaire');

-- CreateEnum
CREATE TYPE "beneficiaire_type" AS ENUM ('boutique', 'jp', 'createur');

-- CreateEnum
CREATE TYPE "moyen_paiement" AS ENUM ('mvola', 'orange', 'airtel', 'carte');

-- CreateEnum
CREATE TYPE "statut_paiement" AS ENUM ('initie', 'en_attente_operateur', 'confirme', 'echoue', 'expire', 'rembourse');

-- CreateEnum
CREATE TYPE "sens_ecriture" AS ENUM ('debit', 'credit');

-- CreateEnum
CREATE TYPE "compte_ecriture" AS ENUM ('boutique', 'createur', 'cagnotte', 'commission_jp', 'abonnement_jp');

-- CreateEnum
CREATE TYPE "statut_expedition" AS ENUM ('en_preparation', 'expediee', 'livree', 'confirmee');

-- CreateTable
CREATE TABLE "reservation" (
    "id" UUID NOT NULL,
    "variante_id" UUID NOT NULL,
    "utilisateur_id" UUID,
    "session_invitee_id" UUID,
    "quantite" INTEGER NOT NULL DEFAULT 1,
    "statut" "statut_reservation" NOT NULL DEFAULT 'active',
    "origine" "origine_vente" NOT NULL DEFAULT 'catalogue',
    "direct_id" UUID,
    "rang" INTEGER NOT NULL DEFAULT 0,
    "expire_le" TIMESTAMPTZ(6) NOT NULL,
    "suspendu_depuis" TIMESTAMPTZ(6),
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zone_livraison" (
    "id" UUID NOT NULL,
    "nom" TEXT NOT NULL,
    "quartiers" JSONB NOT NULL,
    "delai_transport_j" INTEGER NOT NULL DEFAULT 1,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zone_livraison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarif_livraison" (
    "boutique_id" UUID NOT NULL,
    "zone_id" UUID NOT NULL,
    "montant" INTEGER NOT NULL,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tarif_livraison_pkey" PRIMARY KEY ("boutique_id","zone_id")
);

-- CreateTable
CREATE TABLE "commande" (
    "id" UUID NOT NULL,
    "numero" TEXT NOT NULL,
    "acheteur_id" UUID NOT NULL,
    "createur_id" UUID,
    "evenement_id" UUID,
    "direct_id" UUID,
    "donateur_ref" TEXT,
    "statut" "statut_commande" NOT NULL DEFAULT 'brouillon',
    "origine" "origine_vente" NOT NULL DEFAULT 'catalogue',
    "univers_cle" TEXT NOT NULL,
    "mode_livraison" "mode_livraison" NOT NULL DEFAULT 'domicile',
    "adresse_id" UUID,
    "code_promo" TEXT,
    "sous_total" INTEGER NOT NULL,
    "frais_livraison" INTEGER NOT NULL DEFAULT 0,
    "remise" INTEGER NOT NULL DEFAULT 0,
    "remise_livraison" INTEGER NOT NULL DEFAULT 0,
    "credit_cagnotte_utilise" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "note_acheteur" TEXT,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ligne_commande" (
    "id" UUID NOT NULL,
    "commande_id" UUID NOT NULL,
    "variante_id" UUID NOT NULL,
    "boutique_id" UUID NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prix_unitaire" INTEGER NOT NULL,
    "remise_ligne" INTEGER NOT NULL DEFAULT 0,
    "promotion_id" UUID,
    "part_createur" INTEGER NOT NULL DEFAULT 0,
    "taux_commission_pour_mille" INTEGER NOT NULL DEFAULT 0,
    "mode_remuneration" "mode_remuneration" NOT NULL DEFAULT 'commission',
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ligne_commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_beneficiaire" (
    "promotion_id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "code_personnel" TEXT NOT NULL,
    "utilise_le" TIMESTAMPTZ(6),
    "commande_id" UUID,

    CONSTRAINT "promotion_beneficiaire_pkey" PRIMARY KEY ("promotion_id","utilisateur_id")
);

-- CreateTable
CREATE TABLE "paiement" (
    "id" UUID NOT NULL,
    "commande_id" UUID NOT NULL,
    "rang" "rang_paiement" NOT NULL DEFAULT 'pivot',
    "beneficiaire_type" "beneficiaire_type" NOT NULL,
    "beneficiaire_id" UUID,
    "msisdn_destination" TEXT NOT NULL,
    "moyen" "moyen_paiement" NOT NULL,
    "montant" INTEGER NOT NULL,
    "statut" "statut_paiement" NOT NULL DEFAULT 'initie',
    "reference_externe" TEXT,
    "cle_idempotence" TEXT NOT NULL,
    "motif_echec" TEXT,
    "nb_rejeux" INTEGER NOT NULL DEFAULT 0,
    "prochain_rejeu_le" TIMESTAMPTZ(6),
    "payeur_utilisateur_id" UUID,
    "payeur_pays" TEXT,
    "montant_devise_origine" INTEGER,
    "devise_origine" TEXT,
    "taux_indicatif" DECIMAL(12,6),
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecriture_financiere" (
    "id" UUID NOT NULL,
    "paiement_id" UUID,
    "type" TEXT NOT NULL,
    "reference" TEXT,
    "montant" INTEGER NOT NULL,
    "sens" "sens_ecriture" NOT NULL,
    "compte" "compte_ecriture" NOT NULL,
    "titulaire_id" UUID,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ecriture_financiere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facture" (
    "id" UUID NOT NULL,
    "commande_id" UUID NOT NULL,
    "numero" TEXT NOT NULL,
    "url_pdf" TEXT,
    "emise_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expedition" (
    "id" UUID NOT NULL,
    "commande_id" UUID NOT NULL,
    "boutique_id" UUID NOT NULL,
    "statut" "statut_expedition" NOT NULL DEFAULT 'en_preparation',
    "moyen_declare" TEXT,
    "telephone_verifie" BOOLEAN NOT NULL DEFAULT false,
    "nb_tentatives" INTEGER NOT NULL DEFAULT 0,
    "motif_echec" TEXT,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maj_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expedition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evenement_livraison" (
    "id" UUID NOT NULL,
    "expedition_id" UUID NOT NULL,
    "statut" "statut_expedition" NOT NULL,
    "auteur_id" UUID,
    "horodatage" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commentaire" TEXT,

    CONSTRAINT "evenement_livraison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fil_remise" (
    "id" UUID NOT NULL,
    "commande_id" UUID NOT NULL,
    "participants" JSONB NOT NULL,
    "point_convenu" TEXT,
    "moment_convenu" TIMESTAMPTZ(6),
    "accord_le" TIMESTAMPTZ(6),
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fil_remise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reservation_variante_id_statut_idx" ON "reservation"("variante_id", "statut");

-- CreateIndex
CREATE INDEX "reservation_utilisateur_id_statut_idx" ON "reservation"("utilisateur_id", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "commande_numero_key" ON "commande"("numero");

-- CreateIndex
CREATE INDEX "commande_acheteur_id_cree_le_idx" ON "commande"("acheteur_id", "cree_le");

-- CreateIndex
CREATE INDEX "commande_origine_cree_le_idx" ON "commande"("origine", "cree_le");

-- CreateIndex
CREATE INDEX "commande_statut_cree_le_idx" ON "commande"("statut", "cree_le");

-- CreateIndex
CREATE INDEX "ligne_commande_commande_id_idx" ON "ligne_commande"("commande_id");

-- CreateIndex
CREATE INDEX "ligne_commande_boutique_id_cree_le_idx" ON "ligne_commande"("boutique_id", "cree_le");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_beneficiaire_code_personnel_key" ON "promotion_beneficiaire"("code_personnel");

-- CreateIndex
CREATE UNIQUE INDEX "paiement_cle_idempotence_key" ON "paiement"("cle_idempotence");

-- CreateIndex
CREATE INDEX "paiement_commande_id_rang_idx" ON "paiement"("commande_id", "rang");

-- CreateIndex
CREATE INDEX "ecriture_financiere_titulaire_id_compte_cree_le_idx" ON "ecriture_financiere"("titulaire_id", "compte", "cree_le");

-- CreateIndex
CREATE UNIQUE INDEX "facture_commande_id_key" ON "facture"("commande_id");

-- CreateIndex
CREATE UNIQUE INDEX "facture_numero_key" ON "facture"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "expedition_commande_id_key" ON "expedition"("commande_id");

-- CreateIndex
CREATE INDEX "expedition_boutique_id_statut_idx" ON "expedition"("boutique_id", "statut");

-- CreateIndex
CREATE INDEX "evenement_livraison_expedition_id_horodatage_idx" ON "evenement_livraison"("expedition_id", "horodatage");

-- CreateIndex
CREATE UNIQUE INDEX "fil_remise_commande_id_key" ON "fil_remise"("commande_id");

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_direct_id_fkey" FOREIGN KEY ("direct_id") REFERENCES "direct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarif_livraison" ADD CONSTRAINT "tarif_livraison_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarif_livraison" ADD CONSTRAINT "tarif_livraison_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zone_livraison"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commande" ADD CONSTRAINT "commande_acheteur_id_fkey" FOREIGN KEY ("acheteur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commande" ADD CONSTRAINT "commande_createur_id_fkey" FOREIGN KEY ("createur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commande" ADD CONSTRAINT "commande_evenement_id_fkey" FOREIGN KEY ("evenement_id") REFERENCES "evenement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commande" ADD CONSTRAINT "commande_direct_id_fkey" FOREIGN KEY ("direct_id") REFERENCES "direct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commande" ADD CONSTRAINT "commande_adresse_id_fkey" FOREIGN KEY ("adresse_id") REFERENCES "adresse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ligne_commande" ADD CONSTRAINT "ligne_commande_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ligne_commande" ADD CONSTRAINT "ligne_commande_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ligne_commande" ADD CONSTRAINT "ligne_commande_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ligne_commande" ADD CONSTRAINT "ligne_commande_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_beneficiaire" ADD CONSTRAINT "promotion_beneficiaire_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_beneficiaire" ADD CONSTRAINT "promotion_beneficiaire_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_beneficiaire" ADD CONSTRAINT "promotion_beneficiaire_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiement" ADD CONSTRAINT "paiement_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecriture_financiere" ADD CONSTRAINT "ecriture_financiere_paiement_id_fkey" FOREIGN KEY ("paiement_id") REFERENCES "paiement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facture" ADD CONSTRAINT "facture_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expedition" ADD CONSTRAINT "expedition_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expedition" ADD CONSTRAINT "expedition_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenement_livraison" ADD CONSTRAINT "evenement_livraison_expedition_id_fkey" FOREIGN KEY ("expedition_id") REFERENCES "expedition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenement_livraison" ADD CONSTRAINT "evenement_livraison_auteur_id_fkey" FOREIGN KEY ("auteur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fil_remise" ADD CONSTRAINT "fil_remise_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Réservation : ce qui porte RB1 ──────────────────────────────────────────
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_quantite_positive"
  CHECK ("quantite" > 0);

-- Une réservation appartient à un compte OU à une session invitée, jamais aux
-- deux, jamais à aucun des deux. Sans ce CHECK, une réservation orpheline
-- bloquerait du stock que personne ne pourrait ni payer ni libérer.
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_porteur_unique"
  CHECK (("utilisateur_id" IS NULL) <> ("session_invitee_id" IS NULL));

-- L'index PARTIEL qui rend l'expiration bon marché.
--
-- La tâche d'expiration tourne toutes les minutes. Sans ce `WHERE`, elle
-- balaierait toutes les réservations jamais créées ; avec lui, elle ne lit que
-- les actives — c'est-à-dire quelques dizaines de lignes.
CREATE INDEX "reservation_active_expire" ON "reservation" ("expire_le")
  WHERE "statut" = 'active';

-- ── Commande : les montants ────────────────────────────────────────────────
ALTER TABLE "commande" ADD CONSTRAINT "commande_montants_positifs"
  CHECK ("sous_total" >= 0 AND "frais_livraison" >= 0 AND "remise" >= 0
     AND "remise_livraison" >= 0 AND "credit_cagnotte_utilise" >= 0 AND "total" >= 0);

ALTER TABLE "ligne_commande" ADD CONSTRAINT "ligne_commande_quantite_positive"
  CHECK ("quantite" > 0 AND "prix_unitaire" > 0);

-- Une remise ne peut pas dépasser ce qu'elle remise. Une ligne à total négatif
-- transformerait une vente en versement.
ALTER TABLE "ligne_commande" ADD CONSTRAINT "ligne_commande_remise_bornee"
  CHECK ("remise_ligne" >= 0 AND "remise_ligne" <= "prix_unitaire" * "quantite");

-- ── Paiement ───────────────────────────────────────────────────────────────
ALTER TABLE "paiement" ADD CONSTRAINT "paiement_montant_positif" CHECK ("montant" > 0);

-- La file de rejeu des crédits secondaires (R-M5). Index partiel : seuls les
-- secondaires échoués sont à rejouer, et eux seuls méritent d'être indexés.
CREATE INDEX "paiement_rejeu_a_faire" ON "paiement" ("prochain_rejeu_le")
  WHERE "rang" = 'secondaire' AND "statut" = 'echoue';

-- ── ecriture_financiere : AJOUT SEUL (D3, C4) ──────────────────────────────
--
-- Même dispositif que `journal_audit`. Un journal financier modifiable n'est
-- pas un journal financier : c'est un tableau.
REVOKE UPDATE, DELETE ON "ecriture_financiere" FROM jp_app;

COMMENT ON TABLE "ecriture_financiere" IS
  'AJOUT SEUL (D3, C4). Ne JAMAIS accorder UPDATE ni DELETE a jp_app. Une erreur se corrige par une ecriture inverse, jamais par une modification.';

ALTER TABLE "ecriture_financiere" ADD CONSTRAINT "ecriture_montant_positif"
  CHECK ("montant" > 0);

-- ── Facture : une numérotation CONTINUE ────────────────────────────────────
--
-- Une séquence dédiée, et non `max(numero) + 1` : deux factures émises en même
-- temps liraient le même maximum et porteraient le même numéro. Un trou dans
-- une série de factures est un problème comptable, un doublon en est un pire.
CREATE SEQUENCE IF NOT EXISTS "facture_numero_seq" AS bigint START WITH 1;
GRANT USAGE, SELECT ON SEQUENCE "facture_numero_seq" TO jp_app;

-- Une facture émise ne se modifie ni ne s'efface. On émet un avoir.
REVOKE UPDATE, DELETE ON "facture" FROM jp_app;
REVOKE DELETE ON "commande" FROM jp_app;
REVOKE DELETE ON "ligne_commande" FROM jp_app;
REVOKE DELETE ON "paiement" FROM jp_app;
REVOKE DELETE ON "expedition" FROM jp_app;
REVOKE DELETE ON "evenement_livraison" FROM jp_app;
