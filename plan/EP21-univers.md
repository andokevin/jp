# EP21 — Les univers

> 12 fonctionnalités · **vague 1** · module `univers`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · règles : `../docs/JP_CAHIER_DES_CHARGES.md` §5.16 *(R-Y1 à R-Y18)*.

**Décision du 20/08/2026.** JP n'est plus une place de marché de mode : c'est une place de marché **par univers**.

| Univers | Signature | Commission | Livraison | État |
|---|---|---|---|---|
| **JP Mode** | *Le direct qui habille* | 8 % | relais, domicile | **ouvert** |
| **JP Beauté** | *Vrai produit, prix vrai* | 8 % | relais, domicile | **ouvert** |
| JP Tech | *Vérifié avant de payer* | **3 %** | relais, domicile | déclaré, fermé |

**Trois univers, et pas d'autre.**

## Pourquoi c'est une épique et pas un champ de plus

**Un univers n'est pas un filtre de catégorie, c'est un jeu de règles.**

Entre une robe et un téléphone, ce qui change n'est pas l'étagère : c'est la fiche article, le mode de livraison, les motifs de litige recevables, le taux de commission et la vérification exigée de la boutique.

Le taux de commission suffit à le démontrer. Un revendeur de téléphones gagne environ 5 % sur un appareil ; lui en prendre 8 rendrait `JP Tech` **vide**, quel que soit le reste du produit. Un univers avec un taux global n'est pas un univers, c'est une étiquette.

## Pourquoi l'application fonctionne à l'identique dans les trois

**Les trois partagent la même logistique** : **la boutique livre, JP suit** *(`DP-04`)*. Ce qui
varie n'est pas le flux, ce sont **trois listes** :

| Ce qui varie | Ce que ça change à l'écran |
|---|---|
| les champs de la fiche | les champs du formulaire de publication |
| les motifs de litige | la liste du sélecteur de motif |
| le taux de commission | un nombre dans le récapitulatif |

Aucun des trois ne change un **parcours**. Un univers exigeant le camion —
du mobilier — aurait imposé un second parcours de livraison et un second
métier. Il a été écarté pour cette raison, et c'est ce qui rend l'affirmation
vraie : **une seule application, trois univers, le même fonctionnement.**

## Pourquoi Tech est déclaré mais fermé

**L'abstraction se construit maintenant, l'ouverture devient une configuration.**

| | Coût |
|---|---|
| Construire l'abstraction maintenant | ~2 semaines |
| La rétrofitter après le lancement | **des mois** — migrer chaque article, chaque commande, chaque promotion, sur des données réelles |

Un univers fermé existe en base, garde ses règles, son accent visuel, et n'apparaît nulle part *(R-Y2)*. L'ouvrir est un `UPDATE`.

**Pourquoi Tech attend.** Le téléphone volé est un vrai problème à Madagascar.
Tech exige l'IMEI **et** la provenance, donc une vérification boutique plus
lourde. On ouvre Tech quand ce contrôle sera éprouvé sur de vrais dossiers, pas
avant — un univers qui laisse passer des appareils volés détruirait la promesse
de la plateforme entière, pas seulement la sienne.

Mode et Beauté, elles, partagent **la même boutique** et le même panier. Deux
marchés validés, un seul métier à apprendre.

## Ce que le panier ne fait PAS

**Le panier ne se scinde pas par univers** *(R-Y7)*. Il se scinde par boutique et par mode de livraison, ce qu'il fait déjà *(F3.1)*.

À Madagascar, la même boutique tient souvent le vêtement et le cosmétique : la forcer à faire payer deux fois serait absurde.

Et comme **les trois univers partagent la même livraison**, la scission par mode de livraison ne se déclenche jamais aujourd'hui. Elle reste écrite parce qu'elle est la bonne règle : c'est la livraison qui contraint un panier, pas l'univers.

