# EP16 — Cadeau, panier partagé et diaspora

> 10 fonctionnalités · vague 2 · module `commande` + `apps/web`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).

> **Le canal qui ne dépend pas du pouvoir d'achat local.** Il donne enfin un usage réel au paiement par carte *(F4.2)*.

**Pourquoi c'est stratégique** : le panier d'un cadeau est structurellement plus élevé que le panier ordinaire, et le donateur n'a pas la contrainte de pouvoir d'achat locale — **le plafond de panier saute**. À mesurer dès le pilote *(F11.7)*.

**Et ce qui manque à un transfert d'argent classique** : celui qui envoie de l'argent à sa famille ne sait jamais ce qui en est fait. Ici, il choisit l'objet, il voit la vendeuse vérifiée, il suit la livraison et il obtient une preuve de remise. C'est la proposition de valeur entière de cette épique, et elle tient dans cette phrase.

**Règle absolue** : **l'adresse de livraison n'est jamais visible du donateur** *(RB8, R-L8)*. Il paie, il ne voit pas où ça va.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F16.1 | Panier partageable par lien | P1 | S | complet |
| F16.2 | « Demander en cadeau » | P1 | S | complet |
| F16.3 | Paiement d'un panier par un tiers | P1 | S | complet |
| F16.4 | Paiement par carte depuis l'étranger | P1 | S | complet |
| F16.10 | Affichage de la conversion de devise | P1 | S | moyen |
| F16.5 | Message joint au cadeau | P1 | C | moyen |
| F16.6 | Notification de révélation et remerciement | P1 | C | moyen |
| F16.7 | Liste d'envies publique | P2 | S | moyen |
| F16.9 | Offrir directement un article | P2 | S | moyen |
| F16.8 | Cagnotte collective | P2 | C | cadre |

---

## F16.1 / F16.2 / F16.3 — Le parcours cadeau

`P1 · S · complet` — **Règles** R-L8, RB8 · **Dépend de** F3.1, F4.2

### 1. Conception

- **A** : compose son panier → **« Demander en cadeau »** → un lien → elle l'envoie sur WhatsApp ou Messenger à son frère, son copain, sa mère.
- **D (donateur)** : ouvre le lien **sans avoir l'application** → voit les articles, les photos, le prix total, les frais de livraison, **la vendeuse vérifiée** *(F0.7)* → paie par carte ou mobile money → laisse un message *(F16.5)*.
- **A** : notifiée *« Naina vous a offert votre panier »* → la commande suit le parcours normal → à la réception, elle publie son remerciement *(F14.7)* → **le remerciement est du contenu, donc de l'acquisition. La boucle se referme.**
- **D** : suit la livraison **depuis son lien, sans compte**, et voit la preuve de remise.

**La règle de confidentialité, et sa conséquence technique** *(RB8)* : le donateur voit les articles, le total, les frais et le mode de livraison **agrégé** (« point relais » ou « à domicile »), mais **jamais** le quartier, le repère, le nom du relais ni le numéro de téléphone. Cela signifie une **projection dédiée** pour la page cadeau, pas un filtrage à l'affichage — un champ absent de la réponse ne peut pas fuir.

**Le lien public** porte un jeton opaque, à durée limitée, révocable par l'acheteuse.

### 2. Structure de code

```
apps/api/src/modules/commande/
├─ cadeau.ts             creerLien() · projectionDonateur() · payer()
├─ routes.ts             POST /commandes/:id/cadeau
│                        GET /cadeau/:jeton          ← public
│                        POST /cadeau/:jeton/paiement ← public, idempotent
└─ cadeau.test.ts        ← RB8 : la projection ne contient aucune adresse
apps/web/src/pages/cadeau/[jeton].tsx     ← rendu serveur, aperçu de lien
apps/mobile/src/features/cadeau/ecrans/{EcranDemanderCadeau,EcranSuiviCadeau}.tsx
```

`projectionDonateur()` est le point critique : c'est la seule fonction autorisée à composer la réponse publique, et son test vérifie l'absence des champs d'adresse.

### 3. Base de données

Migration `..._f16_1_cadeau` :

