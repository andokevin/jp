# EP04 — Paiement

> 8 fonctionnalités · vague 1 · module `paiement`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).
> **Amont** : [`JP_DECISIONS_PRODUIT.md`](../docs/JP_DECISIONS_PRODUIT.md) — `DP-07`, `DP-15`, `DP-16`.

**On fait comme tout le commerce en ligne : le client paie, le vendeur reçoit son argent, JP ne récupère que sa commission.** Un débit, une confirmation, **deux ou trois crédits éclatés** *(`DP-16`)*.

**Le séquestre est supprimé** *(`DP-07`)* et **JP ne détient aucun fonds, à aucun moment** *(`R-M9`)* : les crédits vont directement sur les comptes des bénéficiaires. Ce qui est enregistré chez JP, c'est **la transaction**, jamais l'argent — et c'est ça, la traçabilité *(`D-21`)*.

**La boutique choisit son mode** *(`DP-15`)* : **abonnement mensuel** — pas de patte commission, un seul crédit vers elle — ou **commission** — JP est crédité directement de sa part. **C'est l'éclatement qui rend la commission gratuite à collecter** : JP ne la récupère pas, elle lui est créditée.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F4.1 | Paiement mobile money ⚠️ | P1 | M | complet |
| F4.14 | **Éclatement du paiement** *(`DP-16`)* | P1 | M | complet |
| F4.9 | ♻️ **Relevé des commissions** *(`DP-15`)* | P1 | S | moyen |
| F4.10 | Reprise après échec de paiement | P1 | M | complet |
| F4.11 | Facture PDF horodatée | P1 | M | complet |
| F4.2 | Paiement par carte ⚠️ | P1 | S | moyen |
| F4.13 | Historique des mouvements | P1 | S | moyen |
| ~~F4.4~~ ~~F4.5~~ ~~F4.6~~ ~~F4.7~~ ~~F4.8~~ | ~~Séquestre, libérations, remboursement, portefeuille~~ ❌ *(`DP-07`)* | — | — | — |
| ~~F4.3~~ ~~F4.12~~ | ~~Paiement à la livraison, acompte~~ ❌ *(`DP-04`)* | — | — | — |

> ### L'exposition juridique reste supprimée
>
> `docs/marque/` désigne comme **« principal risque du projet »** le régime d'un
> tiers non agréé conservant des fonds d'acheteurs — **loi 2016-056, art. 79-80**,
> action `A-03`. **JP ne recevant aucun fonds, ce risque n'existe pas.**

---

## F4.14 — L'éclatement du paiement

`P1 · M · complet` — **Règles** R-M4 à R-M7, R-M9, R-M10 · **Recette** RB2, RB10, RB11 · **Décision** `DP-16` · **Bloque** `F10.1`, `F15.5`

### 1. Conception

```
paiement de l'acheteuse — UN débit, UNE confirmation
        │  éclatement par le prestataire
   ┌────┴──────────────┬──────────────┐
   ▼                   ▼              ▼
mobile money       compte JP      mobile money
de la boutique    (commission,    de la créatrice
   (le net)         si mode        (si affiliée)
                  commission)
```

- **R-M9** — **JP ne détient aucun fonds, à aucun moment.** Les crédits vont directement aux bénéficiaires.
- **R-M10** — **L'éclatement atomique est le cas nominal.** Le nombre de bénéficiaires ne change **rien** pour l'acheteuse : un débit, une confirmation.

**Le nombre de crédits, par situation** :

| Situation | Crédits |
|---|---|
| Boutique en **abonnement**, vente simple | **1** — la boutique |
| Boutique en **commission**, vente simple | **2** — la boutique, JP |
| Boutique en **commission**, vente affiliée | **3** — la boutique, JP, la créatrice |

### 2. Le repli, si le prestataire n'éclate pas *(`PO-11`)*

**On code le repli, on préfère le nominal.** L'architecture supporte les deux — c'est ce qui évite d'attendre la réponse des opérateurs pour commencer.