---

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F21.1 ★ | Sélecteur d'univers, univers mémorisé | P1 | M | complet |
| F21.2 ★ | Règles par univers | P1 | M | complet |
| F21.3 ★ | Fiche article adaptée à l'univers | P1 | M | complet |
| F21.4 | Motifs de litige filtrés par univers | P1 | M | complet |
| F21.5 ★ | Commission par univers | P1 | M | complet |
| F21.6 | Un lien profond impose son univers | P1 | S | moyen |
| F21.7 | Pastille d'univers hors contexte | P1 | C | moyen |
| F21.8 | Ouverture et fermeture depuis le back-office | P1 | S | moyen |
| F21.9 | Recherche transverse aux univers ouverts | P2 | S | moyen |
| F21.10 ★ | Boutique multi-univers, visible dans un seul par défaut | P1 | S | complet |
| F21.11 | Bilan par univers | P1 | S | cadre |
| F21.12 | Signature à la première visite | P1 | C | cadre |

**Déjà fait au socle** : le registre `packages/contracts/src/univers.ts`, la table `univers`, les décisions UX de `packages/ui/src/univers.ts`, et le seed des cinq univers. Les mini-plans ci-dessous s'appuient dessus.

---

## F21.1 — Sélecteur d'univers, univers mémorisé

`P1 · M · complet` — **Bloque** toute l'épique · **Règles** R-Y8, R-Y9, R-Y10

### 1. Conception

**Fonctionnel.** L'univers courant est visible en permanence en tête d'écran et se touche pour changer. Tout ce qui est en dessous appartient à cet univers : le fil, la recherche, les filtres, les vitrines. C'est le modèle du grand magasin — on sait à quel étage on est.

Trois comportements décidés au socle *(voir `packages/ui/src/univers.ts`)* :

- le sélecteur **n'apparaît que s'il y a le choix** *(R-Y10)*. Avec un seul univers ouvert, il occupe 48 dp de hauteur utile pour rien ;
- l'univers est **mémorisé** entre deux ouvertures *(R-Y9)*. Quelqu'un qui vient pour la beauté ne veut pas rechoisir à chaque fois ;
- un **lien profond impose son univers** *(R-Y8)*. Sans cela, on ouvrirait un article invisible dans le contexte courant.

**Cas d'échec** : l'univers mémorisé a été fermé entre-temps → on retombe sur le premier ouvert, avec un message. Silencieusement basculer serait déroutant.

**Technique.** L'univers courant est un état **client**, pas serveur : il ne dépend pas du compte et change plus souvent qu'une préférence. Il voyage en paramètre de requête sur les listes, jamais en en-tête — un en-tête serait invisible dans un journal d'accès et rendrait le débogage pénible.

**Hors périmètre** : la recherche transverse *(F21.9)*, le bilan par univers *(F21.11)*.

### 2. Structure de code

```
apps/api/src/modules/univers/{routes,service,repository,index}.ts
apps/mobile/src/noyau/univers.ts          état courant, mémorisation
apps/mobile/src/navigation/index.ts       le lien profond impose l'univers
packages/ui/src/univers.ts                ✅ déjà écrit au socle
packages/contracts/src/univers.ts         ✅ déjà écrit au socle
```

### 3. Base de données

Rien à créer : la table `univers` existe *(migration `univers`)*. `GET /univers` lit les lignes `ouvert = true`, triées par `rang`.

### 4. Design

**Écrans** : la barre de sélection en tête, l'entête d'univers à la première visite, la pastille sur une vignette hors contexte.

**Prompt Stitch** *(préambule commun de `PLAN_SOCLE §8`, puis)* :

