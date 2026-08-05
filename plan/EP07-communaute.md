# EP07 — Communauté : abonnements, promotions, fidélisation

> 24 fonctionnalités · vague 1 · modules `fidelite`, `promotion`, `notification`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).

**Trois sous-domaines, un ordre imposé par les données.**

1. **Abonnements** — ne dépendent de rien. À faire d'abord : ils conditionnent les notifications de promotion et le fil.
2. **Promotions** — ne dépendent que des abonnements pour la notification générale. Livrables en phase 1.
3. **Fidélisation** — dépend d'un historique de commandes confirmées qui **n'existe pas au lancement**. Phase 2, mais avec **une obligation en phase 1** : le journal des ventes confirmées *(R-R11)*, sans lequel il faudra reconstituer les données à la main.

Le backlog présente la fidélisation avant les promotions. **L'ordre est inversé ici, volontairement** : coder un moteur de rang au premier mois, c'est coder un moteur qui n'a rien à classer.

**Le risque à ne pas perdre de vue dans toute cette épique** — la notification. Une acheteuse qui suit 15 boutiques et reçoit 15 messages coupe **toutes** les notifications, y compris « votre colis est arrivé » et le code de retrait. Les plafonds *(R-U4, R-W9)* ne sont pas une politesse, ils protègent le canal dont la logistique dépend.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F7.1 | Suivre / ne plus suivre | P1 | M | complet |
| F7.15 ★ | Écrans abonnés / abonnements, compteurs | P1 | S | complet |
| F7.17 ★ | Fil « Abonnements » avec nouveautés catalogue | P1 | S | complet |
| F7.16 ★ | Notification « nouvel abonné » | P2 | C | cadre |
| F7.2 | Fil des directs en cours et à venir | P1 | M | complet |
| F7.3 | Notifications : direct, promo, retour en stock | P2 | M | complet |
| F7.4 | Alerte « prévenez-moi quand c'est dispo » | P2 | S | moyen |
| F7.22 ★ | Promotion boutique | P1 | S | complet |
| F7.23 ★ | Notification automatique des abonnés | P1 | S | complet |
| F7.26 ★ | Règles de cumul et de priorité des remises | P1 | M | complet |
| F7.8 | Promotions programmées | P2 | S | moyen |
| F7.24 ★ | Promotion ciblée par rang | P2 | S | complet |
| F7.9 ★ | Code promo individuel nominatif | P2 | C | moyen |
| F7.25 ★ | Centre « Mes offres » | P2 | S | moyen |
| F7.18 ★ | Moteur de rang client | P2 | S | complet |
| F7.6 ★ | Paliers de fidélité paramétrables | P2 | S | complet |
| F7.5 ★ | Écran « Mes clientes » | P2 | S | complet |
| F7.19 ★ | Rang visible côté acheteuse | P2 | S | complet |
| F7.7 | Cagnotte | P3 | S | moyen |
| F7.10 | Accès anticipé à une collection | P2 | C | cadre |
| F7.11 | Partage vers WhatsApp et Facebook | P1 | M | complet |
| F7.12 | Parrainage vendeur et acheteur | P1 | M | complet |
| F7.13 | Liste d'envies | P2 | C | cadre |
| F7.14 | Message privé ⚠️ | P2 | S | cadre |

---

# Sous-domaine 1 — Abonnements

## F7.1 — Suivre / ne plus suivre un vendeur ou une créatrice

`P1 · M · complet` — **Bloque** F7.15, F7.17, F7.23, F20.6 · **Règles** R-Q1 · **Story** US-SOCIAL-01

### 1. Conception

**Un seul appui, aucune confirmation** *(R-Q1)*. Depuis une vitrine, une fiche, un direct, un clip ou une story. Action non symétrique, sans obligation, sans demande à accepter — sauf compte privé *(F19.10)*.

**L'abonnement est l'actif que le vendeur construit sur JP.** C'est aussi le seul canal qui rend les promotions et les événements possibles sans acheter de publicité. Une fonctionnalité en apparence triviale, structurellement centrale.

- **A non connectée** : l'appui déclenche l'inscription, et **l'abonnement est posé après connexion** — pas perdu en route.
- **Hors ligne** : l'état s'affiche localement et se synchronise à la reconnexion, **sans double abonnement** *(US-SOCIAL-01 CA4)*.
- **Vendeur suspendu** *(F6.8)* : bouton indisponible, état expliqué.

**Technique.** Compteurs `nb_abonnes` **dénormalisés** sur `profil_vendeur` et `profil_createur`, maintenus par déclencheur. Compter 200 000 lignes à chaque affichage de vitrine est exclu *(C1, C2)*.

L'idempotence est portée par la **clé primaire composite** `(suiveur_id, suivi_id)` : un double appui, ou une synchronisation hors ligne rejouée, ne crée jamais deux lignes.

### 2. Structure de code

```
apps/api/src/modules/fidelite/
├─ abonnements.ts    suivre() · nePlusSuivre() · listerAbonnes() · listerAbonnements()
├─ routes.ts         POST /abonnements · DELETE /abonnements/:suiviId
└─ abonnements.test.ts
packages/ui/src/BoutonSuivre.tsx          ← un seul composant, utilisé partout
apps/mobile/src/features/abonnements/hooks/useAbonnement.ts
```

`BoutonSuivre` est dans `packages/ui` et non dans une fonctionnalité : il apparaît à cinq endroits, et cinq implémentations divergeraient.

### 3. Base de données

Migration `..._f7_1_abonnement` :

```prisma
model Abonnement {
  suiveurId          String
  suiviId            String
  type               TypeSuivi          // vendeur | createur
  notificationsPromo Boolean  @default(true)   // R-Q6
  creeLe             DateTime @default(now())
  @@id([suiveurId, suiviId])
  @@index([suiviId, creeLe])            // liste des abonnés, R-Q3
}
```

Déclencheurs SQL d'incrément et de décrément de `nb_abonnes`, plus une tâche de réconciliation quotidienne — un déclencheur peut manquer un cas lors d'une migration, le compteur doit pouvoir être recalculé.

### 4. Design

Bouton à deux états, trois tailles. **Le libellé change, la position ne bouge pas** : un bouton qui change de largeur entre « Suivre » et « Suivi » fait sauter la mise en page.

**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :

```
Component sheet — follow button, all states and placements.
Row 1, the button alone in three sizes: filled accent "Suivre"; outlined with a
check "Suivi"; and a disabled greyed "Suivre" with a small lock icon.
Both active states must have the SAME width so the layout never shifts.
Row 2, the button in context: inside a shop header next to the shop name; as a
small chip overlaid on a live stream top bar; inline in a product page seller row;
as a compact icon-only variant on a clip's right-side action column.
Row 3, an unauthenticated tap result: a bottom sheet reading "Créez votre compte
pour suivre Miora" with a primary "Continuer" button and a muted line
"Votre abonnement sera enregistré après la connexion."
```

### 5. Backend

`POST /abonnements` `{ suiviId, type }` → 201, idempotent (un second appel renvoie 200 sans erreur).
`DELETE /abonnements/:suiviId` → 204, idempotent.

Émet `abonnement.cree` / `abonnement.supprime` *(PLAN_SOCLE §6)*, consommés par la notification *(F7.16)* et le fil *(F7.17)*.

**Tests** : double appui → une seule ligne ; désabonnement puis réabonnement ; compteur exact après 1 000 opérations concurrentes ; réconciliation corrigeant un compteur volontairement faussé ; vendeur suspendu → 409 ; utilisateur supprimé → ligne retirée et compteur à jour *(US-SOCIAL-04 CA4)*.

### 6. Frontend

`useAbonnement` avec **mise à jour optimiste** et file hors ligne : l'action part immédiatement à l'écran, se rejoue à la reconnexion, et la clé composite garantit l'absence de doublon côté serveur.

```issues
feature: F7.1
titre: Suivre / ne plus suivre un vendeur ou une créatrice
epic: "07"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: []
```

---

## F7.15 — Écrans abonnés / abonnements et compteurs publics ★

`P1 · S · complet` — **Dépend de** F7.1 · **Règles** R-Q2, R-Q3, R-Q6 · **Stories** US-SOCIAL-02, US-SOCIAL-03

### 1. Conception

**Trois écrans, une règle de confidentialité.**

- **A** : « Moi → Abonnements », triable par activité récente. Sur chaque ligne, **couper les notifications de promotion sans se désabonner** *(R-Q6)* — c'est le réglage qui évite le désabonnement pur et simple.
- **A** : sur chaque vitrine, le **nombre d'abonnés est public** *(R-Q2)*. C'est un signal de confiance au même titre que le score, et il ne coûte rien à produire.
- **V / C** : liste des abonnés avec prénom, photo, date. **Jamais l'adresse électronique ni le numéro** *(R-Q3)*. Tableau de bord : compteur et **progression sur 30 jours** — l'indicateur que le vendeur regarde le plus souvent.

**Décision.** Le réglage de notification est **par vendeur**, pas global. Un réglage global forcerait l'acheteuse à choisir entre tout recevoir et tout couper, et elle choisirait de tout couper.

### 2. Structure de code

```
apps/api/src/modules/fidelite/abonnements.ts   + projections des deux listes
apps/mobile/src/features/abonnements/
├─ ecrans/EcranMesAbonnements.tsx
├─ ecrans/EcranMesAbonnes.tsx                  côté vendeur
├─ composants/LigneAbonnement.tsx              avec interrupteur de promos
└─ hooks/{useMesAbonnements,useMesAbonnes}.ts
apps/mobile/src/features/tableau-bord/composants/CarteAbonnes.tsx
```

