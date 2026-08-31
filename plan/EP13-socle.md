# EP13 — Socle technique et non fonctionnel

> 10 exigences · vague 2 · transverses à tous les modules.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md).

**Ce ne sont pas des fonctionnalités visibles, mais des conditions de survie sur ce marché.** Un produit techniquement correct et inutilisable sur un Tecno Spark avec 300 Ko/s ne sert à rien.

**Particularité de cette épique** : ses exigences ne se « livrent » pas une fois, elles se **tiennent en permanence**. Chaque mini-plan définit donc un **budget mesurable** et le **test qui le vérifie**, à rejouer avant chaque mise en production. Une exigence non fonctionnelle sans chiffre est un vœu.

| ID | Exigence | Phase | Prio | Détail |
|---|---|---|---|---|
| F13.1 | Android bas de gamme, APK léger | P1 | M | complet |
| F13.2 | Connexions lentes et intermittentes | P1 | M | complet |
| F13.3 | Push + **repli SMS** | P1 | M | complet |
| F13.4 | Bilingue mg / fr, montants en Ariary | P1 | M | complet |
| F13.6 | Chiffrement des pièces d'identité, accès tracés | P1 | M | complet |
| F13.7 | Conformité à la loi malgache | P1 | M | complet |
| F13.8 | Journalisation des transactions | P1 | M | complet |
| F13.9 | Mesure d'usage dès le premier jour | P1 | M | complet |
| F13.5 | Consultation hors ligne | P1 | S | moyen |
| F13.10 | Version web légère | P2 | S | moyen |

---

## F13.1 — Fonctionnement sur Android bas de gamme, APK léger

`P1 · M · complet` — **Contrainte C1** · **⚠️ décision J0 : appareil de référence et plafond de poids**

### 1. Conception

**L'appareil de référence doit être choisi en J0 et acheté**, pas imaginé. Recommandation : un appareil réellement répandu localement, autour de 2 Go de mémoire, Android 10, écran de 5 à 6 pouces. C'est sur lui que la recette se fait — pas sur un émulateur, et surtout pas sur le téléphone d'un développeur.

**Le risque assumé de React Native** *(PLAN_SOCLE §1)* : le poids de l'APK et l'empreinte mémoire sont moins maîtrisés qu'en natif. La réponse n'est pas de changer de pile, c'est de **mesurer à chaque livraison** et de traiter le dépassement comme un défaut bloquant.

**Budgets à tenir comme des contraintes de recette** *(CDC §10.1)* :

| Élément | Budget | Vérification |
|---|---|---|
| Poids de l'APK | ⚠️ à fixer en J0 — proposition : 25 Mo | mesure automatique en intégration continue |
| Mémoire au défilement du fil | pas de dépassement, pas de saccade | profilage sur l'appareil de référence |
| Démarrage à froid | < 3 s sur l'appareil de référence | mesure automatisée |
| Images de liste | miniature dimensionnée serveur, jamais l'originale | assertion sur les URL renvoyées |
| Lecteurs vidéo hors écran | **libérés** | profilage mémoire au défilement des clips |

### 2. Structure de code

```
scripts/mesure-apk.mjs              taille par livraison, seuil bloquant
scripts/profil-memoire.md           procédure de profilage manuel
apps/mobile/src/noyau/images.ts      demande de dimensions, jamais l'original
apps/mobile/src/noyau/listes.ts      recyclage, fenêtre de rendu
.github/workflows/budget.yml         échec de la CI si le budget est dépassé
```

### 3. Base de données

Sans objet. Côté serveur : génération de trois tailles d'image *(F1.1)* et refus de servir une image pleine résolution depuis un point d'entrée de liste.

### 4. Design

Contrainte transverse portée par `packages/ui` : deux graisses, trois tailles, animations minimales, pas de dégradé lourd, pas d'ombre coûteuse *(PLAN_SOCLE §7)*.

**Prompt Stitch** — préambule commun, puis :
```
Reference sheet — "Low-end device constraints" as a documentation frame.
Show the same product feed screen twice, side by side, labelled "Correct" and
"À éviter". The correct version: flat cards, one image each with a visible
low-resolution placeholder on one card, two font weights, a single accent color,
no shadows. The wrong version: heavy gradients, blurred glass panels, four font
weights, multiple large images per card, decorative shadows — annotated with small
red callouts explaining the cost ("dégradé = repaint coûteux", "verre dépoli =
GPU", "4 images par carte = 4 requêtes").
```

