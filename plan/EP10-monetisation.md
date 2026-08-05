# EP10 — Monétisation et abonnement vendeur

> 8 fonctionnalités · vague 3 (sauf F10.1 et F10.2, phase 1) · modules `paiement`, `exploitation`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).

**La commission est le premier revenu du modèle, et le premier risque de désengagement.** La règle qui gouverne cette épique tient en une phrase : **aucune surprise, jamais**. Une commission découverte après coup est la première cause de départ d'un vendeur.

**L'hypothèse la plus importante à mesurer au pilote** *(décision n° 3)* : **à partir de quel taux la vendeuse cherche-t-elle à contourner la plateforme ?** Ce n'est pas une question de tarification, c'est une question de survie du modèle — et elle se mesure par le taux de transactions engagées sur JP puis conclues ailleurs.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F10.1 | Commission prélevée automatiquement | P1 | M | complet |
| F10.2 | Barème par catégorie / par palier ⚠️ | P1 | M | complet |
| F10.4 | Comptes multi-utilisateurs et permissions | P2 | S | complet |
| F10.3 | Paliers d'abonnement vendeur | P2 | S | moyen |
| F10.5 | Achat d'une mise en avant | P2 | S | moyen |
| F10.6 | Direct premium | P3 | W | cadre |
| F10.7 | Espace partenaire marque | P3 | W | cadre |
| F10.8 | Insights marché vendus aux marques | P3 | W | cadre |

---

## F10.1 / F10.2 — Commission automatique et barème

`P1 · M · complet` — **Règles** R-G1 à R-G4 · **⚠️ décision n° 3 : le taux**

### 1. Conception

**Le vendeur voit la commission avant de mettre en ligne, et sur chaque commande, en clair** *(R-G1)* :

> *« Vente 50 000 Ar — commission 2 500 Ar — vous recevez 47 500 Ar. »*

Trois emplacements obligatoires : à la **création d'article** (simulation), sur **chaque commande**, et dans le **relevé** *(F4.9)*. Plus l'aperçu de marge avant de lancer une promotion *(R-U10, F7.22)*.

**Barème par catégorie** *(R-G2)* : les marges ne sont pas les mêmes sur un accessoire et sur une robe importée. Paramétrable *(R-O1)*, avec historisation — une commande conserve le taux appliqué **au moment de la vente**, jamais le taux courant.

**Prélèvement** : à la confirmation du paiement, dans la même transaction que la création du séquestre *(F4.4)*. Écriture au compte `commission_jp` *(CDC §3.3)*.

**Interaction avec l'affiliation** *(F15.5)* : la commission de la créatrice est **prélevée sur la part de JP** en V1, pas sur la marge du vendeur. Le net vendeur est donc **identique** avec ou sans créatrice — c'est ce qui lève la résistance à l'affiliation, et c'est un test.

**Le cas du vendeur particulier** *(F1.17, R-H11)* : son barème n'est pas nécessairement celui d'une boutique. À trancher avec le seuil de bascule.

### 2. Structure de code
```
apps/api/src/modules/paiement/
├─ commission.ts        ← fonction pure : (montant, categorie, palier) → commission
├─ commission.test.ts   table de cas, tous les barèmes
apps/api/src/modules/sequestre/journal.ts     écriture au compte commission_jp
apps/mobile/src/features/article/composants/ApercuCommission.tsx
apps/mobile/src/features/commandes-vendeur/composants/DetailCommission.tsx
```

### 3. Base de données
```
bareme_commission
  id PK · categorie_id FK null · palier_abonnement null · type_vendeur null
  taux_pour_mille int          -- entier : 25 = 2,5 %
  debut_le · fin_le null
  IDX(categorie_id, debut_le)
```

`ligne_commande.commission_jp` conserve le **montant** calculé, et `bareme_id` le barème appliqué. Historiser le barème par période est ce qui rend une facture d'il y a six mois réexplicable.