### 3. Base de données

Aucune table nouvelle. `abonnement.notificationsPromo` existe depuis `F7.1`. Pour la progression sur 30 jours, une vue matérialisée ou un agrégat quotidien `statistique_abonnes (vendeur_id, jour, nb_abonnes, nouveaux, perdus)` — recompter chaque jour sur toute la table serait coûteux au pic.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — "Mes abonnements" (buyer).
Vertical order: title "Mes abonnements (14)"; a sort chip row "Activité récente ·
A-Z"; a list of rows, each with a round shop avatar, shop name with a verified
badge, a secondary line showing activity ("En direct maintenant" in red, or
"3 nouveautés cette semaine", or "Aucune activité depuis 2 semaines"), and on the
right a small bell icon that is either filled (promos on) or crossed out (promos
off). Tapping the bell shows a tiny inline toast "Promotions de Miora désactivées
— vous restez abonnée."
Empty state variant: an illustration, "Vous ne suivez personne encore", and a
horizontal strip of suggested shops with "Suivre" buttons.

Screen 2 — "Mes abonnés" (seller).
Vertical order: a stats card at the top with a big number "1 240" labelled
"abonnés", a green delta "+86 sur 30 jours", and a small sparkline; a search
field; a list of follower rows with avatar, first name "Hanta", date
"Depuis le 12 juin", and — only for followers who have ordered — a small
gold "Cliente Or" chip. No email, no phone number anywhere on this screen.
```

### 5. Backend

`GET /moi/abonnements` (curseur, tri) · `PATCH /moi/abonnements/:suiviId` `{ notificationsPromo }` · `GET /vendeurs/:id/abonnes` — **réservé au vendeur concerné**, projection sans coordonnées.

**Tests** : la réponse `abonnes` **ne contient jamais** `email` ni `telephone` (assertion sur les clés de l'objet, pas sur les valeurs) ; un autre vendeur reçoit 403 ; compteur public exact ; progression 30 jours correcte ; réglage de promo par vendeur, indépendant des autres.

### 6. Frontend

Listes recyclées, pagination par curseur. La carte d'abonnés est en tête du tableau de bord vendeur.

```issues
feature: F7.15
titre: Écrans abonnés / abonnements et compteurs publics
epic: "07"
phase: P1
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F7.1]
```

---

## F7.17 — Fil « Abonnements » alimenté aussi par les nouveautés catalogue ★

`P1 · S · complet` — **Dépend de** F7.1, F14.18 · **Règles** R-Q5 · **Story** US-SOCIAL-05

### 1. Conception

**Sans cette fonctionnalité, l'abonnement ne sert à rien pour une boutique qui ne diffuse pas de direct** — et avec la vente hors direct *(F1.19)*, ces boutiques vont être nombreuses.

Le fil « Abonnements » contient donc : directs en cours et à venir, **nouveaux articles**, promotions en cours, événements des comptes suivis *(R-Q5)*.

**Regroupement obligatoire** : les nouveautés d'un même vendeur publiées le même jour forment **une seule carte** (« 12 nouveautés chez Miora »). Douze cartes d'un même vendeur noient le fil et donnent envie de se désabonner.

**Chaque carte mène à un article achetable.** Aucune carte purement informative — c'est la règle d'or de l'épique 14, appliquée ici.

**État vide** *(US-SOCIAL-05 CA5)* : aucune activité depuis 7 jours → des suggestions du fil « Pour toi », **clairement identifiées comme telles**. Un fil vide donne l'impression que l'application est morte ; un fil rempli de suggestions déguisées en abonnements est un mensonge.

### 2. Structure de code

```
apps/api/src/modules/contenu/
├─ filAbonnements.ts    agrégation multi-sources, regroupement, ordonnancement
└─ filAbonnements.test.ts
apps/mobile/src/features/fil/
├─ ecrans/EcranFilAbonnements.tsx
├─ composants/{CarteDirect,CarteNouveautes,CartePromo,CarteEvenement}.tsx
└─ hooks/useFilAbonnements.ts
```

### 3. Base de données

Aucune table nouvelle, mais **les index qui rendent l'agrégation tenable** :

```sql
CREATE INDEX article_vendeur_publie ON article (vendeur_id, cree_le DESC)
  WHERE statut = 'en_ligne';
CREATE INDEX promotion_vendeur_active ON promotion (vendeur_id, debut_le DESC)
  WHERE statut = 'active';
```

**Décision — pas de table de fil précalculé en V1.** Un fil matérialisé (fan-out à l'écriture) est la bonne réponse à grande échelle, mais il ajoute une source de vérité à maintenir et à réparer. Avec les index ci-dessus et une pagination par curseur, l'agrégation à la lecture tient largement le volume de lancement. Le point de bascule à surveiller : un vendeur suivi par 50 000 personnes qui publie 100 articles d'un coup.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen — "Abonnements" feed (second tab of the home feed).
Vertical order of cards, each full-width:
1. A live card: 16:9 thumbnail, red "EN DIRECT" pill, viewer count "312",
   shop avatar and name, title "Arrivage robes wax", primary action "Rejoindre".
2. A grouped novelty card: header row "Miora Boutique · 12 nouveautés
   aujourd'hui", then a horizontal scroll strip of 4 product thumbnails each with
   its price, and a trailing tile "+8" ; a footer link "Voir tout".
3. A promotion card in the accent color: "-20 % sur toute la boutique",
   shop name, a countdown line "Se termine dans 2 jours", action "Voir les
   articles".
4. An event card: the event's colored banner, "Noël JP · 12 boutiques",
   action "Découvrir".
5. A dimmed section divider reading "Suggestions pour vous" followed by two
   product cards — visibly separated from the subscriptions above.
Tab bar at the top: "Pour toi · Abonnements" with "Abonnements" active.
```

### 5. Backend

`GET /fil/abonnements?curseur=` — agrégation, regroupement par vendeur et par jour, ordonnancement : directs en cours d'abord, puis à venir, puis promotions, puis nouveautés, puis événements.

**Tests** : les quatre types de sources présents ; 12 articles d'un même vendeur le même jour → **une** carte ; ordonnancement respecté ; aucune carte sans article achetable ; état vide → suggestions marquées ; mode économie de données → images basse définition, pas de lecture automatique ; performance de l'agrégation sur un utilisateur suivant 200 comptes.

### 6. Frontend

Liste recyclée, préchargement d'un seul élément en mode économie *(F0.9)*. Onglet distinct du fil « Pour toi » *(F14.18)*, état de défilement conservé au changement d'onglet.

```issues
feature: F7.17
titre: Fil Abonnements alimenté par les nouveautés catalogue
epic: "07"
phase: P1
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F7.1, F14.18]
```

---

## F7.2 — Fil des directs en cours et à venir

`P1 · M · complet`

**Conception** — en tête du fil d'accueil : directs **en cours** des comptes suivis, puis directs en cours des autres, puis « ce soir à 20 h », puis replays récents *(F8.1)*.

**Structure** — `modules/contenu/filAccueil.ts` · `features/fil/ecrans/EcranAccueil.tsx`.

**Base de données** — `direct (id, vendeur_id, titre, affiche_url, statut, debut_prevu_le, debut_le, fin_le, nb_spectateurs)`, index `(statut, debut_prevu_le)`.

**Backend** — `GET /directs/en-cours`, `GET /directs/a-venir`. Le compteur de spectateurs vient de Redis, l'existence du direct vient de la base.

**Design** — carrousel de directs en cours, liste des directs à venir avec rappel. Prompt Stitch : *home feed top section — a horizontal carousel of live cards each with a 16:9 thumbnail, a red "EN DIRECT" pill, a viewer count, the shop avatar and name; followed by a section "Ce soir" with rows showing time "20 h 00", shop name, title and a "Me rappeler" outline button.*

**Tests** : ordre respecté ; direct terminé disparaît des « en cours » ; rappel programmé.

```issues
feature: F7.2
titre: Fil des directs en cours et à venir
epic: "07"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: []
```

---

# Sous-domaine 2 — Promotions

## F7.26 — Règles de cumul et de priorité des remises ★

`P1 · M · complet` — **Bloque** F7.22, F7.24, F7.9, F3.15, F3.6 · **Règles** R-U7, R-U9, R-U12 · **Story** US-PROMO-07

### 1. Conception

**À figer avant d'écrire une ligne du calcul de panier.** Une règle de remise se change difficilement une fois des factures émises : il faut pouvoir réexpliquer un montant trois mois plus tard, en litige.

**La règle** : une seule remise par ligne de commande, **la plus favorable à l'acheteur**, jamais l'addition. Exception unique et documentée : une remise sur les articles **et** une livraison offerte, qui portent sur des assiettes distinctes.

**Pourquoi pas de cumul** — trois raisons, chacune suffisante :
1. le vendeur ne peut plus prévoir sa marge, et une marge imprévisible fait fuir le vendeur avant la commission ;
2. le calcul devient inexplicable à l'acheteuse, donc suspect ;
3. l'ordre d'application change le résultat (−20 % puis −5 000 Ar ≠ −5 000 Ar puis −20 %), ce qui produit des écarts irréconciliables entre l'écran et la facture.

**Ce que porte concrètement ce mini-plan** : la fonction pure de calcul, sa table de cas, la contrainte de structure en base, et l'avertissement au vendeur en cas de chevauchement.

**La garantie structurelle** *(voir F3.15 §3)* : `ligne_commande.promotion_id` est une **colonne scalaire**. Le cumul est impossible par construction, pas seulement interdit par convention.