### 5. Backend

Aucune fonctionnalité. Une règle : **aucune réponse ne renvoie de champ non utilisé par l'écran appelant** *(CDC §6.2)*, vérifiée par revue des projections.

**Tests** : taille de l'APK sous le seuil, en CI ; démarrage à froid mesuré ; aucune URL d'image pleine résolution dans une réponse de liste ; profilage mémoire au défilement de 200 éléments sans croissance continue.

### 6. Frontend

Listes recyclées partout, jamais de `map` sur une liste longue. Libération des lecteurs vidéo hors écran — c'est la première cause de plantage sur les fils de clips.

```issues
feature: F13.1
titre: Fonctionnement sur Android bas de gamme, APK léger
epic: "13"
phase: P1
prio: M
etapes: [conception, squelette, design, backend, frontend]
depend: []
```

---

## F13.2 — Tolérance aux connexions lentes et intermittentes

`P1 · M · complet` — **Contrainte C2**

### 1. Conception

**Le réseau n'est pas une exception, c'est le cas normal.** Trois comportements obligatoires :

1. **Pagination stricte par curseur**, taille de page réduite *(CDC §6.2)*.
2. **Reprise automatique** : toute requête interrompue est rejouable, et les écritures financières sont idempotentes *(R-M2)*.
3. **File d'actions hors ligne** pour les gestes qui n'exigent pas de réponse immédiate : suivre *(F7.1)*, réactions, actions de tournée *(F5.5)*.

**Ce qui ne doit jamais arriver** : un écran figé sans explication, une requête qui échoue après 60 s de silence, un geste perdu parce que le réseau a coupé au mauvais moment.

**Budget** *(CDC §10.1)* : le fil renvoie une charge utile minimale, un seul contenu préchargé en mode économie *(F0.9)*, et « Je prends » → confirmation tient sous 30 s bout en bout, réseau réel compris.

### 2. Structure de code

```
apps/mobile/src/noyau/
├─ clientApi.ts        temps d'attente courts, reprises avec recul exponentiel
├─ fileHorsLigne.ts    file persistée, clés d'idempotence locales
├─ cache.ts            cache par écran, invalidation ciblée
└─ etatReseau.ts       détection, bandeau, bascule mode économie
```

### 3. Base de données

Côté serveur : index qui rendent la pagination par curseur stable sous insertion (clé de tri composite `(cree_le, id)` et non `cree_le` seul — sinon deux éléments à la même seconde produisent des doublons ou des trous).

### 4. Design

Chaque écran a ses **quatre états** *(PLAN_SOCLE §7)*, dont l'état hors ligne.

**Prompt Stitch** — préambule commun, puis :
```
Reference sheet — offline and slow-network states.
Frame 1: a slim persistent top banner in amber reading "Connexion perdue — vos
actions seront envoyées plus tard" with a small cloud-off icon.
Frame 2: the same banner in green, transient: "3 actions envoyées".
Frame 3: a feed in a degraded state — content from cache with a muted header chip
"Affiché depuis votre téléphone · dernière mise à jour il y a 12 min" and a
"Actualiser" link.
Frame 4: a blocked action state — the "Je prends" button replaced by a disabled
button reading "Connexion requise pour réserver" with an explanatory line, never
a silent failure.
Frame 5: a retry state on a failed request — an inline row with a warning icon,
"Impossible de charger", and a "Réessayer" link, positioned exactly where the
content would have been.
```

### 5. Backend

Curseurs partout, temps d'attente serveur bornés, réponses compressées, `ETag` sur les ressources stables (catégories, relais, guides de tailles).

**Tests** : pagination stable sous insertion concurrente ; requête interrompue rejouée → **aucun effet double** ; file hors ligne de 50 actions synchronisée sans doublon ; « Je prends » → confirmation sous 30 s sur profil réseau dégradé simulé (300 Ko/s, 400 ms de latence, 2 % de perte).

### 6. Frontend

Aucun écran ne peut être **sans issue** : chaque erreur réseau propose une action. Les états hors ligne sont testés avec le réseau réellement coupé, pas simulé.

