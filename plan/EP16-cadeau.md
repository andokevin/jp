# EP16 — Cadeau, panier partagé et diaspora

> 10 fonctionnalités · vague 2 · module `commande` + `apps/web`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).
> **Amont** : [`JP_DECISIONS_PRODUIT.md`](../docs/JP_DECISIONS_PRODUIT.md) — `DP-10`.

> **Le canal qui ne dépend pas du pouvoir d'achat local.** Il donne enfin un usage réel au paiement par carte *(F4.2)*.

**Pourquoi c'est stratégique** : le panier d'un cadeau est structurellement plus élevé que le panier ordinaire, et le donateur n'a pas la contrainte de pouvoir d'achat locale — **le plafond de panier saute**.

> ### Ce que `DP-04` et `DP-07` retirent à cette épique
>
> La proposition de valeur tenait en une phrase : *« celui qui envoie de l'argent
> à sa famille ne sait jamais ce qui en est fait ; ici, il choisit l'objet, il
> voit la boutique vérifiée, **il suit la livraison et il obtient une preuve de
> remise** »*.
>
> **La seconde moitié tombe.** Il n'y a plus de preuve de remise *(`DP-04`)*, ni
> de suivi de livraison côté donateur *(`DP-10`)*.
>
> **La première moitié tient entièrement, et c'est elle qui portait la valeur** :
> envoyer de l'argent à Madagascar est **déjà gratuit et instantané** *(Taptap
> Send, 0 €, dépôt MVola en moins de 5 minutes)*. **Nous ne vendons ni le prix ni
> la vitesse — nous vendons de savoir ce que l'argent devient.** Il choisit
> l'objet, et il voit la boutique vérifiée.

**Le parcours est réécrit** *(`DP-10`)* :

1. Le donateur choisit l'article et **désigne le compte JP du bénéficiaire**.
2. **Le bénéficiaire et la boutique conviennent du point de remise** *(`F5.11`)*. Le donateur n'y participe pas et n'en voit rien.
3. **L'accord constaté, le donateur confirme le paiement.** L'argent va **directement** sur le mobile money de la boutique *(`DP-07`, `DP-16`)*.

> ### `RB8` devient structurel
>
> **L'adresse de livraison n'est jamais visible du donateur** *(RB8, R-L8, R-G1)*.
> Il fallait la lui **cacher activement** ; désormais **il ne la manipule
> jamais** — elle se négocie entre deux personnes dont il ne fait pas partie.
> L'invariant n'est plus une précaution d'affichage, il est **une propriété du
> parcours**.

> ### ⚠️ Deux conséquences à traiter
>
> - **Le bénéficiaire doit avoir un compte JP** *(`R-G5`)*. On n'offre plus à
>   quelqu'un qui n'est pas sur la plateforme — restriction réelle du canal, **et
>   levier d'acquisition** : recevoir un cadeau devient une raison de s'inscrire.
> - **Le paiement vient après la négociation**, donc l'article doit être tenu
>   pendant tout l'échange. **30 minutes ne suffisent pas entre deux fuseaux
>   horaires** *(`R-G7`, `PO-10`)*.
> - Le donateur était défini **« web, sans compte »**. Désigner un bénéficiaire
>   puis revenir confirmer suppose une session *(`PO-9`)* — compte léger, ou lien
>   signé envoyé par courriel.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F16.1 | Panier partageable par lien | P1 | S | complet |
| F16.2 | « Demander en cadeau » | P1 | S | complet |
| F16.3 | Paiement d'un panier par un tiers, **après accord de remise** | P1 | S | complet |
| F16.4 | Paiement par carte depuis l'étranger | P1 | S | complet |
| F16.10 | Affichage de la conversion de devise | P1 | S | moyen |
| F16.5 | Message joint au cadeau | P1 | C | moyen |
| F16.7 | Liste d'envies publique | P2 | S | moyen |
| F16.9 | Offrir directement un article | P2 | S | moyen |
| F16.8 | Cagnotte collective | P2 | C | cadre |
| ~~F16.6~~ | ~~Notification de révélation adossée à la preuve de remise~~ ❌ *(`DP-04`)* — **la preuve n'existe plus**. Le remerciement subsiste par l'unboxing *(`F14.7`)* | — | — | — |

---

## F16.1 / F16.2 / F16.3 — Le parcours cadeau

`P1 · S · complet` — **Règles** R-L8, R-G1, R-G5, R-G7, RB8 · **Décision** `DP-10` · **Dépend de** F3.1, F4.2, **F5.11**

