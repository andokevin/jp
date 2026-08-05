# EP05 — Livraison

> 10 fonctionnalités · vague 2 · module `livraison` · applications `apps/terrain`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).

**La livraison est la partie du produit où JP tient ou ne tient pas sa promesse.** Le séquestre garantit l'argent ; c'est la livraison qui produit l'objet. Un colis qui n'arrive pas rend tout le reste inutile.

**Deux applications de terrain** *(L2, L3)* : livreur et point relais. Elles partagent une base React Native (`apps/terrain`) avec deux rôles, parce que ce sont les mêmes contraintes — un téléphone modeste, une main occupée, un réseau incertain, et une preuve à produire.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F5.1 | Bordereau et étiquette colis | P1 | M | complet |
| F5.2 | Statuts de livraison partagés | P1 | M | complet |
| F5.3 | Réseau de points relais | P1 | M | complet |
| F5.4 | Code de retrait à usage unique | P1 | M | complet |
| F5.5 | Application livreur | P1 | S | complet |
| F5.6 | Regroupement des colis d'un vendeur | P1 | S | moyen |
| F5.7 | Échec de livraison et retour | P1 | S | moyen |
| F5.8 | Retour produit pour cause de taille | P2 | S | moyen |
| F5.9 | Estimation du délai avant l'achat | P1 | S | moyen |
| F5.10 | Application point relais | P1 | M | complet |

---

## F5.2 — Statuts de livraison partagés des deux côtés

`P1 · M · complet` — **Règles** R-L4 · **Bloque** toute l'épique

### 1. Conception

Statuts communs : `Payée → En préparation → Remise au transport → En cours de livraison` / `Arrivée au point relais → Livrée → Confirmée`.

- **A** : voit une frise dans sa commande, **avec notification à chaque changement**. C'est la réponse directe au « plus de nouvelles » qui fait le procès des ventes Facebook.
- **V** : fait avancer les statuts qui la concernent ; les autres sont mis à jour par **L** ou **PR**.

**Le point de conception** : un seul jeu de statuts, **identique des deux côtés** *(R-L4)*. Des statuts internes différents de ceux montrés à l'acheteuse produisent immanquablement des désaccords (« mais elle dit que c'est expédié »).

**Machine à états du colis** *(CDC §4.3)* :
```
A_PREPARER → PRET → ENLEVE → EN_LIVRAISON ──────────► REMIS
                                  │                     ▲
                                  └─► AU_RELAIS ────────┘
                                          │ (délai de garde dépassé)
            ECHEC_LIVRAISON ◄─────────────┴─► RETOUR_VENDEUR
```

Chaque transition produit un `evenement_livraison` horodaté et attribué — c'est l'historique partagé, et la matière première de l'instruction d'un litige *(F6.5)*.

### 2. Structure de code

```
apps/api/src/modules/livraison/
├─ routes.ts · service.ts · repository.ts
├─ machine.ts          transitions, autorisations par rôle
├─ evenements.ts       journal horodaté, attribué
└─ machine.test.ts
apps/mobile/src/features/commandes/composants/FriseLivraison.tsx
apps/terrain/src/features/tournee/
```

### 3. Base de données

Migration `..._f5_2_colis` — `colis`, `evenement_livraison` (CDC §3.4).

```sql
CREATE INDEX colis_par_commande ON colis (commande_id);
CREATE INDEX colis_a_livrer ON colis (livreur_id, statut) WHERE statut IN ('enleve','en_livraison');
CREATE INDEX colis_au_relais ON colis (relais_id, statut) WHERE statut = 'au_relais';
CREATE INDEX evenement_par_colis ON evenement_livraison (colis_id, horodatage);
```

### 4. Design

**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :

```
Screen — order tracking timeline (buyer).
Vertical order: the order number "#1042" and a status headline "Arrivé au point
relais"; a vertical timeline with six steps, completed ones with filled green
dots and timestamps, the current one with a pulsing accent dot, future ones grey:
"Payée — 12 août 19 h 42", "En préparation — 13 août 08 h 10", "Remise au
transport — 13 août 14 h 30", "Arrivée au point relais — 14 août 11 h 05"
(current), "Retirée", "Confirmée"; each completed step shows who did it in small
muted text ("par Miora", "par Rado, livreur").
Under the timeline, a prominent accent card because the parcel is at the relay:
"Votre code de retrait" with the six digits "482 913" in very large mono type, a
copy icon, and the relay details "Épicerie Tsara · Analamahitsy · 7 h – 20 h";
plus a muted line "À retirer avant le 21 août".
At the bottom, two buttons: primary "J'ai reçu mon colis" and secondary outline
"Il y a un problème".
```

### 5. Backend

`GET /commandes/:id` inclut le colis et sa frise. `POST /colis/:id/statut` `{ statut, preuve? }` — **autorisation par rôle** : le vendeur ne peut pas déclarer « remis », le livreur ne peut pas déclarer « en préparation ».

**Tests** : toutes les transitions valides et invalides ; autorisation par rôle sur chaque transition ; notification à chaque changement, **une seule par changement** ; frise identique côté acheteuse et côté vendeur (même source, comparaison des deux réponses) ; historique complet horodaté et attribué.

### 6. Frontend

Frise avec l'auteur de chaque étape — savoir *qui* a fait avancer le colis réduit les contestations. Consultable **hors ligne** *(CDC §10.3)*.

```issues
feature: F5.2
titre: Statuts de livraison partagés des deux côtés
epic: "05"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F3.7]
```

---

## F5.3 / F5.4 / F5.10 — Points relais, code de retrait, application relais

`P1 · M · complet` — **Règles** R-L5, R-L6, R-L7 · **⚠️ délai de garde à caler**

### 1. Conception

- **A** : choisit son relais → à l'arrivée du colis, reçoit une notification **et un SMS** avec un **code à 6 chiffres** *(R-L6)* → passe quand elle veut → donne le code → repart avec le colis.
- **PR** : application simple → « Réception » : scanne ou saisit le numéro de colis, il entre en stock → « Remise » : saisit le code donné par l'acheteuse, confirme, statut `Livrée` → écran « Colis en attente » avec les délais de garde.
- **L** : dépose plusieurs colis d'un coup au relais, **une seule validation** *(F5.6)*.

**Le code de retrait est la notification la plus critique du produit** *(N…)* : repli SMS obligatoire, et **consultable hors ligne** *(CDC §10.3)* — l'acheteuse est devant le relais, souvent sans données.

**Usage unique** *(R-L6)* : un code consommé ne rouvre pas. La remise est une transaction, contrôlée dans une transaction de base.

**⚠️ Délai de garde** : au-delà de X jours, le colis repart chez le vendeur *(F5.7)*. X à caler avec les relais — c'est une contrainte de place physique dans une épicerie, pas un paramètre théorique.

**Pas d'adresse personnelle demandée** en mode relais : c'est aussi une fonctionnalité de discrétion, appréciée dans un contexte où l'on ne souhaite pas toujours faire livrer chez soi.

### 2. Structure de code

```
apps/api/src/modules/livraison/
├─ relais.ts          réseau, proximité, horaires, capacité
├─ codeRetrait.ts     génération, hachage, consommation transactionnelle
└─ codeRetrait.test.ts
apps/terrain/src/features/relais/
├─ ecrans/{EcranReception,EcranRemise,EcranColisEnAttente}.tsx
└─ hooks/{useReception,useRemise}.ts
apps/mobile/src/features/livraison/composants/{ListeRelais,CarteCodeRetrait}.tsx
```

### 3. Base de données

Migration `..._f5_3_relais` — `point_relais` (CDC §3.4), `colis.code_retrait char(6)`, `colis.relais_id`, `colis.garde_jusqu_au`.

**Le code est stocké haché**, comme un OTP *(R-C6)* : une fuite de base ne doit pas permettre de retirer les colis de tout le monde. Les six chiffres ne sont en clair que dans la notification et le SMS.