```issues
feature: F13.2
titre: Tolérance aux connexions lentes et intermittentes
epic: "13"
phase: P1
prio: M
etapes: [conception, squelette, design, backend, frontend]
depend: []
```

---

## F13.3 — Notifications push et repli SMS

`P1 · M · complet` — **⚠️ décision J0 : fournisseur SMS et coût par message**

### 1. Conception

**Le push ne suffit pas** sur des téléphones d'entrée de gamme et des connexions intermittentes. Pour les messages critiques, un repli SMS est obligatoire :

| Message | Push | SMS |
|---|---|---|
| Colis arrivé au relais | ✔ | **✔ obligatoire** |
| Code de retrait | ✔ | **✔ obligatoire** |
| Réservation qui expire | ✔ | — |
| Décision de litige | ✔ | **✔** |
| Promotion, direct, événement | ✔ | **jamais** |

**Le SMS coûte.** C'est pourquoi il est réservé à ce qui est irremplaçable : sans le code de retrait, l'acheteuse ne récupère pas son colis, et toute la chaîne s'arrête. C'est aussi la raison pour laquelle l'authentification est passée au courriel *(F0.1)* — pour préserver ce budget.

**Règle de déclenchement** : le SMS part si le push n'est pas confirmé lu dans un délai court, **ou immédiatement** pour le code de retrait (on ne fait pas attendre quelqu'un qui est devant l'épicerie).

### 2. Structure de code

```
apps/api/src/modules/notification/
├─ canaux/push.ts · canaux/sms.ts · canaux/email.ts
├─ FournisseurSms.ts     ← interface, coût journalisé par message
├─ repli.ts              règle de bascule push → SMS
└─ repli.test.ts
apps/api/src/jobs/repliSms.ts
```

### 3. Base de données

`notification.canal`, `notification.lu_le`, `notification_sms (notification_id, msisdn, cout, statut, reference_externe)`.

Le coût par message est **journalisé** : c'est une ligne de dépense qui doit être suivie, pas découverte sur une facture.

### 4. Design

Réglages de notification *(F7.3)* avec les critiques **non désactivables et expliquées**.

**Prompt Stitch** — préambule commun, puis :
```
Frame 1 — the retrieval code as an SMS, shown as a plain Android SMS thread
bubble from "JP": "JP : votre colis est arrive a Epicerie Tsara,
Analamahitsy. Code de retrait : 482913. A retirer avant le 21/08."
(Plain ASCII, no accents, under 160 characters — SMS constraints.)
Frame 2 — the same information as a push notification card, richer, with the shop
name and an action chip "Voir le code".
Frame 3 — a settings section "Messages importants" listing two locked rows with
padlock icons ("Colis arrivé", "Code de retrait") and the explanatory line
"Toujours activés, par SMS aussi — vous en avez besoin pour récupérer vos colis."
```

### 5. Backend

`notification.envoyer()` choisit le canal selon le type et applique le repli. Les libellés SMS sont **contraints** : ASCII sans accents, moins de 160 caractères — au-delà, le message est facturé double et parfois tronqué.

**Tests** : code de retrait → SMS **immédiat** ; colis arrivé → push puis SMS si non lu ; promotion → **jamais de SMS** ; libellé SMS sous 160 caractères et sans accent (test paramétré sur tous les gabarits) ; coût journalisé ; échec du fournisseur → journalisé, pas de boucle de rejeu.

### 6. Frontend

Réception et affichage du push, ouverture ciblée. Le code de retrait est **mis en cache localement** dès réception *(F13.5)*.

```issues
feature: F13.3
titre: Notifications push et repli SMS
epic: "13"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F7.3]
```

---

## F13.4 — Interface bilingue malgache / français, montants en Ariary

`P1 · M · complet` — **Règles** R-… bilingue

### 1. Conception

**Intégralement bilingue** : interface, notifications, courriels, messages d'erreur, factures. **Le malgache par défaut**, avec détection de la langue de l'appareil au premier lancement.

**La contrainte de conception permanente** : les libellés malgaches sont environ **30 % plus longs**. Aucun bouton, onglet ou étiquette ne doit tronquer. C'est un point de recette visuelle sur chaque écran, à vérifier systématiquement — pas une découverte à la fin.