### 2. Structure de code

```
apps/api/src/modules/promotion/
├─ calcul.ts             fonction pure — aucun accès base, aucune horloge
├─ calcul.test.ts        table de cas exhaustive
├─ eligibilite.ts        période, périmètre, cible, plafond
├─ chevauchement.ts      détection à la création d'une promotion
└─ erreurs.ts            PROMO_NON_ELIGIBLE · PROMO_EXPIREE · PROMO_PLAFOND_ATTEINT
packages/money/src/remise.ts   pourcentage et montant, arrondi entier
```

### 3. Base de données

Migration `..._f7_26_remise_ligne` : voir `F3.15 §3`. Contrainte ajoutée :

```sql
ALTER TABLE ligne_commande ADD CONSTRAINT remise_sous_prix
  CHECK (remise_ligne >= 0 AND remise_ligne <= prix_unitaire * quantite);
```

Une remise supérieure au prix est refusée par la base : dernier filet contre un calcul fautif *(R-U12)*.

### 4. Design

Pas d'écran propre. Deux éléments d'interface :
- **côté acheteuse**, la ligne de remise nommée et la phrase d'explication *(prompt en [F3.15](EP03-commande.md#f315--application-dune-promotion-et-dun-rang-client-au-panier-))* ;
- **côté vendeur**, l'avertissement de chevauchement.

**Prompt Stitch** — préambule commun, puis :

```
Screen — overlap warning inside the seller's promotion creation flow.
An amber card with a warning triangle, title "Une autre promotion couvre déjà
ces articles", body "Promo Noël (-20 %) est active jusqu'au 25 décembre.",
then a highlighted rule line "Une seule remise s'appliquera : la plus
avantageuse pour la cliente.", then two comparison rows showing an example —
"Avec Promo Noël : 40 000 Ar" and "Avec cette promotion : 45 000 Ar" with the
first one marked by a green check and the label "C'est celle-ci qui
s'appliquera". Buttons: primary "Créer quand même", secondary "Modifier".
```

### 5. Backend

Aucun endpoint propre : `calcul.ts` est appelé par `panier.ts` *(F3.15)* et par la projection d'article *(F1.9)*. `chevauchement.ts` est appelé à la création de promotion *(F7.22)*.

**Tests** — la table de cas de `F3.15 §5`, plus :
- remise > prix refusée à la création *(R-U12)* ;
- contrainte de base rejetant une écriture fautive ;
- détection de chevauchement sur périmètre boutique, catégorie et sélection ;
- **propriété vérifiée sur 1 000 paniers générés** : pour chaque ligne, `remise_ligne` égale exactement la meilleure remise éligible, et jamais leur somme.

### 6. Frontend

Phrase d'explication sous les totaux du panier : « Une seule remise s'applique par article, la plus avantageuse pour vous. » Elle transforme une règle restrictive en argument de confiance.

```issues
feature: F7.26
titre: Règles de cumul et de priorité des remises
epic: "07"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: []
```

---

## F7.22 — Promotion boutique ★

`P1 · S · complet` — **Dépend de** F7.26, F1.9 · **Bloque** F7.23, F7.24, F20.3 · **Règles** R-U1, R-U2, R-U10 à R-U12 · **Story** US-PROMO-01

### 1. Conception

**Parcours vendeur, cinq choix et un résumé.** Type (pourcentage / montant fixe / livraison offerte) → valeur → période (immédiate ou programmée) → périmètre (boutique / catégorie / sélection) → cible (tous / abonnés / palier / clientes nommées) → **résumé qui annonce l'effet** → lancer.

**Le garde-fou qui décide de l'adoption** *(R-U10)* : avant validation, afficher **le net qui restera au vendeur** sur un article représentatif — *« Robe 50 000 Ar → 40 000 Ar, commission 2 000 Ar, vous recevez 38 000 Ar. »* Un vendeur qui découvre sa marge après coup ne refait pas de promotion. C'est exactement le mécanisme de `F10.1` sur la commission, appliqué à la remise.

**Trois règles de propreté** :
- le prix affiché est le prix payé, partout *(R-U2, RB7)* ;
- retour automatique au prix d'origine à la fin *(R-U11)* — un prix barré permanent est un mensonge commercial qui détruit l'effet de la promotion suivante *(RB9)* ;
- une valeur rendant le prix nul ou négatif est refusée ; au-delà d'un seuil élevé (70 %), confirmation explicite *(R-U12)*.

**L'employé ne peut pas créer de promotion** *(matrice §3.2, note ⁶)* : une promotion engage le prix, donc la marge. Même raisonnement que l'interdiction de modifier un prix.

**Modification après le début : interdite**, sauf annulation *(machine à états, CDC §4.5)*. Une promotion qu'on modifie en cours de route produit des paniers incohérents entre deux acheteuses.

### 2. Structure de code

```
apps/api/src/modules/promotion/
├─ routes.ts        GET/POST/PATCH/DELETE /vendeur/promotions
├─ service.ts       creer() · activer() · terminer() · annuler()
├─ machine.ts       brouillon → programmee → active → terminee | annulee
├─ repository.ts
├─ apercu.ts        ← le net vendeur sur un article représentatif (R-U10)
└─ *.test.ts
apps/api/src/jobs/promotionsProgrammees.ts     bascule par date, idempotente
apps/mobile/src/features/promotions/
├─ ecrans/{EcranListePromotions,EcranCreationPromotion,EcranResume}.tsx
├─ composants/{SelecteurType,SaisieValeur,SelecteurPerimetre,SelecteurCible}.tsx
└─ hooks/{usePromotions,useCreationPromotion}.ts
```

### 3. Base de données

Migration `..._f7_22_promotion` — table `promotion`, `promotion_article`, `promotion_beneficiaire` (CDC §3.8), avec :

```sql
CREATE INDEX promotion_a_activer ON promotion (debut_le)
  WHERE statut = 'programmee';
CREATE INDEX promotion_a_terminer ON promotion (fin_le)
  WHERE statut = 'active';
ALTER TABLE promotion ADD CONSTRAINT periode_coherente CHECK (fin_le > debut_le);
ALTER TABLE promotion ADD CONSTRAINT valeur_positive CHECK (valeur > 0);
```

Les deux index partiels sont ce qui rend la tâche de bascule bon marché : elle ne balaie jamais toute la table.

### 4. Design

Création en un écran à sections dépliantes plutôt qu'un assistant à cinq pas — un vendeur qui lance une promotion sait déjà ce qu'il veut, cinq écrans le ralentissent.

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — "Nouvelle promotion" (seller).
Vertical order: back arrow, title "Nouvelle promotion".
Section "Type de remise": a three-option segmented control "Pourcentage ·
Montant fixe · Livraison offerte", with "Pourcentage" selected.
Section "Valeur": a large numeric field showing "20" with a "%" suffix, and a
quick-pick chip row "10 % · 20 % · 30 % · 50 %".
Section "Période": two date fields "Du 20 déc." and "Au 25 déc.", plus a toggle
row "Démarrer maintenant".
Section "Sur quels articles ?": three radio rows — "Toute la boutique",
"Une catégorie" (with a right chevron), "Une sélection d'articles" (with a right
chevron and a count "12 articles sélectionnés"); the first one is selected.
Section "Pour qui ?": three radio rows — "Toutes mes clientes", "Mes abonnés
(1 240)", "Mes clientes Or et VIP (38)"; each with a one-line explanation.
Pinned bottom: full-width primary button "Voir le résumé".

Screen 2 — "Résumé" before launching.
Vertical order: title "Vérifiez avant de lancer".
A recap card with rows: "Remise −20 %", "Du 20 au 25 décembre", "Toute la
boutique (48 articles)", "Toutes mes clientes".
A prominent bordered margin card titled "Ce que vous recevrez" with an example:
a small product row "Robe wax", then three lines "Prix affiché 40 000 Ar",
"Commission JP 2 000 Ar", and in bold "Vous recevez 38 000 Ar", with a struck
"au lieu de 47 500 Ar" beneath.
A notification card with a bell icon: "Vos 1 240 abonnés seront prévenus" and a
toggle switched on, plus a muted line "Un seul message par jour maximum."
Pinned bottom: full-width primary button "Lancer la promotion" and a secondary
text link "Programmer pour plus tard".