```sql
CREATE INDEX relais_proximite ON point_relais USING gist (
  ll_to_earth(latitude, longitude)) WHERE statut = 'actif';
CREATE INDEX colis_garde_depassee ON colis (garde_jusqu_au)
  WHERE statut = 'au_relais';
```

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — relay picker (buyer).
A list of relay cards sorted by distance, each with a real storefront photo on the
left, the name "Épicerie Tsara", the neighbourhood "Analamahitsy", a distance chip
"800 m", opening hours "7 h – 20 h, tous les jours", a capacity line in green
"Places disponibles", and a radio on the right. One card shows an amber capacity
line "Presque plein". A map toggle at the top right.

Screen 2 — pickup code card (buyer), the most important card of the product.
A high-contrast accent card: label "Votre code de retrait", then the six digits
"482 913" in very large monospace with generous letter spacing, a copy icon, then
the relay name and hours, then a muted line "Disponible même sans connexion" with
a small offline icon, and finally "À retirer avant le 21 août" in amber.

Screen 3 — relay app, "Remise d'un colis" (apps/terrain, one-handed use).
Vertical order: a big title "Remise"; a very large six-box numeric input with an
oversized keypad below it taking the bottom half of the screen; as soon as a valid
code is typed, a result card appears above showing the parcel photo thumbnail,
"Hanta R.", "Commande #1042", and a green "Code valide" banner; a full-width tall
primary button "Confirmer la remise".
Produce two error frames: "Code inconnu" in red, and "Ce code a déjà été utilisé
le 14 août à 15 h 02" in amber.

Screen 4 — relay app, "Colis en attente": a list of parcels with buyer first name,
order number, arrival date, and a guard countdown chip — green "5 jours restants",
amber "2 jours", red "Retour demain". A header count "12 colis en stock".
```

### 5. Backend

`GET /points-relais?lat=&lon=` · `POST /colis/:id/reception` (relais) · `POST /colis/:id/remise` `{ code }` (relais) · `GET /relais/colis` (colis en attente).

La remise est **une transaction** : vérification du code haché, marquage consommé, passage du colis en `remis`, événement de livraison, déclenchement de la fenêtre de confirmation *(F4.5)*.

**Tests** : code valide → remise, statut, événement ; **code rejoué → refus avec la date de première utilisation** ; code d'un autre colis → refus ; deux remises concurrentes avec le même code → une seule réussit ; délai de garde dépassé → retour vendeur *(F5.7)* ; SMS de code envoyé **et** notification ; code consultable hors ligne ; relais inactif absent de la liste.

### 6. Frontend

Application relais volontairement dépouillée : deux actions, gros boutons, gros chiffres. Elle sera utilisée par un épicier entre deux clients, pas par un logisticien.

Côté acheteuse, le code est **mis en cache localement** dès réception de la notification.

```issues
feature: F5.3
titre: Réseau de points relais, carte, horaires, fiche
epic: "05"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F3.4]
```
```issues
feature: F5.4
titre: Code de retrait à usage unique
epic: "05"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F5.3]
```
```issues
feature: F5.10
titre: Application point relais, réception, stock, remise
epic: "05"
phase: P1
prio: M
etapes: [conception, squelette, design, backend, frontend]
depend: [F5.4]
```

---

## F5.5 — Application livreur

`P1 · S · complet` — **Règles** R-L2 · **Dépend de** F4.3

### 1. Conception

**L** : se connecte → « Ma tournée du jour » → liste ordonnée : enlèvements chez les vendeurs, puis remises → à chaque point, « Arrivé » → à la remise, **photo du colis remis ou code de l'acheteuse** → si paiement à la livraison *(F4.3)*, saisit le montant encaissé → passe au suivant.

- **A** : voit le nom et le numéro du livreur quand la course démarre.
- **V** : voit que ses colis ont bien été enlevés.

**Contrainte de conception dominante** : l'application est utilisée **en mouvement, à moto, souvent hors réseau**. Elle doit donc fonctionner **hors ligne par défaut** : la tournée est téléchargée au démarrage, les actions sont enregistrées localement et synchronisées quand le réseau revient. Une application de livreur qui exige une connexion à chaque appui ne sera pas utilisée.

**La preuve de remise est le pivot** : photo ou code. Sans preuve, un litige « non reçu » est indécidable et JP paie systématiquement.

### 2. Structure de code

```
apps/api/src/modules/livraison/
├─ tournee.ts         composition, ordre, affectation
└─ preuve.ts          photo, code, horodatage, position
apps/terrain/src/features/tournee/
├─ ecrans/{EcranTournee,EcranPoint,EcranPreuve,EcranEncaissement}.tsx
├─ noyau/fileHorsLigne.ts     ← file d'actions locale, synchronisation
└─ hooks/useTournee.ts
```

### 3. Base de données

Migration `..._f5_5_tournee` :

```
livreur
  id PK · utilisateur_id FK · vehicule · zone_id FK null · statut
