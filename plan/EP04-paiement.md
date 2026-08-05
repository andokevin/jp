# EP04 — Paiement, séquestre et argent

> 13 fonctionnalités · vague 2 · modules `paiement`, `sequestre`, `portefeuille`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).

**C'est ici que se joue la proposition de valeur.** Le séquestre est ce qui matérialise la promesse « ton argent n'est pas perdu ».

**Contrainte permanente de l'épique** *(C4)* — argent conservé pour compte de tiers : journal financier **inaltérable**, idempotence de bout en bout, réconciliation quotidienne, traçabilité complète. Aucune écriture financière ne se modifie ; **toute correction est une écriture inverse**.

**Deux critères de recette bloquants sont ici** : `RB2` (fonds correctement séquestrés et libérés dans tous les cas) et `RB10` (paiement interrompu : ni double prélèvement, ni commande perdue).

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F4.1 | Paiement mobile money ⚠️ | P1 | M | complet |
| F4.2 | Paiement par carte ⚠️ | P1 | S | moyen |
| F4.3 | **Paiement à la livraison** ⚠️ | P1 | M | complet |
| F4.4 | Séquestre | P1 | M | complet |
| F4.5 | Libération à la confirmation | P1 | M | complet |
| F4.6 | Libération automatique après délai | P1 | M | complet |
| F4.7 | Remboursement total ou partiel | P1 | M | complet |
| F4.8 | Portefeuille et retrait | P1 | M | complet |
| F4.9 | Relevé des commissions | P1 | S | moyen |
| F4.10 | Reprise après échec de paiement | P1 | M | complet |
| F4.11 | Facture PDF horodatée | P1 | M | complet |
| F4.12 | Acompte + solde à la livraison ⚠️ | P2 | S | cadre |
| F4.13 | Historique des mouvements | P1 | S | moyen |

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
"votre numéro" tag; a fourth row "Payer à la réception" with a truck icon and a
muted line "En espèces au livreur"; a fifth row "Carte bancaire". Pinned bottom:
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
the order number "#1042", the escrow sentence card ("Votre argent est gardé par
JP…"), and a primary button "Suivre ma commande".
```

### 5. Backend

`POST /commandes/:id/paiement` `{ moyen, msisdn? }`, **`Idempotency-Key` requis** → 202 `{ paiementId, statut: 'en_attente_operateur' }`.
`POST /webhooks/paiement/:prestataire` — signature vérifiée, traitement idempotent, **tolérant à l'arrivée précoce**.
`GET /paiements/:id` — sondage côté client pendant l'attente.

À la confirmation : `paiement.confirme` → consommation de la réservation *(F1.10)*, passage de la commande en `PAYEE`, création du séquestre *(F4.4)*, écritures financières, notification au vendeur avec **le montant net, commission affichée** *(F10.1)*.

**Tests — les plus exigeants du dépôt, avec ceux du stock :**
- Rejeu de la même clé d'idempotence → **même résultat, un seul prélèvement** *(RB10)*.
- Webhook reçu **deux fois** → un seul traitement.
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

## F4.4 / F4.5 / F4.6 — Le séquestre

`P1 · M · complet` — **Règles** R-E1 à R-E10 · **Recette RB2** · **Le mécanisme central du produit**

### 1. Conception

**C'est ce qui matérialise la promesse « ton argent n'est pas perdu ».**

- **A (après paiement)** : voit clairement *« Votre argent est gardé par JP. Miora sera payée quand vous confirmerez avoir reçu. »* **Cette phrase doit être à l'écran de confirmation, pas enfouie dans les conditions générales** *(R-E1)*.
- **A (réception)** : notification « Avez-vous bien reçu ? » → « Oui, tout va bien » → fonds libérés → invitation à l'avis *(F6.1)*.
- **A (problème)** : « Il y a un problème » → litige *(F6.3)* → **les fonds restent bloqués**.
- **V** : deux soldes distincts dans son portefeuille — **« en attente de confirmation »** et **« disponible au retrait »** *(R-E6)*. La distinction doit être limpide, sinon la vendeuse croit qu'on la vole.

**F4.6 — libération automatique** *(R-E4)* : sans réponse de l'acheteuse après N jours suivant la livraison confirmée, les fonds sont libérés automatiquement. ⚠️ N à caler — hypothèse : 3 jours après remise. **Sans cette règle, les vendeuses attendent indéfiniment et quittent la plateforme.**

**Quatre chemins de libération**, tous à tester *(RB2)* : confirmation manuelle, unboxing *(F14.7)*, délai automatique, décision d'arbitrage *(F6.5)*.

**Le journal financier est inaltérable** *(C4)* : `ecriture_financiere` est **append only**. Aucune modification, aucune suppression ; toute correction est une écriture inverse. Les soldes de portefeuille sont **dérivés du journal**, jamais saisis.

### 2. Structure de code

```
apps/api/src/modules/sequestre/
├─ routes.ts
├─ service.ts        creer() · liberer(motif) · rembourser() · bloquer()
├─ journal.ts        ← écritures financières, append only, la seule porte d'entrée
├─ machine.ts        retenu → libere | rembourse | partiel
└─ *.test.ts
apps/api/src/jobs/liberationAutomatique.ts
apps/mobile/src/features/commandes/composants/CarteSequestre.tsx
apps/mobile/src/features/argent/composants/DeuxSoldes.tsx
```

`journal.ts` est la **seule** porte d'entrée vers `ecriture_financiere`. Aucun autre fichier n'y écrit — c'est vérifié par une règle de lint sur les imports.

### 3. Base de données

Migration `..._f4_4_sequestre` — `sequestre`, `ecriture_financiere`, `portefeuille` (CDC §3.3).

```sql
-- interdiction absolue de modifier le journal financier
REVOKE UPDATE, DELETE ON ecriture_financiere FROM app_role;
CREATE INDEX ecriture_titulaire ON ecriture_financiere (titulaire_id, compte, cree_le);
CREATE INDEX sequestre_a_liberer ON sequestre (liberable_le)
  WHERE statut = 'retenu' AND liberable_le IS NOT NULL;
ALTER TABLE sequestre ADD CONSTRAINT montant_positif CHECK (montant_retenu > 0);
```

**Le `REVOKE` est la garantie structurelle** : même un développeur pressé ne peut pas corriger une écriture. Il doit en passer une inverse.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — escrow reassurance card (appears on the confirmation screen and in
order tracking).
A bordered card with a shield icon, the sentence "Votre argent est gardé par JP."
in bold on its own line, then "Miora sera payée quand vous confirmerez avoir reçu
votre colis." in regular weight, then a three-step mini timeline with the current
step highlighted: "Payé → Livré → Vous confirmez". A small text link "Comment ça
marche ?".

Screen 2 — reception confirmation prompt (push-triggered screen).
A parcel illustration, title "Avez-vous bien reçu votre colis ?", the order
summary row, then two full-width buttons: primary green "Oui, tout va bien" and
secondary outline "Il y a un problème"; under them a muted line "Sans réponse,
nous paierons Miora dans 3 jours."

Screen 3 — seller wallet with the two balances, which MUST be unmistakable.
Two large stacked cards. Card 1, muted with a clock icon: label "En attente de
confirmation", amount "128 000 Ar", and a line "3 commandes livrées, en attente
de la confirmation des clientes". Card 2, accent-colored with a check icon: label
"Disponible au retrait", amount "347 000 Ar", and a full-width primary button
"Retirer". Below the cards, a muted explanatory line "L'argent passe
automatiquement en disponible 3 jours après la livraison."
```

### 5. Backend

`POST /commandes/:id/confirmer` → libération *(motif `confirmation`)*.
Travail `liberationAutomatique` → libération *(motif `automatique`)* à `liberable_le`.
`POST /admin/litiges/:id/decision` → libération ou remboursement *(motif `arbitrage`)*.
`GET /portefeuille` → les deux soldes, **dérivés du journal**.

**Tests — RB2, jeu de scénarios complet :**
- Les **quatre** chemins de libération produisent les bonnes écritures.
- Litige ouvert → fonds **bloqués**, libération automatique **suspendue**.
- Remboursement partiel → écritures cohérentes, somme des écritures = zéro par commande soldée.
- **Réconciliation à 100 %** : sur 1 000 commandes générées avec tous les chemins, la somme des écritures par compte égale les soldes.
- Tentative d'`UPDATE` sur `ecriture_financiere` → **rejetée par la base**.
- Soldes recalculés depuis le journal = soldes stockés, sur un jeu de 10 000 écritures.
- Double exécution du travail de libération → une seule libération.
- Encaissement d'un vendeur non vérifié → refusé *(F0.6)*.

### 6. Frontend

Carte de séquestre à l'écran de confirmation **et** dans le suivi de commande. Les deux soldes du vendeur avec un contraste visuel fort et une explication de la bascule — c'est l'écran le plus sujet aux malentendus du produit.

```issues
feature: F4.4
titre: Séquestre, fonds retenus par JP
epic: "04"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F4.1]
```
```issues
feature: F4.5
titre: Libération à la confirmation de réception
epic: "04"
phase: P1
prio: M
etapes: [conception, design, backend, frontend]
depend: [F4.4]
```
```issues
feature: F4.6
titre: Libération automatique après délai sans contestation
epic: "04"
phase: P1
prio: M
etapes: [conception, backend]
depend: [F4.4]
```

---

## F4.3 — Paiement à la livraison ⚠️

`P1 · M · complet` — **décision ouverte n° 1, la plus importante du lancement**

### 1. Conception

**Non prévu dans le deck d'origine, et probablement la fonctionnalité la plus déterminante du lancement.** Sans elle, une part importante de la demande est inaccessible ; avec elle, le séquestre perd son sens et le risque revient au vendeur.

- **A** : « Payer à la réception » → commande créée sans paiement → paie en espèces au livreur ou au relais.
- **V** : voit le mode sur le bordereau ; **elle porte le risque du refus à la livraison**, sauf mécanisme de couverture.
- **L / PR** : encaisse, saisit le montant reçu, remet le colis. Les espèces sont reversées à JP à la réconciliation *(F11.5)*.

**⚠️ À trancher avant de coder le paiement** — trois options à tester au pilote :
(a) le réserver aux acheteuses ayant **déjà une commande honorée** ;
(b) le limiter aux **points relais** uniquement, moins coûteux que le domicile ;
(c) exiger un **acompte mobile money** couvrant les frais de livraison *(F4.12)*.

**Recommandation de mise en œuvre** : coder les trois comme des **règles d'éligibilité paramétrables** *(R-O1)*, activables indépendamment. Le pilote tranchera par la mesure, pas par le débat — et le code ne sera pas à réécrire.

**Ce que le paiement à la livraison change structurellement** : il n'y a pas de séquestre. La protection de l'acheteuse est intrinsèque (elle paie en recevant) ; celle du vendeur disparaît. Le refus à la livraison devient le risque principal, et il doit être **mesuré dès le premier jour** — c'est le chiffre qui décidera du maintien de l'option.

### 2. Structure de code

```
apps/api/src/modules/paiement/
├─ especes.ts            création sans paiement, encaissement terrain
├─ eligibiliteEspeces.ts ← les trois règles, paramétrables
apps/api/src/modules/livraison/encaissement.ts
apps/terrain/src/features/encaissement/     app livreur et relais
apps/admin/src/pages/finance/EspecesACollecter.tsx
```

### 3. Base de données

Migration `..._f4_3_paiement_livraison` :

```
paiement.moyen inclut 'especes'
colis + montant_a_encaisser int · montant_encaisse int null · encaisse_par_id null
collecte_especes
  id PK · porteur_id FK · porteur_type(livreur|relais)
  montant_du · montant_reverse · statut · periode_debut · periode_fin
```

Paramètres d'éligibilité : `especes_actif`, `especes_requiert_commande_honoree`, `especes_relais_seulement`, `especes_acompte_frais_livraison`.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — cash-on-delivery option in the payment choice list, three variants:
(a) available: a row with a truck icon, "Payer à la réception", muted line
"En espèces au livreur ou au point relais", and a radio;
(b) restricted: the same row greyed with a padlock and the line "Disponible après
votre première commande livrée";
(c) relay-only: the row available but with the line "Uniquement en point relais".

Screen 2 — courier app collection screen (apps/terrain).
Vertical order: a delivery card with the buyer first name "Hanta", the address
with its landmark "Analamahitsy — près de l'épicerie Tsara", and the phone number
with a call icon; a large amount card "À encaisser : 55 000 Ar"; a numeric field
"Montant reçu" pre-filled with 55 000 and a large numeric keypad; a photo capture
row "Photo du colis remis"; a full-width primary button "Confirmer la remise".
Produce a second frame for a refusal: a secondary red outline button "Refus à la
livraison" opening a reason list "Cliente absente · Refuse le colis · Adresse
introuvable · Montant contesté".

Screen 3 — admin cash reconciliation table (desktop): rows per courier/relay with
columns Porteur, Colis remis, Espèces encaissées, Déjà reversé, Solde dû, Dernier
versement, and a highlighted total row; rows with a gap are flagged in amber.
```

### 5. Backend

`POST /commandes/:id/paiement` avec `moyen: 'especes'` → commande `PAYEE` **sans** encaissement, `sequestre` non créé.
`POST /colis/:id/encaissement` (app terrain) `{ montantEncaisse, preuve }` → écritures sur le compte `especes`.
Réconciliation *(F11.5)* : rapprochement des espèces collectées et reversées.

**Tests** : éligibilité selon les trois règles, activables indépendamment ; commande espèces → **aucun séquestre créé** ; montant encaissé différent du montant dû → écart signalé, **jamais absorbé** ; refus à la livraison → retour vendeur *(F5.7)*, commande annulée, mesure incrémentée ; solde dû par porteur exact ; taux de refus à la livraison remonté au tableau de bord *(F11.7)*.

### 6. Frontend

Option visible dans le choix de paiement avec son état d'éligibilité **expliqué** (jamais un simple grisé). App terrain avec pavé numérique large — le livreur saisit sous la pluie, d'une main.

```issues
feature: F4.3
titre: Paiement à la livraison
epic: "04"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F4.1, F5.5]
```

---

## F4.7 — Remboursement total ou partiel

`P1 · M · complet` — **Règles** R-E7

### 1. Conception
Déclenché par : annulation acheteuse *(F3.8)*, refus vendeur *(F3.9)*, décision d'arbitrage *(F6.5)*, seuil de précommande non atteint *(F15.8, RB3)*, refus de vérification d'un particulier *(R-H10)*.

Le remboursement passe par le prestataire d'origine et produit **des écritures inverses**, jamais une modification. Un remboursement partiel laisse le solde en séquestre ou le libère, selon la décision.

**Idempotence** : un remboursement rejoué ne rembourse pas deux fois.

### 2. Structure de code
`modules/paiement/remboursement.ts` · `modules/sequestre/service.ts`.

### 3. Base de données
`sequestre.statut` inclut `rembourse` et `partiel`. `remboursement (id, paiement_id, montant, motif, reference_externe, cle_idempotence UQ, statut)`.

### 4. Design
Prompt Stitch : *refund status card in order tracking — a timeline with three steps "Remboursement demandé · En cours chez MVola · Reçu", the current step highlighted, an amount "55 000 Ar", a delay line "Sous 48 h en général", and a support link; plus a partial-refund variant showing "Remboursement partiel : 20 000 Ar sur 55 000 Ar" with a reason line "Article non conforme — accord trouvé".*

### 5. Backend
`POST /admin/remboursements` · déclenché automatiquement par les cinq cas ci-dessus.

**Tests** : les cinq déclencheurs ; total et partiel ; rejeu idempotent → un seul remboursement ; écritures inverses cohérentes ; **somme des écritures d'une commande remboursée = 0** ; remboursement d'un paiement espèces (pas de prestataire) → procédure manuelle tracée.

### 6. Frontend
Suivi du remboursement dans la commande, avec délai annoncé — l'attente sans information est la principale source de contacts au support.

```issues
feature: F4.7
titre: Remboursement total ou partiel
epic: "04"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F4.4]
```

---

## F4.8 — Portefeuille vendeur et retrait

`P1 · M · complet` — **Règles** R-E6, R-E8 · **⚠️ décision : rythme de retrait**

### 1. Conception
« Mon argent » → solde disponible → « Retirer » → vers son numéro mobile money **vérifié** *(F0.6)* → confirmation → reçu.

**Le numéro de destination ne peut être que le numéro vérifié** au nom du titulaire de la pièce d'identité. C'est la règle qui empêche le détournement de compte de devenir un détournement d'argent.

**⚠️ À trancher** — retrait à la demande ou versement automatique hebdomadaire ? Les frais mobile money par transaction plaident pour un regroupement ; la trésorerie de la vendeuse plaide pour l'instantané. **Hypothèse : retrait à la demande, gratuit une fois par semaine, payant au-delà.** À paramétrer *(R-O1)*, pas à coder en dur.

Retraits **gelés** pendant une récupération de compte *(R-C14)*.

### 2. Structure de code
`modules/portefeuille/{service,retrait,routes}.ts` · `apps/mobile/src/features/argent/ecrans/{EcranMonArgent,EcranRetrait}.tsx`.

### 3. Base de données
`portefeuille`, `retrait` (CDC §3.3) avec `cle_idempotence UQ`. `portefeuille.retraits_geles bool` *(F0.3)*.

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen — "Retirer mon argent".
Vertical order: an available-balance header "Disponible : 347 000 Ar"; an amount
field with a large "Ar" suffix and quick-pick chips "50 000 · 100 000 · Tout";
a read-only destination card showing the operator logo, "MVola 034 •• ••• 67" and
a green "Vérifié" chip, with a muted line "Les retraits ne peuvent aller que vers
votre numéro vérifié"; a fees card showing "Frais : gratuit (1er retrait de la
semaine)" in green, with a secondary line "Prochain retrait cette semaine :
1 000 Ar"; a full-width primary button "Retirer 100 000 Ar".
Produce a frozen variant: the button disabled, and an amber card reading
"Retraits temporairement bloqués — vérification de compte en cours (dossier
#R-204)" with a "Voir mon dossier" link.
```

