# EP11 — Back-office JP

> 11 fonctionnalités · vague 2 · module `exploitation` · application `apps/admin`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).

**Non décrit dans le deck, mais toutes les promesses du produit reposent dessus.** Le séquestre, l'arbitrage, la vérification, la modération : chaque promesse faite à l'acheteuse est une file de travail pour quelqu'un.

**Le back-office est une application web séparée** *(CDC §2.2)*, pas un écran caché de l'application mobile. Les métiers sont différents : comparer une CIN et un selfie, instruire un litige, réconcilier des espèces — ce sont des tâches d'écran large et de clavier.

**Le principe qui gouverne toute l'épique** : chaque file affiche **l'âge de ses éléments** et fait remonter ce qui approche d'un engagement. Une file sans notion d'ancienneté produit des dossiers oubliés, et un dossier oublié est une promesse rompue.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F11.7 | **Tableau de bord des 4 mesures fondatrices** | P1 | M | complet |
| F11.1 | File de vérification des vendeurs | P1 | M | complet |
| F11.3 | Console d'arbitrage des litiges | P1 | M | complet |
| F11.5 | Réconciliation paiements et espèces | P1 | M | complet |
| F11.6 | Paramètres économiques | P1 | M | complet |
| F11.2 | Modération des contenus | P1 | M | moyen |
| F11.4 | Gestion du réseau de points relais | P1 | M | moyen |
| F11.8 | Recherche utilisateur, commande, paiement | P1 | M | moyen |
| F11.9 | Journal d'audit | P1 | S | moyen |
| F11.10 | Gestion des livreurs et des tournées | P1 | S | moyen |
| F11.11 | Notifications de masse | P2 | C | cadre |

---

## F11.7 — Tableau de bord des quatre mesures fondatrices

`P1 · M · complet` — **Règles** R-O2, exigence contractuelle · **À livrer avant le premier direct du pilote**

### 1. Conception

**Ce n'est pas un tableau de bord d'analyse, c'est l'instrument de mesure du projet** *(R-O2)*. Il doit exister **dès le premier direct**, sinon l'objectif de mesure n'est pas atteint et le pilote ne prouve rien.

**Les quatre mesures fondatrices** :

| # | Mesure | Source |
|---|---|---|
| 1 | **Commandes annoncées en direct jamais conclues** | réservations expirées et abandons en direct |
| 2 | **Temps administratif par heure de direct** | temps entre fin de direct et dernière expédition |
| 3 | **Acheteuses ayant abandonné à l'étape paiement** | `paiement_abandonne` + étape *(CDC §11)* |
| 4 | **Stock immobilisé par des réservations expirées** | somme des montants des réservations expirées |

**Plus les hypothèses à valider** : taux de conversion, panier moyen, répartition domicile/relais, taux de litige, coût d'acquisition, **part du chiffre d'affaires hors direct** *(R-H2, nouveau)*, **taux de refus au paiement à la livraison** *(F4.3)*, **taux de production d'unboxings** *(F14.7)*.

**Le point de conception** : ces mesures ne se calculent pas après coup. Elles supposent que les **événements d'usage soient instrumentés dès le premier jour** *(CDC §11)*. C'est pourquoi cette fonctionnalité est en tête de l'épique : elle définit ce que les autres modules doivent émettre.

### 2. Structure de code

```
apps/api/src/modules/exploitation/
├─ mesures.ts        les 4 mesures fondatrices, définitions figées
├─ hypotheses.ts     les indicateurs secondaires
├─ evenements.ts     réception et stockage des événements d'usage
├─ routes.ts         GET /admin/indicateurs
└─ mesures.test.ts   ← cas de référence pour chaque mesure
apps/api/src/jobs/agregatsQuotidiens.ts
apps/admin/src/pages/indicateurs/{Fondatrices,Hypotheses,ParOrigine}.tsx
```