```
Screen: home feed with a UNIVERSE SELECTOR pinned at the very top.
The selector is a horizontal row of two pill-shaped chips, full width,
48dp tall: "Mode" (active, filled with purple #7C2D92, white text) and
"Beauté" (inactive, light grey fill #F4F4F5, dark text #18181B).
Below it, a single-line universe header showing "JP Beauté" in white on a
raspberry band #A31A5B, with the tagline "Vrai produit, prix vrai" in
smaller white text underneath — this tagline appears only on first visit.
Below that, a 2-column grid of product cards, each with a low-resolution
blurred placeholder state visible, a price in "50 000 Ar" format, and no
universe badge (we are inside that universe already).
States needed as separate frames: default, first visit with tagline,
single universe (selector hidden entirely), loading with placeholders.
```

### 5. Backend

```
GET /univers                    → les univers ouverts, triés par rang
GET /univers/:cle               → un univers et ses règles
```

Les listes existantes gagnent un paramètre `univers` **obligatoire** : `GET /articles?univers=beaute`. Obligatoire et non facultatif, pour qu'un appel sans univers échoue franchement au lieu de renvoyer un mélange.

Erreur : `UNIVERS_INCONNU` *(404)* · `UNIVERS_FERME` *(404 aussi — on ne révèle pas qu'il existe)*.

**Tests** : un univers fermé est absent de `GET /univers` · un article demandé avec le mauvais univers est introuvable · l'ordre suit `rang`.

### 6. Frontend

Le sélecteur lit `GET /univers` **une fois** et le garde en cache long : la liste change quelques fois par an.

L'univers courant est écrit dans le stockage local à chaque changement. À l'ouverture, on le relit et on vérifie qu'il est toujours ouvert.

**Hors ligne** : l'univers mémorisé suffit à afficher le cache. Sans réseau, on ne peut pas savoir si un univers a été fermé — on affiche, et on corrigera au retour du réseau.

```issues
feature: F21.1
titre: Sélecteur d'univers, univers mémorisé
epic: "21"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: []
```

---

## F21.2 — Règles par univers

`P1 · M · complet` — **Bloque** F21.3, F21.4, F21.5 · **Règles** R-Y1 à R-Y6, R-Y11

### 1. Conception

**Le cœur de l'épique.** Cinq règles varient d'un univers à l'autre :

| Règle | Où elle vit | Pourquoi là |
|---|---|---|
| commission | **base** *(`univers.commission_pour_mille`)* | levier économique du pilote, doit changer sans déploiement |
| modes de livraison | **code** | change la logistique, donc le produit — pas un réglage |
| champs de fiche | **code** | change l'écran de publication |
| champs obligatoires | **code** | change ce qu'on refuse |
| motifs de litige | **code** | change l'arbitrage |
| provenance exigée | **code** | change la vérification boutique |

**Ce partage est la décision de conception de la fonctionnalité.** Ce qui doit bouger pendant le pilote va en base ; ce qui change le produit va dans le code, où il passe par une revue et un test.

**Cas d'échec** : une requête forgée demande un mode de livraison hors univers → refus **côté serveur** *(R-Y4)*, jamais seulement à l'affichage.

**Technique.** `packages/contracts/src/univers.ts` est la source unique — déjà écrit et couvert par 33 tests au socle. Le service `univers` lit la commission en base et le reste dans le registre.

### 2. Structure de code

```
apps/api/src/modules/univers/service.ts       lit base + registre, expose les règles
packages/contracts/src/univers.ts             ✅ socle — le registre
prisma/schema.prisma                          ✅ socle — la table
```

### 3. Base de données

`article` gagne `univers_cle` — **non modifiable après création** *(R-Y1)*. Changer l'univers d'un article changerait ses règles de litige et sa commission après qu'une commande a été passée.

```sql
ALTER TABLE article ADD COLUMN univers_cle TEXT NOT NULL REFERENCES univers(cle);
CREATE INDEX article_univers_idx ON article(univers_cle, cree_le DESC);

-- Un déclencheur interdit la modification : une contrainte CHECK ne peut pas
-- comparer l'ancienne et la nouvelle valeur.
CREATE TRIGGER article_univers_immuable
  BEFORE UPDATE OF univers_cle ON article
  FOR EACH ROW WHEN (OLD.univers_cle <> NEW.univers_cle)
  EXECUTE FUNCTION refuser_changement_univers();
```

`commande` gagne `univers_cle` et `taux_commission_pour_mille`, **figés à la création** *(R-Y3)* — comme le barème historisé de `R-G3`.

### 4. Design

Pas d'écran propre. La règle se voit dans `F21.3` *(fiche)*, `F21.4` *(litige)* et `F21.5` *(récapitulatif)*.

### 5. Backend

```
GET /univers/:cle/regles   → livraisons, champs, motifs, commission
```

Trois gardes serveur, chacune testée :

```ts
livraisonPermise(universCle, mode)     // au paiement
motifRecevable(universCle, motif)      // à l'ouverture d'un litige
champsManquants(universCle, fiche)     // à la publication
```

**Tests** : ⚠️ **la commission par univers est supprimée** *(`DP-08`)* — si un univers doit coûter plus cher, cela se joue sur **le palier d'abonnement**, plus sur la vente. Ancienne rédaction : la commission de `tech` est bien inférieure à la moitié de celle de `mode` · `maison` refuse le point relais · un motif hors univers est refusé · un univers inconnu ne permet rien.

### 6. Frontend

Les règles sont lues une fois par univers et mises en cache. Le client **ne recalcule jamais** la commission : il affiche celle que le serveur renvoie *(RB7)*.

```issues
feature: F21.2
titre: Règles par univers — commission, livraison, fiche, litige
epic: "21"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F21.1]
```

---

## F21.3 — Fiche article adaptée à l'univers

`P1 · M · complet` — **Règles** R-Y5, R-Y13, R-Y14, R-Y15 · **Dépend de** F21.2, F1.1

### 1. Conception

L'écran de publication **change de champs selon l'univers**. Une robe demande taille et état ; un cosmétique demande péremption, contenance et scellé.

**Le refus nomme les champs manquants** *(R-Y5)*. « Fiche incomplète » est un mur ; « il manque la date de péremption et l'état du flacon » est une consigne.

**Cas d'échec majeur, propre à Beauté** : un article périmé. Le contrôle a lieu **à la publication et au moment de l'achat** *(R-Y13)*, parce qu'un article peut périmer en stock — c'est le cas le plus probable, pas le plus rare.

**Pourquoi le scellé est sur la vignette et pas seulement sur la fiche** *(R-Y14)* : c'est l'information qui décide de l'achat. La cacher derrière un clic, c'est la cacher.

### 2. Structure de code

```
apps/api/src/modules/catalogue/service.ts     validation par univers
apps/mobile/src/features/catalogue/           formulaire dynamique
packages/contracts/src/univers.ts             ✅ champsManquants()
```

### 3. Base de données

`article` gagne `attributs jsonb` — les champs propres à l'univers. Un `jsonb` plutôt que trente colonnes nullables : les champs varient par univers et grossiront à chaque ouverture.

```sql
ALTER TABLE article ADD COLUMN attributs JSONB NOT NULL DEFAULT '{}';

-- Beauté : la péremption est dans les attributs, mais elle doit être
-- indexable et vérifiable. On l'extrait en colonne générée.
ALTER TABLE article ADD COLUMN peremption_le DATE
  GENERATED ALWAYS AS ((attributs->>'date_peremption')::date) STORED;
CREATE INDEX article_peremption_idx ON article(peremption_le)
  WHERE peremption_le IS NOT NULL;
```

**Pourquoi une colonne générée** : elle permet d'indexer et de contraindre sans dupliquer la donnée. Un `jsonb` seul serait incapable d'exclure les articles périmés d'une liste sans parcourir toute la table.

### 4. Design

**Prompt Stitch** :

```
Screen: "Publier un article" form for the BEAUTY universe (seller studio).
Header shows a small raspberry chip "JP Beauté" so the seller knows which
universe they are publishing into.
Fields in order: photo picker (up to 8, first one marked "principale"),
product name, brand, price with "Ar" suffix, contenance with a unit
selector (ml / g), a DATE PICKER labelled "Date de péremption" marked
required with a red asterisk, and a two-option segmented control
"Scellé / Entamé" also marked required. Then an optional "Provenance"
text field with a helper line: "D'où vient ce produit ? Une photo de
facture est valorisée au classement."
A summary card shows the simulated commission: "Vous recevrez 46 000 Ar
sur 50 000 Ar".
Bottom: full-width primary button "Mettre en ligne".
States needed as separate frames: empty form, filled form, validation
error showing exactly which required fields are missing (named, not
generic), and an error state for a péremption date in the past.
```

### 5. Backend

```
POST /articles     { universCle, attributs, … }
```

Refus `422 CHAMPS_MANQUANTS` avec `champs: { date_peremption: "…", scelle: "…" }`.
Refus `422 PRODUIT_PERIME` si `date_peremption` est passée.

**Tests** : `champsManquants('beaute', {})` cite la péremption et le scellé · un article périmé est refusé à la publication **et** exclu de l'achat · `mode` n'exige aucune péremption.

### 6. Frontend

Le formulaire est **construit depuis les règles**, pas codé en dur par univers. Ajouter `JP Tech` ne demandera pas un nouvel écran.

```issues
feature: F21.3
titre: Fiche article adaptée à l'univers
epic: "21"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F21.2]
```

---

## F21.4 — Motifs de litige filtrés par univers

`P1 · M · complet` — **Règles** R-Y6, R-Y16, R-Y17 · **Dépend de** F21.2, F6.3

### 1. Conception

« Pas ma taille » n'a aucun sens pour un téléphone ; « batterie morte » aucun pour une robe. Offrir la liste complète produirait des litiges mal qualifiés — et **un litige mal qualifié est un litige mal arbitré** *(RB4)*.

Quatre motifs restent transverses : non reçu, différent de la photo, endommagé au transport, contrefaçon.

**Deux règles propres à Beauté, et elles ne sont pas commerciales :**

- **« réaction cutanée » passe en priorité** *(R-Y16)*, comme un signalement d'urgence. Ce n'est pas un litige de commerce, c'est possiblement une urgence médicale ;
- **un cosmétique entamé ne se retourne pas** *(R-Y17)*, sauf défaut ou contrefaçon. Accepter le retour ferait payer à la boutique le changement d'avis de l'acheteuse — un produit entamé ne se revend pas.

### 2. Structure de code

```
apps/api/src/modules/litige/service.ts    filtre par univers, priorité
apps/mobile/src/features/litige/
```

### 3. Base de données

`litige` gagne `univers_cle` *(dénormalisé depuis la commande, pour l'index de la file d'arbitrage)* et `prioritaire boolean`.

```sql
ALTER TABLE litige ADD COLUMN univers_cle TEXT NOT NULL REFERENCES univers(cle);
ALTER TABLE litige ADD COLUMN prioritaire BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX litige_file_idx ON litige(prioritaire DESC, ouvert_le)
  WHERE statut <> 'resolu';
```

### 4. Design

**Prompt Stitch** :

```
Screen: "Ouvrir un litige" — reason picker, BEAUTY universe.
A short vertical list of radio rows, each 48dp tall, showing ONLY the
reasons valid for this universe: "Je ne l'ai pas reçu", "Différent de la
photo", "Abîmé au transport", "Contrefaçon", "Le flacon était entamé",
"Date de péremption dépassée", "J'ai eu une réaction cutanée".
The last one is visually distinct — a light red background tint and a
small line underneath: "Traité en priorité".
Below: a text area "Racontez ce qui s'est passé", a photo attachment row
showing 2 thumbnails and an add button, and a full-width primary button
"Envoyer le signalement".
States needed as separate frames: default, reaction cutanée selected
(showing the priority notice), sending, sent with a case number.
```

### 5. Backend

```
GET  /commandes/:id/motifs-litige    → les motifs recevables ici
POST /litiges                        { motif, … }
```

Refus `422 MOTIF_HORS_UNIVERS`. `POST` marque `prioritaire = true` si le motif est `reaction_cutanee`.

**Tests** : `pas_la_bonne_taille` refusé en Beauté · `peremption_depassee` refusé en Mode · les quatre transverses acceptés partout · `reaction_cutanee` place le dossier en tête de file · un cosmétique entamé sans défaut est refusé au retour.

### 6. Frontend

La liste est lue depuis le serveur, jamais codée dans l'écran : ajouter un univers ne doit pas demander de toucher au client.

```issues
feature: F21.4
titre: Motifs de litige filtrés par univers
epic: "21"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F21.2]
```

---

## F21.5 — Commission par univers

`P1 · M · complet` — **Règles** R-Y3 · **Recette RB7** · **Dépend de** F21.2

### 1. Conception

**La règle qui décide si un univers vit ou meurt.** 3 % pour `JP Tech`, 8 % pour `JP Mode` : un revendeur de téléphones qui gagne 5 % sur un appareil ne peut pas en céder 8.

Deux points non négociables :

- le taux est **figé sur la commande à sa création** *(R-Y3)*. Un changement de taux ne rétroagit jamais — on ne modifie pas un calcul après avoir émis des factures ;
- la commission apparaît dans le **récapitulatif avant paiement** *(RB7)*. Aucun frais découvert après l'engagement.

### 2. Structure de code

```
apps/api/src/modules/commande/service.ts    lit le taux de l'univers
apps/api/src/modules/univers/service.ts     expose le taux courant
packages/money/                             ✅ commissionSur, netVendeur
```

### 3. Base de données

```sql
ALTER TABLE commande ADD COLUMN univers_cle TEXT NOT NULL REFERENCES univers(cle);
ALTER TABLE commande ADD COLUMN taux_commission_pour_mille INT NOT NULL;
ALTER TABLE commande ADD CONSTRAINT taux_fige_valide
  CHECK (taux_commission_pour_mille > 0 AND taux_commission_pour_mille <= 300);
```

### 4. Design

Le récapitulatif d'achat et l'écran « Mon argent » de la boutique montrent le taux appliqué, **par univers** si la boutique en a plusieurs.

### 5. Backend

Au calcul du panier, le taux vient de `univers.commission_pour_mille`. `commissionSur()` et `netVendeur()` de `@jp/money` font le calcul — **arrondi vers le bas, l'ariary contesté reste à la boutique**.

**Tests** : deux commandes de même montant dans deux univers différents produisent deux commissions différentes · changer le taux en base ne modifie pas une commande déjà créée · `netVendeur + commission = montant`, exactement.

### 6. Frontend

Le client **affiche** la commission, il ne la calcule jamais. Un calcul côté client divergerait au premier arrondi.

```issues
feature: F21.5
titre: Commission par univers
epic: "21"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F21.2]
```

---

## F21.6 — Un lien profond impose son univers

`P1 · S · moyen` — **Règles** R-Y8 · **Dépend de** F21.1

Un lien vers un article de `JP Beauté` partagé sur WhatsApp **bascule l'application** sur cet univers. Sans cela, on ouvrirait un article invisible dans le contexte courant, et la personne verrait un écran vide sans comprendre pourquoi.

**Base** : rien. **Backend** : la réponse d'un article porte son `universCle`. **Frontend** : `analyserLien()` *(déjà écrit au socle)* lit l'univers depuis la réponse et bascule avant d'afficher.

**Test** : ouvrir un lien de Beauté depuis Mode change l'univers courant · un lien vers un univers **fermé** affiche « cet article n'est plus disponible », pas une erreur technique.

```issues
feature: F21.6
titre: Un lien profond impose son univers
epic: "21"
phase: P1
prio: S
etapes: [conception, bdd, backend, frontend]
depend: [F21.1]
```

---

## F21.7 — Pastille d'univers hors contexte

`P1 · C · moyen` — **Dépend de** F21.1

La pastille ne sert que **hors** de l'univers courant : recherche transverse, résultat cadeau, notification. Dans son propre univers, elle n'apprend rien et vole de la place. La règle est déjà écrite dans `packages/ui/src/univers.ts` et testée.

```issues
feature: F21.7
titre: Pastille d'univers hors contexte
epic: "21"
phase: P1
prio: C
etapes: [conception, design, frontend]
depend: [F21.1]
```

---

## F21.8 — Ouverture et fermeture depuis le back-office

`P1 · S · moyen` — **Règles** R-Y2, R-Y12 · **Dépend de** F21.2, F11.6

Ouvrir un univers est un `UPDATE` d'une ligne — mais **une décision qui engage un recrutement de boutiques et une promesse publique**. Elle passe donc au journal d'audit, nominativement *(R-Y12)*.

**Décision ouverte** : simple validation d'un opérateur, ou **double validation** comme les paramètres économiques ? Je penche pour la double validation — c'est du même ordre qu'un changement de taux de commission.

**Le cas concret qui vient** : ouvrir `JP Tech`. Il attend que le contrôle de provenance et l'IMEI soient éprouvés sur de vrais dossiers.

**Fermer un univers** ne supprime rien : les articles restent, les commandes en cours se terminent, les nouvelles publications sont refusées. Une fermeture qui effacerait le catalogue serait irréversible pour un geste réversible.

```issues
feature: F21.8
titre: Ouverture et fermeture d'un univers depuis le back-office
epic: "21"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F21.2]
```

---

## F21.9 — Recherche transverse aux univers ouverts

`P2 · S · moyen` — **Dépend de** F21.1, F8.1

**Décision ouverte.** Chercher « crème » depuis `JP Mode` doit-il proposer des résultats de `JP Beauté` ? Transverse aide à la découverte ; cloisonné préserve le repère d'étage.

Ma préférence : **cloisonné par défaut, avec une ligne « 12 résultats dans JP Beauté »** qui bascule d'un geste. On garde le repère et on n'enterre pas le catalogue.

```issues
feature: F21.9
titre: Recherche transverse aux univers ouverts
epic: "21"
phase: P2
prio: S
etapes: [conception, design, backend, frontend]
depend: [F21.1]
```

---

## F21.10 — Boutique multi-univers, visible dans un seul par défaut

`P1 · S · complet` — **Règles** R-Y11, R-Y19, R-Y20 · **Dépend de** F21.2, F0.6

### 1. Conception

**Par défaut, une boutique n'est visible que dans UN univers** — celui de son
premier article *(R-Y19)*. Elle peut en ajouter, en un geste, depuis son studio.

**Ajouter un univers déclenche un avertissement** *(R-Y20)* :

> *« Être visible partout vous rend spécialiste de rien. »*

« La boutique qui vend de tout » est un positionnement plus faible que « la
spécialiste du téléphone ». Une acheteuse qui cherche un cosmétique fait plus
confiance à une boutique qui ne vend que ça. **C'est un fait de marché, pas une
préférence esthétique.**

**La plateforme informe, elle n'interdit pas.** Interdire serait paternaliste :
c'est son commerce. Mais lui laisser découvrir la conséquence six mois plus tard,
quand ses ventes stagnent, serait pire que de la prévenir.

**Ce qui reste unique** : la vérification boutique, le portefeuille, le score de
confiance, le rang de ses clientes. Elle a **une** boutique, visible dans un ou
plusieurs univers.

**Ce qui est par univers** : les exigences de provenance — vendre un cosmétique
demande de déclarer d'où il vient, vendre une robe non.

**Cas d'échec** : elle publie un cosmétique alors qu'elle n'est visible qu'en
Mode → on lui propose d'ajouter Beauté, avec l'avertissement. On ne l'ajoute
**pas** en silence : ce serait décider pour elle.

### 2. Structure de code

```
apps/api/src/modules/identite/service.ts       les univers de la boutique
apps/api/src/modules/univers/service.ts        la garde de publication
apps/mobile/src/features/identite/             l'écran d'ajout + l'avertissement
```

### 3. Base de données

```sql
CREATE TABLE boutique_univers (
  boutique_id  UUID NOT NULL REFERENCES boutique(id) ON DELETE CASCADE,
  univers_cle TEXT NOT NULL REFERENCES univers(cle),
  ajoute_le   TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  PRIMARY KEY (boutique_id, univers_cle)
);
```

Une table de liaison plutôt qu'un tableau : elle porte la **date d'ajout**, qui
servira à mesurer si l'avertissement a un effet.

### 4. Design

**Prompt Stitch** :

```
Screen: "Mes univers" in the seller studio.
A short list of rows, one per universe, each 48dp tall with a toggle on
the right: "Mode" (toggle ON, purple accent), "Beauté" (toggle OFF),
"Tech" (greyed out entirely with a small line "Bientôt disponible").
When the seller taps the "Beauté" toggle, a bottom sheet slides up. It
has a bold headline "Être visible partout vous rend spécialiste de rien",
then two short paragraphs of body text explaining that buyers trust a
focused shop more, then two buttons: a secondary text link "Annuler" and
a full-width primary button "Ajouter quand même".
States needed as separate frames: one universe active, the warning sheet
open, two universes active, and Tech shown as unavailable.
```

L'avertissement est une **feuille du bas**, pas une boîte de dialogue : elle se
lit sans bloquer, et le bouton d'action reste en bas, à portée du pouce.

### 5. Backend

```
GET   /boutiques/moi/univers        → les univers de la boutique
PUT   /boutiques/moi/univers        → ajoute ou retire
POST  /articles                    → refuse si l'univers n'est pas le sien
```

Refus `403 UNIVERS_NON_ACTIVE` avec l'action possible : *« Activez JP Beauté
dans Mes univers. »* Jamais un refus sec.

**Retirer un univers** ne supprime pas les articles : ils cessent d'être
visibles, et redeviennent visibles si l'univers est réactivé. Supprimer serait
irréversible pour un geste réversible.

**Tests** : le premier article fixe l'univers de la boutique · publier hors de
ses univers est refusé **avec l'action** · retirer un univers masque les articles
sans les supprimer · réactiver les remontre.

### 6. Frontend

L'avertissement s'affiche **à chaque ajout**, pas seulement au premier. Une
boutique qui passe de deux à trois univers mérite la même information.

```issues
feature: F21.10
titre: Boutique multi-univers
epic: "21"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F21.2]
```

---

## F21.11 — Bilan par univers

`P1 · S · cadre` — **Dépend de** F21.2, F11.7

Les quatre indicateurs du pilote, ventilés par univers. C'est ce qui permettra de répondre à la seule question qui compte après le lancement : **lequel des deux marche ?**

Sans cette ventilation, un pilote à deux univers donne une moyenne qui ne dit rien.

```issues
feature: F21.11
titre: Bilan par univers dans le tableau de bord du pilote
epic: "21"
phase: P1
prio: S
etapes: [conception, bdd, backend, frontend]
depend: [F21.2]
```

---

## F21.12 — Signature à la première visite

`P1 · C · cadre` — **Dépend de** F21.1

La signature — *« Vrai produit, prix vrai »* — s'affiche **une seule fois**, à la première visite de l'univers. La répéter à chaque ouverture la rendrait invisible. La règle est écrite et testée dans `packages/ui/src/univers.ts`.

```issues
feature: F21.12
titre: Signature d'univers à la première visite
epic: "21"
phase: P1
prio: C
etapes: [conception, frontend]
depend: [F21.1]
```