### 5. Backend
`GET /portefeuille` · `POST /portefeuille/retrait` **`Idempotency-Key` requis** · `GET /portefeuille/retraits`.

**Tests** : retrait supérieur au disponible → refus ; destination différente du numéro vérifié → refus ; retraits gelés → refus avec motif ; frais appliqués selon le rythme paramétré ; rejeu idempotent → un seul retrait ; échec prestataire → **remise au solde disponible**, pas de perte ; écritures cohérentes.

### 6. Frontend
Écran « Mon argent » avec les deux soldes *(F4.4)*, historique, reçu téléchargeable.

```issues
feature: F4.8
titre: Portefeuille vendeur et retrait vers mobile money
epic: "04"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F4.4, F0.6]
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
Facture avec numéro, date, articles, prix unitaires, **remise nommée** *(R-U8)*, frais de livraison, total, identité du vendeur vérifié, mention JP. Consultable et téléchargeable depuis la commande. Côté vendeur, la même facture **plus le détail de la commission**.

**La facture n'est pas un document administratif, c'est une preuve psychologique.** Elle doit être belle et partageable. C'est souvent le premier document commercial que la vendeuse aura jamais émis — et le premier objet qui prouve à l'acheteuse qu'elle n'a pas acheté à un inconnu sur Facebook.

Horodatage **inaltérable** *(R-F1)*, numérotation continue, exportable pour la comptabilité du vendeur.

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
Two address blocks side by side: left "Vendeur — Miora Boutique" with a small
"Vérifié par JP" badge and the shop identifiers; right "Cliente — Hanta R."
with the delivery landmark only (no full personal address).
A clean line-item table: Article, Taille, Qté, Prix unitaire, Total — two rows.
A totals block right-aligned: "Sous-total 118 000 Ar", a green line "Promo Noël
-20 % · -23 600 Ar", "Livraison 5 000 Ar", and "TOTAL PAYÉ 99 400 Ar" in a bold
bordered box.
Footer: the escrow sentence in small type, a payment line "Payé par MVola le
12 août 2026 à 19 h 42", and a light JP watermark.
Produce a second variant, the seller's copy, identical but with an extra
right-aligned block: "Commission JP 4 970 Ar" and "Montant net versé
94 430 Ar".
```

