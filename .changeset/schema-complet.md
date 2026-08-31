---
'@jp/api': minor
---

**Le schéma est entièrement migré** — 96 tables, contre 7 hier.

Les 32 migrations planifiées *(`JP_CONCEPTION_BDD.md` §12)* ont été jouées en
7 migrations groupées par domaine : identité, catalogue et stock, social et
direct et événements, commande et paiement et livraison, contenu et confiance
et modération, créatrices et fidélité et cadeau, monétisation et exploitation.

**Trois écarts avec la documentation ont été tranchés en faveur du
dictionnaire**, postérieur à la refonte :

- la table `litige` du diagramme ER est devenue **`signalement_commande`**,
  sans `decision_texte` ni `decide_par_id` *(`DP-05`)* — personne n'instruit,
  personne ne tranche. `RB4` s'est déplacé sur `sanction.motif_texte` ;
- **`bareme_commission`** est rétablie *(`DP-15`)*, historisée : un déclencheur
  n'autorise que la clôture d'une version, jamais la modification d'un taux ;
- `article.peremption_le` est une colonne **ordinaire** et non générée — Prisma
  ne sait pas déclarer les colonnes générées, et une colonne ajoutée à la main
  ferait dériver le schéma.

**Ce qu'il faut savoir avant de coder dessus.**

`DELETE` est retiré à `jp_app` sur 29 tables : la suppression y est douce.
`ecriture_financiere`, `mouvement_cagnotte`, `vente_confirmee_journal` et
`evenement_usage` sont en **ajout seul**, comme `journal_audit`.

Quatre garanties ne vivent que dans le SQL, pas dans le schéma Prisma : le
déclencheur **différé** de `RB5` *(un contenu publié porte au moins un
article)*, le `CHECK compteur_coherent` *(un signalement ouvert pèse,
toujours)*, l'index partiel d'expiration des réservations, et l'unicité
partielle de l'abonnement actif. Les toucher sans lire leur commentaire de
migration casse une règle produit, pas une contrainte technique.

52 tests éprouvent tout cela sur un PostgreSQL réel.