```
panier_cadeau
  id PK · jeton UQ · acheteur_id FK · commande_id FK null
  message_donateur null · donateur_nom null · donateur_pays null
  statut(ouvert|paye|expire|revoque)
  expire_le · cree_le
  IDX(jeton)
```

`commande.donateur_ref` relie la commande au donateur sans créer de compte pour lui.

### 4. Design

**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :

```
Screen 1 — "Demander en cadeau" (buyer, mobile).
Vertical order: title "Demander ce panier en cadeau"; the cart summary grouped by
shop with a total "135 000 Ar"; a privacy reassurance card with a lock icon
reading "La personne qui paie ne verra jamais votre adresse — seulement les
articles et le total."; a link preview card showing exactly what the recipient
will see in WhatsApp (product image, "Le panier de Hanta", "135 000 Ar");
a validity row "Ce lien expire dans 7 jours"; a full-width primary button
"Partager le lien" and a secondary "Copier le lien".

Screen 2 — the public gift page (web, no account, opened by the donor abroad).
Vertical order: a warm header "Hanta souhaiterait recevoir ceci"; a product list
with images, names, sizes and prices; a seller card with the shop name, the blue
"Boutique vérifiée" badge and the line "Identité et compte Mobile Money vérifiés
par JP"; a totals block "Articles 118 000 Ar · Livraison 17 000 Ar · Total
135 000 Ar" and, directly beneath, a converted line "≈ 28,90 €" with a muted
"taux indicatif"; a delivery row showing ONLY "Livraison en point relais à
Antananarivo" with no address, no relay name, no phone number; an optional
message field "Un mot pour Hanta ?"; a payment method row with card first, then
mobile money; a fees disclosure line "Frais de conversion : 0,80 € — inclus dans
le total affiché"; a full-width primary button "Offrir 28,90 €".
Add a trust footer: "JP garde votre argent jusqu'à la livraison confirmée."

Screen 3 — donor tracking page (web, no account): a timeline of the delivery with
timestamps, and at the end a proof-of-delivery block showing the parcel photo and
"Remis le 16 août à 14 h 20" — but no address anywhere; plus a thank-you card
appearing once the recipient has published her unboxing, with a play button.
```

### 5. Backend

`POST /commandes/:id/cadeau` → jeton et lien · `GET /cadeau/:jeton` **public** (projection donateur) · `POST /cadeau/:jeton/paiement` **public, `Idempotency-Key` requis** · `GET /cadeau/:jeton/suivi` **public**.

**Tests — RB8 en premier :**
- La réponse de `GET /cadeau/:jeton` **ne contient aucun champ d'adresse** : assertion sur les clés de l'objet, récursive, y compris dans les objets imbriqués.
- Idem pour la page de suivi et pour la preuve de remise.
- Lien expiré, lien révoqué → page d'état explicite, pas d'erreur brute.
- Paiement du donateur → commande normale, séquestre créé, parcours identique.
- Panier modifié par l'acheteuse après création du lien → **le lien reflète le panier figé**, pas le panier courant (sinon le donateur paie autre chose que ce qu'il a vu).
- Double paiement du même lien → un seul encaissement *(idempotence)*.
- Notification à l'acheteuse à la place du paiement.

### 6. Frontend

`apps/web` rend la page cadeau **côté serveur** : c'est un lien partagé sur WhatsApp, l'aperçu et le temps de premier affichage décident de la conversion. La carte de vendeur vérifié est visible **avant** le bouton de paiement.

```issues
feature: F16.1
titre: Panier partageable par lien
epic: "16"
phase: P1
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F3.1]
```
```issues
feature: F16.2
titre: Demander en cadeau
epic: "16"
phase: P1
prio: S
etapes: [conception, design, backend, frontend]
depend: [F16.1]
```
```issues
feature: F16.3
titre: Paiement d'un panier par un tiers
epic: "16"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F16.1, F4.2]
```

---

## F16.4 / F16.10 — Paiement depuis l'étranger et conversion de devise

`P1 · S · complet / moyen` — **Recette RB7**

### 1. Conception

La page de paiement **détecte le pays**, affiche le **montant converti à titre indicatif** (« ≈ 28,90 € »), propose la **carte en premier**. **Frais de conversion annoncés à l'avance** *(RB7)* — un frais découvert après l'engagement est un défaut bloquant, ici comme partout.