**Taux en pour mille et non en pourcentage décimal** : aucun flottant, nulle part *(CDC §6.2)*.

### 4. Design
**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :
```
Frame 1 — commission preview while creating an article.
A compact bordered card placed directly under the price field, updating live:
"Si vous vendez à 50 000 Ar" then three rows right-aligned — "Prix de vente
50 000 Ar", "Commission JP 2 500 Ar (5 %)", and in bold accent "Vous recevez
47 500 Ar" — plus a small text link "Comment est calculée la commission ?".
This card must be visible before publishing, not after.

Frame 2 — commission detail on a seller order card.
An expandable row on the order: collapsed it shows "Vous recevez 47 500 Ar";
expanded it shows the full breakdown "Vente 50 000 Ar", "Commission JP 2 500 Ar",
"dont créatrice Ony 1 500 Ar" as an indented sub-row, and "Vous recevez
47 500 Ar" in bold, followed by a green note "La commission créatrice est prélevée
sur la part de JP — votre net est le même."

Frame 3 — the explanation sheet: a short table of commission rates by category
("Robes 5 %", "Accessoires 7 %", "Chaussures 5 %"), the date the rates apply from,
and a plain line "La commission est prélevée une seule fois, au paiement. Aucun
autre frais."
```

### 5. Backend
Calcul à la création de commande, prélèvement à la confirmation de paiement. `GET /baremes` (public pour la simulation).

**Tests** : commission affichée = commission prélevée, sur 100 commandes générées ; barème par catégorie appliqué ; **barème historisé** — une commande passée conserve son taux après changement du barème ; commission créatrice prélevée sur la part JP → **net vendeur inchangé** (assertion sur les écritures) ; aucun flottant dans le calcul ; remboursement → commission reprise par écriture inverse.

### 6. Frontend
L'aperçu est **avant** la publication et **avant** le lancement d'une promotion. Le détail est dépliable sur chaque commande, jamais caché dans un relevé mensuel.

```issues
feature: F10.1
titre: Commission prélevée automatiquement au paiement
epic: "10"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F4.1]
```
```issues
feature: F10.2
titre: Barème de commission par catégorie et par palier
epic: "10"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F10.1]
```

---

## F10.4 — Comptes multi-utilisateurs et permissions

`P2 · S · complet` — **Règles** matrice §3.2 · **Voir** F7.5, F9.1

### 1. Conception

**V (propriétaire)** invite son employée par son adresse électronique → choisit ses permissions : voir les commandes, préparer, modérer le chat, créer des articles. **Jamais** : voir le portefeuille, retirer l'argent, modifier les prix, créer une promotion.

**Sans séparation claire de l'argent, aucune vendeuse ne donnera d'accès à son employée.** C'est la condition d'adoption de la fonctionnalité, et elle dicte la conception : la séparation doit être **visible et compréhensible** dans l'écran d'invitation, pas seulement appliquée en arrière-plan.

**Le principe technique** : les permissions filtrent **les projections**, pas seulement l'interface *(R-R8, F9.1)*. Un montant masqué à l'affichage reste dans la réponse réseau. Les champs financiers sont **absents** de la réponse pour un employé.

**Portée** : l'employée se connecte avec **son propre compte** *(F0.1)* et bascule vers la boutique à laquelle elle est rattachée. Pas de compte partagé, pas de mot de passe transmis — c'est aussi ce qui permet de révoquer un accès proprement.

### 2. Structure de code
```
apps/api/src/modules/identite/
├─ equipe.ts        inviter() · revoquer() · permissions()
├─ routes.ts        GET/POST/DELETE /vendeur/equipe
apps/api/src/plateforme/permissions.ts     ← garde appliqué aux routes ET projections
apps/mobile/src/features/equipe/ecrans/{EcranEquipe,EcranInvitation}.tsx
```

`plateforme/permissions.ts` expose deux outils : un garde de route et un **filtre de projection**. Les deux sont obligatoires ; utiliser le garde seul laisse fuir les montants.