tournee
  id PK · livreur_id FK · date · statut(planifiee|en_cours|terminee)
tournee_point
  id PK · tournee_id FK · ordre · type(enlevement|remise)
  colis_id FK · statut · arrive_le null · termine_le null
```

Les actions hors ligne portent une **clé d'idempotence locale** : la synchronisation d'une file rejouée ne double ni les remises ni les encaissements.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — "Ma tournée du jour" (courier app, offline-first).
Top bar: date "14 août", a progress ring "7/18", and an offline indicator chip
that reads either green "Synchronisé" or amber "3 actions en attente".
A sectioned list: section "Enlèvements (2)" with rows showing the shop name
"Miora Boutique", the address landmark, a parcel count "5 colis", and a large
"Arrivé" button; section "Remises (16)" with rows showing the buyer first name,
the landmark address, a "55 000 Ar à encaisser" amber chip where applicable, and
a "Arrivé" button. Completed rows are collapsed with a green check.

Screen 2 — "Preuve de remise".
Vertical order: the buyer name and order number; two large tabs "Photo du colis"
and "Code de la cliente"; under the Photo tab, a camera viewport with a capture
button and a hint "Photographiez le colis remis"; under the Code tab, a six-box
input with a large keypad; a full-width tall primary button "Confirmer la remise".
A muted footer line "Enregistré même sans réseau".

Screen 3 — failed delivery: a red outline button "Échec de livraison" opening a
reason list "Cliente absente · Refuse le colis · Adresse introuvable · Numéro
injoignable", a photo capture row, and a primary button "Enregistrer l'échec".
```

### 5. Backend