`mesures.ts` porte une **définition écrite** de chaque mesure en commentaire. Une mesure dont la définition dérive en cours de pilote ne mesure plus rien.

### 3. Base de données

Migration `..._f11_7_mesures` :

```
evenement_usage
  id PK · type · utilisateur_id null · donnees jsonb · horodatage
  IDX(type, horodatage)
  -- append only, purgé après agrégation (rétention 90 j)

agregat_quotidien
  jour PK · mesure PK · valeur numeric · denominateur numeric null
  PK(jour, mesure)
```

Les mesures sont **agrégées quotidiennement** et non recalculées à chaque affichage : le tableau de bord doit s'ouvrir instantanément, y compris au pic.

### 4. Design

**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :

```
Screen — admin dashboard, "Les quatre mesures" (desktop web, data-dense but calm).
Top: a period selector "7 jours · 30 jours · Depuis le lancement" and a
last-updated line.
A 2x2 grid of four large measure cards, each with: the measure name, a very large
current value, a small sparkline of the last 14 days, a delta chip versus the
previous period (green or red), and a one-line plain-language definition in muted
text. The four cards read:
1. "Ventes annoncées jamais conclues" — "12 %" — "Réservations expirées ou
paiements abandonnés en direct".
2. "Temps administratif par heure de direct" — "38 min" — "Entre la fin du direct
et la dernière expédition".
3. "Abandons à l'étape paiement" — "8 %" — "Ont ouvert le paiement sans le
terminer".
4. "Stock immobilisé" — "340 000 Ar" — "Valeur des réservations expirées en cours".
Below the grid, a secondary section "Hypothèses à valider" as a compact table with
rows: Taux de conversion, Panier moyen, Domicile / Relais, Taux de litige, Part du
CA hors direct, Refus au paiement à la livraison, Production d'unboxings — each
with the current value, the hypothesis stated at launch, and a status chip
"Confirmée / À surveiller / Infirmée".
Use a restrained palette: this screen is read every morning, it must not shout.
```

### 5. Backend

`GET /admin/indicateurs?periode=` — les quatre mesures et les hypothèses. `POST /evenements-usage` (interne, depuis les clients, par lots).

**Tests** : chaque mesure vérifiée sur un **jeu de données de référence** avec le résultat attendu calculé à la main ; agrégation quotidienne idempotente ; les événements d'usage ne bloquent jamais un parcours (envoi asynchrone, échec silencieux côté client) ; purge après 90 jours sans perte d'agrégat.

### 6. Frontend

`apps/admin` : quatre cartes, une définition visible sous chaque chiffre. La définition affichée en permanence est ce qui empêche les interprétations divergentes en réunion.

```issues
feature: F11.7
titre: Tableau de bord des 4 mesures fondatrices
epic: "11"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: []
```

---

## F11.5 — Réconciliation des paiements et des encaissements espèces

`P1 · M · complet` — **Règles** R-O3 · **Contrainte C4** · **Recette RB2**

### 1. Conception

**OP** rapproche **quotidiennement** : paiements opérateurs, encours séquestré, retraits vendeurs, commissions, et **espèces collectées par les livreurs et les relais** *(F4.3)*. Les écarts sont signalés.

**C'est l'exigence la plus lourde de l'épique, et elle n'est pas négociable** : JP conserve l'argent d'autrui *(C4)*. Un écart non détecté aujourd'hui est un trou dans la caisse dans trois mois, et un risque réglementaire.

**Trois rapprochements distincts** :
1. **Opérateurs** — relevé du prestataire contre `paiement` confirmés. Écart typique : un paiement confirmé chez l'opérateur et resté `en_attente` chez JP (webhook perdu).
2. **Séquestre** — encours théorique (somme du journal) contre encours attendu (commandes payées non confirmées). Écart typique : une libération sans écriture inverse.
3. **Espèces** — montants encaissés par les porteurs contre montants reversés. Écart typique : un livreur en retard de versement, ou un montant encaissé différent du montant dû.

