# PLAN_INDEX — carte des 266 fonctionnalités

> **Le plan de réalisation, fonctionnalité par fonctionnalité.** Chaque fonctionnalité du backlog a son mini-plan complet — conception, squelette de code, base de données, design et prompt Stitch, backend, frontend — dans le fichier d'épique correspondant.
>
> **À lire d'abord :** [PLAN_SOCLE.md](PLAN_SOCLE.md) — pile, arborescence, conventions, design system, préambule Stitch. Les mini-plans le supposent connu et ne le répètent pas.

---

## Comment lire un mini-plan

Chaque fonctionnalité suit la même structure à six sections :

| # | Section | Contenu |
|---|---|---|
| 1 | **Conception** | Spécification fonctionnelle par persona, cas d'échec, décisions techniques, invariants |
| 2 | **Structure de code** | Fichiers et modules à créer, back-end et front-end |
| 3 | **Base de données** | Tables, colonnes, index, contraintes, nom de migration |
| 4 | **Design** | Écrans, états, variantes mg/fr, **prompt Stitch prêt à l'emploi** |
| 5 | **Backend** | Endpoints, logique métier, effets asynchrones, tests |
| 6 | **Frontend** | Composants, écrans, état et cache, intégration API, tests |

**Niveau de détail** — gradué pour que 266 mini-plans restent lisibles :

- **complet** — les six sections développées. Les 37 fonctionnalités nouvelles ou refondues (★) et toutes les `P1/M`.
- **moyen** — conception, base de données, endpoints, prompt Stitch, arborescence resserrée. Les `P1/S`, `P1/C`, `P2/M`, `P2/S`.
- **cadre** — conception, impact base de données, endpoints pressentis. Les `P2/C` et `P3/*` : une arborescence de fichiers écrite aujourd'hui pour une fonctionnalité de phase 3 sera obsolète avant d'être lue.

| Niveau | Fonctionnalités |
|---|---|
| complet | 127 |
| moyen | 96 |
| cadre | 43 |

---

## Ordre de réalisation

**Vague 0 — socle** *(PLAN_SOCLE §9, S1→S10)* — monorepo, plateforme API, Prisma, files, temps réel, design system, coquilles Expo et Vite. Aucun mini-plan de domaine ne démarre avant.

**Vague 1 — les six épics de la demande**
1. [EP00-identite](EP00-identite.md) — authentification par courriel et code
2. [EP01-catalogue](EP01-catalogue.md) + [EP03-commande](EP03-commande.md) — vente hors direct
3. [EP07-communaute](EP07-communaute.md) — abonnements, puis promotions, puis fidélisation
4. [EP20-evenements](EP20-evenements.md) — événements thématiques

**Vague 2 — le reste du périmètre Phase 1** — [EP02](EP02-direct.md) direct · [EP04](EP04-paiement.md) paiement · [EP05](EP05-livraison.md) livraison · [EP06](EP06-confiance.md) confiance · [EP11](EP11-backoffice.md) back-office · [EP13](EP13-socle.md) non fonctionnel · [EP14](EP14-contenu.md) contenu · [EP15](EP15-createurs.md) créatrices · [EP16](EP16-cadeau.md) cadeau · [EP17](EP17-habitude.md) habitude · [EP19](EP19-moderation.md) modération

**Vague 3 — hors Phase 1** — [EP08](EP08-decouverte.md) découverte · [EP09](EP09-statistiques.md) statistiques · [EP10](EP10-monetisation.md) monétisation · [EP12](EP12-assistant.md) assistant · [EP18](EP18-premium.md) premium

**Une remarque sur l'ordre à l'intérieur de l'épique 7.** Les promotions passent **avant** la fidélisation, alors que le backlog les présente dans l'autre sens. La promotion générale ne dépend que des abonnements ; la promotion ciblée dépend du rang, qui dépend d'un historique d'achats qui n'existe pas encore. Coder la fidélisation d'abord, c'est coder un moteur qui n'a rien à classer.

---

## Les 21 épiques

| Épique | Fichier | Fonctionnalités | Vague |
|---|---|---|---|
| 0 — Compte, identité, vérification | [EP00-identite](EP00-identite.md) | 16 | 1 |
| 1 — Catalogue, articles, stock, **vente hors direct** | [EP01-catalogue](EP01-catalogue.md) | 20 | 1 |
| 2 — Le direct | [EP02-direct](EP02-direct.md) | 21 | 2 |
| 3 — Panier et commande | [EP03-commande](EP03-commande.md) | 15 | 1 |
| 4 — Paiement et argent | [EP04-paiement](EP04-paiement.md) | 13 | 2 |
| 5 — Livraison | [EP05-livraison](EP05-livraison.md) | 10 | 2 |
| 6 — Confiance, avis, litiges | [EP06-confiance](EP06-confiance.md) | 10 | 2 |
| 7 — Communauté, **abonnements, fidélité, promotions** | [EP07-communaute](EP07-communaute.md) | 24 | 1 |
| 8 — Découverte, recherche, navigation | [EP08-decouverte](EP08-decouverte.md) | 8 | 3 |
| 9 — Statistiques vendeur | [EP09-statistiques](EP09-statistiques.md) | 7 | 3 |
| 10 — Monétisation et abonnement vendeur | [EP10-monetisation](EP10-monetisation.md) | 8 | 3 |
| 11 — Back-office JP | [EP11-backoffice](EP11-backoffice.md) | 11 | 2 |
| 12 — Assistant du vendeur | [EP12-assistant](EP12-assistant.md) | 5 | 3 |
| 13 — Socle technique et non fonctionnel | [EP13-socle](EP13-socle.md) | 10 | 2 |
| 14 — Contenu et fil social | [EP14-contenu](EP14-contenu.md) | 21 | 2 |
| 15 — Créatrices, affiliation, précommande | [EP15-createurs](EP15-createurs.md) | 13 | 2 |
| 16 — Cadeau, panier partagé, diaspora | [EP16-cadeau](EP16-cadeau.md) | 10 | 2 |
| 17 — Gamification, habitude, dressing | [EP17-habitude](EP17-habitude.md) | 13 | 2 |
| 18 — Premium, JP Club, marques | [EP18-premium](EP18-premium.md) | 10 | 3 |
| 19 — Modération et sécurité des personnes | [EP19-moderation](EP19-moderation.md) | 12 | 2 |
| **20 — Événements thématiques** | [EP20-evenements](EP20-evenements.md) | 9 | 1 |