### 5. Backend
Génération asynchrone à la confirmation de paiement, `GET /commandes/:id/facture`, `GET /vendeur/factures/export?periode=`.

**Tests** : numérotation continue et unique sous concurrence ; montants **exactement** ceux de la commande ; remise nommée présente ; version vendeur avec commission ; **l'adresse personnelle complète n'y figure pas** *(RB8)* ; export multi-factures.

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

## F4.9 — Relevé des commissions prélevées

`P1 · S · moyen` — **Règles** R-G1, R-G2

**Conception** — le vendeur voit la commission **avant** de mettre en ligne, et sur chaque commande, en clair : *« Vente 50 000 Ar — commission 2 500 Ar — vous recevez 47 500 Ar »*. **Aucune surprise, jamais** : une commission découverte après coup est la première cause de désengagement.

Relevé par période, exportable, avec le détail par commande.

**Base de données** — `ligne_commande.commission_jp` (déjà là), écritures sur le compte `commission_jp`.

**Backend** — `GET /vendeur/commissions?periode=`, `GET /vendeur/commissions/export`.

**Design** — Prompt Stitch : *commissions statement screen with a period selector "Août 2026", a summary card "Ventes 1 240 000 Ar · Commissions 62 000 Ar · Net 1 178 000 Ar", a per-order list with three columns (order, sale, commission), and an "Exporter" button; plus the inline commission preview shown before publishing an article: a small card "Si vous vendez à 50 000 Ar, vous recevrez 47 500 Ar".*