**Montants** : entiers en Ariary, format `50 000 Ar` avec espace insécable, **jamais de décimale**, **aucun flottant** nulle part *(CDC §6.2)*.

**Les messages d'erreur sont traduits côté serveur** à partir d'un code stable : le client affiche ce qu'il reçoit, il ne traduit pas des codes qu'il ne connaît pas forcément (compatibilité ascendante — le parc ne se met pas à jour vite).

### 2. Structure de code

```
packages/i18n/
├─ src/mg.ts · src/fr.ts          catalogues complets
├─ src/formats.ts                 montants, dates, nombres
└─ src/verification.test.ts       ← clés manquantes, longueurs excessives
packages/money/src/format.ts      format Ariary, une seule implémentation
apps/api/src/plateforme/erreurs.ts  code stable → message mg/fr
```

### 3. Base de données

`utilisateur.langue`. Les contenus éditoriaux bilingues (catégories, événements, guides) portent deux colonnes `_mg` et `_fr`.

### 4. Design

**Prompt Stitch** — préambule commun, puis :
```
Reference sheet — bilingual layout stress test.
Show the same three screens twice, side by side, in French and in Malagasy, with
the Malagasy labels deliberately being the longest realistic translations:
(1) the buy sheet with its two buttons ("Payer 55 000 Ar" / "Ajouter au panier et
continuer" and their Malagasy equivalents), (2) a bottom tab bar with five labels,
(3) a settings row list.
Annotate any place where the Malagasy label would overflow with a red callout and
show the accepted solution (two-line button, smaller label, icon-only tab).
All amounts formatted as "50 000 Ar" with a non-breaking space, never "50000Ar"
and never with decimals.
```

### 5. Backend

Messages d'erreur traduits, notifications et courriels dans la langue de l'utilisateur, factures dans sa langue.

**Tests** : **aucune clé manquante** dans l'un des deux catalogues (test automatique comparant les deux) ; aucun libellé dépassant la longueur maximale par contexte ; format de montant identique partout (une seule fonction) ; aucun flottant dans les schémas Zod de montants (assertion sur les types) ; notification envoyée dans la langue de l'utilisateur et non celle du serveur.

### 6. Frontend

Changement de langue **à chaud**, sans redémarrage. Test de rendu de chaque écran dans les deux langues, avec les libellés les plus longs.

```issues
feature: F13.4
titre: Interface bilingue malgache et français, montants en Ariary
epic: "13"
phase: P1
prio: M
etapes: [conception, squelette, design, backend, frontend]
depend: []
```

---

## F13.6 — Sécurité : chiffrement des pièces d'identité, accès tracés

`P1 · M · complet` — **Règles** R-V5, N3.1

### 1. Conception

Les pièces d'identité et les selfies sont **chiffrés au repos**, à accès restreint et **journalisé nominativement** *(R-V5)*.

**Pourquoi c'est plus qu'une case de conformité** : le produit demande à de jeunes femmes de téléverser leur carte d'identité et une photo de leur visage. Une fuite ne serait pas un incident technique, ce serait un préjudice personnel durable. La journalisation nominative protège aussi l'équipe : elle rend une consultation abusive détectable.

**Règles complémentaires** *(CDC §9)* : secrets hors du dépôt avec rotation possible, quotas sur l'authentification, la publication, le signalement et la création de compte, adresse électronique jamais en clair dans les journaux *(R-C10)*, adresse de livraison jamais exposée hors du couple acheteur/transporteur *(RB8)*.

### 2. Structure de code

```
apps/api/src/plateforme/
├─ chiffrement.ts        chiffrement au repos, rotation de clé
├─ accesDocument.ts      ← seule porte d'accès, journalise systématiquement
└─ secrets.ts            lecture depuis l'environnement, jamais du dépôt
apps/api/src/modules/identite/documents.ts
```

`accesDocument.ts` est la **seule** fonction capable de déchiffrer un document, et elle journalise avant de rendre le contenu. Une règle de lint interdit l'import direct du module de chiffrement ailleurs.

### 3. Base de données

`document_identite (url_chiffree, empreinte)` *(CDC §3.1)*, `journal_audit` pour chaque accès. Les documents sont **effacés** à la suppression de compte, pas anonymisés *(F0.11)*.

### 4. Design