- **R-M4** — **la requête vers la boutique est la requête pivot.** Émise en premier ; **son échec annule tout** : ni commande, ni requête suivante. Rien n'a bougé.
- **R-M5** — **les requêtes secondaires sont rattrapables, jamais bloquantes.** Commission JP ou part créatrice : un échec **ne remet pas la commande en cause**, la somme due est enregistrée et rejouée.
- **R-M6** — **le nombre de confirmations est annoncé avant l'écran de paiement.** Un deuxième code non annoncé est indiscernable d'une fraude.
- **R-M7** — 🔒 **on ne rejoue jamais à l'aveugle** : on interroge d'abord l'opérateur sur le sort de sa référence, on ne rejoue que si la réponse est « non effectué ».

> **Il n'existe pas de « tout ou rien » entre plusieurs transferts mobile money.**
> `R-M4` et `R-M5` n'établissent pas l'atomicité : elles organisent l'échec
> partiel pour qu'il tombe **toujours du côté rattrapable**. **L'ordre est une
> règle de sécurité**, pas un détail — l'inverser produirait des commissions
> encaissées sur des commandes inexistantes.

> ### ⚠️ `PO-11` — la question la plus importante du projet
>
> *« Un encaissement unique peut-il être réparti automatiquement vers plusieurs
> comptes bénéficiaires, en une seule opération, avec un seul code de
> confirmation pour le payeur ? »*
>
> À poser à **MVola, Orange Money et Airtel**. Si la réponse est non **et**
> qu'aucun bénéficiaire tiers n'est possible, l'argent devra transiter par JP —
> **et le risque juridique reviendra avec lui**.

### 3. Structure de code

```
apps/api/src/modules/paiement/
├─ plan.ts             calcul des parts AVANT tout appel — net, commission, créatrice
├─ eclatement.ts       mode atomique si disponible, sinon requêtes ordonnées
├─ rejeu.ts            reprise des pattes secondaires — interroge AVANT (R-M7)
└─ *.test.ts
apps/mobile/src/features/paiement/composants/AnnonceConfirmations.tsx
```

### 4. Base de données

`paiement` porte `rang` *(`pivot` | `secondaire`)*, `beneficiaire_type` *(**`boutique` | `jp` | `createur`**)*, `beneficiaire_id`, `msisdn_destination` **figé**, `nb_rejeux`, `prochain_rejeu_le`.

`commande` porte **`taux_commission_pour_mille`** et **`mode_remuneration`**, **figés à la création** *(`R-G3`, `R-B5`)*.

```sql
CREATE INDEX paiement_par_commande ON paiement (commande_id, rang);
CREATE INDEX paiement_a_rejouer ON paiement (prochain_rejeu_le)
  WHERE rang = 'secondaire' AND statut = 'ECHOUE';
```

**La somme des crédits d'une commande égale le montant débité** — à vérifier par test, pas par `CHECK`.

### 5. Design

```
Screen — payment plan, shown BEFORE the operator prompt.
A compact card: "Vous allez recevoir 1 demande de confirmation" with a large
numeral and the total "50 000 Ar". Below, a muted breakdown visible only to the
SHOP in its own studio — never to the buyer: "Miora 47 500 Ar · JP 2 500 Ar".
The buyer sees ONLY her total and the verified-shop line.
Produce a second frame for the fallback mode: "2 demandes de confirmation",
with the info line "La deuxième arrive juste après la première."
```

**L'acheteuse ne voit jamais la répartition.** Elle paie un prix ; comment il se répartit ne la regarde pas, et le lui montrer ferait apparaître une commission qu'elle ne paie pas *(`R-B1`)*.

### 6. Backend

`GET /commandes/:id/plan-paiement` → `{ confirmations, total }` *(sans la répartition)* · `POST /commandes/:id/paiement` · job `rejeuPattesSecondaires`.

**Tests** : abonnement → **1 crédit** ; commission → **2** ; commission + affiliation → **3** ; **la somme des crédits égale le débit**, au centime ; **mode atomique** : tout ou rien ; **repli** : échec du pivot → aucune commande ; échec d'un secondaire → commande créée, patte rejouée **après interrogation** *(`R-M7`)* ; rejeu avec la même clé → pas de double crédit ; **l'acheteuse ne voit jamais la répartition**.