**Les espèces sont le rapprochement le plus risqué** : il n'y a pas de trace électronique à la source, seulement une saisie humaine. D'où la photo de preuve *(F5.5)* et la comparaison systématique `montant_a_encaisser` contre `montant_encaisse`.

### 2. Structure de code

```
apps/api/src/modules/exploitation/
├─ reconciliation.ts        les trois rapprochements
├─ ecarts.ts                détection, classement, suivi de résolution
├─ imports/relevesOperateur.ts
└─ reconciliation.test.ts
apps/api/src/jobs/reconciliationQuotidienne.ts
apps/admin/src/pages/finance/{Reconciliation,Ecarts,Especes}.tsx
```

### 3. Base de données

Migration `..._f11_5_reconciliation` :

```
reconciliation
  id PK · jour · type(operateur|sequestre|especes)
  montant_attendu · montant_constate · ecart
  statut(equilibree|ecart_detecte|resolue) · executee_le

ecart
  id PK · reconciliation_id FK · reference · montant · nature
  statut(ouvert|en_analyse|resolu) · resolution_texte · resolu_par_id
  IDX(statut, montant DESC)
```

Un écart n'est **jamais** corrigé en modifiant une écriture *(C4)* : sa résolution produit une écriture inverse et un texte d'explication.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen 1 — admin "Réconciliation du jour" (desktop).
Top: a date selector and a global status banner — green "Équilibrée" or red
"3 écarts détectés — 47 500 Ar".
Three reconciliation cards side by side, each with a title ("Opérateurs",
"Séquestre", "Espèces"), an expected amount, an observed amount, a difference in
large type (green zero or red value), and a status icon.
Below, a table of discrepancies with columns Référence, Nature, Montant, Âge,
Statut, and an action column; rows sorted by amount descending, with red chips on
items older than 48 h. Nature values read like "Webhook non reçu — paiement
confirmé chez MVola", "Libération sans écriture inverse", "Espèces non reversées
— Rado, livreur".
A right-side panel for the selected discrepancy: the full ledger extract, the
related order, and a resolution form with a required explanation field and a
button "Résoudre par écriture inverse".