Un seul élément d'interface : la mention d'accès journalisé — **désormais un accès automatisé** *(`DP-05`, `UC-52`)*, visible par l'opérateur. Savoir que la consultation est tracée change le comportement.

**Prompt Stitch** — préambule commun, puis :
```
Frame — admin document viewer with visible audit notice.
The identity document image fills most of the frame with a zoom control; above it
a slim grey bar reading "Consultation enregistrée — Naina, 14 août 11 h 04, IP
41.xx.xx.xx"; below it a muted line "L'accès aux pièces d'identité est journalisé
et contrôlé." Also produce the buyer-facing reassurance card shown during KYC
upload: a shield icon, "Vos documents sont chiffrés", body "Seule l'équipe de
vérification peut les consulter, et chaque consultation est enregistrée."
```

### 5. Backend

Chiffrement à l'entrée, déchiffrement uniquement via `accesDocument`, quotas sur les points d'entrée sensibles.

**Tests** : document stocké **illisible** sans clé ; toute lecture produit une entrée d'audit (test paramétré) ; adresse électronique absente des journaux ; adresse de livraison absente des réponses destinées au donateur et à la créatrice *(RB8)* ; rotation de clé sans perte d'accès aux anciens documents ; suppression de compte → documents effacés du stockage objet.

### 6. Frontend

Message de réassurance au téléversement. Aucune mise en cache locale d'un document d'identité.

```issues
feature: F13.6
titre: Sécurité, chiffrement des pièces d'identité, accès tracés
epic: "13"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F0.6]
```

---

## F13.7 — Conformité à la loi malgache sur les données personnelles

`P1 · M · complet`

### 1. Conception

**Ce qui doit exister concrètement**, au-delà de la déclaration d'intention :

- **Suppression de compte effective** *(F0.11)*, avec anonymisation et conservation limitée aux obligations comptables.
- **Export de ses données** sur demande : profil, commandes, avis, contenus.
- **Finalité et durée de conservation documentées** par catégorie de donnée.
- **Consentement explicite** pour ce qui n'est pas nécessaire à la transaction (notifications de promotion, classements publics).
- **Registre des traitements** tenu à jour — un document, pas du code, mais à produire.

**Une contrainte de conception qui en découle** : la durée de conservation doit être **appliquée par des travaux de purge**, pas seulement écrite dans une politique. Une politique de rétention sans purge automatique est fausse au bout de six mois.

### 2. Structure de code

```
apps/api/src/modules/exploitation/
├─ donneesPersonnelles.ts     export, suppression, registre
└─ retention.ts               durées par catégorie
apps/api/src/jobs/purgeRetention.ts     ← applique réellement les durées
docs/registre-traitements.md
apps/mobile/src/features/reglages/ecrans/EcranMesDonnees.tsx
```

### 3. Base de données

Durées de conservation appliquées : `code_otp` 24 h, `evenement_usage` 90 j, `message_direct` 90 j (sauf pièce de litige), `notification` 180 j, documents d'identité jusqu'à suppression de compte, écritures financières **conservées** *(obligation comptable)*.

### 4. Design

**Prompt Stitch** — préambule commun, puis :
```
Screen — "Mes données" (settings).
Vertical order: title; a section "Ce que nous conservons" with four expandable
rows, each naming a data category, its purpose and its retention in plain
language: "Vos commandes — pour le suivi et la comptabilité — 10 ans",
"Vos pièces d'identité — pour la vérification — jusqu'à la suppression de votre
compte", "Votre historique de navigation — pour personnaliser votre fil —
90 jours", "Vos messages de direct — 90 jours"; then a section "Vos droits" with
three action rows: "Télécharger mes données" with a download icon, "Corriger mes
informations", and "Supprimer mon compte" in red; a muted footer line naming the
applicable Malagasy data-protection framework.
```

### 5. Backend

`POST /moi/export-donnees` → archive générée en asynchrone, lien à durée limitée. `GET /moi/retention` → les durées applicables. Travail de purge quotidien.

**Tests** : export complet et lisible ; purge effective sur chaque catégorie (données au-delà de la durée absentes) ; écritures financières **non purgées** ; consentement respecté sur les notifications de promotion ; suppression de compte → documents effacés, écritures conservées et désolidarisées.