```issues
feature: F4.14
titre: Éclatement du paiement, atomique ou en requêtes ordonnées
epic: "04"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F3.7]
```

---

## F4.9 — Relevé des commissions ♻️

`P1 · S · moyen` — **Règles** R-G1, R-G3 · **Décision** `DP-15`

**Conception** — en mode commission, la boutique voit **avant la mise en vente et sur chaque commande** : *« Vente 50 000 Ar — commission 2 500 Ar — vous recevez 47 500 Ar »* *(`R-G1`)*. **Les 47 500 Ar arrivent directement sur son mobile money** : la commission n'est pas prélevée après, elle est **une patte de l'éclatement** *(`DP-16`)*. Le barème est **historisé** et **figé à la commande** *(`R-G3`)*.

**En mode abonnement**, cet écran affiche *« vous recevez 100 % »* et renvoie à l'abonnement *(`F10.3`)*.

**Base** — `bareme_commission`, `commande.taux_commission_pour_mille` et `mode_remuneration`, **figés à la création**.

**Backend** — `GET /boutique/commissions?periode=`, export tableur.

**Tests** : le taux affiché avant mise en vente est celui appliqué ; un changement de barème ne touche aucune commande existante ; en mode abonnement, aucune commission n'apparaît.

```issues
feature: F4.9
titre: Relevé des commissions prélevées
epic: "04"
phase: P1
prio: S
etapes: [conception, design, backend, frontend]
depend: [F4.14]
```

---

## F4.1 — Paiement mobile money

`P1 · M · complet` — **Règles** R-M1, R-M2 · **Recette** RB10 · **⚠️ décision J0 : prestataires**

### 1. Conception

**A** : « Payer » → opérateur présélectionné d'après son numéro → confirme le montant → **reçoit la demande de validation sur son téléphone** (USSD ou notification opérateur) → saisit son code → retour dans l'app → confirmation avec le numéro de commande.

**Le point critique de tout le produit** : pendant l'attente de confirmation opérateur (jusqu'à 60 s), afficher un écran d'attente **explicite** avec le minuteur de réservation **suspendu** *(R-S5)*. **Ne jamais laisser un écran figé** — c'est là que l'acheteuse croit avoir perdu son argent, et une seule occurrence de cette impression détruit la confiance qu'on met des mois à construire.

**Machine à états** *(CDC §4.2)* :
```
INITIE → EN_ATTENTE_OPERATEUR → CONFIRME
             │                      │
             ├─ ECHOUE              └─→ REMBOURSE (total ou partiel)
             └─ EXPIRE
```

**Idempotence obligatoire** *(R-M2, RB10)* : chaque tentative porte une clé unique. Un rejeu avec la même clé renvoie le résultat initial **sans nouveau prélèvement**. Clé conservée 24 h minimum.

**Rappels asynchrones** : signature vérifiée, traitement idempotent, et **réception possible avant même la réponse synchrone** — le webhook peut arriver avant que l'appel initial ne rende sa réponse. Le code doit gérer cet ordre.

**Réconciliation active** : tout paiement resté `EN_ATTENTE_OPERATEUR` au-delà d'un délai est **réinterrogé**, jamais abandonné silencieusement. Un paiement oublié dans cet état est de l'argent prélevé sans commande.

### 2. Structure de code

```
apps/api/src/modules/paiement/
├─ routes.ts             POST /commandes/:id/paiement · POST /webhooks/paiement/:p
├─ service.ts            initier() · traiterRappel() · reinterroger()
├─ machine.ts            transitions strictes
├─ prestataires/
│  ├─ Prestataire.ts     ← interface : initier, verifierSignature, interroger
│  ├─ mvola.ts · orange.ts · airtel.ts · carte.ts
├─ idempotence.ts        délègue à plateforme/idempotence.ts
├─ erreurs.ts            PAIEMENT_ECHOUE · PAIEMENT_EXPIRE · MONTANT_INCOHERENT
└─ *.test.ts
apps/api/src/jobs/reconciliationPaiements.ts     réinterrogation périodique
apps/mobile/src/features/paiement/
├─ ecrans/{EcranChoixOperateur,EcranAttenteOperateur,EcranConfirmation}.tsx
└─ hooks/usePaiement.ts
```

