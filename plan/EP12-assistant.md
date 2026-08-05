# EP12 — Assistant du vendeur

> 5 fonctionnalités · vague 3 · phase 3 · module `assistant`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md).

**Toutes les fonctionnalités de cette épique sont en phase 3 et en priorité `W`.** Elles sont utiles, aucune n'est nécessaire au lancement, et elles supposent un modèle de langue avec un coût par appel — donc une ligne de dépense variable à surveiller.

**Le principe qui gouverne l'épique, et il n'est pas négociable** : **le vendeur garde toujours le dernier mot.** Une fiche publiée sans relecture abîmerait sa réputation, et une réponse automatique fausse dans un direct lui coûterait une vente. L'assistant propose, il ne publie jamais.

**Deuxième principe** : tout contenu produit automatiquement est **signalé comme tel** à l'acheteuse quand elle le voit — cohérent avec l'étiquetage du contenu sponsorisé *(F18.8)*.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F12.1 | Fiche produit rédigée depuis une photo | P3 | W | cadre |
| F12.2 | Réponses automatiques aux questions du chat | P3 | W | cadre |
| F12.3 | Bilan de soirée commenté et conseils | P3 | W | cadre |
| F12.4 | Suggestion de prix depuis les ventes comparables | P3 | W | cadre |
| F12.5 | Insights marché pour les marques | P3 | W | cadre |

---

## F12.1 — Fiche produit rédigée depuis une photo

`P3 · W · cadre`

**Conception** — le vendeur photographie un article → l'assistant propose nom, catégorie, matière, description, tailles probables → **elle corrige et valide**.

**C'est la fonctionnalité la plus utile de l'épique** : la création de fiche est l'étape la plus coûteuse pour le vendeur *(F1.1)*, et celle qu'il abandonne le plus. Un gain de deux minutes par article sur trente articles change son quotidien.

**Elle garde toujours le dernier mot** : rien n'est publié sans validation, et les champs proposés sont visuellement distingués des champs saisis.

**Impact base de données** — `article.champs_suggeres jsonb` (trace de ce qui a été proposé et de ce qui a été corrigé). Cette trace est utile : elle mesure la qualité réelle des suggestions, et elle permet de couper la fonctionnalité si elle propose n'importe quoi.

**Endpoints pressentis** — `POST /assistant/fiche` `{ photoUrl }` → suggestions.

**Point de coût** — un appel par article. À plafonner par vendeur et par jour, et à réserver aux paliers d'abonnement si le coût le justifie *(F10.3)*.

```issues
feature: F12.1
titre: Fiche produit rédigée depuis une photo
epic: "12"
phase: P3
prio: W
etapes: [conception, bdd, backend, frontend]
depend: [F1.1]
```

---

## F12.2 — Réponses automatiques aux questions récurrentes du chat

`P3 · W · cadre`

**Conception** — pendant le direct, les questions récurrentes (« c'est combien ? », « taille M dispo ? ») reçoivent une réponse **tirée de la fiche produit**, signalée comme automatique. Le vendeur garde la main sur le reste.

**Le périmètre doit rester étroit, et c'est délibéré** : uniquement des questions dont la réponse est **factuelle et présente dans les données** — prix, tailles disponibles, délai d'expédition, mode de livraison. Aucune question de conseil, aucune négociation, aucune promesse.

Une réponse automatique fausse sur un stock ou un prix produit une commande annulée, donc un litige, donc une perte de confiance. Le coût d'une erreur est très supérieur au gain de temps.

**S'applique aussi aux questions de fiche** *(F1.20)*, où la réponse a une durée de vie plus longue et donc plus de valeur.

**Impact base de données** — `reponse_automatique (contenu, source_champ, contexte)`, `message_direct.automatique bool`.

**Point d'attention** — l'étiquetage « réponse automatique » est obligatoire côté acheteuse. Une réponse automatique qui se fait passer pour la vendeuse est un mensonge, et il se découvre.

```issues
feature: F12.2
titre: Réponses automatiques aux questions récurrentes du chat
epic: "12"
phase: P3
prio: W
etapes: [conception, bdd, backend, frontend]
depend: [F2.10, F1.20]
```

---

## F12.3 — Bilan de soirée commenté et conseils

`P3 · W · cadre`

**Conception** — après le direct, un résumé en langage clair : *« Vos robes sont parties en 4 minutes, les tailles L manquaient. Trois personnes ont demandé du 42. »*

**Se greffe sur des données déjà produites** *(F2.15, F9.1, F9.3)* : la valeur ajoutée est la **formulation**, pas le calcul. C'est ce qui rend la fonctionnalité peu risquée — les chiffres sont exacts par construction, seul le commentaire est généré.

**Garde-fou** : aucun conseil chiffré inventé. « Baissez votre prix de 10 % » n'est acceptable que si le calcul le soutient et que la règle est explicable *(comme pour le score, R-T10)*.

**Impact base de données** — `direct_bilan.commentaire_genere` *(F2.15)*.

```issues
feature: F12.3
titre: Bilan de soirée commenté et conseils
epic: "12"
phase: P3
prio: W
etapes: [conception, bdd, backend, frontend]
depend: [F2.15, F9.3]
```

---

## F12.4 — Suggestion de prix à partir des ventes comparables

`P3 · W · cadre`

**Conception** — proposer une fourchette de prix à partir des ventes réelles d'articles comparables (catégorie, marque, état, taille).

**Ce n'est pas une fonctionnalité de modèle de langue, c'est une statistique** : médiane et quartiles des ventes confirmées comparables. À ce titre, elle est plus fiable et moins coûteuse que le reste de l'épique, et elle pourrait être avancée si le besoin se confirme.

**Deux garde-fous.**
- **Effectif minimal** avant de suggérer : une fourchette calculée sur trois ventes est du bruit présenté comme un conseil.
- **Ne jamais imposer.** Le vendeur connaît son coût d'achat, que la plateforme ignore. Une suggestion qui l'amènerait à vendre à perte détruirait la confiance qu'il a dans le produit.

**Impact base de données** — agrégats depuis `ligne_commande` des commandes confirmées, par catégorie et par état *(F1.18)*.

```issues
feature: F12.4
titre: Suggestion de prix à partir des ventes comparables
epic: "12"
phase: P3
prio: W
etapes: [conception, backend, frontend]
depend: [F9.3]
```

---

## F12.5 — Insights marché pour les marques

`P3 · W · cadre` — **voir** F10.8

**Conception** — restitution des tendances de marché aux marques partenaires *(F18.6)*.

**Le point à trancher est le même que pour `F10.8`, et il est le seul qui compte** : l'anonymisation doit être **réelle et démontrable**. Des agrégats à faible effectif permettent de réidentifier un vendeur ou une acheteuse. Seuil minimal d'effectif par agrégat, aucune donnée nominative, et une revue explicite avant toute diffusion externe.

Sur un produit dont l'actif est la confiance, une donnée mal anonymisée revendue est la faute la plus coûteuse imaginable — plus coûteuse qu'une fuite technique, parce qu'elle serait volontaire.

```issues
feature: F12.5
titre: Insights marché pour les marques
epic: "12"
phase: P3
prio: W
etapes: [conception, backend]
depend: [F10.8]
```

---

*Épique suivante : [EP18-premium](EP18-premium.md).*