Screen 3 — promotions list.
Rows grouped under "Active", "Programmée", "Terminée". Each row: the discount as
a colored chip "-20 %", the scope "Toute la boutique", the dates, and on the
right either a live countdown "2 j restants", a "Démarre le 20 déc." label, or
stats "48 ventes · 320 000 Ar". A floating action button "+" at the bottom right.
```

### 5. Backend

| Route | Notes |
|---|---|
| `POST /vendeur/promotions` | validation, détection de chevauchement *(F7.26)*, calcul de l'aperçu de marge |
| `GET /vendeur/promotions` | groupées par statut |
| `PATCH /vendeur/promotions/:id` | **refusé si `statut = active`**, sauf champ `notifier_abonnes` |
| `DELETE /vendeur/promotions/:id` | annulation ; les commandes passées ne changent pas |
| `GET /vendeur/promotions/:id/stats` | notifiés, ouvertures, ventes *(F7.23)* |

Travail `promotionsProgrammees` : bascule `programmee → active` et `active → terminee`, **idempotent** — après un incident, une promotion en retard démarre, mais **jamais deux fois** *(R-U3)*.

**Tests** : création des trois types ; valeur nulle/négative/supérieure au prix refusée ; seuil de 70 % → confirmation exigée ; modification en `active` refusée ; fin de période → prix d'origine rétabli **automatiquement** ; employé → 403 ; aperçu de marge exact, commission comprise ; chevauchement détecté et signalé ; double exécution de la tâche → un seul passage à `active`.

### 6. Frontend

Sections dépliantes, aperçu de marge **avant** le bouton de lancement. Sélection d'articles avec recherche et compteur. Écran de liste avec décompte en direct.

```issues
feature: F7.22
titre: Promotion boutique
epic: "07"
phase: P1
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F7.26, F1.9]
```

---

## F7.23 — Notification automatique des abonnés au lancement ★

`P1 · S · complet` — **Dépend de** F7.22, F7.1, F7.3 · **Règles** R-U4, R-Q6 · **Story** US-PROMO-03

### 1. Conception

**C'est ce qui donne sa valeur à l'abonnement, et c'est le mécanisme le plus facile à transformer en spam.**

- **A** : *« Miora lance −20 % sur toute sa boutique jusqu'à dimanche »* → un appui → vitrine filtrée sur les articles en promotion.
- **V** : nombre d'abonnés notifiés, ouvertures, **ventes générées**. Sans ce retour, il ne sait pas si ça marche, donc il en abuse.

**Les plafonds, et pourquoi ils sont non négociables** *(R-U4)* :
- **une notification de promotion par vendeur et par 24 h** ;
- au-delà de **3 promotions** d'abonnements différents le même jour → **regroupement** en un seul message (« 4 boutiques que vous suivez sont en promotion ») ;
- réglage par vendeur côté acheteuse *(R-Q6)* ;
- budget partagé avec les notifications d'événement *(R-W9)*.

Une acheteuse qui suit 15 boutiques et reçoit 15 messages coupe **toutes** les notifications. Elle perd alors « votre colis est arrivé au relais » et son code de retrait — c'est-à-dire les deux seules notifications dont la logistique de JP dépend réellement. Le plafond protège le canal, pas la politesse.

**Où vivent les plafonds** : dans le module `notification`, **et nulle part ailleurs** *(PLAN_SOCLE §3)*. Un plafond appliqué en trois endroits est un plafond contourné.

**Cas d'échec** *(US-PROMO-03 CA7)* — échec de l'envoi push : **pas de rejeu en boucle**, journalisation. Un renvoi automatique agressif est pire que l'absence de notification.

### 2. Structure de code

```
apps/api/src/modules/notification/
├─ service.ts        envoyer() — LE point de passage unique
├─ plafonds.ts       ← toute la logique de limite et de regroupement
├─ regroupement.ts   digest quotidien
├─ canaux/{push,sms,email}.ts
└─ plafonds.test.ts
apps/api/src/jobs/notificationPromotion.ts   fan-out par lots
apps/api/src/modules/promotion/stats.ts      notifiés → ouvertures → ventes
apps/mobile/src/features/promotions/ecrans/EcranStatsPromotion.tsx
```

### 3. Base de données

Migration `..._f7_23_notifications` :

```
notification
  id PK · utilisateur_id FK · type · titre · corps · donnees jsonb
  canal(push|sms|email) · envoye_le null · lu_le null · ouvert_le null
  regroupee_dans_id FK null
  IDX(utilisateur_id, envoye_le DESC)

notification_compteur              -- les plafonds, R-U4
  utilisateur_id FK · emetteur_id FK · type · jour
  nb int
  PK(utilisateur_id, emetteur_id, type, jour)
```

`promotion.notifiee_le` (depuis `F7.22`) est le **verrou d'idempotence** : après un incident du planificateur, la promotion ne renotifie pas *(R-U3)*.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — three push notification cards as they appear on an Android lock screen.
(a) Single promotion: app icon, title "Miora Boutique", body "-20 % sur toute la
boutique jusqu'à dimanche".
(b) Grouped digest: title "4 boutiques en promotion", body "Miora, Fara, Lalao et
1 autre lancent des remises aujourd'hui".
(c) For contrast, a critical logistics notification: title "Votre colis est
arrivé", body "Code de retrait : 482 913 — Épicerie Tsara". Add a caption under
frame (c): "This is the notification the caps exist to protect."

Screen 2 — "Résultats de ma promotion" (seller stats).
Vertical order: title with the promotion chip "-20 % · Terminée"; a funnel card
with four stacked rows, each with a horizontal bar and a number: "Abonnés
prévenus 1 240", "Ont ouvert 312 (25 %)", "Ont visité la boutique 180",
"Ont acheté 48 (3,9 %)"; a revenue card "320 000 Ar de ventes générées" with a
secondary line "Remise accordée : 80 000 Ar"; a muted comparison line "Votre
moyenne sur 5 promotions : 2,8 %".
```

### 5. Backend

Au passage `programmee → active`, si `notifier_abonnes` et `notifiee_le is null` : travail de fan-out par lots de 500, appliquant pour chaque abonné, **dans cet ordre** : réglage `notificationsPromo` → plafond par vendeur/24 h → seuil de regroupement → envoi ou mise en digest. Puis `notifiee_le` est posé.

`GET /vendeur/promotions/:id/stats` — entonnoir notifiés → ouvertures → visites → ventes.

**Tests** — les plus révélateurs de l'épique :
- deux promotions du même vendeur en 24 h → **une seule** notification, et le vendeur en est averti avant de valider ;
- une acheteuse suivant 5 boutiques toutes en promotion le même jour → **un seul** message groupé ;
- réglage coupé → aucune notification, abonnement conservé ;
- double exécution du travail → un seul envoi *(idempotence par `notifiee_le`)* ;
- échec push → journalisé, **pas rejoué en boucle** ;
- le budget est bien partagé avec les événements *(R-W9)* : promotion + événement le même jour ne font pas deux notifications pleines ;
- l'entonnoir de statistiques rattache correctement les ventes à la notification.

### 6. Frontend

Interrupteur de notification sur l'écran de résumé *(F7.22)* avec le nombre d'abonnés concernés. Écran de statistiques en entonnoir — pas un compteur de vues, un chemin jusqu'à l'argent.

```issues
feature: F7.23
titre: Notification automatique des abonnés au lancement d'une promotion
epic: "07"
phase: P1
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F7.22, F7.1, F7.3]
```

---

## F7.3 — Notifications : direct, promo, retour en stock

`P2 · M · complet` — **Règles** R-U4, R-Q6, R-W9, N…

**Conception** — le module de notification, transverse. Types : direct démarré, promotion, retour en stock *(F7.4)*, colis arrivé, code de retrait, réservation qui expire, nouvel abonné, événement.

**Réglage fin obligatoire** : sans lui, une acheteuse qui suit 15 vendeurs désinstalle en une semaine. Les notifications de direct sont **regroupées en une par soirée**.

**Repli SMS obligatoire** *(N…, R-L6)* pour les notifications critiques : colis arrivé, code de retrait. Le push ne suffit pas sur des téléphones bas de gamme et des connexions intermittentes.

**Structure** — `modules/notification/{service,plafonds,regroupement,canaux,preferences}.ts` *(voir F7.23)*.

**Base de données** — `notification`, `notification_compteur`, `preference_notification (utilisateur_id, type, active, canal)`.

**Design** — écran de réglages par type, avec explication de ce qu'on perd en coupant. Prompt Stitch : *notification settings screen with grouped toggle rows under sections "Mes commandes" (rows: "Colis arrivé", "Code de retrait", each with a locked padlock icon and a muted line "Toujours activé — vous en avez besoin pour récupérer vos colis"), "Boutiques suivies" ("Directs", "Nouveautés", "Promotions"), "Mon compte" ("Nouveaux abonnés", "Événements"); each toggleable row shows a one-line consequence under it.*

**Backend** — `GET/PUT /moi/preferences-notifications`, `POST /notifications/:id/lue`. Les notifications critiques **ne sont pas désactivables** — et c'est dit à l'écran.

**Tests** : préférences respectées ; regroupement des directs par soirée ; repli SMS déclenché sur échec push pour les types critiques ; notification critique non désactivable ; plafonds partagés entre promotions et événements.

```issues
feature: F7.3
titre: Notifications direct, promo, retour en stock
epic: "07"
phase: P2
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F7.1]
```

---

## F7.24 — Promotion ciblée par rang ★

`P2 · S · complet` — **Dépend de** F7.18, F7.6, F7.22 · **Règles** R-U5, R-R9 · **Story** US-PROMO-04

### 1. Conception

Depuis « Mes clientes » *(F7.5)* : sélectionner un palier, créer une promotion réservée. **Seules les clientes éligibles peuvent l'utiliser**, et elles la voient nommément : *« Offre réservée aux clientes VIP de Miora »*. Une remise VIP visible et utilisable par tous n'est plus un privilège.

**Décision — visible mais grisée** *(⚠️ F7.24 du backlog)*. Une cliente non éligible **voit** la promotion, grisée, avec la progression nécessaire pour y accéder *(F7.19)*. Le raisonnement : un palier ne motive que si l'on sait ce qu'on y gagne. Une offre strictement invisible ne crée aucune envie de progresser, et l'intérêt du programme de fidélité s'effondre. Le risque de frustration existe, il est moindre que le risque d'un programme sans effet.

**Éligibilité vérifiée côté serveur** *(R-U5)*, au calcul du panier. Jamais côté client — un contrôle d'éligibilité côté application est un contrôle absent.

**Cas d'échec** *(US-PROMO-04 CA4)* : perte du palier entre réservation et paiement → remise retirée avec message clair, **sans faire échouer la commande**.

