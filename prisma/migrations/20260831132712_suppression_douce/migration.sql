-- SUPPRESSION DOUCE — la garantie, pas l'intention.
--
-- Un commentaire dans le schéma Prisma dit ce qu'on souhaite ; il n'empêche
-- rien. Le seul dispositif qui empêche un DELETE, c'est le retrait du droit.
-- Même raisonnement que le REVOKE d'AJOUT SEUL sur `journal_audit` (D3).
--
-- Les tables ci-dessous portent une histoire que la ligne supprimee rendrait
-- illisible : une commande dont l'article a disparu perd son libelle, un avis
-- dont la boutique a disparu perd son objet. On marque `supprime_le` (ou
-- `statut = supprime` pour `utilisateur`) et la ligne reste.
--
-- ATTENTION : ce REVOKE ne vaut que pour `jp_app`. Le proprietaire des tables
-- contourne ses propres revocations, et un superutilisateur contourne tout.
-- C'est pourquoi l'API tourne avec DATABASE_URL_APP et jamais DATABASE_URL.

REVOKE DELETE ON "utilisateur"       FROM jp_app;
REVOKE DELETE ON "boutique"          FROM jp_app;
REVOKE DELETE ON "article"           FROM jp_app;
REVOKE DELETE ON "variante"          FROM jp_app;
REVOKE DELETE ON "extrait_boutique"  FROM jp_app;

COMMENT ON TABLE "boutique" IS
  'SUPPRESSION DOUCE : marquer supprimee_le, jamais DELETE. Le droit est retire a jp_app.';
COMMENT ON TABLE "article" IS
  'SUPPRESSION DOUCE : marquer supprime_le, jamais DELETE. Une commande passee cite encore cet article.';
COMMENT ON TABLE "extrait_boutique" IS
  'SUPPRESSION DOUCE : marquer supprime_le, jamais DELETE.';

-- `panier`, `ligne_panier`, `profil_acheteur` et `document_identite` gardent le
-- droit DELETE : retirer un article de son panier, changer d'avis sur ses
-- preferences ou redeposer une piece d'identite sont de vraies suppressions.
-- Rien de ce qu'elles portent n'a de valeur de preuve.
