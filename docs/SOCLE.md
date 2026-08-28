# Le socle, fichier par fichier

> **À quoi sert ce document.** Le socle fait 44 issues fermées et une
> quarantaine de fichiers écrits. Ce guide dit **quoi ouvrir, dans quel ordre,
> et ce qu'il faut y voir.** Les fichiers eux-mêmes portent le détail : chacun
> commence par un commentaire qui explique sa raison d'être.
>
> Les fichiers de 8 à 12 lignes sont des **coquilles** — l'arborescence est
> posée, le contenu arrive avec sa fonctionnalité. Ne les lisez pas.

---

## L'ordre de lecture recommandé

Six séances, de la plus fondatrice à la plus périphérique.

| # | Séance | Fichiers | Durée |
|---|---|---|---|
| 1 | **Les règles du dépôt** | `eslint.config.mjs`, `tsconfig.base.json`, `scripts/check-architecture.mjs` | 30 min |
| 2 | **L'argent** | `packages/money/src/index.ts` + son test | 45 min |
| 3 | **La base et sa garantie** | `prisma/migrations/*_socle/migration.sql`, `plateforme/db.ts` | 1 h |
| 4 | **L'idempotence** | `plateforme/idempotence.ts` + les 5 tests | 45 min |
| 5 | **Les permissions** | `plateforme/permissions.ts` + les 3 tests | 30 min |
| 6 | Le reste, à la demande | files, temps réel, design system, observabilité | — |

**Si vous ne lisez que trois fichiers**, prenez la séance 3, la 4 et la 5. Ce
sont les trois endroits où une erreur coûterait de l'argent réel.

---

# S1 — Monorepo, TypeScript strict, intégration continue

**Ce que ça fait** : un dépôt où `pnpm verifier` passe sur neuf espaces de
travail, et où quatre règles d'architecture sont **appliquées** au lieu d'être
rappelées en revue.

| Fichier | Lignes | À y voir |
|---|---|---|
| `package.json` | 48 | tous les scripts. `verifier` enchaîne typage, style, tests, architecture, contrat |
| `pnpm-workspace.yaml` | 3 | les neuf espaces |
| `turbo.json` | 31 | les tâches et **leurs entrées déclarées** — c'est ce qui rend le cache utile |
| **`tsconfig.base.json`** | 32 | `noUncheckedIndexedAccess` et `exactOptionalPropertyTypes` : les deux drapeaux qui vous forceront la main partout |
| **`eslint.config.mjs`** | 147 | **les quatre règles de dépendance**. Le cœur de `S1` |
| **`scripts/check-architecture.mjs`** | 113 | 7 contrôles qui éprouvent ces règles **dans les deux sens** |
| `.github/workflows/ci.yml` | — | écrit, **jamais exécuté sur GitHub** |

### Ce qu'il faut comprendre

Les quatre règles d'`eslint.config.mjs` :

1. un paquet partagé ne connaît aucune application ;
2. la plateforme ne dépend d'aucun module métier ;
3. un module n'entre pas dans les entrailles d'un autre ;
4. **aucun flottant hors de `@jp/money`**.

Et `check-architecture.mjs` les met à l'épreuve avec **quatre imports fautifs
qui doivent être refusés et trois légitimes qui doivent passer**. Sans le
second groupe, une règle tellement large que rien ne compile paraîtrait
correcte.

```bash
pnpm archi   # voyez les 7 lignes de verdict
```

---

# S2 — `money`, `i18n`, `contracts`

**Ce que ça fait** : les trois paquets que tout le reste importe. Une erreur
ici se propage partout, d'où le soin.

## `packages/money` — l'ariary en entiers

| Fichier | Lignes |
|---|---|
| **`src/index.ts`** | 299 |
| `src/index.test.ts` | 248 · 40 tests |

**Les deux choses à y voir :**