**Palier supérieur éligible** : une promotion « Or et plus » s'applique aux VIP. Un palier qui exclut le palier supérieur serait absurde, et c'est une erreur facile à commettre dans le code d'éligibilité — d'où le test.

### 2. Structure de code

```
apps/api/src/modules/promotion/
├─ eligibilite.ts    + cible=palier : rang_client.palier.rang_ordre >= palier_min
└─ eligibilite.test.ts
apps/mobile/src/features/promotions/composants/SelecteurPalier.tsx
apps/mobile/src/features/vitrine/composants/CartePromoVerrouillee.tsx
```

### 3. Base de données

Aucune table nouvelle : `promotion.cible = 'palier'` et `promotion.palier_min_id` existent depuis `F7.22`. Index `(vendeur_id, score DESC)` sur `rang_client` *(F7.18)* pour évaluer l'éligibilité sans balayage.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — targeted promotion, buyer view when eligible.
A card in a warm gold-accented style: a crown icon, a label "Offre réservée aux
clientes VIP de Miora", the discount in large type "-30 %", a validity line
"Jusqu'au 25 décembre", and a full-width primary button "Voir les articles".
A small line at the bottom: "Vous êtes cliente VIP depuis mars."

Screen 2 — the same promotion, buyer view when NOT eligible (locked but visible).
The same card, desaturated, with a closed padlock replacing the crown, the
discount still readable but dimmed, and instead of the button a progress block:
a thin progress bar at 60 %, a line "Encore 2 commandes pour devenir cliente Or",
and a text link "Comment ça marche ?".
The offer must be readable — the point is to create the desire to progress.