### 3. Base de données
`membre_equipe (id, vendeur_id, utilisateur_id, permissions[], invite_le, accepte_le, revoque_le)` *(CDC §3.1)*.

```sql
CREATE UNIQUE INDEX membre_actif ON membre_equipe (vendeur_id, utilisateur_id)
  WHERE revoque_le IS NULL;
```

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen 1 — "Mon équipe" (seller).
A list of member rows: avatar, first name "Fara", a role line "Préparation et
chat", a status chip ("Active" green, or "Invitation envoyée" amber), and a
"Modifier" link; plus a dashed "+ Inviter quelqu'un" row.

Screen 2 — "Inviter quelqu'un" — the screen that must reassure.
Vertical order: an email field; then a section "Ce qu'elle pourra faire" with four
toggle rows, each with a plain description: "Voir les commandes", "Préparer et
expédier", "Modérer le chat des directs", "Créer des articles";
then a visually separated, bordered, greyed section titled "Ce qu'elle ne pourra
jamais faire" listing four locked rows with padlock icons and no toggles:
"Voir votre argent", "Retirer de l'argent", "Modifier les prix", "Créer des
promotions";
then a reassurance line in green "Votre argent reste visible par vous seule.";
a full-width primary button "Envoyer l'invitation".
The locked section is the point of this screen — it must be as prominent as the
toggles.