**L'arrondi est nommé par son bénéficiaire.** Il n'existe pas de fonction
« appliquer un pourcentage ». Il y a `commissionSur` qui arrondit vers le bas —
l'ariary contesté reste au vendeur — et `remiseSur` qui arrondit vers le haut —
il va à l'acheteuse. Jamais vers JP. Une fonction neutre obligerait chaque
appelant à trancher, et un appelant sur dix trancherait mal.

**`repartir` conserve la somme.** 1 000 Ar en trois donne `[334, 333, 333]`,
jamais `333 × 3`. Méthode du plus fort reste. Vérifié sur 2 500 cas — sans cet
invariant, la perte d'un ariary ne se voit qu'à la première réconciliation, où
elle devient un écart à justifier.

Regardez aussi `depuisTexte` : « 50.000 » vaut 50 000, « 1500,50 » est refusé.
Un séparateur de milliers est suivi d'exactement trois chiffres.

## `packages/i18n` — anglais et français

| Fichier | Lignes | Contenu |
|---|---|---|
| **`src/langues.ts`** | 56 | la seule définition des langues · lecture d'`Accept-Language` |
| `src/pluriel.ts` | 35 | le français met 0 au **singulier**, l'anglais au pluriel |
| `src/format.ts` | 89 | dates et heures sur le fuseau **fixé** à Antananarivo |
| **`src/messages.ts`** | 105 | les catalogues, les deux langues côte à côte |
| `src/index.test.ts` | 196 · 27 tests | dont **le test de largeur** |

**Le test de largeur** est celui à voir. Le français fait ~20 % de plus que
l'anglais ; une maquette dessinée en anglais doit prévoir la marge. Le test
compare les deux catalogues clé par clé et **a attrapé un débordement au
premier passage** : 46 caractères pour 35 autorisés.

Regardez pourquoi les deux catalogues sont dans **un seul fichier** : deux
fichiers séparés dérivent, on ajoute une clé dans l'un et on oublie l'autre.
Ici le typage l'interdit.

## `packages/contracts` — le contrat API

| Fichier | Lignes | Contenu |
|---|---|---|
| **`src/commun.ts`** | 145 | pagination par curseur · enveloppe d'erreur · en-têtes |
| **`src/exploitation.ts`** | 187 | **le registre des paramètres, bornes codées** |
| `src/commun.test.ts` | 98 · 12 tests | |
| les 16 autres | 9 chacun | coquilles, une par domaine |

**Pourquoi le curseur et pas `?page=3`** : sur un catalogue qui bouge, un
décalage saute ou répète des lignes. Une acheteuse qui fait défiler pendant
qu'un article se vend voit un doublon ou un trou.

**Les bornes des paramètres sont dans le code**, pas dans la table. Une borne
stockée en base se modifierait par la même interface que la valeur qu'elle
encadre. Une durée de réservation à zéro seconde doit être **impossible à
saisir**, pas déconseillée.

## Le garde-fou de `S2`

`scripts/check-contrat.mjs` — 124 lignes, 8 contrôles. Il prouve que le contrat
est **imposé par le typage** : une erreur sans message, une page sans curseur,
une langue inexistante, une clé de message inconnue → tout est refusé à la
compilation.

```bash
pnpm contrat
```

Il a trouvé un vrai manque à sa première exécution : `@jp/api` n'avait pas
déclaré `@jp/i18n`.

---

# S4 — La base de données