L'interface `Prestataire` est la seule dépendance publique : ajouter un opérateur ne touche pas le service.

### 3. Base de données

Migration `..._f4_1_paiement` — `paiement` (CDC §3.3) avec `cle_idempotence UQ`, `reference_externe`, `payeur_utilisateur_id`, `payeur_pays`.

```sql
CREATE UNIQUE INDEX paiement_idempotence ON paiement (cle_idempotence);
CREATE INDEX paiement_a_reinterroger ON paiement (cree_le)
  WHERE statut = 'en_attente_operateur';
ALTER TABLE paiement ADD CONSTRAINT montant_positif CHECK (montant > 0);
```

L'index partiel de réinterrogation est ce qui rend la réconciliation bon marché.

### 4. Design

**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :

```
Screen 1 — "Comment payer ?".
Vertical order: an amount header card showing "À payer" and "55 000 Ar" in very
large bold; three operator rows, each with the operator logo area, name
("MVola", "Orange Money", "Airtel Money"), the masked number "034 •• ••• 67"
under the first one, and a radio on the right; MVola is pre-selected with a small
"votre numéro" tag; a fourth row "Carte bancaire". Above the button, a muted
line: "Boutique vérifiée — identité et Mobile Money contrôlés." Pinned bottom:
full-width primary button "Payer 55 000 Ar".

Screen 2 — waiting for operator confirmation. THIS SCREEN MUST NEVER LOOK FROZEN.
Vertical order: a large animated phone illustration with radiating waves; title
"Validez sur votre téléphone"; a numbered three-step list, the current step
highlighted: "1. Une demande MVola s'affiche sur votre écran", "2. Saisissez
votre code secret", "3. Revenez ici"; a live elapsed indicator "Nous attendons la
confirmation… 12 s" with an animated dot row; a green reassurance card with a
pause icon reading "Votre réservation est mise en pause — vous ne perdrez pas
votre article"; a secondary text link at the bottom "Je n'ai rien reçu".

Screen 3 — "Je n'ai rien reçu" help sheet: three collapsible rows "Vérifiez que
votre téléphone a du réseau", "Composez #111# pour voir vos demandes en attente",
"Le montant n'a pas été prélevé si rien ne s'affiche", plus a primary button
"Réessayer le paiement" and a secondary "Choisir un autre moyen".

Screen 4 — payment confirmed: a large green check, "Paiement confirmé",
the order number "#1042", the honest payment card ("Boutique vérifiée par JP —
identité et Mobile Money contrôlés"), and a primary button "Suivre ma commande".
```

### 5. Backend

`POST /commandes/:id/paiement` `{ moyen, msisdn? }`, **`Idempotency-Key` requis** → 202 `{ paiementId, statut: 'en_attente_operateur' }`.
`POST /webhooks/paiement/:prestataire` — signature vérifiée, traitement idempotent, **tolérant à l'arrivée précoce**.
`GET /paiements/:id` — sondage côté client pendant l'attente.

À la confirmation : `paiement.confirme` → consommation de la réservation *(F1.10)*, passage de la commande en `PAYEE`, journalisation. **Les crédits sont déjà partis** — c'est l'éclatement qui les a émis *(`F4.14`, `R-M10`)*. Ancienne rédaction : création du séquestre *(F4.4)*, écritures financières, notification à la boutique avec **le montant net, commission affichée** *(F10.1)*.

**Tests — les plus exigeants du dépôt, avec ceux du stock :**
- Rejeu de la même clé d'idempotence → **même résultat, un seul prélèvement** *(RB10)*.
- Webhook reçu **deux fois** → un seul traitement.
- **Échec de l'encaissement → aucune commande créée.** Rien n'a bougé.
- **Échec d'une patte secondaire → la commande existe, l'expédition suit, la patte est rejouée après interrogation** *(`R-M5`, `R-M7`)*.
- Webhook reçu **avant** la réponse synchrone → traitement correct.
- Coupure provoquée **à chaque étape** du parcours → ni double prélèvement, ni commande perdue *(RB10)*.
- Paiement expiré → réservation libérée, commande annulée, aucune écriture financière orpheline.
- Montant du webhook différent du montant attendu → refus et alerte, **jamais d'ajustement silencieux**.
- Réinterrogation d'un paiement resté en attente 10 min → statut résolu.
- Minuteur de réservation **suspendu** pendant l'attente, repris à l'échec.