Screen 2 — "Espèces à collecter" table: rows per courier and relay with Porteur,
Colis remis, Encaissé, Reversé, Solde dû, Dernier versement, Âge du solde; amber
rows past 3 days, red past 7; a total row; and a "Enregistrer un versement"
action per row.
```

### 5. Backend

`POST /admin/reconciliations/executer` · `GET /admin/reconciliations?jour=` · `GET /admin/ecarts` · `POST /admin/ecarts/:id/resolution`.

Travail quotidien, avec **alerte** si un écart dépasse un seuil ou dure plus de 48 h *(CDC §11)*.

**Tests** : les trois rapprochements sur des jeux équilibrés → écart nul ; webhook manquant simulé → écart détecté et nommé ; libération sans écriture inverse → détectée ; espèces non reversées → solde dû exact ; résolution → **écriture inverse**, jamais de modification ; **réconciliation à 100 %** sur 1 000 commandes tous chemins confondus *(RB2)*.

### 6. Frontend

Tableau dense mais lisible, tri par montant, âge visible. L'écran est consulté chaque matin : la première information doit être « est-ce que c'est équilibré ? », en un coup d'œil.

```issues
feature: F11.5
titre: Réconciliation des paiements et des encaissements espèces
epic: "11"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F4.4, F4.3]
```

---

## F11.1 — File de vérification des vendeurs

`P1 · M · complet` — **Règles** R-V1 à R-V6 · **Voir** F0.6

### 1. Conception

**OP** : file d'attente → compare **CIN / selfie / titulaire du compte mobile money** *(R-V2)* → valide, refuse, ou demande une pièce → notification au vendeur.

**Le refus doit être motivé et indiquer précisément ce qui manque** *(R-V3)*. Un refus vague produit une nouvelle soumission identique, donc deux fois le travail.

**Un délai cible est affiché au vendeur** *(R-V4)* : la file doit donc être dimensionnée et son âge surveillé. Une file de vérification en retard bloque des encaissements, donc des ventes, donc la croissance.

**Accès aux documents journalisé** *(R-V5, N3.1)* : chaque consultation d'une pièce d'identité laisse une trace nominative. C'est une exigence de protection des personnes, et une protection de l'équipe.

### 2. Structure de code

```
apps/api/src/modules/identite/verification.ts    (F0.6)
apps/api/src/modules/exploitation/fileVerification.ts
apps/admin/src/pages/verifications/{File,Dossier}.tsx
```

### 3. Base de données

`demande_verification` *(F0.6)*, index `(statut, cree_le)`. `journal_audit` pour chaque accès document.

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen — admin KYC review, side-by-side comparison (desktop).
Left column: the three uploaded documents as large viewable images — CIN recto,
CIN verso, selfie — each with a zoom control and a "Consulté" audit note.
Right column: a form-like comparison panel with rows showing the declared values
and empty check circles for the reviewer to tick: "Nom sur la pièce : RAKOTO
Miora", "Nom du compte Mobile Money : RAKOTO Miora" with a green "Concordance"
chip, "Date de naissance : 12/04/1998" with an age line "28 ans — majeure",
"Adresse d'enlèvement : Analamahitsy", "Nom de boutique : Miora Boutique".
Bottom action bar: three buttons — green "Valider", amber "Demander une pièce"
(opening a checklist of what is missing), red "Refuser" (opening a required
reason field with quick-pick reasons "Photo illisible", "Noms discordants",
"Pièce expirée", "Mineur").
A header chip shows the queue age: "Dossier reçu il y a 14 h — engagement 24 h".
```

### 5. Backend