Screen 3 — seller side, targeting step.
A radio list of tiers, each row showing the tier name, a client count and the
average basket: "Bronze · 210 clientes", "Argent · 64 clientes", "Or · 26
clientes · panier moyen 78 000 Ar", "VIP · 12 clientes · panier moyen 145 000 Ar",
with "Or" selected and a muted line under the list "Les clientes VIP en
bénéficieront aussi."
```

### 5. Backend

Aucun endpoint nouveau : `POST /vendeur/promotions` avec `cible: 'palier'`. `GET /promotions/mes-offres` *(F7.25)* renvoie les promotions éligibles **et** les verrouillées, avec la progression.

**Tests** : Bronze → non appliquée ; Or → appliquée ; **VIP → appliquée** (palier supérieur) ; perte de palier entre réservation et paiement → remise retirée, commande maintenue ; tentative d'utiliser l'identifiant d'une promotion réservée sans y avoir droit → refus + anomalie journalisée ; la promotion verrouillée est bien renvoyée avec sa progression et **sans** possibilité de l'appliquer.

### 6. Frontend

`CartePromoVerrouillee` — lisible, désaturée, avec la progression. Le contraste entre la carte éligible (dorée) et verrouillée (grise) doit être immédiat.

```issues
feature: F7.24
titre: Promotion ciblée par rang
epic: "07"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F7.18, F7.6, F7.22]
```

---

## F7.9 — Code promo individuel envoyé à une cliente nommée ★

`P2 · C · moyen` — **Règles** R-U6 · **Story** US-PROMO-05

**Conception** — depuis la fiche d'une cliente : montant ou pourcentage, date d'expiration, notification personnelle. Usage réel : s'excuser d'un retard, remercier une grosse commande, faire revenir une cliente inactive depuis trois mois.

**Code nominatif ET à usage unique** *(R-U6)*. L'unicité de `code_personnel` plus le contrôle de `utilise_le` **dans la transaction de création de commande** interdisent le double usage, y compris en appels concurrents.

**Cas d'échec dimensionnant** *(US-PROMO-05 CA5)* — commande annulée après usage du code : le code est **rendu utilisable** ou remplacé. La cliente ne peut pas perdre un geste commercial du fait d'une annulation qu'elle n'a pas décidée.

**Base de données** — `promotion_beneficiaire (promotion_id, utilisateur_id, code_personnel UQ, utilise_le, commande_id)`.

**Backend** — `POST /vendeur/promotions/:id/codes` `{ utilisateurIds }` (génération en lot depuis une sélection multiple), consommation dans la transaction de commande, restitution à l'annulation.

**Design** — action depuis la fiche cliente et depuis la sélection multiple de la liste. Prompt Stitch : *seller sheet "Envoyer un code à Hanta" with a segmented control "Pourcentage · Montant", a value field, an expiry date field defaulting to "+30 jours", an optional short message field with placeholder "Merci pour votre fidélité", a preview card showing the notification Hanta will receive, and a primary button "Envoyer le code".*

**Tests** : code utilisable une seule fois ; usage par une autre personne refusé ; deux appels concurrents → un seul succès ; expiration → refus motivé avec la date ; **annulation → code restitué** ; envoi en lot à 20 clientes → 20 codes distincts.

```issues
feature: F7.9
titre: Code promo individuel envoyé à une cliente nommée
epic: "07"
phase: P2
prio: C
etapes: [conception, bdd, design, backend, frontend]
depend: [F7.5, F7.22]
```

---

## F7.25 — Centre « Mes offres » côté acheteuse ★

`P2 · S · moyen` — **Story** US-PROMO-06

**Conception** — un écran rassemblant : codes personnels, promotions éligibles par palier, cagnotte *(F7.7)*, promotions en cours des boutiques suivies. Chaque offre porte sa date d'expiration et un bouton « Voir les articles ».

Offres expirées **archivées**, pas mélangées. Offre à moins de 48 h de l'expiration : signalée, avec **une seule** notification de rappel *(F17.12)*.

**Base de données** — aucune table : une agrégation de `promotion`, `promotion_beneficiaire`, `rang_client`, `cagnotte`.

**Backend** — `GET /moi/offres` — actives, verrouillées avec progression *(F7.24)*, archivées séparées.

**Design** — sections avec compte à rebours. Prompt Stitch : *"Mes offres" screen with sections "À utiliser maintenant" (cards with a discount chip, shop name, expiry countdown "Expire dans 2 jours" in amber, and a "Voir les articles" button), "Bientôt accessible" (the locked tier cards from F7.24), "Ma cagnotte" (a single card showing "4 500 Ar disponibles" with a line "Utilisable sur votre prochaine commande"), and a collapsed section "Offres passées (7)". Empty state: an illustration with "Aucune offre pour le moment" and a line "Suivez des boutiques pour recevoir leurs promotions."*

**Tests** : les quatre sources présentes ; expirées archivées ; une seule notification de rappel ; progression correcte sur les offres verrouillées.

```issues
feature: F7.25
titre: Centre Mes offres côté acheteuse
epic: "07"
phase: P2
prio: S
etapes: [conception, design, backend, frontend]
depend: [F7.24, F7.9]
```

---

## F7.8 — Promotions programmées

`P2 · S · moyen` — **Règles** R-U3 · **Story** US-PROMO-02

**Conception** — date de début future, statut `programmee`, bascule automatique, notification envoyée **une seule fois**. Modification et annulation libres avant le début ; après un incident du planificateur, démarrage en retard mais **jamais deux fois**.

**Structure, base de données** — mutualisés avec `F7.22` : `statut`, index partiel `promotion_a_activer`, travail `promotionsProgrammees`, verrou `notifiee_le`.

**Design** — bascule « Démarrer maintenant » et champs de date *(prompt en [F7.22](#f722--promotion-boutique-))*.

**Tests** : bascule à la date ; modification avant début sans notification envoyée ; **double exécution → un seul démarrage et une seule notification** ; panne puis reprise → démarrage rattrapé, journalisé.

```issues
feature: F7.8
titre: Promotions programmées
epic: "07"
phase: P2
prio: S
etapes: [conception, backend, frontend]
depend: [F7.22]
```

---

# Sous-domaine 3 — Fidélisation

## F7.18 — Moteur de rang client ★

`P2 · S · complet` — **Dépend de** F3.7 · **Bloque** F7.5, F7.6, F7.19, F7.24 · **Règles** R-R1 à R-R3, R-R11 · **Stories** US-FID-01, US-FID-06

### 1. Conception

**Quatre composantes** *(R-R3)*, recalculées à chaque commande confirmée :

| Composante | Source | Intention |
|---|---|---|
| **Volume** | montant cumulé confirmé chez ce vendeur | qui dépense |
| **Fréquence** | nombre de commandes confirmées | qui revient |
| **Récence** | date de la dernière commande, avec décote | qui est encore active |
| **Fiabilité** | annulations, litiges perdus, retours systématiques | qui coûte cher |

**Trois règles non négociables.**

1. **Par vendeur, jamais global** *(R-R1)*. Un vendeur n'a aucune raison de connaître les dépenses de sa cliente chez ses concurrents. Exigence de vie privée. **La garantie est structurelle** : il n'existe volontairement aucun index ni aucune vue permettant d'agréger un client tous vendeurs confondus. L'absence de chemin d'accès est la garantie ; un contrôle d'autorisation seul se contourne par une nouvelle requête.
2. **Seules les commandes confirmées comptent** *(R-R2)*. Une commande payée puis remboursée ne fabrique pas de VIP.
3. **Explicable en une phrase** *(R-R3)*, au vendeur comme à la cliente. Un rang opaque produit le même rejet qu'un score de confiance opaque.

**Décote de récence** — demi-vie paramétrable (`demi_vie_recence_j`, hyp. 180 jours) : le poids d'une commande décroît de moitié tous les six mois. Une cliente inactive depuis un an ne reste pas VIP indéfiniment. La perte de palier est **annoncée avant** qu'elle survienne *(R-R10, F7.19)*.

**Performance** *(US-FID-01 CA6)* — le recalcul est **asynchrone** et ne ralentit **jamais** la confirmation de commande. 10 000 confirmations pendant un direct ne doivent pas mettre la file d'attente à genoux : le travail est groupé par vendeur, avec fenêtre de regroupement.

**L'obligation de phase 1** *(R-R11)* — la table `vente_confirmee_journal` est écrite **dès le lancement**, dans la transaction de confirmation, même si le moteur n'est activé qu'en phase 2. Sans elle, il faudra reconstituer l'historique à la main, ou repartir de zéro en effaçant la fidélité des premières clientes — les plus fidèles, précisément.

### 2. Structure de code

```
apps/api/src/modules/fidelite/
├─ score.ts              ← fonction PURE : (ventes, params) → score
├─ score.test.ts         table de cas, y compris décote et pénalités
├─ rang.ts               attribution du palier depuis le score et les seuils
├─ journal.ts            écriture de vente_confirmee_journal (phase 1 !)
├─ recalcul.ts           orchestration, groupement, idempotence
└─ rattrapage.ts         calcul sur l'historique, relançable
apps/api/src/jobs/recalculRang.ts       déclenché par commande.confirmee
```

`score.ts` est **pure** : pas d'accès base, pas d'horloge (la date de référence est un paramètre). C'est ce qui rend la table de cas exhaustive et le rattrapage vérifiable.

### 3. Base de données

Migration `..._f7_18_rang_client` — `vente_confirmee_journal`, `rang_client` (CDC §3.7).

```sql
CREATE UNIQUE INDEX vcj_commande ON vente_confirmee_journal (commande_id);
CREATE INDEX vcj_couple ON vente_confirmee_journal (vendeur_id, utilisateur_id, confirme_le);
CREATE INDEX rang_classement ON rang_client (vendeur_id, score DESC);
CREATE INDEX rang_inactivite ON rang_client (vendeur_id, derniere_commande_le);
```

**L'unicité sur `commande_id` est ce qui rend le rattrapage idempotent** *(US-FID-06 CA3)* : le relancer dix fois donne le même résultat.

**Et ce qui n'existe pas, volontairement** : aucun index sur `(utilisateur_id)` seul dans `vente_confirmee_journal`, aucune vue agrégeant un client tous vendeurs confondus. À documenter dans la migration, pour qu'un futur développeur cherchant à « optimiser » comprenne que l'absence est intentionnelle.

### 4. Design

Pas d'écran propre — le moteur alimente `F7.5`, `F7.19`, `F7.24`. Un seul élément d'interface : **l'explication du score**, exigée par `R-R3`.

**Prompt Stitch** — préambule commun, puis :

```
Screen — "Comment le classement fonctionne" (explanation sheet, shown to both
seller and buyer).
Vertical order: title; four explanation rows, each with an icon, a bold label and
one plain sentence: "Ce que vous dépensez — le total de vos commandes reçues",
"À quelle fréquence — le nombre de commandes", "Récemment — une commande de
l'an dernier compte moins qu'une commande de ce mois", "Sans incident — les
annulations répétées font baisser le rang"; then a highlighted single-sentence
summary in a bordered card: "Plus vous commandez, souvent et récemment, plus
votre rang monte."; then a muted privacy line with a lock icon: "Votre rang est
calculé pour chaque boutique séparément. Une vendeuse ne voit jamais vos achats
chez les autres."; a full-width button "J'ai compris".
```

### 5. Backend

Aucun endpoint public : le moteur est interne. Consommateur de `commande.confirmee`, et travail de rattrapage déclenché à l'activation du drapeau de fonctionnalité.

**Tests**
- Commande confirmée → score recalculé ; commande remboursée → **exclue** *(R-R2)*.
- Décote de récence : deux clientes au même montant, l'une active, l'autre inactive depuis un an → scores différents dans le bon sens.
- Pénalité de fiabilité sur annulations et litiges perdus.
- **Étanchéité par vendeur** *(R-R1)* : une cliente ayant acheté chez deux vendeurs a deux lignes indépendantes ; la réponse d'API du vendeur A ne contient **rien** du vendeur B.
- **Rattrapage idempotent** : lancé trois fois sur 5 000 commandes → scores identiques.
- **Performance** : 10 000 confirmations en 60 s → la confirmation reste sous son budget de latence, le recalcul se fait en différé.
- Le journal est écrit dans la **même transaction** que la confirmation : un échec de recalcul ne perd jamais la vente.

### 6. Frontend

Feuille d'explication accessible depuis « Mes clientes » et depuis le rang côté acheteuse. Aucune autre interface.

```issues
feature: F7.18
titre: Moteur de rang client
epic: "07"
phase: P2
prio: S
etapes: [conception, squelette, bdd, design, backend]
depend: [F3.7]
```

---

## F7.6 — Paliers de fidélité paramétrables ★

`P2 · S · complet` — **Dépend de** F7.18 · **Règles** R-R4, R-R5 · **Story** US-FID-02

### 1. Conception

Quatre paliers par défaut — **Bronze / Argent / Or / VIP** — renommables, supprimables, avec seuils en montant cumulé **et/ou** en nombre de commandes, et un avantage en texte libre.

**La fidélisation est désactivable** *(R-R4)*. Un vendeur qui n'en veut pas n'en a pas, et **la liste de ses clientes reste utilisable** — c'est-à-dire que `F7.5` ne dépend pas de `F7.6`. Beaucoup de vendeurs voudront la liste sans le programme.

**Deux garde-fous.**
- Seuils **strictement croissants** avec le rang : contrôle à la sauvegarde de l'ensemble, pas palier par palier *(US-FID-02 CA3)*.
- Une modification de seuils **ne retire jamais un avantage déjà consommé** *(R-R5)*. Le recalcul peut faire redescendre une cliente, il ne reprend pas une remise dont elle a bénéficié.

**Avantage en texte libre — décision assumée.** Le vendeur écrit son avantage (« 5 % sur tout », « livraison offerte », « accès anticipé »). JP ne le garantit pas et l'indique clairement à la cliente : *« avantage accordé par la boutique »* *(US-FID-02 CA6)*. L'alternative — une liste fermée d'avantages techniquement appliqués — serait plus propre mais couvrirait mal les usages réels, et retarderait la fonctionnalité de plusieurs semaines. L'avantage **réellement appliqué au panier** passe par une promotion ciblée *(F7.24)*, qui est le mécanisme garanti.

### 2. Structure de code

```
apps/api/src/modules/fidelite/
├─ paliers.ts        CRUD en bloc, validation de la cohérence d'ensemble
├─ routes.ts         GET/PUT /vendeur/paliers
└─ paliers.test.ts
apps/mobile/src/features/fidelite/
├─ ecrans/EcranPaliers.tsx
└─ composants/CartePalier.tsx
```

**`PUT` en bloc et non `PATCH` par palier** : la cohérence des seuils est une propriété de l'ensemble. Valider un palier isolément laisse passer des configurations incohérentes.

### 3. Base de données

Migration `..._f7_6_paliers` — `palier_fidelite` (CDC §3.7), `profil_vendeur.fidelite_activee`. Seed des quatre paliers par défaut à l'activation.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen — "Mes paliers de fidélité" (seller settings).
Vertical order: title, and a master toggle row "Activer les paliers" (on);
four reorderable palier cards from bottom to top tier, each showing: a colored
medal icon (bronze, silver, gold, purple), an editable name field ("Bronze"),
two threshold fields side by side labelled "À partir de" with an "Ar" suffix
("0", "100 000", "300 000", "800 000") and "ou commandes" ("1", "3", "6", "12"),
a free-text field "Avantage" with placeholders like "5 % sur tout",
"Livraison offerte", "Accès anticipé aux nouveautés", and a live client count
chip on the right ("210 clientes", "64", "26", "12");
below the cards a dashed "+ Ajouter un palier" row;
an amber helper card reading "Les seuils doivent augmenter d'un palier au
suivant.";
a muted line "Vos clientes verront « avantage accordé par la boutique ». Pour
appliquer une remise automatiquement, créez une promotion réservée à ce palier."
with a link "Créer une promotion";
pinned bottom full-width primary button "Enregistrer".
Also produce an error frame where the third palier threshold is lower than the
second, with both fields outlined in red and the message "Le seuil de « Or »
doit être supérieur à celui de « Argent »".
```

### 5. Backend