### 6. Frontend

Écran « Mes données » en langage clair. Les durées annoncées doivent correspondre aux durées réellement appliquées — c'est un test, pas une intention.

```issues
feature: F13.7
titre: Conformité à la loi malgache sur les données personnelles
epic: "13"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F0.11]
```

---

## F13.8 — Journalisation complète des transactions

`P1 · M · complet` — **Contrainte C4** · **preuve en litige**

### 1. Conception

Toute transaction laisse une trace **inaltérable** : écriture financière *(F4.4)*, mouvement de stock *(F1.6)*, événement de livraison *(F5.2)*, journal d'audit *(F11.9)*, journal des ventes confirmées *(R-R11)*.

**Ces journaux servent trois usages distincts, et c'est pourquoi ils ne se confondent pas** : la preuve en litige *(F6.5)*, la réconciliation financière *(F11.5)*, et la reconstruction d'état après incident.

**Le principe non négociable** : append only. `REVOKE UPDATE, DELETE` sur `ecriture_financiere` et `journal_audit`. Toute correction est une écriture inverse, jamais une modification.

**Identifiant de corrélation** traversant API, travailleurs et WebSocket *(CDC §11)* : sans lui, reconstituer une transaction qui a traversé quatre modules et deux files d'attente est impraticable.

### 2. Structure de code

```
apps/api/src/plateforme/
├─ correlation.ts        identifiant propagé partout, y compris dans les jobs
├─ journal.ts            journaliseur structuré, champs interdits filtrés
apps/api/src/modules/sequestre/journal.ts     écritures financières (F4.4)
```

Le journaliseur **filtre les champs interdits** à l'écriture (adresse électronique, code OTP, jeton, données de carte) : la protection est dans l'outil, pas dans la discipline de chaque appelant *(R-C10)*.

### 3. Base de données

Les cinq journaux, tous en append only, tous indexés sur leur référence métier pour l'instruction.

### 4. Design

Sans objet côté utilisateur. ⚠️ **L'écran d'instruction de dossier a disparu** *(`DP-05`, `F6.5` supprimée)* — le journal reste, son lecteur non. Ancienne rédaction : qui **assemble** ces journaux en une vue lisible.

### 5. Backend

**Tests** : `UPDATE` et `DELETE` rejetés par la base sur les deux journaux ; identifiant de corrélation présent dans toutes les entrées d'une transaction traversant API, file et WebSocket ; champs interdits **absents** des journaux (test paramétré sur une liste de champs sensibles) ; reconstruction du solde d'un portefeuille par relecture du journal seul, sur 10 000 écritures.

### 6. Frontend

Sans objet.

```issues
feature: F13.8
titre: Journalisation complète des transactions
epic: "13"
phase: P1
prio: M
etapes: [conception, squelette, bdd, backend]
depend: [F4.4]
```

---

## F13.9 — Mesure d'usage et entonnoirs, dès le premier jour

`P1 · M · complet` — **Voir** F11.7

### 1. Conception

**L'instrumentation est une exigence de conception, pas une tâche de fin de projet** *(R-O2)*. Les mesures fondatrices *(F11.7)* ne se calculent pas rétroactivement : si l'événement n'a pas été émis, la donnée n'existe pas.

**Événements à instrumenter dès le premier jour** *(CDC §11)*, y compris ceux ajoutés par la vague 1 : `direct_vu`, `je_prends_appuye`, `feuille_ouverte`, `paiement_lance`, `paiement_confirme`, `paiement_abandonne` + étape, `reservation_expiree`, `contenu_vu`, `article_clique`, `contenu_converti`, `unboxing_publie`, `vente_affiliee`, `commande_cadeau` + pays, `litige_ouvert`/`resolu` + délai, `signalement_urgence` + délai, **`otp_demande`/`verifie`/`echoue`**, **`commande_creee` + origine**, **`abonnement_cree`/`supprime`**, **`promo_notifiee`/`ouverte`/`convertie`**, **`notification_coupee` + canal**, **`evenement_page_vue`/`converti`**.

**`notification_coupee` est le signal d'alerte le plus important du produit** : il dit si l'on est en train de saturer l'attention et de perdre le canal dont la logistique dépend.

### 2. Structure de code