`GET /livreur/tournee` · `POST /tournee-points/:id/arrive` · `POST /colis/:id/remise-livreur` `{ preuve, montantEncaisse? }` · `POST /colis/:id/echec` `{ motif, preuve }` · `POST /livreur/synchronisation` (lot d'actions hors ligne, idempotent).

**Tests** : tournée ordonnée ; **synchronisation d'un lot rejoué → aucune action doublée** ; remise avec photo, remise avec code ; encaissement espèces enregistré *(F4.3)* ; échec → retour vendeur *(F5.7)* ; le vendeur voit l'enlèvement ; l'acheteuse voit le nom et le numéro du livreur au démarrage de la course, **et pas avant**.

### 6. Frontend

Hors ligne par défaut : tournée en cache, file d'actions locale, indicateur de synchronisation **toujours visible**. Boutons hauts, contraste maximal, une seule action par écran.

```issues
feature: F5.5
titre: Application livreur, tournée, scan, preuve de remise
epic: "05"
phase: P1
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F5.2]
```

---

## F5.1 — Bordereau de préparation et étiquette colis

`P1 · M · complet`

**Conception** — bordereau imprimable ou lisible à l'écran : numéro de commande, articles avec tailles, mode de livraison, relais ou repère d'adresse, **numéro du destinataire**, montant à encaisser si espèces *(F4.3)*, note de l'acheteuse *(F3.11)*.

**Beaucoup de vendeurs n'ont pas d'imprimante.** Le bordereau doit donc être **utilisable à l'écran** et l'étiquette recopiable à la main sans ambiguïté : numéro court, gros caractères, aucune information superflue.

**L'adresse complète n'apparaît que sur le bordereau destiné au transport** *(R-L8, RB8)*, jamais dans une vue partageable.

**Base de données** — aucune table : projection de `commande` + `colis`.

**Backend** — `GET /vendeur/colis/:id/bordereau` (JSON et PDF).

**Design** — Prompt Stitch : *packing slip screen (seller, screen-first) with a very large order number "#1042" at the top, a "Point relais" chip, the item checklist with checkboxes ("Robe wax bleue · M · 1"), a recipient block with first name and phone number in large type, an amber "À encaisser : 55 000 Ar" card when applicable, the buyer note in a quoted block, and two buttons "Marquer comme prêt" and "Imprimer / PDF"; plus a compact label layout designed to be copied by hand: order number, relay name, recipient first name and phone, nothing else.*

**Tests** : bordereau complet ; adresse absente des vues non destinées au transport ; montant à encaisser présent seulement en mode espèces.

```issues
feature: F5.1
titre: Bordereau de préparation et étiquette colis
epic: "05"
phase: P1
prio: M
etapes: [conception, design, backend, frontend]
depend: [F3.7]
```

---

## F5.6 — Regroupement des colis d'un même vendeur

`P1 · S · moyen`

**Conception** — le vendeur dépose plusieurs colis en un trajet ; le livreur en enlève plusieurs d'un coup ; le relais en reçoit plusieurs en **une seule validation**. Côté acheteuse, la suggestion « Regroupez au même point relais et économisez X Ar » *(F3.1)*.

Sans regroupement, un enlèvement de cinq colis demande cinq validations et le livreur cesse de les faire.

**Base de données** — `enlevement (id, vendeur_id, livreur_id, colis_ids[], valide_le)` ou simple lot logique.

**Backend** — `POST /enlevements` (lot), `POST /relais/receptions` (lot).

**Design** — Prompt Stitch : *courier pickup screen showing a shop header and a list of 5 parcels with checkboxes all pre-checked, a select-all row, and a single tall primary button "Enlever 5 colis"; plus the relay reception equivalent "Réception de 5 colis" with a scan-or-type row per parcel and one confirm button.*

**Tests** : lot de 5 → 5 transitions et 5 événements, **une seule action utilisateur** ; lot partiel (un colis manquant) → les autres passent, le manquant reste, écart signalé.

```issues
feature: F5.6
titre: Regroupement des colis d'un même vendeur
epic: "05"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F5.5, F5.10]
```

---

## F5.7 — Échec de livraison et retour

`P1 · S · moyen`

**Conception** — trois causes : acheteuse absente ou injoignable, refus du colis, délai de garde dépassé au relais. Le colis repart chez le vendeur ; la commande est annulée et **remboursée** *(F4.7)*, sauf accord de nouvelle tentative.

**⚠️ Qui paie le retour ?** Question réelle : sur des paniers faibles, le coût du retour peut dépasser la marge. À trancher au pilote, **paramétrable** en attendant.

Un taux d'échec élevé sur une acheteuse est un signal : il alimente la composante fiabilité du rang client *(R-R3)* et peut restreindre l'accès au paiement à la livraison *(F4.3)*.

**Base de données** — `colis.statut` inclut `echec_livraison` et `retour_vendeur`, `colis.motif_echec`, `colis.nb_tentatives`.

**Backend** — `POST /colis/:id/echec`, `POST /colis/:id/nouvelle-tentative`, travail de garde dépassée.

**Design** — Prompt Stitch : *buyer notification and screen for a failed delivery: title "Nous n'avons pas pu vous livrer", the reason "Vous étiez absente le 14 août", two options as cards — "Nouvelle tentative demain" (primary, with a fee line "Frais : 3 000 Ar") and "Annuler et me faire rembourser 55 000 Ar" (secondary) — plus a muted line "Sans réponse sous 48 h, votre commande sera remboursée."*

**Tests** : les trois causes ; retour vendeur → remboursement ; nouvelle tentative avec frais paramétrables ; compteur de tentatives ; garde dépassée → retour automatique ; effet sur la fiabilité du rang client.

```issues
feature: F5.7
titre: Échec de livraison et retour
epic: "05"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F5.2, F4.7]
```

---

## F5.9 — Estimation du délai affichée avant l'achat

`P1 · S · moyen` — **Recette RB7**

**Conception** — « Expédié en 2 jours · Livré vers le 16 août » affiché **avant** le bouton d'achat *(F1.15)*. Calculé à partir du délai d'expédition **réel** du vendeur (moyenne mobile de ses expéditions passées) et du délai de transport de la zone.

**Hors direct, c'est l'information la plus importante après le prix** : l'acheteuse n'a pas vu le vendeur parler, elle n'a que ce chiffre pour juger.

**Un délai annoncé et non tenu est plus grave qu'un délai long** : il alimente le score de confiance *(F6.2)*.

**Base de données** — `profil_vendeur.delai_expedition_moyen` (calculé), `zone_livraison.delai_transport_j`.

**Backend** — inclus dans la projection d'article et le panier. Recalcul du délai vendeur par travail quotidien.

**Design** — Prompt Stitch : *delivery estimate row on a product page: a truck icon, "Livré vers le 16 août", a secondary line "Miora expédie en 2 jours en moyenne", and a small "Voir les délais" link opening a sheet that breaks it down into "Préparation 2 j" + "Transport 1 j" with a note "Basé sur les 30 dernières expéditions de cette boutique".*

**Tests** : délai calculé sur données réelles ; nouveau vendeur sans historique → délai déclaré, marqué comme tel ; affiché avant le paiement *(RB7)* ; écart délai annoncé / réel remonté au score.

```issues
feature: F5.9
titre: Estimation du délai affichée avant l'achat
epic: "05"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F5.2]
```

---

## F5.8 — Retour produit pour cause de taille

`P2 · S · moyen` — **⚠️ qui paie le retour ?**

**Conception** — **la première cause de litige dans le vestimentaire**, et la raison d'être des mesures réelles *(F1.18)* et des avis par morphologie *(F6.10)*.

- **A** : commande livrée → « La taille ne va pas » → échange contre une autre taille (si disponible) ou remboursement → dépose le colis au relais → à réception par le vendeur, échange expédié ou remboursement déclenché.
- **V** : accepte ou conteste ; règles définies dans sa politique de retour, **affichée sur sa vitrine**.

**⚠️ Qui paie le retour** — coût réel sur des paniers faibles. Paramétrable, à trancher au pilote. Piste : à la charge du vendeur si les mesures étaient absentes ou fausses, à la charge de l'acheteuse si elles étaient justes. C'est la règle la plus juste, et elle incite à mesurer *(R-H4)*.

**Base de données** — `retour (id, commande_id, motif, type(echange|remboursement), variante_echange_id, statut, frais_a_charge_de)`.

**Backend** — `POST /commandes/:id/retour`, machine à états du retour, réutilisation du réseau relais pour le trajet inverse.

**Design** — Prompt Stitch : *return request flow — screen 1 "La taille ne va pas" with two option cards "Échanger contre une autre taille" (showing available sizes as chips) and "Me faire rembourser"; screen 2 a shipping instruction card with the relay to drop at, a return code, and a fees line "Frais de retour : à la charge de la boutique" (with a variant "à votre charge : 5 000 Ar"); screen 3 a return tracking timeline.*

**Tests** : échange avec stock disponible ; échange sans stock → bascule remboursement ; frais imputés selon la règle paramétrée ; retour reçu par le vendeur → déclenchement ; politique de retour affichée sur la vitrine.

```issues
feature: F5.8
titre: Retour produit pour cause de taille
epic: "05"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F5.7, F4.7]
```

---

*Épique suivante : [EP06-confiance](EP06-confiance.md).*