`GET /vendeur/paliers` (avec le nombre de clientes par palier) · `PUT /vendeur/paliers` (remplacement de l'ensemble, validation globale, recalcul des attributions) · `POST /vendeur/fidelite/activer` et `/desactiver`.

**Tests** : seuils décroissants → refus avec le palier fautif nommé ; seuils modifiés → réattribution, **aucun avantage consommé reprisée** ; désactivation → paliers invisibles côté cliente, **données conservées**, liste des clientes toujours utilisable ; suppression d'un palier occupé → réattribution au palier inférieur.

### 6. Frontend

Cartes réordonnables, compteur de clientes en direct par palier — c'est ce qui permet au vendeur de calibrer ses seuils au lieu de les inventer.

```issues
feature: F7.6
titre: Paliers de fidélité paramétrables
epic: "07"
phase: P2
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F7.18]
```

---

## F7.5 — Écran « Mes clientes » ★

`P2 · S · complet` — **Dépend de** F7.18 · **Règles** R-R6, R-R7, R-R8 · **Stories** US-FID-03, US-FID-04

### 1. Conception

**Ce que le vendeur veut, c'est savoir à qui faire un geste.** Pas un tableau de bord analytique : une liste de noms, ordonnée, avec une action à côté de chaque ligne.

- **Liste** : ordonnée par rang. Par ligne — prénom, photo, palier, montant cumulé, nombre de commandes, date de la dernière. Tri par montant, fréquence, récence. Filtres par palier et « inactives depuis X ».
- **Fiche cliente** : historique des commandes, tailles achetées, articles préférés, litiges éventuels, **note privée** jamais visible de la cliente.
- **L'action, qui est le point de tout l'écran** *(R-R7)* : « Offrir une promo » *(F7.24)* ou « Envoyer un code » *(F7.9)*, depuis la fiche ou depuis une sélection multiple. **Une liste qu'on ne peut pas actionner ne sert à rien.**

**État de démarrage** *(R-R6)* — moins de 5 clientes : la liste s'affiche, mais **sans palmarès**. Un classement à trois lignes est ridicule et décrédibilise la fonctionnalité. Le message explique que les paliers s'activeront quand il y aura de quoi classer.

**L'employé** *(R-R8)* : lecture seule et **montants masqués**, si le vendeur l'autorise. Fara prépare les colis, elle n'a pas à connaître le chiffre d'affaires par cliente.

**Cliente ayant supprimé son compte** *(US-FID-03 CA5)* : ligne **anonymisée**, historique agrégé conservé pour la comptabilité du vendeur *(F0.11)*.

### 2. Structure de code

```
apps/api/src/modules/fidelite/
├─ clients.ts       liste paginée, tri, filtres, projection selon permission
├─ ficheClient.ts   historique, tailles, préférés, litiges, note
├─ routes.ts        GET /vendeur/clients · /:uid · PUT /:uid/note
└─ clients.test.ts
apps/mobile/src/features/clientes/
├─ ecrans/{EcranMesClientes,EcranFicheCliente}.tsx
├─ composants/{LigneCliente,FiltresClientes,BarreSelection,CarteHistorique}.tsx
└─ hooks/{useMesClientes,useFicheCliente}.ts
```

### 3. Base de données

Migration `..._f7_5_note_client` — table `note_client` (CDC §3.7), avec unicité `(vendeur_id, utilisateur_id)`.

Les projections de liste s'appuient sur `rang_client` et `IDX(vendeur_id, score DESC)` — pas d'agrégation à la volée sur `vente_confirmee_journal`, qui serait lente au pic.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — "Mes clientes" (seller CRM list).
Vertical order: title "Mes clientes (312)"; a search field; a horizontal filter
chip row "Toutes · VIP · Or · Argent · Bronze · Inactives 3 mois"; a sort row
"Trier par : Montant ▾"; then the list. Each row: a round avatar; first name
"Hanta" with a small colored tier medal chip beside it ("VIP"); a secondary line
"12 commandes · dernière il y a 6 jours"; a right-aligned cumulative amount
"1 240 000 Ar" in bold. Long-pressing a row enters multi-select: rows gain
checkboxes and a bottom action bar appears with two buttons "Offrir une promo"
and "Envoyer un code" plus a count "3 sélectionnées".

Screen 2 — client detail sheet.
Vertical order: avatar, first name "Hanta", a gold "Cliente VIP" chip, and a line
"Cliente depuis juin 2026"; a three-stat row "12 commandes · 1 240 000 Ar ·
panier moyen 103 000 Ar"; a "Ses tailles" chip row "M · 38 · 39" derived from
past orders; a "Ses préférences" chip row "Robes · Wax · Bleu"; an "Historique"
list of five order rows with date, item thumbnail, amount and a status chip;
an amber row "1 litige résolu en sa faveur" with a link; a "Note privée"
multiline field with placeholder "Visible par vous seule" containing "Préfère le
retrait au relais Analamahitsy"; pinned bottom two buttons: primary "Offrir une
promo" and secondary "Envoyer un code".

Screen 3 — starting state, fewer than 5 clients.
The same header, then a centered illustration, title "Vos premières clientes",
body "Vous avez 3 clientes. Le classement et les paliers s'activeront quand vous
en aurez davantage.", followed by the three client rows shown WITHOUT tier chips
and WITHOUT ranking positions, each still tappable.

Screen 4 — employee view: the same list with every amount replaced by a small
grey padlock chip reading "Masqué", the sort row limited to "Nom" and "Récence",
and no action bar at all.
```

### 5. Backend

`GET /vendeur/clients?tri=&palier=&inactifDepuisJ=&curseur=` · `GET /vendeur/clients/:uid` · `PUT /vendeur/clients/:uid/note`.

**Projection selon la permission** : pour un employé, les champs de montant sont **absents de la réponse**, pas masqués côté client *(R-R8)*. Un masquage à l'affichage laisse les montants dans la réponse réseau.

**Tests** : tri et filtres corrects ; pagination par curseur stable sous insertion ; **employé → aucun champ de montant dans la réponse** (assertion sur les clés) ; autre vendeur → 403 ; moins de 5 clientes → pas de palmarès ; note privée jamais renvoyée à la cliente ; cliente supprimée → ligne anonymisée, agrégats conservés ; sélection multiple → création de promotion ciblée pré-remplie.

### 6. Frontend

Liste recyclée, sélection multiple par appui long, barre d'action en bas. Fiche cliente en feuille modale pour ne pas perdre la position dans la liste.

```issues
feature: F7.5
titre: Écran Mes clientes, CRM léger vendeur
epic: "07"
phase: P2
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F7.18]
```

---

## F7.19 — Rang visible côté acheteuse et progression ★

`P2 · S · complet` — **Dépend de** F7.18, F7.6 · **Règles** R-R9, R-R10 · **Story** US-FID-05

### 1. Conception

- **A** : sur la vitrine d'une boutique où elle a acheté — *« Vous êtes cliente Or chez Miora »* — et **la progression vers le suivant** : *« Encore 2 commandes pour devenir VIP »*, avec l'avantage à la clé.
- **A** : écran « Mes avantages » rassemblant ses paliers chez tous les vendeurs.

**La règle qui rend l'ensemble honnête** *(R-R9)* : l'avantage annoncé **doit être réellement appliqué** au panier. Un palier sans effet est une manipulation, contraire aux principes de conception. C'est pourquoi l'avantage garanti passe par une promotion ciblée *(F7.24)* et non par le texte libre du palier.

**Perte de palier annoncée avant** *(R-R10)* : *« Votre statut Or expire dans 3 semaines — une commande le prolonge »*. Découvrir qu'on a perdu son statut sans avertissement est vécu comme une trahison, pour un mécanisme censé récompenser.

**Discrétion** *(US-FID-05 CA4)* : l'acheteuse peut refuser d'apparaître dans les classements publics *(F17.5)* ; son rang reste visible du vendeur, pas des autres acheteuses.

### 2. Structure de code

```
apps/api/src/modules/fidelite/
├─ progression.ts     palier courant, suivant, reste à faire, date d'expiration
└─ routes.ts          GET /moi/avantages
apps/api/src/jobs/alerteExpirationPalier.ts
apps/mobile/src/features/fidelite/
├─ ecrans/EcranMesAvantages.tsx
├─ composants/{CartePalierAcheteuse,BarreProgression}.tsx
apps/mobile/src/features/vitrine/composants/BandeauMonPalier.tsx
```

### 3. Base de données

Aucune table nouvelle. `rang_client` porte tout. `utilisateur.classements_publics bool` pour la discrétion.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — my tier banner inside a shop storefront.
A gold-accented card placed under the shop header: a medal icon, a line
"Vous êtes cliente Or chez Miora", the benefit in bold "Livraison offerte dès
50 000 Ar", then a thin progress bar at 70 % with labels under it "Or" on the
left and "VIP" on the right, and a sentence "Encore 2 commandes pour devenir
VIP et débloquer -10 % sur tout". A small text link "Comment ça marche ?".

Screen 2 — "Mes avantages" (all shops).
A list of shop cards, each with the shop avatar and name, the tier medal and
name, the current benefit line, and a compact progress bar with its remaining
requirement. One card shows an amber expiry warning row: "Votre statut Or expire
dans 3 semaines — une commande le prolonge" with a "Voir la boutique" link.
Empty state: "Achetez chez une boutique pour commencer à monter en rang."

Screen 3 — privacy setting row: a toggle labelled "Apparaître dans les
classements publics" with a helper line "Votre rang reste visible par les
boutiques où vous achetez, mais pas par les autres clientes."
```

### 5. Backend

`GET /moi/avantages` — pour chaque vendeur où la cliente a un rang : palier, avantage, progression, date d'expiration prévisible.
`GET /vendeurs/:id/vitrine` inclut `monPalier` si l'appelante en a un.
Travail `alerteExpirationPalier` : une notification, **trois semaines avant**, une seule fois.

**Tests** : progression exacte (montant et commandes) ; avantage affiché = avantage appliqué au panier *(R-R9, test croisé avec F7.24)* ; alerte d'expiration une seule fois ; réglage de discrétion respecté ; aucune donnée d'autres vendeurs dans la réponse *(R-R1)*.

### 6. Frontend

Bandeau sur la vitrine, écran « Mes avantages » dans « Moi ». La progression est exprimée en **actions concrètes** (« 2 commandes »), jamais en points ou en pourcentage abstrait.

```issues
feature: F7.19
titre: Rang visible côté acheteuse et progression
epic: "07"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F7.18, F7.6]
```

---

# Sous-domaine 4 — Croissance et divers