```
packages/contracts/src/evenements-usage.ts   ← liste exhaustive, typée
apps/mobile/src/noyau/mesure.ts              envoi par lots, échec silencieux
apps/api/src/modules/exploitation/evenements.ts
```

La liste est **typée dans `contracts`** : un événement non déclaré ne compile pas, et un événement déclaré non émis est détectable.

### 3. Base de données

`evenement_usage` *(F11.7)*, `agregat_quotidien`.

### 4. Design

Sans objet côté utilisateur.

### 5. Backend

`POST /evenements-usage` par lots. **L'envoi ne bloque jamais un parcours** : échec silencieux côté client, file locale, envoi opportuniste.

**Tests** : chaque événement de la liste est effectivement émis par le parcours correspondant (test d'intégration par parcours) ; l'échec d'envoi de mesure n'interrompt aucun parcours ; agrégation quotidienne cohérente ; entonnoir « Je prends » → payé reconstituable.

### 6. Frontend

Envoi par lots, jamais en synchrone sur un geste. Aucune donnée personnelle dans les événements — un identifiant, pas un nom, jamais une adresse.

```issues
feature: F13.9
titre: Mesure d'usage et entonnoirs dès le premier jour
epic: "13"
phase: P1
prio: M
etapes: [conception, squelette, bdd, backend, frontend]
depend: [F11.7]
```

---

## F13.5 — Consultation hors ligne des commandes et du code de retrait

`P1 · S · moyen` — **Contrainte** CDC §10.3

**Conception** — consultables sans réseau une fois chargés : liste des commandes et leurs statuts, **code de retrait**, factures téléchargées, panier.

**Le code de retrait hors ligne est indispensable** : l'acheteuse est devant le relais, souvent sans données. Un code de retrait qui exige une connexion pour s'afficher est une fonctionnalité qui échoue exactement au moment où elle sert.

**Base de données** — côté client : stockage local chiffré des commandes actives et des codes.

**Backend** — les projections concernées sont conçues pour être **complètes en une réponse**, mises en cache côté client à réception.

**Design** — Prompt Stitch : *offline order list with a muted header chip "Hors ligne — informations du 14 août 11 h 05", rows still fully readable with their statuses, and the retrieval code card fully visible with a small offline icon; plus a greyed-out action button "Actualiser (connexion requise)".*

**Tests** : réseau coupé → commandes, statuts, code et facture accessibles ; code affiché identique au code serveur ; cache invalidé à la reconnexion ; aucune action d'écriture proposée hors ligne sur ces écrans.

```issues
feature: F13.5
titre: Consultation hors ligne des commandes et du code de retrait
epic: "13"
phase: P1
prio: S
etapes: [conception, design, backend, frontend]
depend: [F5.4]
```

---

## F13.10 — Version web légère

`P2 · S · moyen` — **Livrable L5 étendu**

**Conception** — `apps/web` porte déjà les pages publiques indispensables : article, vitrine, page cadeau *(F16.4)*, page événement *(F20.4)*, replay *(F2.16)*, avec **rendu serveur pour l'aperçu de lien** *(F7.11)*.

**Deux publics distincts** : la diaspora, qui est en partie sur iOS et n'installera pas d'application *(hors périmètre V1)*, et les acheteuses locales **sans place de stockage** — cas réel et fréquent sur des téléphones de 16 Go.

**Périmètre proposé pour la version légère** : consultation, panier, paiement. Pas de direct, pas de publication, pas de studio boutique. Le direct en navigateur sur un téléphone d'entrée de gamme est une mauvaise expérience qui abîmerait l'image du produit.

**Backend** — les mêmes API, aucune duplication.

**Design** — Prompt Stitch : *responsive web product page rendered server-side, visually consistent with the mobile app, with a persistent bottom bar "Installer l'application pour voir les directs" that is dismissible, and a full checkout flow usable in a mobile browser.*

**Tests** : aperçu de lien correct sur les cinq types de page ; parcours d'achat complet en navigateur mobile ; pas de dépendance à une fonctionnalité native ; poids de page sous budget.

```issues
feature: F13.10
titre: Version web légère
epic: "13"
phase: P2
prio: S
etapes: [conception, squelette, design, backend, frontend]
depend: [F7.11]
```

---

*Épique suivante : [EP14-contenu](EP14-contenu.md).*