---

## Les 266 fonctionnalités

★ = nouvelle ou refondue dans la vague « auth, vente hors direct, social, fidélisation, promotions, événements ».

| ID | Fonctionnalité | Phase | Prio | Mini-plan | Détail |
|---|---|---|---|---|---|
| `F0.1` ★ | **Inscription et connexion par email + code OTP** | P1 | M | [EP00-identite](EP00-identite.md) | **complet** |
| `F0.2` | Connexion, session longue, multi-appareil | P1 | M | [EP00-identite](EP00-identite.md) | **complet** |
| `F0.3` ★ | Récupération de compte (perte de l'email, changement de SIM) | P1 | S | [EP00-identite](EP00-identite.md) | **complet** |
| `F0.4` ★ | Bascule de rôle acheteur ↔ vendeur ↔ **particulier** sur un même compte | P1 | S | [EP00-identite](EP00-identite.md) | **complet** |
| `F0.5` | Profil acheteur (nom, photo, tailles habituelles, morphologie) | P1 | S | [EP00-identite](EP00-identite.md) | moyen |
| `F0.6` | Vérification vendeur — CIN ou NIF/STAT, selfie, numéro mobile money, adresse | P1 | M | [EP00-identite](EP00-identite.md) | **complet** |
| `F0.7` | Badge « vendeur vérifié » affiché partout | P1 | M | [EP00-identite](EP00-identite.md) | **complet** |
| `F0.8` | Choix de la langue : malgache / français | P1 | S | [EP00-identite](EP00-identite.md) | moyen |
| `F0.9` | Mode économie de données | P1 | S | [EP00-identite](EP00-identite.md) | moyen |
| `F0.10` | Consultation en invité, sans compte | P1 | S | [EP00-identite](EP00-identite.md) | moyen |
| `F0.11` | Suppression et désactivation de compte | P1 | M | [EP00-identite](EP00-identite.md) | **complet** |
| `F0.12` | Blocage d'un utilisateur | P2 | C | [EP00-identite](EP00-identite.md) | cadre |
| `F0.13` ★ | **Connexion Google (OAuth)** | P1 | S | [EP00-identite](EP00-identite.md) | **complet** |
| `F0.14` ★ | **Renvoi de code, limitation de débit, anti-énumération de comptes** | P1 | M | [EP00-identite](EP00-identite.md) | **complet** |
| `F0.15` ★ | **Changement d'adresse email avec double vérification** | P1 | S | [EP00-identite](EP00-identite.md) | **complet** |
| `F0.16` ★ | Numéro de téléphone en contact de livraison, vérifié à la première commande | P1 | S | [EP00-identite](EP00-identite.md) | **complet** |
| `F1.1` | Créer un article (photos, nom, prix, description) | P1 | M | [EP01-catalogue](EP01-catalogue.md) | **complet** |
| `F1.2` | Variantes taille / couleur, stock par variante | P1 | M | [EP01-catalogue](EP01-catalogue.md) | **complet** |
| `F1.3` | Création rapide en lot depuis la galerie photo | P1 | S | [EP01-catalogue](EP01-catalogue.md) | moyen |
| `F1.4` | Catégories et attributs mode (matière, marque, coupe) | P1 | S | [EP01-catalogue](EP01-catalogue.md) | moyen |
| `F1.5` | Guide des tailles par marque + repères de mesure | P2 | S | [EP01-catalogue](EP01-catalogue.md) | moyen |
| `F1.6` | Gestion de stock : entrée, sortie, alerte de rupture | P1 | M | [EP01-catalogue](EP01-catalogue.md) | **complet** |
| `F1.7` | États d'un article : brouillon, en ligne, masqué, épuisé | P1 | M | [EP01-catalogue](EP01-catalogue.md) | **complet** |
| `F1.8` | Duplication d'un article | P1 | C | [EP01-catalogue](EP01-catalogue.md) | moyen |
| `F1.9` | Prix barré / promotion sur un article | P1 | S | [EP01-catalogue](EP01-catalogue.md) | moyen |
| `F1.10` | **Réservation temporaire du stock (minuteur)** | P1 | M | [EP01-catalogue](EP01-catalogue.md) | **complet** |
| `F1.11` | Vitrine publique du vendeur, ouverte 24 h/24 | P1 | M | [EP01-catalogue](EP01-catalogue.md) | **complet** |
| `F1.12` | Réorganisation de la vitrine (épinglage, ordre) | P2 | C | [EP01-catalogue](EP01-catalogue.md) | cadre |
| `F1.13` | Import d'un catalogue existant (tableur / photos en masse) | P2 | C | [EP01-catalogue](EP01-catalogue.md) | cadre |
| `F1.14` | Pièce unique (stock = 1, comportement spécifique) | P1 | S | [EP01-catalogue](EP01-catalogue.md) | moyen |
| `F1.15` ★ | **Achat immédiat depuis la fiche article, hors direct** | P1 | M | [EP01-catalogue](EP01-catalogue.md) | **complet** |
| `F1.16` ★ | **Ajout au panier depuis le catalogue, réservation longue** | P1 | M | [EP01-catalogue](EP01-catalogue.md) | **complet** |
| `F1.17` ★ | **Dépôt d'annonce par un particulier** | P1 | S | [EP01-catalogue](EP01-catalogue.md) | **complet** |
| `F1.18` ★ | **Fiche enrichie hors live : état, mesures réelles, photos multiples** | P1 | M | [EP01-catalogue](EP01-catalogue.md) | **complet** |
| `F1.19` ★ | **Vitrine « catalogue d'abord » — vendre 24 h/24 sans direct** | P1 | M | [EP01-catalogue](EP01-catalogue.md) | **complet** |
| `F1.20` ★ | Questions publiques sur une fiche article | P2 | S | [EP01-catalogue](EP01-catalogue.md) | **complet** |
| `F2.1` | Planifier un direct (date, heure, titre, affiche) | P1 | S | [EP02-direct](EP02-direct.md) | moyen |
| `F2.2` | Notification aux abonnés avant et au démarrage | P2 | M | [EP02-direct](EP02-direct.md) | moyen |
| `F2.3` | Démarrer / arrêter un direct depuis le téléphone | P1 | M | [EP02-direct](EP02-direct.md) | **complet** |
| `F2.4` | Sélectionner l'article « à l'écran maintenant » | P1 | M | [EP02-direct](EP02-direct.md) | **complet** |
| `F2.5` | Bandeau prix + stock restant en temps réel | P1 | M | [EP02-direct](EP02-direct.md) | **complet** |
| `F2.6` | **Le bouton « Je prends »** | P1 | M | [EP02-direct](EP02-direct.md) | **complet** |
| `F2.7` | File d'ordre d'arrivée sur un article | P1 | M | [EP02-direct](EP02-direct.md) | **complet** |
| `F2.8` | Feuille rapide quantité / taille / livraison | P1 | M | [EP02-direct](EP02-direct.md) | **complet** |
| `F2.9` | Minuteur de réservation visible | P1 | M | [EP02-direct](EP02-direct.md) | **complet** |
| `F2.10` | Chat du direct | P1 | S | [EP02-direct](EP02-direct.md) | moyen |
| `F2.11` | Modération du chat (masquer, bloquer, mots interdits) | P1 | S | [EP02-direct](EP02-direct.md) | moyen |
| `F2.12` | Compteur de spectateurs et réactions | P1 | C | [EP02-direct](EP02-direct.md) | moyen |
| `F2.13` | Qualité adaptative et reprise après coupure réseau | P1 | M | [EP02-direct](EP02-direct.md) | **complet** |
| `F2.14` | Panneau vendeur en direct (commandes qui tombent) | P1 | M | [EP02-direct](EP02-direct.md) | **complet** |
| `F2.15` | Bilan de fin de direct | P1 | S | [EP02-direct](EP02-direct.md) | moyen |
| `F2.16` | **Replay achetable, articles repérés à la minute** | P2 | S | [EP02-direct](EP02-direct.md) | moyen |
| `F2.17` | Direct à deux (co-animation, catalogue partagé) | P3 | W | [EP02-direct](EP02-direct.md) | cadre |
| `F2.18` | Vente flash à compte à rebours | P3 | W | [EP02-direct](EP02-direct.md) | cadre |
| `F2.19` | Enchère en direct | P3 | W | [EP02-direct](EP02-direct.md) | cadre |
| `F2.20` | Épingler un message dans le chat | P1 | C | [EP02-direct](EP02-direct.md) | moyen |
| `F2.21` | Rediffusion simultanée vers Facebook ⚠️ | P2 | S | [EP02-direct](EP02-direct.md) | moyen |
| `F3.1` | Panier multi-articles et multi-vendeurs | P1 | M | [EP03-commande](EP03-commande.md) | **complet** |
| `F3.2` | Récapitulatif : sous-total, livraison, remise, total | P1 | M | [EP03-commande](EP03-commande.md) | **complet** |
| `F3.3` | Carnet d'adresses de livraison | P1 | M | [EP03-commande](EP03-commande.md) | **complet** |
| `F3.4` | Choix domicile / point relais | P1 | M | [EP03-commande](EP03-commande.md) | **complet** |
| `F3.5` | Calcul des frais de livraison par zone | P1 | M | [EP03-commande](EP03-commande.md) | **complet** |
| `F3.6` | Application d'un code promo ou d'un crédit fidélité | P2 | S | [EP03-commande](EP03-commande.md) | moyen |
| `F3.7` | Création de commande et numéro de commande | P1 | M | [EP03-commande](EP03-commande.md) | **complet** |
| `F3.8` | Annulation par l'acheteuse avant expédition | P1 | S | [EP03-commande](EP03-commande.md) | moyen |
| `F3.9` | Annulation / refus par le vendeur | P1 | S | [EP03-commande](EP03-commande.md) | moyen |
| `F3.10` | Expiration de réservation → remise en stock automatique | P1 | M | [EP03-commande](EP03-commande.md) | **complet** |
| `F3.11` | Note à l'attention du vendeur | P1 | C | [EP03-commande](EP03-commande.md) | moyen |
| `F3.12` | Commande cadeau (adresse d'un tiers) | P2 | C | [EP03-commande](EP03-commande.md) | cadre |
| `F3.13` | Panier entre amies (partage des frais) | P3 | W | [EP03-commande](EP03-commande.md) | cadre |
| `F3.14` ★ | **Commande hors direct — parcours complet identique** | P1 | M | [EP03-commande](EP03-commande.md) | **complet** |
| `F3.15` ★ | **Application d'une promotion et d'un rang client au panier** | P1 | M | [EP03-commande](EP03-commande.md) | **complet** |
| `F4.1` | Paiement MVola / Orange Money / Airtel Money ⚠️ | P1 | M | [EP04-paiement](EP04-paiement.md) | **complet** |
| `F4.2` | Paiement par carte bancaire (agrégateur) ⚠️ | P1 | S | [EP04-paiement](EP04-paiement.md) | moyen |
| `F4.3` | **Paiement à la livraison** ⚠️ | P1 | M | [EP04-paiement](EP04-paiement.md) | **complet** |
| `F4.4` | Séquestre : les fonds sont retenus par JP | P1 | M | [EP04-paiement](EP04-paiement.md) | **complet** |
| `F4.5` | Libération à la confirmation de réception | P1 | M | [EP04-paiement](EP04-paiement.md) | **complet** |
| `F4.6` | Libération automatique après délai sans contestation | P1 | M | [EP04-paiement](EP04-paiement.md) | **complet** |
| `F4.7` | Remboursement total ou partiel | P1 | M | [EP04-paiement](EP04-paiement.md) | **complet** |
| `F4.8` | Portefeuille vendeur et retrait vers mobile money | P1 | M | [EP04-paiement](EP04-paiement.md) | **complet** |
| `F4.9` | Relevé des commissions prélevées | P1 | S | [EP04-paiement](EP04-paiement.md) | moyen |
| `F4.10` | Reprise après échec de paiement | P1 | M | [EP04-paiement](EP04-paiement.md) | **complet** |
| `F4.11` | Facture PDF horodatée, des deux côtés | P1 | M | [EP04-paiement](EP04-paiement.md) | **complet** |
| `F4.12` | Acompte + solde à la livraison ⚠️ | P2 | S | [EP04-paiement](EP04-paiement.md) | moyen |
| `F4.13` | Historique de tous les mouvements | P1 | S | [EP04-paiement](EP04-paiement.md) | moyen |
| `F5.1` | Bordereau de préparation / étiquette colis | P1 | M | [EP05-livraison](EP05-livraison.md) | **complet** |
| `F5.2` | Statuts de livraison partagés des deux côtés | P1 | M | [EP05-livraison](EP05-livraison.md) | **complet** |
| `F5.3` | Réseau de points relais : carte, horaires, fiche | P1 | M | [EP05-livraison](EP05-livraison.md) | **complet** |
| `F5.4` | Code de retrait à usage unique | P1 | M | [EP05-livraison](EP05-livraison.md) | **complet** |
| `F5.5` | Application livreur : tournée, scan, preuve de remise | P1 | S | [EP05-livraison](EP05-livraison.md) | moyen |
| `F5.6` | Regroupement des colis d'un même vendeur | P1 | S | [EP05-livraison](EP05-livraison.md) | moyen |
| `F5.7` | Échec de livraison et retour | P1 | S | [EP05-livraison](EP05-livraison.md) | moyen |
| `F5.8` | Retour produit pour cause de taille | P2 | S | [EP05-livraison](EP05-livraison.md) | moyen |
| `F5.9` | Estimation du délai affichée avant l'achat | P1 | S | [EP05-livraison](EP05-livraison.md) | moyen |
| `F5.10` | Application point relais : réception, stock, remise | P1 | M | [EP05-livraison](EP05-livraison.md) | **complet** |
| `F6.1` | Avis vérifiés (seul un acheteur ayant payé peut noter) | P2 | M | [EP06-confiance](EP06-confiance.md) | moyen |
| `F6.2` | Score de confiance vendeur, public | P2 | M | [EP06-confiance](EP06-confiance.md) | moyen |
| `F6.3` | Signalement d'un litige sur une commande | P1 | M | [EP06-confiance](EP06-confiance.md) | **complet** |
| `F6.4` | Fil de litige avec pièces jointes (photos) | P1 | M | [EP06-confiance](EP06-confiance.md) | **complet** |
| `F6.5` | Arbitrage par l'équipe JP, décision tracée | P1 | M | [EP06-confiance](EP06-confiance.md) | **complet** |
| `F6.6` | Historique complet consultable des deux côtés | P1 | M | [EP06-confiance](EP06-confiance.md) | **complet** |
| `F6.7` | Signalement d'un contenu ou d'un utilisateur | P1 | S | [EP06-confiance](EP06-confiance.md) | moyen |
| `F6.8` | Sanctions vendeur : avertissement, gel, suspension | P1 | S | [EP06-confiance](EP06-confiance.md) | moyen |
| `F6.9` | Réponse publique du vendeur à un avis | P2 | C | [EP06-confiance](EP06-confiance.md) | cadre |
| `F6.10` | Avis avec photo portée et morphologie | P2 | S | [EP06-confiance](EP06-confiance.md) | moyen |
| `F7.1` | Suivre / ne plus suivre un vendeur ou une créatrice | P1 | M | [EP07-communaute](EP07-communaute.md) | **complet** |
| `F7.2` | Fil des directs en cours et à venir | P1 | M | [EP07-communaute](EP07-communaute.md) | **complet** |
| `F7.3` | Notifications : direct, promo, retour en stock | P2 | M | [EP07-communaute](EP07-communaute.md) | moyen |
| `F7.4` | Alerte « prévenez-moi quand c'est dispo » | P2 | S | [EP07-communaute](EP07-communaute.md) | moyen |
| `F7.15` ★ | **Écrans abonnés / abonnements, compteurs publics** | P1 | S | [EP07-communaute](EP07-communaute.md) | **complet** |
| `F7.16` ★ | **Notification « nouvel abonné »** | P2 | C | [EP07-communaute](EP07-communaute.md) | **complet** |
| `F7.17` ★ | **Fil « Abonnements » alimenté aussi par les nouveautés catalogue** | P1 | S | [EP07-communaute](EP07-communaute.md) | **complet** |
| `F7.5` ★ | **Écran « Mes clientes » — CRM léger vendeur** | P2 | S | [EP07-communaute](EP07-communaute.md) | **complet** |
| `F7.6` ★ | **Paliers de fidélité paramétrables par le vendeur** | P2 | S | [EP07-communaute](EP07-communaute.md) | **complet** |
| `F7.18` ★ | **Moteur de rang client (score volume · fréquence · récence)** | P2 | S | [EP07-communaute](EP07-communaute.md) | **complet** |
| `F7.19` ★ | **Rang visible côté acheteuse et progression vers le palier suivant** | P2 | S | [EP07-communaute](EP07-communaute.md) | **complet** |
| `F7.7` | Cagnotte : % de chaque achat en crédit | P3 | S | [EP07-communaute](EP07-communaute.md) | cadre |
| `F7.10` | Accès anticipé à une collection | P2 | C | [EP07-communaute](EP07-communaute.md) | cadre |
| `F7.22` ★ | **Promotion boutique — %, montant, livraison offerte** | P1 | S | [EP07-communaute](EP07-communaute.md) | **complet** |
| `F7.23` ★ | **Notification automatique des abonnés au lancement d'une promotion** | P1 | S | [EP07-communaute](EP07-communaute.md) | **complet** |
| `F7.24` ★ | **Promotion ciblée par rang (VIP / Or)** | P2 | S | [EP07-communaute](EP07-communaute.md) | **complet** |
| `F7.9` ★ | **Code promo individuel envoyé à une cliente nommée** | P2 | C | [EP07-communaute](EP07-communaute.md) | **complet** |
| `F7.25` ★ | **Centre « Mes offres » côté acheteuse** | P2 | S | [EP07-communaute](EP07-communaute.md) | **complet** |
| `F7.26` ★ | **Règles de cumul et de priorité des remises** | P1 | M | [EP07-communaute](EP07-communaute.md) | **complet** |
| `F7.8` | Promotions programmées | P2 | S | [EP07-communaute](EP07-communaute.md) | moyen |
| `F7.11` | **Partage d'un direct / article vers WhatsApp et Facebook** | P1 | M | [EP07-communaute](EP07-communaute.md) | **complet** |
| `F7.12` | **Parrainage vendeur et parrainage acheteur** | P1 | M | [EP07-communaute](EP07-communaute.md) | **complet** |
| `F7.13` | Liste d'envies | P2 | C | [EP07-communaute](EP07-communaute.md) | cadre |
| `F7.14` | Message privé acheteur ↔ vendeur ⚠️ | P2 | S | [EP07-communaute](EP07-communaute.md) | moyen |
| `F8.1` | Fil d'accueil : directs en cours, à venir, replays, articles | P1 | M | [EP08-decouverte](EP08-decouverte.md) | **complet** |
| `F8.2` | Recherche texte | P1 | S | [EP08-decouverte](EP08-decouverte.md) | moyen |
| `F8.3` | Filtres : taille, couleur, marque, budget, catégorie | P1 | S | [EP08-decouverte](EP08-decouverte.md) | moyen |
| `F8.4` | Tri : nouveauté, prix, popularité, score vendeur | P1 | C | [EP08-decouverte](EP08-decouverte.md) | moyen |
| `F8.5` | Recommandations « à ma taille » | P2 | S | [EP08-decouverte](EP08-decouverte.md) | moyen |
| `F8.6` | Mise en avant sponsorisée dans le fil et la recherche | P2 | S | [EP08-decouverte](EP08-decouverte.md) | moyen |
| `F8.7` | Navigation par catégories | P1 | S | [EP08-decouverte](EP08-decouverte.md) | moyen |
| `F8.8` | Recherches récentes et suggestions | P1 | C | [EP08-decouverte](EP08-decouverte.md) | moyen |
| `F9.1` | Tableau de bord : jour, semaine, mois | P1 | S | [EP09-statistiques](EP09-statistiques.md) | moyen |
| `F9.2` | Performance par direct | P1 | S | [EP09-statistiques](EP09-statistiques.md) | moyen |
| `F9.3` | Performance par article | P2 | S | [EP09-statistiques](EP09-statistiques.md) | moyen |
| `F9.4` | Entonnoir spectateurs → « Je prends » → payé | P2 | S | [EP09-statistiques](EP09-statistiques.md) | moyen |
| `F9.5` | Export des ventes (tableur) | P2 | C | [EP09-statistiques](EP09-statistiques.md) | cadre |
| `F9.6` | Comparaison avec la période précédente | P2 | C | [EP09-statistiques](EP09-statistiques.md) | cadre |
| `F9.7` | Heures et jours les plus rentables | P3 | C | [EP09-statistiques](EP09-statistiques.md) | cadre |
| `F10.1` | Commission prélevée automatiquement au paiement | P1 | M | [EP10-monetisation](EP10-monetisation.md) | **complet** |
| `F10.2` | Barème de commission par catégorie / par palier ⚠️ | P1 | M | [EP10-monetisation](EP10-monetisation.md) | **complet** |
| `F10.3` | Paliers d'abonnement vendeur (dont un gratuit) | P2 | S | [EP10-monetisation](EP10-monetisation.md) | moyen |
| `F10.4` | Comptes multi-utilisateurs et permissions | P2 | S | [EP10-monetisation](EP10-monetisation.md) | moyen |
| `F10.5` | Achat d'une mise en avant (produit ou direct) | P2 | S | [EP10-monetisation](EP10-monetisation.md) | moyen |
| `F10.6` | Direct premium : durée étendue, meilleure qualité, co-animation | P3 | W | [EP10-monetisation](EP10-monetisation.md) | cadre |
| `F10.7` | Espace partenaire marque | P3 | W | [EP10-monetisation](EP10-monetisation.md) | cadre |
| `F10.8` | Insights marché anonymisés, vendus aux marques | P3 | W | [EP10-monetisation](EP10-monetisation.md) | cadre |
| `F11.1` | File de vérification des vendeurs | P1 | M | [EP11-backoffice](EP11-backoffice.md) | **complet** |
| `F11.2` | Modération des contenus et des directs | P1 | M | [EP11-backoffice](EP11-backoffice.md) | **complet** |
| `F11.3` | Console d'arbitrage des litiges | P1 | M | [EP11-backoffice](EP11-backoffice.md) | **complet** |
| `F11.4` | Gestion du réseau de points relais | P1 | M | [EP11-backoffice](EP11-backoffice.md) | **complet** |
| `F11.5` | Réconciliation des paiements et des encaissements espèces | P1 | M | [EP11-backoffice](EP11-backoffice.md) | **complet** |
| `F11.6` | Paramètres : commissions, frais, durée de réservation, délais | P1 | M | [EP11-backoffice](EP11-backoffice.md) | **complet** |
| `F11.7` | **Tableau de bord des 4 indicateurs du pilote (slide 6)** | P1 | M | [EP11-backoffice](EP11-backoffice.md) | **complet** |
| `F11.8` | Recherche d'un utilisateur, d'une commande, d'un paiement | P1 | M | [EP11-backoffice](EP11-backoffice.md) | **complet** |
| `F11.9` | Journal d'audit de toutes les actions du back-office | P1 | S | [EP11-backoffice](EP11-backoffice.md) | moyen |
| `F11.10` | Gestion des livreurs et des tournées | P1 | S | [EP11-backoffice](EP11-backoffice.md) | moyen |
| `F11.11` | Envoi de notifications de masse | P2 | C | [EP11-backoffice](EP11-backoffice.md) | cadre |
| `F12.1` | Fiche produit rédigée depuis une photo | P3 | W | [EP12-assistant](EP12-assistant.md) | cadre |
| `F12.2` | Réponses automatiques aux questions récurrentes du chat | P3 | W | [EP12-assistant](EP12-assistant.md) | cadre |
| `F12.3` | Bilan de soirée commenté et conseils | P3 | W | [EP12-assistant](EP12-assistant.md) | cadre |
| `F12.4` | Suggestion de prix à partir des ventes comparables | P3 | W | [EP12-assistant](EP12-assistant.md) | cadre |
| `F12.5` | Insights marché pour les marques | P3 | W | [EP12-assistant](EP12-assistant.md) | cadre |
| `F13.1` | Fonctionnement sur Android bas de gamme, APK léger | P1 | M | [EP13-socle](EP13-socle.md) | **complet** |
| `F13.2` | Tolérance aux connexions lentes et intermittentes | P1 | M | [EP13-socle](EP13-socle.md) | **complet** |
| `F13.3` | Notifications push + **repli SMS** pour les messages critiques | P1 | M | [EP13-socle](EP13-socle.md) | **complet** |
| `F13.4` | Interface bilingue malgache / français, montants en Ariary | P1 | M | [EP13-socle](EP13-socle.md) | **complet** |
| `F13.5` | Consultation hors ligne des commandes et du code de retrait | P1 | S | [EP13-socle](EP13-socle.md) | moyen |
| `F13.6` | Sécurité : chiffrement des pièces d'identité, accès tracés | P1 | M | [EP13-socle](EP13-socle.md) | **complet** |
| `F13.7` | Conformité à la loi malgache sur les données personnelles | P1 | M | [EP13-socle](EP13-socle.md) | **complet** |
| `F13.8` | Journalisation complète des transactions (preuve en litige) | P1 | M | [EP13-socle](EP13-socle.md) | **complet** |
| `F13.9` | Mesure d'usage et entonnoirs, dès le premier jour | P1 | M | [EP13-socle](EP13-socle.md) | **complet** |
| `F13.10` | Version web légère pour les acheteuses sans place de stockage | P2 | S | [EP13-socle](EP13-socle.md) | moyen |
| `F14.1` | Story 24 h shoppable | P1 | M | [EP14-contenu](EP14-contenu.md) | **complet** |
| `F14.2` | Clip vertical court (« JP Clips ») | P1 | M | [EP14-contenu](EP14-contenu.md) | **complet** |
| `F14.3` | Fil « Pour toi » swipable et personnalisé | P1 | M | [EP14-contenu](EP14-contenu.md) | **complet** |
| `F14.4` | Enregistrement et montage simple dans l'application | P1 | S | [EP14-contenu](EP14-contenu.md) | moyen |
| `F14.5` | **Attacher 1 à n articles à un contenu** | P1 | M | [EP14-contenu](EP14-contenu.md) | **complet** |
| `F14.6` | Post photo « look du jour » | P1 | S | [EP14-contenu](EP14-contenu.md) | moyen |
| `F14.7` | **Unboxing — le geste central du social** | P1 | M | [EP14-contenu](EP14-contenu.md) | **complet** |
| `F14.8` | Avant / après essayage | P2 | S | [EP14-contenu](EP14-contenu.md) | moyen |
| `F14.9` | Sondage « laquelle je prends ? » | P2 | S | [EP14-contenu](EP14-contenu.md) | moyen |
| `F14.10` | Duo / réponse vidéo | P2 | C | [EP14-contenu](EP14-contenu.md) | cadre |
| `F14.11` | Lookbook thématique | P2 | C | [EP14-contenu](EP14-contenu.md) | cadre |
| `F14.12` | Hashtags et pages de hashtag | P1 | S | [EP14-contenu](EP14-contenu.md) | moyen |
| `F14.13` | Bibliothèque de sons et de musique ⚠️ | P2 | S | [EP14-contenu](EP14-contenu.md) | moyen |
| `F14.14` | Brouillons et publication programmée | P2 | C | [EP14-contenu](EP14-contenu.md) | cadre |
| `F14.15` | Réactions, commentaires, partages sur un contenu | P1 | M | [EP14-contenu](EP14-contenu.md) | **complet** |
| `F14.16` | Enregistrer un contenu en favori | P1 | C | [EP14-contenu](EP14-contenu.md) | moyen |
| `F14.17` | Statistiques d'un contenu (vues → clics → ventes) | P1 | M | [EP14-contenu](EP14-contenu.md) | **complet** |
| `F14.18` | Fil « Abonnements » séparé du fil « Pour toi » | P1 | S | [EP14-contenu](EP14-contenu.md) | moyen |
| `F14.19` | Contenu épinglé sur le profil | P2 | C | [EP14-contenu](EP14-contenu.md) | cadre |
| `F14.20` | Téléversement depuis la galerie | P1 | M | [EP14-contenu](EP14-contenu.md) | **complet** |
| `F14.21` | Sous-titres automatiques | P2 | S | [EP14-contenu](EP14-contenu.md) | moyen |
| `F15.1` | Statut créatrice et vérification | P1 | M | [EP15-createurs](EP15-createurs.md) | **complet** |
| `F15.2` | Profil créatrice public | P1 | M | [EP15-createurs](EP15-createurs.md) | **complet** |
| `F15.3` | « Ma sélection » — vitrine d'articles d'autres vendeurs | P1 | M | [EP15-createurs](EP15-createurs.md) | **complet** |
| `F15.4` | Lien et attribution d'affiliation traçables | P1 | M | [EP15-createurs](EP15-createurs.md) | **complet** |
| `F15.5` | Commission d'affiliation sur les ventes générées | P1 | M | [EP15-createurs](EP15-createurs.md) | **complet** |
| `F15.6` | Tableau de bord créatrice (vues → clics → ventes → gains) | P1 | M | [EP15-createurs](EP15-createurs.md) | **complet** |
| `F15.7` | Paliers de créatrice | P2 | S | [EP15-createurs](EP15-createurs.md) | moyen |
| `F15.8` | **Précommande groupée avec seuil** ⚠️ | P1 | S | [EP15-createurs](EP15-createurs.md) | moyen |
| `F15.9` | Mode revendeuse (achat fournisseur, revente sous son nom) | P1 | S | [EP15-createurs](EP15-createurs.md) | moyen |
| `F15.10` | Portefeuille et retrait créatrice | P1 | M | [EP15-createurs](EP15-createurs.md) | **complet** |
| `F15.11` | Demande de partenariat vendeuse ↔ créatrice | P2 | S | [EP15-createurs](EP15-createurs.md) | moyen |
| `F15.12` | Envoi d'un article offert contre contenu | P2 | C | [EP15-createurs](EP15-createurs.md) | cadre |
| `F15.13` | Annuaire de fournisseurs / sourcing ⚠️ | P3 | W | [EP15-createurs](EP15-createurs.md) | cadre |
| `F16.1` | Panier partageable par lien | P1 | S | [EP16-cadeau](EP16-cadeau.md) | moyen |
| `F16.2` | « Demander en cadeau » | P1 | S | [EP16-cadeau](EP16-cadeau.md) | moyen |
| `F16.3` | Paiement d'un panier par un tiers | P1 | S | [EP16-cadeau](EP16-cadeau.md) | moyen |
| `F16.4` | Paiement par carte depuis l'étranger | P1 | S | [EP16-cadeau](EP16-cadeau.md) | moyen |
| `F16.5` | Message joint au cadeau | P1 | C | [EP16-cadeau](EP16-cadeau.md) | moyen |
| `F16.6` | Notification de révélation et remerciement | P1 | C | [EP16-cadeau](EP16-cadeau.md) | moyen |
| `F16.7` | Liste d'envies publique | P2 | S | [EP16-cadeau](EP16-cadeau.md) | moyen |
| `F16.8` | Cagnotte collective à plusieurs contributeurs | P2 | C | [EP16-cadeau](EP16-cadeau.md) | cadre |
| `F16.9` | Offrir directement un article à quelqu'un | P2 | S | [EP16-cadeau](EP16-cadeau.md) | moyen |
| `F16.10` | Affichage de la conversion de devise | P1 | S | [EP16-cadeau](EP16-cadeau.md) | moyen |
| `F17.1` | Série de connexion quotidienne | P2 | C | [EP17-habitude](EP17-habitude.md) | cadre |
| `F17.2` | Badges et accomplissements | P2 | S | [EP17-habitude](EP17-habitude.md) | moyen |
| `F17.3` | Progression visible vers l'avantage suivant | P2 | S | [EP17-habitude](EP17-habitude.md) | moyen |
| `F17.4` | Rendez-vous récurrents et « drops » programmés | P1 | S | [EP17-habitude](EP17-habitude.md) | moyen |
| `F17.5` | Classements hebdomadaires (créatrices, clientes) | P2 | C | [EP17-habitude](EP17-habitude.md) | cadre |
| `F17.6` | Défis avec hashtag | P2 | S | [EP17-habitude](EP17-habitude.md) | moyen |
| `F17.7` | Boîte surprise | P3 | C | [EP17-habitude](EP17-habitude.md) | cadre |
| `F17.8` | Jeux pendant le direct (quiz, roue, tirage) | P3 | C | [EP17-habitude](EP17-habitude.md) | cadre |
| `F17.9` | Quiz de style à l'inscription | P1 | S | [EP17-habitude](EP17-habitude.md) | moyen |
| `F17.10` | **Dressing virtuel** | P2 | S | [EP17-habitude](EP17-habitude.md) | moyen |
| `F17.11` | Composition et publication de looks depuis le dressing | P2 | C | [EP17-habitude](EP17-habitude.md) | cadre |
| `F17.12` | Rappel de panier abandonné, plafonné | P1 | S | [EP17-habitude](EP17-habitude.md) | moyen |
| `F17.13` | Cagnotte créditée par l'unboxing | P1 | S | [EP17-habitude](EP17-habitude.md) | moyen |
| `F18.1` | « JP Sélect » — sélection éditoriale de vendeurs et d'articles | P2 | S | [EP18-premium](EP18-premium.md) | moyen |
| `F18.2` | « Le Journal JP » — éditorial, tendances, lookbooks | P2 | C | [EP18-premium](EP18-premium.md) | cadre |
| `F18.3` | **JP Club — abonnement acheteuse** | P2 | S | [EP18-premium](EP18-premium.md) | moyen |
| `F18.4` | Badge créatrice vérifiée | P1 | S | [EP18-premium](EP18-premium.md) | moyen |
| `F18.5` | Conciergerie / personal shopper | P3 | W | [EP18-premium](EP18-premium.md) | cadre |
| `F18.6` | Espace marque : campagnes et briefs | P3 | S | [EP18-premium](EP18-premium.md) | cadre |
| `F18.7` | Place de marché des collaborations marque ↔ créatrice | P3 | S | [EP18-premium](EP18-premium.md) | cadre |
| `F18.8` | Étiquetage obligatoire du contenu sponsorisé | P2 | M | [EP18-premium](EP18-premium.md) | moyen |
| `F18.9` | Mesure de campagne pour la marque | P3 | S | [EP18-premium](EP18-premium.md) | cadre |
| `F18.10` | Régie publicitaire display ⚠️ | P3 | W | [EP18-premium](EP18-premium.md) | cadre |
| `F19.1` | Filtrage automatique des commentaires | P1 | M | [EP19-moderation](EP19-moderation.md) | **complet** |
| `F19.2` | Commentaires restreignables par l'autrice | P1 | M | [EP19-moderation](EP19-moderation.md) | **complet** |
| `F19.3` | Signalement en un geste | P1 | M | [EP19-moderation](EP19-moderation.md) | **complet** |
| `F19.4` | Blocage d'un utilisateur | P1 | M | [EP19-moderation](EP19-moderation.md) | **complet** |
| `F19.5` | Vérification d'âge à l'inscription | P1 | M | [EP19-moderation](EP19-moderation.md) | **complet** |
| `F19.6` | Retrait de contenu avec notification motivée | P1 | M | [EP19-moderation](EP19-moderation.md) | **complet** |
| `F19.7` | File de modération dans le back-office | P1 | M | [EP19-moderation](EP19-moderation.md) | **complet** |
| `F19.8` | Protection contre la republication de contenu volé | P1 | S | [EP19-moderation](EP19-moderation.md) | moyen |
| `F19.9` | Sanctions graduées et voie de recours | P1 | S | [EP19-moderation](EP19-moderation.md) | moyen |
| `F19.10` | Compte privé / audience restreinte | P2 | C | [EP19-moderation](EP19-moderation.md) | cadre |
| `F19.11` | Filtre de mots personnalisé | P2 | S | [EP19-moderation](EP19-moderation.md) | moyen |
| `F19.12` | Signalement d'urgence (harcèlement, menace) | P1 | M | [EP19-moderation](EP19-moderation.md) | **complet** |
| `F20.1` ★ | Événement JP officiel — thème, dates, visuel, hashtag, page publique | P2 | S | [EP20-evenements](EP20-evenements.md) | **complet** |
| `F20.2` ★ | Candidature et acceptation d'un vendeur ou d'une créatrice | P2 | S | [EP20-evenements](EP20-evenements.md) | **complet** |
| `F20.3` ★ | Rattachement d'articles, promotions, contenus et directs à un événement | P2 | S | [EP20-evenements](EP20-evenements.md) | **complet** |
| `F20.4` ★ | **Page événement publique, accessible sans compte** | P2 | S | [EP20-evenements](EP20-evenements.md) | **complet** |
| `F20.5` ★ | Mini-événement propre à une boutique | P2 | C | [EP20-evenements](EP20-evenements.md) | **complet** |
| `F20.6` ★ | Notifications et rappels d'événement | P2 | C | [EP20-evenements](EP20-evenements.md) | **complet** |
| `F20.7` ★ | Badge et bandeau événement sur les vignettes et les fiches | P2 | C | [EP20-evenements](EP20-evenements.md) | **complet** |
| `F20.8` ★ | Bilan d'événement — participation, CA, nouveaux abonnés | P2 | C | [EP20-evenements](EP20-evenements.md) | **complet** |
| `F20.9` ★ | Calendrier des événements à venir côté acheteuse | P2 | C | [EP20-evenements](EP20-evenements.md) | **complet** |

---

## Décisions bloquantes

Sept décisions produit conditionnent des mini-plans de la vague 1. Elles sont listées dans `../docs/JP_BACKLOG.md` §« Les décisions ouvertes » (points 15 à 21) et reprises en fin de `../docs/JP_USER_STORIES.md`. **Deux sont à trancher avant d'écrire une ligne de code** :

- **la règle de cumul des remises** *(R-U7)* — on ne modifie pas une règle de calcul après avoir émis des factures ;
- **le seuil de bascule particulier → professionnel** *(R-H11)* — il conditionne l'écran de vérification, donc la structure du parcours de dépôt d'annonce.

---

*Backlog : `../docs/JP_BACKLOG.md` · User stories : `../docs/JP_USER_STORIES.md` · Règles : `../docs/JP_CAHIER_DES_CHARGES.md` · Modèle de données : `../docs/JP_CDC_TECHNIQUE.md` · Socle : `PLAN_SOCLE.md`.*