## F7.11 — Partage d'un direct ou d'un article vers WhatsApp et Facebook

`P1 · M · complet`

**Conception** — **le canal d'acquisition principal, et il est sous-estimé.** L'audience est sur Facebook et WhatsApp ; il faut aller la chercher là.

Un appui → lien avec aperçu riche (photo, nom, prix, « en direct maintenant ») → WhatsApp, Messenger, Facebook. Le lien ouvre une page **consultable sans compte** *(F0.10)*, qui convertit au « Je prends ».

**Ce qui fait la qualité de cette fonctionnalité, c'est l'aperçu.** Un lien partagé sans image ni titre ne se clique pas. `apps/web` doit donc rendre côté serveur les balises Open Graph pour : article, vitrine, direct, clip, page d'événement.

**Structure** — `apps/web/src/pages/{article,boutique,direct,evenement}` avec rendu serveur des métadonnées · `packages/ui/src/BoutonPartager.tsx` · `modules/exploitation/liens.ts` (liens courts, mesure d'attribution).

**Base de données** — `lien_partage (code UQ, cible_type, cible_id, partage_par_id, nb_ouvertures, nb_conversions)`.

**Backend** — `POST /partages` → lien court ; `GET /p/:code` → redirection + mesure.

**Design** — feuille de partage native avec aperçu du rendu. Prompt Stitch : *share bottom sheet showing a preview card of exactly what the recipient will see (product image, title "Robe wax bleue", price "50 000 Ar", shop name "Miora Boutique · Vérifiée"), above a row of destination icons WhatsApp, Messenger, Facebook, Copier le lien; plus a mockup of the WhatsApp chat bubble as it will actually appear.*

**Tests** : aperçu correct sur les 5 types de cible ; lien ouvert sans compte → contenu visible ; attribution des ouvertures et conversions ; lien d'un article retiré → page d'état utile, pas une erreur.

```issues
feature: F7.11
titre: Partage d'un direct ou d'un article vers WhatsApp et Facebook
epic: "07"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F0.10]
```

---

## F7.12 — Parrainage vendeur et parrainage acheteur

`P1 · M · complet`

**Conception** — deux parrainages distincts.
- **Vendeur** : lien personnel ; si le filleul réalise sa première vente, le parrain obtient un avantage (commission réduite un mois, mise en avant offerte).
- **Acheteur** : le filleul obtient une réduction sur sa première commande, le parrain un crédit **à la livraison** de cette commande — pas à l'inscription, sinon on paie des inscriptions creuses.

**OP** suit le coût d'acquisition par parrainage contre acquisition payante.

**Base de données** — `parrainage (code UQ, parrain_id, filleul_id, type, statut(en_attente|valide|expire), evenement_declencheur, recompense_versee_le)`.

**Backend** — `GET /moi/parrainage` (code et suivi), validation déclenchée par `commande.confirmee` ou par la première vente du filleul.

**Design** — écran de parrainage avec code, partage et suivi des filleuls. Prompt Stitch : *referral screen with a large copyable code card "HANTA2026", a primary "Partager mon lien" button, a rewards explainer with two rows ("Votre amie reçoit -5 000 Ar sur sa première commande", "Vous recevez 5 000 Ar quand elle est livrée"), and a "Mes filleules (3)" list with per-row status chips "En attente · Validée · Expirée".*

**Tests** : récompense versée **à la livraison** et non à l'inscription ; auto-parrainage refusé ; code réutilisé par le même filleul → une seule validation ; expiration.

```issues
feature: F7.12
titre: Parrainage vendeur et parrainage acheteur
epic: "07"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F3.7]
```

---

## F7.4 — Alerte « prévenez-moi quand c'est dispo »

`P2 · S · moyen`

**Conception** — sur une variante épuisée (affichée barrée, `R-A3`), demander une alerte. Notification au retour en stock, **au premier arrivé** dans l'ordre de la demande — sinon l'alerte crée une déception de masse : 50 personnes notifiées pour 3 pièces.

**Base de données** — `alerte_stock (variante_id, utilisateur_id, cree_le, notifie_le)`, PK composite.

**Backend** — `POST /variantes/:id/alerte`. Déclenchée par `stock.stock_reappro`, par lots ordonnés selon la quantité rentrée.

**Design** — bouton sur la taille barrée. Prompt Stitch : *product page size row where "S" is struck through; tapping it opens a sheet "Taille S épuisée" with a bell illustration, a line "Nous vous prévenons dès qu'elle revient", a primary button "Me prévenir" and a muted line "Vous serez prévenue avant les autres si vous êtes la première à demander."*

**Tests** : notification au retour en stock ; ordre respecté ; nombre de notifications proportionné à la quantité rentrée ; une seule notification par alerte.

```issues
feature: F7.4
titre: Alerte prévenez-moi quand c'est disponible
epic: "07"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F1.6]
```

---

## F7.16 — Notification « nouvel abonné » ★

`P2 · C · cadre` — **Règles** R-Q4 · **Story** US-SOCIAL-04

**Conception** — notification « [Prénom] vous suit », **regroupée au-delà de 5 par jour**. Un abonnement suivi d'un désabonnement dans la minute ne produit **aucune** notification *(US-SOCIAL-04 CA4)* — sinon on notifie du bruit, et parfois du harcèlement.

**Impact base de données** — aucun : consommateur de `abonnement.cree`, plafonds dans `notification_compteur` *(F7.23)*.

**Endpoint** — aucun. Réglage via les préférences de notification *(F7.3)*.

```issues
feature: F7.16
titre: Notification nouvel abonné
epic: "07"
phase: P2
prio: C
etapes: [conception, backend, frontend]
depend: [F7.1, F7.3]
```

---

## F7.7 — Cagnotte, pourcentage de chaque achat en crédit

`P3 · S · moyen`

**Conception** — un pourcentage de chaque achat crédité, utilisable sur la commande suivante. Alimentée aussi par l'unboxing *(F17.13)* et le parrainage *(F7.12)*.

**Un crédit n'est pas une remise** *(F3.6)* : il est payé par JP, pas par le vendeur. Écriture financière distincte, assiette distincte, et il **ne concourt pas** à la règle de non-cumul.

**Base de données** — `cagnotte (utilisateur_id PK, solde)`, `mouvement_cagnotte (type, montant, reference)`. Solde **dérivé des mouvements**, jamais saisi.

**Backend** — `GET /moi/cagnotte`, application au panier *(F3.6)*, restitution à l'annulation.

**Design** — carte dans « Mes offres » et dans « Moi ». Prompt Stitch : *wallet-style card showing "Ma cagnotte" with a large amount "4 500 Ar", a line "Utilisable sur votre prochaine commande", and a movements list with dated rows "+1 500 Ar Commande #1042", "+2 000 Ar Vidéo unboxing", "−3 000 Ar Utilisée sur #1051".*

**Tests** : solde = somme des mouvements ; utilisation partielle ; annulation → restitution ; jamais de solde négatif.

```issues
feature: F7.7
titre: Cagnotte, pourcentage de chaque achat en crédit
epic: "07"
phase: P3
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F3.6]
```

---

## F7.10 — Accès anticipé à une collection

`P2 · C · cadre`

**Conception** — une sélection d'articles visible d'un palier avant les autres. Se ramène à une promotion ciblée sans remise : même mécanisme d'éligibilité *(F7.24)*, effet différent (visibilité au lieu de prix).

**Impact base de données** — `article.visible_a_partir_du_palier_id null`, ou réutilisation de `promotion` avec un type `acces_anticipe`. **Préférer la seconde** : un seul mécanisme d'éligibilité à tester.

```issues
feature: F7.10
titre: Accès anticipé à une collection
epic: "07"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F7.24]
```

---

## F7.13 — Liste d'envies

`P2 · C · cadre`

**Conception** — marquer des articles en envie ; la liste est visible sur le profil et permet à un tiers d'offrir *(F16.9)*. **Elle transforme une intention en déclencheur pour quelqu'un d'autre** : mécanisme de conversion à coût nul.

**Impact base de données** — `envie (utilisateur_id, article_id, cree_le)`, PK composite, `utilisateur.liste_envies_publique bool`.

```issues
feature: F7.13
titre: Liste d'envies
epic: "07"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F16.9]
```

---

## F7.14 — Message privé acheteur ↔ vendeur ⚠️

`P2 · S · cadre` — **décision ouverte n° 7**

**La décision avant la conception.** La messagerie privée est ce que JP est censé remplacer. Sans elle, les acheteuses retournent sur Messenger et la transaction sort de la plateforme.

**Recommandation du backlog, à trancher** : une messagerie **rattachée à une commande** uniquement, pas de messagerie libre. Les questions avant achat passent par le chat public du direct ou par les questions sur la fiche *(F1.20)* — c'est précisément pour cela que `F1.20` existe.

**Impact base de données** — `message_commande (commande_id, auteur_id, texte, pieces_jointes[], cree_le)`. À rapprocher de `message_litige` *(F6.4)* : ce sont deux fils conversationnels attachés à une commande, et il serait sain qu'ils partagent une implémentation.

**Point d'attention** — une messagerie libre non modérée sur un produit qui expose de jeunes femmes est un risque de sécurité des personnes, pas seulement un risque commercial *(épique 19)*.

```issues
feature: F7.14
titre: Message privé acheteur vendeur
epic: "07"
phase: P2
prio: S
etapes: [conception, bdd, backend, frontend]
depend: [F6.4]
```

---

*Épique suivante : [EP20-evenements](EP20-evenements.md) — événements thématiques.*