**Le taux affiché est indicatif et signalé comme tel.** Le montant réellement débité est en Ariary ou dans la devise de l'agrégateur ; annoncer un montant exact qu'on ne contrôle pas produirait une contestation à chaque écart de centime.

**Pourquoi la carte en premier pour un donateur étranger** : il n'a pas de compte mobile money malgache. Lui présenter MVola en tête est une friction inutile sur le canal au panier le plus élevé.

### 2. Structure de code
```
apps/api/src/modules/paiement/
├─ prestataires/carte.ts      (F4.2)
├─ conversion.ts              taux indicatif, mise en cache, mention obligatoire
apps/web/src/pages/cadeau/[jeton].tsx    détection de pays, ordre des moyens
```

### 3. Base de données
`paiement.payeur_pays`, `paiement.montant_devise_origine`, `paiement.devise_origine`, `paiement.taux_indicatif`. `taux_change (devise, taux, releve_le)` mis à jour quotidiennement.

### 4. Design
*Prompt Stitch fourni en [F16.1](#f161--f162--f163--le-parcours-cadeau) (écran 2), qui porte déjà la conversion, l'ordre des moyens de paiement et la divulgation des frais.*

Ajout : une ligne « taux indicatif du 14 août » sous le montant converti, pour que l'écart éventuel ne surprenne pas.

### 5. Backend
Détection de pays par en-tête et par géolocalisation IP, ordre des moyens de paiement adapté, conversion indicative depuis `taux_change`.

**Tests** : pays détecté → carte en tête ; montant converti cohérent avec le taux du jour ; **mention « indicatif » présente** ; frais annoncés avant le bouton *(RB7)* ; taux indisponible → montant affiché en Ariary seul, jamais un taux périmé sans mention ; paiement en Ariary d'un donateur local → aucune conversion affichée.

### 6. Frontend
Page web légère : c'est souvent une connexion depuis l'étranger, mais parfois depuis un téléphone modeste en itinérance.

```issues
feature: F16.4
titre: Paiement par carte depuis l'étranger
epic: "16"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F4.2, F16.3]
```
```issues
feature: F16.10
titre: Affichage de la conversion de devise
epic: "16"
phase: P1
prio: S
etapes: [conception, bdd, backend, frontend]
depend: [F16.4]
```

---

## F16.5 / F16.6 — Message joint, révélation et remerciement

`P1 · C · moyen`

**Conception** — le donateur laisse un message ; l'acheteuse reçoit une notification de révélation *« Naina vous a offert votre panier »* avec le message. À la réception, elle publie son remerciement *(F14.7)* — **et ce remerciement est du contenu, donc de l'acquisition**.

**La boucle est le point de tout** : un cadeau produit une commande, une livraison, un unboxing, un contenu public, et souvent un nouveau donateur qui voit la vidéo. C'est le mécanisme d'acquisition le moins coûteux du produit.

**Base de données** — `panier_cadeau.message_donateur`, `panier_cadeau.donateur_nom`. Le message passe par le filtrage automatique *(R-X1)* : un message joint est un canal de texte libre.

**Backend** — inclus dans `POST /cadeau/:jeton/paiement`. Notification de révélation à l'encaissement. Notification au donateur quand le remerciement est publié.

**Design** — Prompt Stitch : *gift reveal screen for the recipient — a warm illustration, title "Naina vous a offert votre panier !", a quoted message card in a handwriting-like frame "Bon anniversaire ma sœur, profite bien 🎁", the order summary, and two buttons "Suivre ma commande" and "Envoyer un merci"; plus the donor's notification card "Hanta a reçu votre cadeau" with a video thumbnail and a play button.*

**Tests** : message transmis et filtré ; notification de révélation à l'encaissement ; remerciement notifié au donateur **sans compte** (par le lien) ; message vide accepté.

```issues
feature: F16.5
titre: Message joint au cadeau
epic: "16"
phase: P1
prio: C
etapes: [conception, bdd, design, backend, frontend]
depend: [F16.3]
```
```issues
feature: F16.6
titre: Notification de révélation et remerciement
epic: "16"
phase: P1
prio: C
etapes: [conception, design, backend, frontend]
depend: [F16.5, F14.7]
```

---

## F16.7 — Liste d'envies publique

`P2 · S · moyen`

**Conception** — l'acheteuse marque des articles en envie *(F7.13)* → sa liste est visible sur son profil → un appui sur « Offrir » par n'importe qui déclenche `F16.9`.

**L'effet** : la liste d'envies **transforme une intention en déclencheur pour un tiers**. C'est un mécanisme de conversion à coût nul — l'acheteuse fait le travail de sélection, et le donateur n'a plus qu'à payer.

**Base de données** — `envie (utilisateur_id, article_id, cree_le)`, `utilisateur.liste_envies_publique bool`.

**Backend** — `GET /utilisateurs/:id/envies` (public si autorisé), `POST /envies`, `DELETE /envies/:articleId`.

**Design** — Prompt Stitch : *public wish list on a profile — a header "Les envies de Hanta" with a share icon, a two-column product grid where each tile carries a prominent "Offrir" button, an "Offert 🎁" ribbon on one already-gifted tile, and a privacy toggle visible only to the owner reading "Ma liste est publique".*

**Tests** : liste privée invisible ; article déjà offert marqué ; « Offrir » depuis un profil sans compte → parcours cadeau *(F16.9)* ; article épuisé → marqué, non offrable.

```issues
feature: F16.7
titre: Liste d'envies publique
epic: "16"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F7.13]
```

---

## F16.9 — Offrir directement un article à quelqu'un

`P2 · S · moyen`

**Conception** — le donateur choisit un article et l'offre à une personne, **sans que celle-ci l'ait demandé**. Il paie ; la destinataire est notifiée et **renseigne elle-même son adresse de livraison** — c'est la seule façon de respecter `RB8` dans ce sens du parcours.

**Différence structurelle avec `F16.2`** : ici c'est le donateur qui initie, donc l'adresse n'existe pas encore au moment du paiement. La commande reste en attente d'adresse, avec un délai au-delà duquel elle est remboursée.

**Base de données** — `commande.statut` accueille `en_attente_adresse` ; `panier_cadeau.destinataire_id`.

**Backend** — `POST /articles/:id/offrir` `{ destinataireId | contact }`, `POST /commandes/:id/adresse` (par la destinataire).

**Design** — Prompt Stitch : *gift-first flow — donor screen "Offrir cet article" with a recipient selector (a JP user search or a phone/email field), a message field, and a primary "Payer et offrir"; then the recipient's screen "Lalao vous offre une robe wax" with the product card, the message, and a primary button "Choisir où me faire livrer" plus a muted line "Lalao ne verra pas votre adresse."*

**Tests** : adresse renseignée par la destinataire seule ; donateur ne voit jamais l'adresse *(RB8)* ; adresse non renseignée dans le délai → remboursement automatique ; destinataire sans compte → inscription puis reprise du parcours.

```issues
feature: F16.9
titre: Offrir directement un article à quelqu'un
epic: "16"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F16.3]
```

---

## F16.8 — Cagnotte collective à plusieurs contributeurs

`P2 · C · cadre`

**Conception** — pour un article cher, plusieurs personnes contribuent ; chacune voit le montant restant ; à l'atteinte du total, la commande part. Anniversaire, mariage. **Usage réel, aujourd'hui fait à la main.**

**Impact base de données** — `cagnotte_collective (id, jeton UQ, article_id, montant_cible, montant_collecte, statut, expire_le)`, `contribution (cagnotte_id, payeur_ref, montant, paiement_id)`.

**Le point à trancher avant de coder** — **un paiement partiel ne doit jamais déclencher une commande**, et le seuil de complétion est un invariant financier. Si la cagnotte n'atteint pas son total à l'échéance : remboursement intégral de **tous** les contributeurs, automatiquement, sur le modèle de la précommande *(RB3)*. C'est la seule règle qui rend le mécanisme acceptable.

À concevoir **avec** `F3.13` (panier entre amies), sous peine d'avoir deux mécanismes de paiement partagé à maintenir.

```issues
feature: F16.8
titre: Cagnotte collective à plusieurs contributeurs
epic: "16"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F16.3, F15.8]
```

---

*Épique suivante : [EP17-habitude](EP17-habitude.md).*