Screen 3 — the employee's view of the shop dashboard: order counts and the
"À racheter" card visible, every monetary figure replaced by a grey padlock chip
"Masqué", and no "Mon argent" tab at all in the navigation.
```

### 5. Backend
`POST /vendeur/equipe/invitations` · `POST /invitations/:jeton/acceptation` · `DELETE /vendeur/equipe/:id`.

**Tests** : employée sans permission de prix → `PATCH /articles/:id/prix` **403** ; employée → aucun champ financier dans **toutes** les projections vendeur (test paramétré sur les routes vendeur) ; onglet portefeuille absent ; révocation → accès immédiatement coupé ; invitation expirée ; employée d'une boutique ne voyant rien d'une autre ; une même personne employée de deux boutiques → cloisonnement.

### 6. Frontend
L'écran d'invitation montre **explicitement ce qui est interdit**. C'est ce qui fait qu'une vendeuse ose déléguer.

```issues
feature: F10.4
titre: Comptes multi-utilisateurs et permissions
epic: "10"
phase: P2
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F0.1]
```

---

## F10.3 — Paliers d'abonnement vendeur

`P2 · S · moyen`

**Conception** — paliers dont **un gratuit**. Le palier gratuit n'est pas une concession commerciale : sans lui, aucun vendeur ne commence, et le catalogue reste vide.

**Ce qui peut différencier les paliers**, par ordre de valeur perçue décroissante : commission réduite, mises en avant incluses *(F10.5)*, rediffusion Facebook *(F2.21)*, direct de plus longue durée *(F10.6)*, statistiques avancées.

**Ce qui ne doit jamais être derrière un palier** : la vérification, le séquestre, l'accès au litige, la participation aux événements *(R-W12)*. Tout ce qui relève de la **confiance** reste gratuit, sinon le positionnement du produit s'effondre.

**Base de données** — `abonnement_vendeur (vendeur_id, palier, debut_le, fin_le, paiement_id)`, `bareme_commission.palier_abonnement` *(F10.2)*.

**Backend** — `GET /abonnements/paliers`, `POST /vendeur/abonnement`, prélèvement récurrent depuis le portefeuille.

**Design** — Prompt Stitch : *pricing screen with three stacked plan cards (Gratuit, Pro, Boutique+), each listing four included features with check icons and the excluded ones greyed, the monthly price in Ariary, the current plan marked "Votre palier", and a footer line "La vérification, le séquestre et la protection des litiges sont inclus dans tous les paliers, y compris gratuit."*

**Tests** : palier gratuit pleinement fonctionnel ; commission réduite appliquée aux nouvelles ventes ; échéance non payée → **retour au palier gratuit**, jamais de suspension de la boutique ; les fonctionnalités de confiance restent accessibles en gratuit.

```issues
feature: F10.3
titre: Paliers d'abonnement vendeur, dont un gratuit
epic: "10"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F10.2, F4.8]
```

---

## F10.5 — Achat d'une mise en avant

`P2 · S · moyen` — **Voir** F8.6

**Conception** — « Mettre en avant ce direct » ou cet article → budget, durée → paiement **depuis son portefeuille** *(F4.8)* → apparition en haut du fil, **signalée « Sponsorisé »** *(F8.6, F18.8)*.

La mention « Sponsorisé » est **obligatoire** et lisible : elle protège la confiance, qui est l'actif du produit.

**Le vendeur doit voir ce qu'il achète** : impressions, clics, et **ventes générées** — pas seulement un budget consommé. Une mise en avant dont on ne mesure pas le retour ne sera pas rachetée.

**Base de données** — `mise_en_avant (id, vendeur_id, cible_type, cible_id, budget, budget_consomme, debut_le, fin_le, impressions, clics, ventes, statut)`.

**Backend** — `POST /vendeur/mises-en-avant` (débit du portefeuille), injection au fil *(F8.6)*, arrêt à budget épuisé.

**Design** — Prompt Stitch : *promote screen with the target preview (a live or product card), a budget selector with three preset chips "5 000 · 15 000 · 30 000 Ar" and an estimated-reach line "≈ 1 200 à 2 000 personnes", a duration selector, a wallet balance row "Disponible : 347 000 Ar", and a primary button "Mettre en avant"; plus a results screen with four figures (impressions, clics, ventes, CA généré) and a plain verdict line "Vous avez dépensé 15 000 Ar et généré 84 000 Ar de ventes."*

**Tests** : débit du portefeuille ; budget épuisé → arrêt ; mention « Sponsorisé » présente ; ventes attribuées à la mise en avant ; portefeuille insuffisant → refus clair.

```issues
feature: F10.5
titre: Achat d'une mise en avant produit ou direct
epic: "10"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F4.8, F8.6]
```

---

## F10.6 / F10.7 / F10.8 — Direct premium, espace marque, insights

`P3 · W · cadre`

**F10.6 — Direct premium** : durée étendue, meilleure qualité, co-animation *(F2.17)*. Dépend d'abord du coût réel de la diffusion vidéo — c'est le poste le plus incertain du budget *(CDC §7.3)*, et il faut le connaître avant de vendre une option qui l'augmente.

**F10.7 — Espace partenaire marque** : voir `F18.6`. Le mécanisme rentable de la publicité à cette échelle est **la campagne mesurée jusqu'à la vente**, pas l'impression au CPM.

**F10.8 — Insights marché anonymisés vendus aux marques** : quelles tailles, quelles couleurs, quels prix se vendent, par zone. **Le point à trancher avant toute conception** : l'anonymisation doit être réelle et démontrable — des agrégats à faible effectif permettent de réidentifier un vendeur ou une acheteuse. Seuil minimal d'effectif par agrégat, et aucune donnée nominative, jamais. Sur un produit dont l'actif est la confiance, vendre de la donnée mal anonymisée serait la faute la plus coûteuse possible.

```issues
feature: F10.6
titre: Direct premium, durée étendue et co-animation
epic: "10"
phase: P3
prio: W
etapes: [conception, backend, frontend]
depend: [F10.3, F2.17]
```
```issues
feature: F10.7
titre: Espace partenaire marque
epic: "10"
phase: P3
prio: W
etapes: [conception, bdd, backend, frontend]
depend: [F18.6]
```
```issues
feature: F10.8
titre: Insights marché anonymisés vendus aux marques
epic: "10"
phase: P3
prio: W
etapes: [conception, bdd, backend, frontend]
depend: [F9.1]
```

---

*Épique suivante : [EP12-assistant](EP12-assistant.md).*