`GET /admin/verifications?statut=` · `GET /admin/verifications/:id` (journalise l'accès) · `POST /admin/verifications/:id/decision`.

**Tests** : file par ancienneté ; consultation d'un document → entrée d'audit nominative ; refus sans motif → rejeté ; discordance de noms → refus ; mineur → refus définitif *(RB6)* ; validation → encaissement débloqué *(F0.6)* ; demande de pièce → statut intermédiaire et notification.

### 6. Frontend

Comparaison côte à côte, cases à cocher pour forcer l'examen de chaque point. Un écran qui permet de valider en un clic sans regarder produit des validations sans examen.

```issues
feature: F11.1
titre: File de vérification des vendeurs
epic: "11"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F0.6]
```

---

## F11.3 — Console d'arbitrage des litiges

`P1 · M · complet` — **Recette RB4** · **Voir** F6.5

**Conception** — file par âge, urgents en tête, **dossier d'instruction assemblé** *(F6.5 §2)* : historique de livraison, preuve de remise, extrait du journal financier, transcription du fil, historique des deux parties. Décision motivée obligatoire, exécution automatique.

**Le dossier assemblé est ce qui rend l'arbitrage possible en quelques minutes** plutôt qu'en une demi-heure de navigation. C'est la différence entre un engagement de 48 h tenable et un engagement décoratif.

**Structure, base de données, design, backend** — mutualisés avec [F6.5](EP06-confiance.md#f63--f64--f65--f66--le-litige-de-louverture-à-la-décision). Ce mini-plan couvre la **console** : file, tri, affectation, suivi des engagements, statistiques de traitement.

**Ajouts propres à la console** : affectation d'un dossier à un opérateur (pour éviter que deux personnes instruisent le même), compteur de dossiers approchant l'engagement, statistiques de délai moyen et de répartition des décisions.

**Tests** : file triée par âge ; affectation exclusive ; alerte à l'approche de l'engagement ; **100 % des dossiers clos avec décision écrite** *(RB4)* ; statistiques de délai exactes.

```issues
feature: F11.3
titre: Console d'arbitrage des litiges
epic: "11"
phase: P1
prio: M
etapes: [conception, design, backend, frontend]
depend: [F6.5]
```

---

## F11.6 — Paramètres : commissions, frais, durées, délais

`P1 · M · complet` — **Règles** R-O1

### 1. Conception

**Tous les paramètres économiques doivent être modifiables sans nouvelle livraison logicielle** *(R-O1)*, avec **double validation et journalisation**.

Ce n'est pas un confort : le pilote va faire varier la durée de réservation, le taux de commission, le délai de libération. Si chaque essai demande un déploiement, aucun essai n'aura lieu.

**Liste des paramètres** *(CDC §3.11)* — réservation (direct, catalogue), délai d'acceptation vendeur (direct, catalogue), délai de libération automatique, taux de commission par catégorie, crédit d'unboxing, fenêtre d'affiliation, délai de garde relais, plafonds de notification, seuils de bascule particulier, poids du score de rang, TTL et limites de l'OTP, frais de livraison par zone, éligibilité du paiement à la livraison.

**Double validation** : un paramètre économique est proposé par un opérateur et confirmé par un second. Une erreur de saisie sur un taux de commission est une erreur à quatre chiffres.

**Garde-fous par paramètre** : bornes minimale et maximale codées. Une durée de réservation à 0 seconde ou une commission à 90 % doivent être **impossibles à saisir**, pas seulement déconseillées.

### 2. Structure de code

```
apps/api/src/modules/exploitation/
├─ parametres.ts       lecture avec cache, écriture avec double validation
├─ bornes.ts           ← min/max par paramètre, refus hors bornes
├─ routes.ts
└─ parametres.test.ts
apps/admin/src/pages/parametres/{Liste,Modification,Historique}.tsx
```

Tous les modules lisent les paramètres via `parametres.ts`, **jamais une constante en dur**. Une règle de lint interdit les nombres magiques dans les services concernés.

### 3. Base de données

`parametre (cle PK, valeur, type, modifie_par_id, modifie_le)` *(CDC §3.11)* plus :

```
parametre_modification
  id PK · cle · ancienne_valeur · nouvelle_valeur
  propose_par_id · confirme_par_id null · statut(proposee|appliquee|rejetee)
  motif · cree_le · applique_le null
```

### 4. Design

**Prompt Stitch** — préambule commun, puis :

```
Screen — admin "Paramètres économiques" (desktop).
A grouped table with sections "Réservation", "Commissions", "Séquestre",
"Notifications", "Livraison", "Authentification". Each row shows: the parameter
label in plain language ("Durée de réservation en direct"), the current value
("5 minutes"), the allowed range in muted text ("entre 2 et 15 minutes"), the last
change ("modifié le 12 août par Naina"), and an "Modifier" link.
Clicking Modifier opens a side panel: the current value, a new-value input with
inline range validation, a required "Motif du changement" field, an impact warning
card where relevant ("Cette valeur affecte les réservations créées après
l'enregistrement, pas celles en cours"), and a primary button "Proposer la
modification" with a muted line "Un second opérateur devra confirmer."
A separate section at the top shows pending changes awaiting confirmation, each
with "Confirmer" and "Rejeter" buttons and the name of the proposer.
```

### 5. Backend

`GET /admin/parametres` · `POST /admin/parametres/:cle/proposition` · `POST /admin/parametres/modifications/:id/confirmation` · `GET /admin/parametres/:cle/historique`.

**Tests** : valeur hors bornes → refusée ; modification sans confirmation → non appliquée ; confirmation par le **même** opérateur → refusée ; application → journal d'audit ; cache invalidé immédiatement ; **une modification de durée de réservation n'affecte pas les réservations en cours** *(F1.16)*.

### 6. Frontend

Libellés en langage clair, bornes affichées, avertissement d'impact. L'historique par paramètre est ce qui permet de comprendre, trois mois plus tard, pourquoi la durée est à 8 minutes.

```issues
feature: F11.6
titre: Paramètres commissions, frais, durées, délais
epic: "11"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: []
```

---

## F11.2 — Modération des contenus et des directs

`P1 · M · moyen` — **Voir** EP19

**Conception** — file de modération, **urgence en tête** *(R-X4)*, contenus retirés, sanctions. Détail complet en `F19.7`.

**Spécificité des directs** : un signalement sur un direct en cours demande une intervention **immédiate** — la possibilité de couper une diffusion. C'est la seule action du back-office qui doit être disponible en quelques secondes.

**Base de données** — `signalement` *(CDC §3.10)*, index `(niveau, statut, cree_le)`.

**Backend** — `GET /admin/signalements`, `POST /admin/contenus/:id/retrait`, `POST /admin/directs/:id/couper`.

**Design** — Prompt Stitch : *admin moderation queue with a red "Urgences (2)" section pinned at the top showing report reason, reporter, content preview and elapsed time with a red chip "il y a 8 min · engagement 2 h"; then the normal queue; a content review panel with the media, the author's history, previous reports, and four action buttons "Laisser", "Retirer", "Avertir", "Suspendre"; plus a distinct red "Couper le direct" button visible only for live content, with a confirmation modal.*

**Tests** : urgence en tête ; coupure d'un direct effective en moins de 5 s ; décision motivée notifiée à l'auteur et au signalant *(R-X6)* ; historique de l'auteur visible.

```issues
feature: F11.2
titre: Modération des contenus et des directs
epic: "11"
phase: P1
prio: M
etapes: [conception, design, backend, frontend]
depend: [F19.7]
```

---

## F11.4 — Gestion du réseau de points relais

`P1 · M · moyen`

**Conception** — création et gestion des relais : fiche, horaires, photo de devanture, **capacité**, délai de garde, statut actif/inactif, contrat et versements *(F11.5)*.

**La capacité est le paramètre qu'on oublie** : une épicerie ne peut pas stocker 200 colis. Sans plafond, le réseau se bloque physiquement et les colis repartent.

**Base de données** — `point_relais` *(CDC §3.4)* plus `capacite_max`, `nb_colis_en_stock` (dénormalisé).

**Backend** — `GET/POST/PATCH /admin/relais`, désactivation d'un relais **sans** casser les colis en cours (ils restent retirables, il disparaît seulement de la liste de choix).

**Design** — Prompt Stitch : *admin relay management table with columns Nom, Quartier, Colis en stock / capacité (with a fill bar), Horaires, Délai de garde, Solde espèces dû, Statut; a form panel for creating a relay with a photo upload, a map point picker, opening-hours rows per day, and a capacity field with a helper "Au-delà, le relais n'apparaîtra plus dans les choix"; plus a deactivation modal warning "3 colis sont encore en stock — ils resteront retirables".*

**Tests** : relais au-delà de sa capacité absent des choix *(F3.4)* mais toujours opérationnel ; désactivation → absent des choix, colis en cours intacts ; compteur de stock exact.

```issues
feature: F11.4
titre: Gestion du réseau de points relais
epic: "11"
phase: P1
prio: M
etapes: [conception, bdd, design, backend, frontend]
depend: [F5.3]
```

---

## F11.8 — Recherche d'un utilisateur, d'une commande, d'un paiement

`P1 · M · moyen`

**Conception** — la fonctionnalité la plus utilisée du back-office. Recherche unifiée : numéro de commande, adresse électronique, numéro de téléphone, nom de boutique, référence de paiement, numéro de dossier.

**Accès journalisé** *(N3.4)* : consulter la fiche d'un utilisateur est une consultation de données personnelles.

**Backend** — `GET /admin/recherche?q=` — détection du type de requête, résultats groupés par type.

**Design** — Prompt Stitch : *admin global search with a single prominent search field and a hint row "Numéro de commande, email, téléphone, boutique, référence de paiement"; results grouped in sections with type icons; a result detail panel for a user showing account, orders, wallet, disputes, sanctions and a right-hand "Actions" column, plus a muted footer "Cette consultation est enregistrée".*

**Tests** : chaque type de requête trouve sa cible ; consultation journalisée avec l'opérateur ; aucune donnée sensible (document d'identité) affichée sans accès explicite et journalisé séparément.

```issues
feature: F11.8
titre: Recherche d'un utilisateur, d'une commande, d'un paiement
epic: "11"
phase: P1
prio: M
etapes: [conception, design, backend, frontend]
depend: []
```

---

## F11.9 — Journal d'audit de toutes les actions du back-office

`P1 · S · moyen` — **Règles** R-O4, N3.4

**Conception** — **append only**, inaltérable : acteur, action, cible, avant/après, adresse IP, horodatage. Consultable et filtrable.

C'est autant une protection de l'équipe qu'un contrôle : en cas de contestation d'une décision, la trace protège l'opérateur qui a bien fait son travail.

**Base de données** — `journal_audit` *(CDC §3.11)*, avec `REVOKE UPDATE, DELETE` comme pour le journal financier.

**Backend** — écriture par intercepteur sur toutes les routes `/admin/*`, jamais appelée à la main (sinon elle sera oubliée). `GET /admin/audit?acteur=&cible=&periode=`.

**Design** — Prompt Stitch : *admin audit log table with columns Horodatage, Acteur, Action, Cible, IP, and an expandable diff view showing before/after values as two columns with changed fields highlighted; filters for actor, action type, target type and date range.*

**Tests** : **toute** route admin produit une entrée (test paramétré sur la liste des routes) ; tentative de modification → rejetée par la base ; diff avant/après correct ; filtres.

```issues
feature: F11.9
titre: Journal d'audit des actions du back-office
epic: "11"
phase: P1
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: []
```

---

## F11.10 — Gestion des livreurs et des tournées

`P1 · S · moyen`

**Conception** — création des livreurs, affectation de zones, composition et suivi des tournées, soldes d'espèces dus *(F11.5)*, performance (taux d'échec, délai moyen).