**Tests** : commission affichée = commission prélevée ; aperçu avant publication cohérent avec le barème par catégorie *(F10.2)* ; export complet.

```issues
feature: F4.9
titre: Relevé des commissions prélevées
epic: "04"
phase: P1
prio: S
etapes: [conception, design, backend, frontend]
depend: [F10.1]
```

---

## F4.13 — Historique de tous les mouvements

`P1 · S · moyen`

**Conception** — journal lisible de tous les mouvements du portefeuille : ventes, commissions, remboursements, retraits, crédits d'affiliation. **Dérivé du journal financier**, jamais une table parallèle.

**Backend** — `GET /portefeuille/mouvements?curseur=`, projection lisible depuis `ecriture_financiere`.

**Design** — Prompt Stitch : *wallet movements list with dated rows, each with an icon, a label ("Vente #1042", "Commission JP", "Retrait MVola", "Remboursement #1038"), and a signed amount in green or red; grouped by day with daily subtotals; a filter chip row "Tout · Ventes · Retraits · Remboursements".*

**Tests** : somme des mouvements affichés = solde ; pagination stable ; libellés traduits.

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

## F4.12 — Acompte plus solde à la livraison ⚠️

`P2 · S · cadre`

**Conception** — variante de `F4.3` : un acompte mobile money couvrant au moins les frais de livraison, le solde en espèces à la remise. C'est l'option (c) de la décision sur le paiement à la livraison, et **la plus équilibrée** : elle couvre le coût logistique en cas de refus, tout en gardant la barrière d'entrée basse.

**Impact base de données** — deux `paiement` rattachés à une même commande (`acompte` puis `solde`), `commande.montant_acompte`.

**Point d'attention** — deux paiements sur une commande complexifie le séquestre, le remboursement et la facture. À ne pas ouvrir avant que `F4.3` ait été mesuré au pilote.

```issues
feature: F4.12
titre: Acompte plus solde à la livraison
epic: "04"
phase: P2
prio: S
etapes: [conception, bdd, backend, frontend]
depend: [F4.3]
```

---

*Épique suivante : [EP05-livraison](EP05-livraison.md).*