*(Écrit avant `S3`, contrairement au plan initial : l'idempotence a besoin
d'une table. Le plan a été corrigé.)*

| Fichier | Lignes | À y voir |
|---|---|---|
| `docker-compose.yml` | 71 | port sur **`127.0.0.1`** seulement · sonde de santé |
| **`prisma/schema.prisma`** | 225 | 6 tables, 3 énumérés, chaque champ commenté |
| **`prisma/migrations/…_socle/migration.sql`** | 189 | **le `REVOKE`** |
| `prisma/migrations/…_langues/migration.sql` | 19 | migration **corrective** : `mg` → `en` |
| `prisma/migrations/…_plateforme/migration.sql` | 72 | `cle_idempotence`, `session` |
| **`prisma/seed.mts`** | 75 | idempotent par `ON CONFLICT DO NOTHING` |
| `scripts/db-role.mjs` | 69 | pose le mot de passe **depuis `.env`** |
| **`apps/api/src/plateforme/db.ts`** | 62 | le client sur le rôle **restreint** |
| `apps/api/test/conteneur.ts` | 75 | Testcontainers |
| `apps/api/test/socle.test.ts` | 220 · 16 tests | |

### La chose à comprendre dans tout `S4`

```sql
REVOKE UPDATE, DELETE ON journal_audit FROM jp_app;
```

**Cette ligne ne vaut rien sans deux rôles distincts.** En PostgreSQL, le
propriétaire d'une table contourne ses propres révocations, et un
superutilisateur contourne tout.

```
prisma.config.ts   →  DATABASE_URL       propriétaire · migrations
plateforme/db.ts   →  DATABASE_URL_APP   jp_app · l'API tourne avec CELUI-CI
```

`db.ts` refuse même de démarrer si les deux URL sont identiques.

Puis, dans `socle.test.ts`, cherchez **la contre-épreuve** : « le propriétaire,
lui, le peut ». Sans elle, un `REVOKE` mal écrit et un `UPDATE` syntaxiquement
invalide donneraient exactement le même vert.

Deux autres détails du schéma qui méritent l'arrêt :

- **`onDelete: Restrict`** sur `journalAudit.acteurId`. Mon premier réflexe
  était `SetNull` — mais `SetNull` est un `UPDATE` sur le journal, donc une
  porte dérobée dans la garantie d'ajout seul.
- **`@default(uuid(7))`** et non `uuid(4)`. L'UUID v7 commence par un
  horodatage : deux comptes créés à une seconde d'intervalle ont des
  identifiants voisins, et l'index ne se fragmente pas.

⚠️ **Piège pour la suite** : `ALTER DEFAULT PRIVILEGES` accorde `UPDATE` et
`DELETE` aux tables **futures**. `ecriture_financiere` (migration n° 12) devra
porter son propre `REVOKE`.

---

# S3 — La plateforme API

**Ce que ça fait** : tout ce qui est transverse, écrit **une fois** et jamais
réimplémenté dans un module.

| Fichier | Lignes | Rôle |
|---|---|---|
| `plateforme/serveur.ts` | 155 | Fastify · contexte · **une seule sortie pour les erreurs** |
| `plateforme/contexte.ts` | 56 | `AsyncLocalStorage` · masquage de l'adresse |
| `plateforme/erreurs.ts` | 94 | `ErreurMetier` à code stable |
| `plateforme/auth.ts` | 112 | sessions · **jeton jamais en clair** |
| **`plateforme/permissions.ts`** | 123 | **les deux outils** |
| **`plateforme/idempotence.ts`** | 117 | **RB10** |
| `plateforme/pagination.ts` | 44 | curseur |
| `plateforme/debit.ts` | 100 | trois compteurs |
| `plateforme/audit.ts` | 65 | ne lève **jamais** |
| `apps/api/test/plateforme.test.ts` | 329 · 26 tests | |

## Le fichier le plus important du dépôt : `idempotence.ts`

**RB10** — « paiement interrompu : ni double prélèvement, ni commande perdue ».

Quatre situations, quatre réponses :

| Clé | Réponse |
|---|---|
| inconnue | on exécute, on enregistre |
| connue, **terminée** | on rend la réponse enregistrée, à l'identique |
| connue, **en cours** | `409` — deux requêtes simultanées |
| connue, **corps différent** | `422` — le pire cas |

Le quatrième mérite l'arrêt : la même clé pour une requête différente rendrait
à un client bogué **la réponse d'une autre commande**. D'où l'empreinte SHA-256
du corps, comparée à chaque rejeu.

Et regardez comment la course est arbitrée : **on tente d'abord le `create`**,
et une violation d'unicité nous apprend que la clé existe. Un `findUnique`
suivi d'un `create` laisserait passer deux requêtes simultanées entre les deux
appels. **C'est la base qui arbitre, pas nous.**

Enfin : si l'action échoue, **la clé est retirée**. La garder marquerait un
échec comme définitif, le contraire du but.

## Le second fichier à lire : `permissions.ts`

```
garde     décide QUI entre     → lève 403
projeter  décide CE QUI SORT   → retire des champs
```

Une garde de route dit qui entre. Elle **ne dit pas** ce qu'il voit. Une
employée `VE` a le droit d'ouvrir une commande, pas d'y voir la marge du
vendeur *(R-R8)*.

Le test qui justifie l'existence du second outil :

```ts
// L'employé PASSE la garde de lecture…
expect(() => garde(employe, 'vendeur', 'employe_vendeur')).not.toThrow();
// …et c'est la projection, ELLE SEULE, qui retire l'argent.
expect(projeterCommande(employe, { montantTotal: 1 }).montantTotal).toBeUndefined();
```

Avec la garde seule, la requête passe **entière**, marge comprise, et la fuite
ne se voit nulle part : la réponse est un JSON de plus.

## Les autres, en une phrase chacun

**`auth.ts`** — le jeton n'est jamais stocké en clair, seule son empreinte
SHA-256 l'est. Un jeton révoqué qui réapparaît fait tomber **toute la famille**
de rotation : c'est le signe d'un vol *(F0.2)*.

**`contexte.ts`** — `AsyncLocalStorage` transporte l'identifiant de corrélation
à travers les `await`. Une variable globale donnerait le même contexte à deux
requêtes simultanées.

**`erreurs.ts`** — trois champs : `code` stable, `message` **déjà traduit par le
serveur**, `action` — ce que la personne peut faire.

**`debit.ts`** — trois compteurs : identité, adresse, **cible**. Le troisième
est le seul qui protège de l'énumération de comptes, qu'une attaque distribuée
contournerait sinon *(R-C7)*.

**`audit.ts`** — `journaliser` **ne lève jamais**. Un échec de journalisation ne
doit pas faire échouer l'action métier qui, elle, a réussi. Arbitrage assumé,
commenté dans le fichier.

---

# S5 — Les files asynchrones

| Fichier | Lignes | Rôle |
|---|---|---|
| `apps/api/src/jobs/index.ts` | 126 | les six files · `empiler` avec clé métier |
| **`apps/api/src/jobs/reference.ts`** | 82 | le travailleur modèle · la réconciliation |
| `apps/api/test/jobs.test.ts` | 171 · 8 tests | |

### La chose à comprendre

**BullMQ garantit une livraison « au moins une fois », jamais « exactement une
fois ».** Un travailleur tué avant d'accuser réception verra son travail
redistribué. L'idempotence est à notre charge.

Trois mécanismes, dans `reference.ts` :

1. le travail **note en base** ce qu'il a fait, et vérifie avant d'agir. La
   marque doit survivre au redémarrage — donc ni mémoire, ni Redis ;
2. dans un vrai travailleur, la marque et l'effet sont dans la **même
   transaction**. Sinon un plantage entre les deux laisse l'effet sans sa
   marque, et le rejeu le produit une seconde fois ;
3. `reconcilier()` retrouve le travail en souffrance **depuis la base**. Redis
   peut avoir perdu des travaux ou en porter d'obsolètes — **il n'est jamais
   l'autorité** *(décision D2)*.

Dans le test, cherchez **`S5.4`** : on tue un travailleur en plein travail, on
laisse BullMQ redistribuer, et l'effet ne se produit qu'une fois.

`removeOnFail: false` — un échec ne s'efface jamais tout seul. La file d'échecs
est une liste de choses à comprendre, pas un déchet.

---

# S6 — Le temps réel

| Fichier | Lignes |
|---|---|
| **`apps/api/src/temps-reel/index.ts`** | 223 |
| `apps/api/test/temps-reel.test.ts` | 192 · 14 tests |

### La chose à comprendre

**Une reconnexion ne perd rien.** Une coupure de dix secondes en plein direct
fait disparaître des annonces de stock — et la vendeuse le voit à l'écran,
devant ses clientes.

Numéro de séquence par canal. Le client annonce le dernier reçu, le serveur
renvoie le delta :

```
reçus 1, 2 · coupure · 3, 4, 5 passent · reconnexion à 2
→ delta = [3, 4, 5]
```

**Si le retard dépasse l'historique borné** (200 messages), `resynchroniser`
rend `null` et exige un rechargement complet. Avouer le trou vaut mieux que
livrer un état troué en silence.

Deux autres points :

- les modules **publient un événement**, une passerelle le traduit en
  diffusion. `contenu` n'a pas à savoir qu'un WebSocket existe — sinon il
  importerait `ws` et la règle de dépendance sauterait ;
- une socket qui lève **ne coupe pas la diffusion pour les autres**. Elle est
  retirée du registre.

---

# S7 — Le design system

| Fichier | Lignes | Rôle |
|---|---|---|
| **`packages/ui/src/jetons.ts`** | 97 | couleurs, espacements · **le calcul de contraste** |
| **`packages/ui/src/etats.ts`** | 74 | les quatre états, en **type** |
| `packages/ui/src/primitives.ts` | 159 | les sept primitives |
| `packages/ui/src/index.test.ts` | 181 · 17 tests | |

### Deux contraintes qui viennent du terrain, pas du goût

- **48 dp** minimum pour toute cible tactile. En dessous, un doigt sur un écran
  de cinq pouces rate une fois sur trois.
- **4,5:1** minimum de contraste. Un téléphone d'entrée de gamme en plein
  soleil d'Antananarivo n'est pas un écran de bureau.

**Les deux sont vérifiées par test**, avec le calcul de luminance WCAG écrit
dans le paquet. Neuf paires couleur/fond passent, badges compris.

### Les quatre états sont un TYPE, pas une convention

```ts
type Etat<T> =
  | { nom: 'chargement' }
  | { nom: 'vide' }
  | { nom: 'erreur'; code: string; message: string }
  | { nom: 'hors-ligne'; donneesGardees?: T }
  | { nom: 'charge'; donnees: T }
```

Un `switch` incomplet **ne compile pas**. Un écran ne peut donc pas oublier un
cas.

Et l'ordre de résolution compte : **hors ligne passe avant erreur**. Une
requête qui échoue faute de réseau n'est pas une panne serveur, et ne se
raconte pas pareil.

### Pourquoi aucun composant React

React Native et le DOM n'ont ni les mêmes éléments ni les mêmes styles. Une
couche qui prétendrait les unifier coûterait plus qu'elle ne rapporte. **On
partage les décisions, pas le rendu.**

Regardez `minuteurReservation` : il calcule depuis l'échéance rendue par le
**serveur**, jamais une durée décidée côté client qui dériverait avec l'horloge
du téléphone *(RB9)*.

---

# S8 — La coquille mobile

| Fichier | Lignes | Rôle |
|---|---|---|
| **`apps/mobile/src/noyau/client-api.ts`** | 96 | `Idempotency-Key` **automatique** |
| **`apps/mobile/src/noyau/hors-ligne.ts`** | 111 | la file d'écritures |
| `apps/mobile/src/navigation/index.ts` | 35 | liens profonds |
| `apps/mobile/src/index.test.ts` | 191 · 15 tests | |

### Les deux points à voir

**Le client pose la clé automatiquement** sur toute écriture. Un écran qui
l'oublierait ouvrirait un trou dans `RB10` — et ça ne se verrait qu'en
production, sur un double prélèvement.

**La file fabrique la clé au moment du GESTE**, pas de l'envoi. Une clé
fabriquée à l'envoi changerait à chaque tentative, et le serveur verrait autant
de requêtes différentes — l'inverse exact du but.

La file **rejoue dans l'ordre** et **s'arrête** si le réseau est encore coupé :
une confirmation de réception rejouée avant la commande qu'elle confirme
produirait un état incohérent.

`CONSULTABLE_HORS_LIGNE` nomme ce qui doit rester lisible sans réseau, dont
**le code de retrait**. C'est celui qui compte : une acheteuse arrivée au point
relais sans réseau et sans son code repart **sans son colis** — et elle a payé.

⚠️ **Expo n'est pas installé.** Il ne sert à rien avant qu'il y ait un écran, et
sur ce réseau l'installation coûte cher. La logique est écrite et testée sans
lui.

---

# S9 — Les coquilles Vite

| Fichier | Lignes | Rôle |
|---|---|---|
| `apps/admin/src/index.ts` | 87 | client API · tableau paginé · les 8 écrans de l'épique 11 |
| **`apps/web/src/index.ts`** | 64 | **les métadonnées d'aperçu** |
| `apps/web/src/index.test.ts` | 49 · 4 tests | |
| `apps/*/vite.config.ts` | 16 | `127.0.0.1` · avertissement au-delà de 300 ko |

**Le rendu serveur n'a qu'une raison d'être ici : les aperçus de lien.** Pas la
vitesse. Une vitrine collée dans une conversation WhatsApp sans titre ni image
perd l'essentiel de son intérêt à Madagascar, où le partage passe par là.

Regardez l'échappement dans `balisesApercu` : un nom de boutique contenant
`<script>` ne doit pas pouvoir injecter du balisage. Testé.

---

# S10 — L'observabilité

| Fichier | Lignes |
|---|---|
| **`apps/api/src/observabilite/index.ts`** | 241 |
| `apps/api/test/observabilite.test.ts` | 173 · 15 tests |

Quatre parties dans un seul fichier :

**Le nettoyeur de journaux.** Il retire les secrets à n'importe quelle
profondeur — mot de passe, jeton, code, CIN, NIF, téléphone, adresse. Et il
**masque** l'adresse électronique au lieu de la supprimer : `mi***@jp.mg`
suffit à reconnaître un compte pendant un incident sans constituer un annuaire
*(R-C10)*. Un journal se copie, s'exporte, part chez un prestataire.

**Le collecteur.** Compteurs, histogrammes avec le **pic** — il compte autant
que la moyenne —, jauges lues à la demande. Une jauge cassée rend `-1` et ne
casse pas la page de métriques : sinon une base injoignable rendrait aussi les
métriques indisponibles, précisément quand on en a besoin.

**Quinze événements d'usage**, posés dès le premier jour. Ils nomment les
**échecs autant que les succès** : un entonnoir qui ne compte que les
réussites ne dit pas où on perd.

**Quatre alertes, et seulement quatre.** Une alerte qui sonne tous les jours ne
protège plus rien. Chacune porte son *pourquoi* en clair. Regardez celle de
l'écriture financière : **aucun seuil de tolérance, une seule suffit**.

---

# Ce qui n'est PAS fait

Trois choses, dites plutôt que tues.

| | |
|---|---|
| **`#1317`** | La mesure du poids de l'APK. Elle suppose un APK, donc Expo et un écran. Issue **volontairement ouverte** |
| **L'intégration continue** | `ci.yml` est écrit et commité, **jamais exécuté** sur GitHub. À confirmer à la première pull request |
| **Les 20 documents** | Ils parlent encore du malgache. Le code dit `en`/`fr`, les spécifications disent `mg`/`fr` |

Et deux décisions produit provisoires, semées en base et modifiables sans
déploiement — mais la première facture émise **fige le taux** :

```
taux_commission_defaut         = 80    (8 %)
duree_reservation_catalogue_s  = 1800  (30 min)
```

---

# Les commandes

```bash
pnpm verifier      # typage · style · tests · architecture · contrat
pnpm archi         # les 7 contrôles de dépendance
pnpm contrat       # les 8 contrôles de contrat
pnpm db:reset      # reconstruit la base en ~22 s
pnpm db:psql       # un client SQL dans le conteneur
pnpm avancement    # régénère LEARNING-MAP.md depuis GitHub
```

**Pour lire une décision plutôt que du code** : chaque fichier commence par un
commentaire qui dit pourquoi il existe et ce qui casserait sans lui. C'est là
qu'est l'essentiel — le code n'en est que la conséquence.