**Base de données** — `livreur`, `tournee`, `tournee_point` *(F5.5)*.

**Backend** — `GET/POST /admin/livreurs`, `POST /admin/tournees` (composition manuelle ou automatique par zone), `GET /admin/tournees/:id/suivi`.

**Design** — Prompt Stitch : *admin tours screen with a left list of couriers showing avatar, name, zone, today's progress ring "7/18" and cash balance chip; a main panel showing the selected tour as an ordered list of stops with types, statuses and timestamps; and a composition mode allowing drag-to-reorder stops with an "Optimiser par zone" button.*

**Tests** : composition de tournée ; réaffectation d'un colis ; suivi temps réel ; solde d'espèces par livreur exact ; taux d'échec par livreur.

```issues
feature: F11.10
titre: Gestion des livreurs et des tournées
epic: "11"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F5.5]
```

---

## F11.11 — Envoi de notifications de masse

`P2 · C · cadre`

**Conception** — message à un segment (tous, une ville, les vendeurs, les acheteuses inactives). **Soumis aux mêmes plafonds** que le reste *(R-U4)* : le back-office n'a pas le droit de contourner le budget d'attention qu'on impose aux vendeurs.

**Impact base de données** — `campagne_notification (id, segment jsonb, titre, corps, statut, nb_destinataires, envoye_le)`.

**Point d'attention** — une notification de masse mal calibrée peut faire couper les notifications à des milliers de personnes en une soirée, et détruire le canal du code de retrait. Prévoir une **prévisualisation du nombre de destinataires** et une double validation, comme pour les paramètres économiques.

```issues
feature: F11.11
titre: Envoi de notifications de masse
epic: "11"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F7.3]
```

---

*Épique suivante : [EP13-socle](EP13-socle.md).*
