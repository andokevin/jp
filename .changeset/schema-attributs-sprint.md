---
'@jp/api': minor
---

Le schéma gagne huit tables et trois attributs — le sprint « ajout d'attributs ».

**Sur `utilisateur`** : `genre` *(femme · homme · autre, facultatif — `NULL`
n'est pas `autre`)* et `mot_de_passe_empreinte`. Le mot de passe **s'ajoute** à
l'OTP au lieu de le remplacer : l'OTP ne survit pas à la perte de la boîte
courriel et coûte un aller-retour à chaque connexion. La colonne reste nullable
— un compte ouvert par Google n'a pas de mot de passe.

**Tables nouvelles** : `profil_acheteur` *(trois préférences de vêtements au
plus, borné par un `CHECK`)*, `boutique` *(avec `logo_url`, et **sans**
`type_boutique` — `DP-01`)*, `document_identite`, `article`, `variante`,
`panier`, `ligne_panier`, `extrait_boutique`.

**Les deux points à connaître avant de coder dessus.**

`D7` est **révisé** : une table `panier` existe désormais, mais elle ne détient
**aucune** vérité sur le stock. Une ligne de panier est une intention d'achat
qui ne tient rien ; le blocage se fait au passage en caisse, par une
`reservation`. Supposer l'inverse rouvre le risque de survente que `D7`
fermait.

`DELETE` est **retiré à `jp_app`** sur `utilisateur`, `boutique`, `article`,
`variante` et `extrait_boutique` : la suppression y est douce
*(`supprime_le`, ou `statut = supprime`)*. Une commande passée cite encore
l'article qu'elle contient.

32 tests éprouvent ces garanties sur un PostgreSQL réel
*(`apps/api/test/attributs.test.ts`)* — y compris la contre-épreuve qui prouve
que les `REVOKE` mesurent bien le rôle et non une faute de frappe.