### 6. Frontend

`usePaiement` — sondage avec intervalle croissant, écran d'attente **animé** (jamais figé), temps écoulé affiché. Sortie de l'application pendant l'attente → reprise à l'ouverture sur le même écran, statut resynchronisé.

Le lien « Je n'ai rien reçu » est essentiel : il donne à l'acheteuse une action au moment précis où elle doute.

```issues
feature: F4.1
titre: Paiement MVola, Orange Money, Airtel Money
epic: "04"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F3.7]
```

---

## F4.10 — Reprise après échec de paiement

`P1 · M · complet` — **Recette RB10**

### 1. Conception
Un paiement qui échoue ne doit **jamais** faire perdre le panier. À l'échec : réservation **maintenue** si le minuteur le permet, message expliquant le motif réel (solde insuffisant, code faux, délai dépassé, opérateur indisponible), et proposition de réessayer ou de changer de moyen.

**Le motif réel, pas un message générique.** « Le paiement a échoué » ne dit pas à l'acheteuse si elle doit recharger son compte ou réessayer dans cinq minutes.

### 2. Structure de code
`modules/paiement/reprise.ts` · `apps/mobile/src/features/paiement/ecrans/EcranEchecPaiement.tsx`.

### 3. Base de données
`paiement.motif_echec`, correspondance des codes prestataires vers des motifs stables et traduits.

### 4. Design
Prompt Stitch : *payment failure screen with a neutral (not alarming) illustration, a title matching the real cause — produce four frames: "Solde insuffisant" with body "Rechargez votre compte MVola et réessayez"; "Code incorrect"; "Délai dépassé"; "MVola est momentanément indisponible" with body "Essayez Orange Money ou payez à la réception"; each with a green card "Votre article est toujours réservé — 3:12" and two buttons "Réessayer" and "Changer de moyen de paiement".*

### 5. Backend
Correspondance des codes d'échec, conservation de la réservation, reprise sur la **même** commande (pas de nouvelle commande à chaque tentative — sinon l'historique se remplit de commandes fantômes).

**Tests** : les quatre motifs traduits ; réservation conservée quand le minuteur le permet ; réservation expirée pendant l'échec → message adapté et proposition de reprise si le stock est là ; 3 tentatives sur la même commande → un seul enregistrement de commande, trois paiements ; coupure à chaque étape → état cohérent *(RB10)*.

### 6. Frontend
Le message d'erreur est **actionnable**. Changement de moyen sans repasser par le panier.

```issues
feature: F4.10
titre: Reprise après échec de paiement
epic: "04"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F4.1]
```

---

## F4.11 — Facture PDF horodatée

`P1 · M · complet` — **Règles** R-F1 à R-F4

### 1. Conception
Facture avec numéro, date, articles, prix unitaires, **remise nommée** *(R-U8)*, frais de livraison, total, identité de la boutique vérifiée, mention JP. Consultable et téléchargeable depuis la commande. Côté boutique, la même facture **plus le détail de la commission**.

**La facture n'est pas un document administratif, c'est une preuve psychologique.** Elle doit être belle et partageable. C'est souvent le premier document commercial que la boutique aura jamais émis — et le premier objet qui prouve à l'acheteuse qu'elle n'a pas acheté à un inconnu sur Facebook.

Horodatage **inaltérable** *(R-F1)*, numérotation continue, exportable pour la comptabilité de la boutique.

### 2. Structure de code
`modules/facture/{service,gabarit,pdf}.ts` · `apps/api/src/jobs/generationFacture.ts` · `apps/mobile/src/features/commandes/ecrans/EcranFacture.tsx`.

