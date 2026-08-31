# JP — Le dossier de marque

> **Objet.** Construire la marque JP avec quatre cadres éprouvés, appliqués au
> marché malgache réel — puis en tirer des **décisions**, pas des intentions.
>
> Produit le 26 août 2026.

---

## Par où commencer

**Si vous n'avez que dix minutes** → [`05_PLATEFORME_DE_MARQUE.md`](05_PLATEFORME_DE_MARQUE.md),
§1 *(la marque en une page)* et §13 *(les 20 décisions)*.

**Si vous devez écrire un texte, un écran ou une affiche** →
[`05_PLATEFORME_DE_MARQUE.md`](05_PLATEFORME_DE_MARQUE.md), §7 à §10.

**Si vous devez arbitrer une fonctionnalité** →
[`05_PLATEFORME_DE_MARQUE.md`](05_PLATEFORME_DE_MARQUE.md) §12, et
[`04_LOIS_RIES.md`](04_LOIS_RIES.md) loi 22 *(le test de rattachement)*.

**Si quelqu'un conteste une décision** → le document du cadre qui la fonde.

---

## Les sept documents

| # | Document | Cadre | Ce qu'il produit |
|---|---|---|---|
| **1** | [`01_BRANDSCRIPT.md`](01_BRANDSCRIPT.md) | **StoryBrand SB7** — Donald Miller | **4 BrandScripts** — acheteuse, boutique, créatrice, diaspora. Les vilains, les plans, les appels à l'action, les *one-liners* |
| **2** | [`02_CERCLE_DOR.md`](02_CERCLE_DOR.md) | **Le Cercle d'Or** — Simon Sinek | Le **Pourquoi**, les 5 principes du **Comment**, le **Quoi**, le manifeste, et 3 corrections de communication |
| **3** | [`03_ZAG.md`](03_ZAG.md) | **Zag** — Marty Neumeier | Les **17 points de contrôle**, l'énoncé d'unicité, **les 3 zags**, l'ennemi, le cri de ralliement, ce qu'il faut ajouter et retirer |
| **4** | [`04_LOIS_RIES.md`](04_LOIS_RIES.md) | **Les 22 lois du branding** — Al & Laura Ries | Les **3 lois que nous violons**, le mot à posséder, la catégorie à créer, la couleur, la forme du logo |
| **5** | [**`05_PLATEFORME_DE_MARQUE.md`**](05_PLATEFORME_DE_MARQUE.md) | **L'englobement** | **Le document de travail.** Positionnement · audience · valeur · histoire · personnalité · ton · lexique · **les mots de chaque écran** · nom et slogan · **logo et prompt Stitch** · **fonctionnalités à ajouter, améliorer, retirer** · **20 décisions** |
| **6** | [`06_ETUDE_MARCHE.md`](06_ETUDE_MARCHE.md) | **L'étude terrain** | Les faits vérifiés et sourcés qui **tranchent** une décision : marché, paiement, réglementation, langue, couleurs relevées, le nom |
| **7** | [`07_CONCURRENCE.md`](07_CONCURRENCE.md) | **La carte** | Ce que chaque concurrent revendique, **verbatim** — et **les 8 espaces vacants** |

**Ordre de lecture recommandé** : `06` → `07` → `01` → `02` → `03` → `04` → `05`.
*(Les preuves, puis les raisonnements, puis les décisions.)*

---

## La marque, en dix lignes

| | |
|---|---|
| **Nom** | **JP — Je prends** *(jamais séparés)* |
| **Catégorie** | **Le direct protégé** — créée, pas disputée |
| **Pourquoi** | *Personne ne devrait avoir besoin d'être connu pour pouvoir commercer.* |
| **Mono-idée** | **Vous savez à qui vous payez.** |
| **Mot possédé** | **« reçu »** |
| **Ennemi** | **Le numéro personnel.** *Un numéro. Un virement. Et l'espoir.* |
| **Signature** | **« Je prends. Je reçois. »** |
| **Voix** | **JP vous vouvoie. Vous parlez à la première personne.** |
| **Registre** | **Le soulagement.** Jamais l'enthousiasme |
| **Couleur** | Violet `#7C2D92` |

---

## Les trois choses à faire avant de dépenser un ariary en identité

| # | Action | Pourquoi |
|---|---|---|
| **A-01** | **Observer 10 à 20 directs malgaches** et compter les mots-clés de commande réellement tapés | La seule source qui atteste « je prends » date de **2013** et décrit la vente **par post photo, pas par direct**. **C'est le test de vie ou de mort du nom.** |
| **A-02** | **Antériorité OMAPI** sur « JP », classes 35 / 38 / 42 | Le registre n'est pas consultable en ligne. ≈ 180 000 Ar |
| **A-03** | **Avis juridique** sur la conservation de fonds par un tiers non agréé *(loi 2016-056, art. 79-80)* | **Principal risque du projet.** La formulation publique de notre promesse en dépend |

---

## Ce que ce dossier remet en cause dans l'existant

| Élément | Où | Décision |
|---|---|---|
| `LANGUES = ['en', 'fr']` | [`packages/i18n/src/langues.ts`](../../packages/i18n/src/langues.ts) | ❌ **L'anglais n'a aucun destinataire.** `N4.1` impose **mg + fr** — `D-04` |
| *« Achetez en confiance, partout à Madagascar »* | [`plan/EP00-identite.md`](../../plan/EP00-identite.md) | ❌ Générique + deux mots interdits — `M-1` |
| *« Vous savez à qui vous payez »* ✅ *(`D-21`)* | [`plan/EP04-paiement.md`](../../plan/EP04-paiement.md) | ⚠️ **Exposition juridique** — `D-02` |
| Garantie visible **seulement** après paiement | `R-E1` | ❌ **La peur agit avant de payer** — `A-1` |
| ~~« en attente de confirmation »~~ | — | ❌ **Sans objet** *(`DP-07`)* — JP ne tient aucun solde |
| « JP Club » | Modèle économique | ❌ Sous-marque, et risque de faire payer la confiance — `D-11` |
| Régie publicitaire, assistant IA, enchères | Modèle, EP12, phase 3 | ❌ **À retirer du discours** — `R-1`, `R-2`, `R-3` |
| Violet `#7C2D92` | [`packages/ui/src/jetons.ts`](../../packages/ui/src/jetons.ts) | ✅ **Confirmé et désormais justifié** — `D-06` |
| Un accent par univers, un seul design system | [`packages/ui/src/univers.ts`](../../packages/ui/src/univers.ts) | ✅ **Respecte exactement la loi des sous-marques** |

---

## Méthode

Les études `06` et `07` reposent sur une recherche terrain menée en août 2026 :
sources primaires quand elles existent, sources de presse identifiées sinon, et
**trois niveaux de fiabilité affichés** — `[V]` vérifié · `[P]` probable · `[?]`
non vérifié.

**Aucune décision de ce dossier ne s'appuie sur un fait marqué `[?]`.** Les
chiffres invérifiables qui circulent sur le marché malgache — taille du
e-commerce, part de Facebook dans les achats, audience TikTok — sont
**explicitement écartés**, et la raison est donnée.

Deux relevés ont été faits directement, faute de source publiée : **les couleurs
de marque de Yas et de MVola**, extraites des feuilles de style de leurs sites
officiels.

---

*Dossier lié : [`../JP_POSITIONNEMENT.md`](../JP_POSITIONNEMENT.md) ·
[`../JP_DECK.md`](../JP_DECK.md) · [`../JP_BACKLOG.md`](../JP_BACKLOG.md)*