### 1. Conception

- **A** : compose son panier → **« Demander en cadeau »** → un lien → elle l'envoie sur WhatsApp ou Messenger à son frère, son copain, sa mère.
- **D (donateur)** : ouvre le lien **sans avoir l'application** → voit les articles, les photos, le prix total, les frais de livraison, **la boutique vérifiée** *(F0.7)* → paie par carte ou mobile money → laisse un message *(F16.5)*.
- **D** : **désigne le compte JP du bénéficiaire** *(`R-G5`)*, puis **attend l'accord sur le point de remise avant de confirmer le paiement** *(`DP-10`)*.
- **Bénéficiaire + B** : conviennent du lieu et du moment dans le fil de remise *(`F5.11`)*. **`accord_le` débloque le paiement.**
- **A** : notifiée *« Naina vous a offert votre panier »* → la commande suit le parcours normal → à la réception, elle publie son remerciement *(F14.7)* → **le remerciement est du contenu, donc de l'acquisition. La boucle se referme.**
- **D** : ⚠️ **ne suit plus la livraison et ne voit aucune preuve de remise** *(`DP-04`, `DP-10`)*. Il est notifié de la confirmation de réception, rien de plus.

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
"taux indicatif"; NO delivery row at all — the donor sees nothing about where
it goes (RB8, DP-10); instead a muted line "Hanta et la boutique conviennent
entre elles du lieu de remise."; an optional
message field "Un mot pour Hanta ?"; a payment method row with card first, then
mobile money; a fees disclosure line "Frais de conversion : 0,80 € — inclus dans
le total affiché"; a full-width primary button "Offrir 28,90 €".
Add an HONEST footer: "Boutique vérifiée par JP. Elle est vérifiée
par JP : identité et compte Mobile Money contrôlés." — never a claim that JP
holds the money (DP-07, RB12).

Screen 3 — donor confirmation gate (web). Before the pay button becomes active,
a waiting card: "Hanta et la boutique se mettent d'accord sur la remise" with a
muted spinner, then, once agreed, it turns into "C'est convenu — vous pouvez
offrir" WITHOUT revealing the place. Only then the pay button activates (DP-10).

Screen 4 — donor page after payment: a single confirmation line "Hanta a reçu
votre cadeau le 16 août", no timeline, no proof photo, no address; plus a
thank-you card appearing once the recipient has published her unboxing, with a
play button. That card is the ONLY thing the donor gets back — it must be good.
```

### 5. Backend

`POST /commandes/:id/cadeau` → jeton et lien · `GET /cadeau/:jeton` **public** (projection donateur) · `POST /cadeau/:jeton/paiement` **public, `Idempotency-Key` requis** · `GET /cadeau/:jeton/suivi` **public**.

**Tests — RB8 en premier :**
- La réponse de `GET /cadeau/:jeton` **ne contient aucun champ d'adresse** : assertion sur les clés de l'objet, récursive, y compris dans les objets imbriqués.
- Idem pour la page du donateur **et pour le fil de remise** : `403` sur `GET /commandes/:id/fil-remise` avec un jeton de donateur *(`R-G1`)*.
- **Le paiement est refusé tant que `fil_remise.accord_le` est nul** *(`DP-10`)*.
- Lien expiré, lien révoqué → page d'état explicite, pas d'erreur brute.
- Paiement du donateur → commande normale, **éclaté vers la boutique et JP** *(`DP-16`)*, parcours identique.
- **Bénéficiaire sans compte JP → parcours refusé avec une invitation à s'inscrire** *(`R-G5`)*.
- Panier modifié par l'acheteuse après création du lien → **le lien reflète le panier figé**, pas le panier courant (sinon le donateur paie autre chose que ce qu'il a vu).
- Double paiement du même lien → un seul encaissement *(idempotence)*.
- Notification à l'acheteuse à la place du paiement.

### 6. Frontend

`apps/web` rend la page cadeau **côté serveur** : c'est un lien partagé sur WhatsApp, l'aperçu et le temps de premier affichage décident de la conversion. La carte de boutique vérifiée est visible **avant** le bouton de paiement.

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

**Tests** : message transmis et filtré ; **la notification de révélation ne s'adosse plus à une preuve de remise** *(`DP-04`)* mais à la confirmation de réception *(`UC-31`)* ; remerciement notifié au donateur **sans compte** (par le lien) ; message vide accepté.

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