### 3. Base de données
`facture (id, commande_id UQ, numero UQ, url_pdf, emise_le)`. Numérotation par séquence dédiée, jamais par comptage.

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen — invoice PDF layout (A4 portrait, shown as a document preview).
Header: the JP logo top-left, "FACTURE" top-right with the number "JP-2026-001042"
and the date "12 août 2026".
Two address blocks side by side: left "Boutique — Miora Boutique" with a small
"Vérifié par JP" badge and the shop identifiers; right "Cliente — Hanta R."
with the delivery landmark only (no full personal address).
A clean line-item table: Article, Taille, Qté, Prix unitaire, Total — two rows.
A totals block right-aligned: "Sous-total 118 000 Ar", a green line "Promo Noël
-20 % · -23 600 Ar", "Livraison 5 000 Ar", and "TOTAL PAYÉ 99 400 Ar" in a bold
bordered box.
Footer: the verified-shop line in small type ("Boutique vérifiée par JP"),
a payment line "Payé par MVola le
12 août 2026 à 19 h 42", and a light JP watermark.
Produce a second variant, the seller's copy, identical but with an extra
right-aligned block: "Commission JP 4 970 Ar" and "Montant net versé
94 430 Ar".
```

### 5. Backend
Génération asynchrone à la confirmation de paiement, `GET /commandes/:id/facture`, `GET /boutique/factures/export?periode=`.

**Tests** : numérotation continue et unique sous concurrence ; montants **exactement** ceux de la commande ; remise nommée présente ; version boutique avec commission ; **l'adresse personnelle complète n'y figure pas** *(RB8)* ; export multi-factures.

### 6. Frontend
Aperçu dans l'app, téléchargement, partage. Consultable **hors ligne** une fois téléchargée *(CDC §10.3)*.

```issues
feature: F4.11
titre: Facture PDF horodatée des deux côtés
epic: "04"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F4.1]
```

---

## F4.2 — Paiement par carte bancaire

`P1 · S · moyen` — **⚠️ décision J0 : agrégateur**

**Conception** — son usage réel est le **cadeau depuis la diaspora** *(F16.4)*, pas l'achat local. La page de paiement détecte le pays, affiche le montant converti à titre indicatif, propose la carte en premier, et annonce les frais de conversion à l'avance *(F16.10)*.

**Base de données** — `paiement.moyen = 'carte'`, `payeur_pays`, `montant_devise_origine`, `taux_indicatif`.

**Backend** — implémentation de l'interface `Prestataire` *(F4.1)*. Aucune donnée de carte ne transite par le serveur JP : redirection ou champ hébergé par l'agrégateur.

**Design** — Prompt Stitch : *card payment page (web, for the gift flow) with an amount header "55 000 Ar" and a secondary converted line "≈ 11,80 €", a hosted card field block, a fees disclosure card "Frais de conversion : 0,35 € — annoncés avant paiement", the verified-seller badge, and a primary button "Payer 11,80 €".*

**Tests** : aucune donnée de carte dans les journaux ni en base ; conversion indicative correcte ; frais annoncés **avant** *(RB7)* ; webhook idempotent.

```issues
feature: F4.2
titre: Paiement par carte bancaire
epic: "04"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F4.1]
```

---

## F4.13 — Historique de tous les mouvements

`P1 · S · moyen` — **Décision** `DP-07`

**Conception** — journal lisible de **tous les encaissements reçus** : ventes, parts versées aux créatrices *(`DP-09`)*, prélèvements d'abonnement *(`DP-08`)*. **Ce n'est plus un relevé de portefeuille** — JP ne tient aucun solde *(`DP-07`)* — **c'est une trace**, et c'est précisément ce sur quoi repose la nouvelle promesse.

**Backend** — `GET /boutique/mouvements?curseur=`, projection lisible depuis `ecriture_financiere`.

**Design** — Prompt Stitch : *movements list with dated rows, each with an icon, a label ("Vente #1042", "Part créatrice — Ony", "Abonnement — août"), and a signed amount. No running balance anywhere: JP holds no funds.*

**Tests** : chaque ligne correspond à une écriture réelle ; **aucun solde affiché** ; pagination stable par curseur ; libellés traduits.

```issues
feature: F4.13
titre: Historique de tous les mouvements
epic: "04"
phase: P1
prio: S
etapes: [conception, design, backend, frontend]
depend: [F4.8]
```

---

