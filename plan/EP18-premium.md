# EP18 — Premium, JP Club et marques

> 10 fonctionnalités · vague 3 · modules `exploitation`, `contenu`.
> Socle : [PLAN_SOCLE.md](PLAN_SOCLE.md) · gabarit détaillé : [EP00-identite.md](EP00-identite.md).

> **Premium = statut, pas tarif.** Le luxe de prix n'a pas de marché ici ; le luxe de **statut** coûte presque rien et fonctionne très bien.

**Une seule fonctionnalité de cette épique est en phase 1** : `F18.4`, le badge créatrice vérifiée. Et une est en phase 2 avec priorité `M` : `F18.8`, l'étiquetage du contenu sponsorisé — **non négociable dès qu'il existe du contenu rémunéré**.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F18.4 | Badge créatrice vérifiée | P1 | S | moyen |
| F18.8 | Étiquetage obligatoire du contenu sponsorisé | P2 | M | complet |
| F18.1 | « JP Sélect » | P2 | S | moyen |
| F18.3 | JP Club, abonnement acheteuse | P2 | S | complet |
| F18.2 | « Le Journal JP » | P2 | C | cadre |
| F18.6 | Espace marque, campagnes et briefs | P3 | S | moyen |
| F18.7 | Place de marché des collaborations | P3 | S | cadre |
| F18.9 | Mesure de campagne pour la marque | P3 | S | moyen |
| F18.5 | Conciergerie / personal shopper | P3 | W | cadre |
| F18.10 | Régie publicitaire display ⚠️ | P3 | W | cadre |

---

## F18.8 — Étiquetage obligatoire du contenu sponsorisé

`P2 · M · complet` — **Règles** R-K14 · **non négociable**

### 1. Conception

**A** voit une mention claire **« Partenariat rémunéré »** sur tout contenu payé.

**Non négociable** : sur un produit dont l'actif est la confiance, **un sponsoring caché découvert une fois détruit la crédibilité de tout le fil** — pas seulement du contenu concerné. Le coût d'une découverte est disproportionné par rapport au gain d'une mention discrète.

**Trois cas à couvrir**, et il faut les trois :
1. un contenu produit dans le cadre d'un partenariat boutique ↔ créatrice *(F15.11, F15.12)* ;
2. un contenu produit pour une campagne de marque *(F18.6)* ;
3. une mise en avant payée *(F10.5, F8.6)* — mention « Sponsorisé », qui est un cas distinct : c'est l'emplacement qui est payé, pas le contenu.

**La mention est portée par la donnée, pas par la bonne volonté de l'autrice.** Un contenu rattaché à un partenariat ou à une campagne est étiqueté **automatiquement** ; l'autrice ne peut pas retirer l'étiquette. C'est le seul dispositif qui tient.

**Déclaration volontaire** possible en plus, pour un partenariat conclu hors plateforme : bouton « Ce contenu est un partenariat ». Ne pas le proposer serait pousser à masquer.

### 2. Structure de code
```
apps/api/src/modules/contenu/
├─ sponsoring.ts        résolution automatique de l'étiquette
└─ sponsoring.test.ts
packages/ui/src/EtiquetteSponsorise.tsx     ← composant partagé, non masquable
apps/mobile/src/features/publication/composants/DeclarationPartenariat.tsx
```

### 3. Base de données
```
contenu
  + partenariat_id FK null · campagne_id FK null
  + sponsorise_declare bool DEFAULT false
  -- étiquette = partenariat_id IS NOT NULL OR campagne_id IS NOT NULL
  --             OR sponsorise_declare
```

L'étiquette est **calculée**, jamais saisie : impossible de publier un contenu rattaché à une campagne sans étiquette.

### 4. Design
**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :
```
Component sheet — sponsorship labels, three variants, all clearly legible.
Variant 1, paid partnership on a clip: directly under the author name, a small
but high-contrast row with a handshake icon reading "Partenariat rémunéré", never
greyed into invisibility, never truncated.
Variant 2, brand campaign: the same row reading "Partenariat rémunéré · Marque X".
Variant 3, paid placement in the feed: a row above the author name reading
"Sponsorisé", visually distinct from variant 1 — the placement is paid, not the
content.
Add a documentation frame showing the WRONG version: the label in light grey at
4pt below the fold, marked with a red X and the caption "Une mention illisible
équivaut à une absence de mention."
Also produce the voluntary declaration toggle inside the publish flow: a row
"Ce contenu est un partenariat rémunéré" with a toggle and a helper line
"Obligatoire si vous avez été payée ou avez reçu l'article gratuitement."
```

### 5. Backend
Résolution de l'étiquette à la publication et à chaque projection de contenu. `POST /contenus/:id/declaration-partenariat`.

**Tests** : contenu rattaché à un partenariat → **étiquette présente dans toutes les projections** (fil, clip, story, profil, page de hashtag, page d'événement) ; étiquette **non retirable** par l'autrice ; déclaration volontaire fonctionnelle ; mise en avant → mention « Sponsorisé » distincte ; test paramétré vérifiant que chaque surface d'affichage de contenu inclut le champ.

### 6. Frontend
Composant partagé, **jamais réimplémenté**. Contraste et taille minimaux imposés par le composant lui-même — une mention illisible équivaut à une absence de mention.

```issues
feature: F18.8
titre: Étiquetage obligatoire du contenu sponsorisé
epic: "18"
phase: P2
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F14.5, F15.11]
```

---

## F18.3 — JP Club, abonnement acheteuse

`P2 · S · complet` — **⚠️ prix à caler**

### 1. Conception

Abonnement mensuel modeste → **livraison offerte au-delà d'un montant**, accès anticipé aux directs et aux collections *(F7.10)*, cagnotte majorée *(F7.7)*, badge visible.

**⚠️ Le seul avantage qui compte vraiment sur ce marché est la livraison offerte.** Les autres sont du statut — ce qui n'est pas un défaut : le statut coûte presque rien à produire et fonctionne bien. Mais il ne faut pas se tromper sur ce qui déclenche l'abonnement.

**Pourquoi c'est mieux que la publicité comme source de revenu** : revenu récurrent, prévisible, sans coût marginal, et qui **renforce** l'expérience au lieu de la dégrader.

**Le point économique à surveiller** : la livraison offerte est un coût réel et variable. L'abonnement doit être calibré sur le nombre de commandes moyen d'une abonnée, et **le seuil de gratuité est le levier de sécurité** — pas le prix de l'abonnement. À paramétrer *(R-O1)*.

**Interaction avec les remises** *(R-U7)* : la livraison offerte du Club porte sur l'assiette « livraison », elle **peut donc coexister** avec une remise sur les articles. C'est l'exception documentée de la règle de non-cumul, et elle s'applique naturellement ici.

### 2. Structure de code
```
apps/api/src/modules/fidelite/
├─ club.ts            adhésion, renouvellement, avantages
└─ club.test.ts
apps/api/src/modules/promotion/calcul.ts     ← intègre l'avantage Club
apps/api/src/jobs/renouvellementClub.ts
apps/mobile/src/features/club/ecrans/{EcranClub,EcranAdhesion}.tsx
```

### 3. Base de données
```
adhesion_club
  id PK · utilisateur_id FK
  statut(active|suspendue|resiliee) · debut_le · prochaine_echeance_le
  paiement_id FK null
  IDX(prochaine_echeance_le) WHERE statut = 'active'
```

Paramètres : `club_prix_mensuel`, `club_seuil_livraison_offerte`, `club_taux_cagnotte`.

### 4. Design
**Prompt Stitch** — préambule commun, puis :
```
Screen 1 — "JP Club" (buyer).
Vertical order: a warm premium header with a small crown, title "JP Club";
the price stated plainly "5 000 Ar par mois, sans engagement";
then a benefits list where the FIRST item is visually dominant: a large bordered
card with a truck icon, "Livraison offerte dès 40 000 Ar", and a line "Vous
économisez 5 000 à 12 000 Ar par commande"; followed by three smaller rows with
icons: "Accès aux directs 15 minutes avant tout le monde", "Cagnotte doublée sur
vos unboxings", "Badge Club sur votre profil";
then a personalised savings estimate card: "Avec vos 3 commandes par mois, vous
économiseriez environ 21 000 Ar" (computed from her own history);
a full-width primary button "Rejoindre le Club" and a text link "Résilier à tout
moment".

Screen 2 — Club member state: the same screen with a "Membre depuis mars" chip,
a savings-to-date card "Vous avez économisé 84 000 Ar depuis votre adhésion", the
next renewal date, and a discreet "Gérer mon abonnement" link.

Screen 3 — the Club benefit as it appears in the cart: a green row in the totals
block reading "JP Club : livraison offerte" showing "−5 000 Ar", coexisting with
another green row "Promo Noël −20 %" — both applied, because they concern
different amounts.
```

### 5. Backend
`POST /club/adhesion` · `DELETE /club/adhesion` · avantage appliqué dans `calcul.ts` *(F3.15)* · renouvellement mensuel.

**Tests** : livraison offerte appliquée au-dessus du seuil, **pas en dessous** ; cumul livraison offerte + remise articles autorisé *(R-U7)* ; échéance impayée → adhésion suspendue, **avantages retirés sans supprimer le compte** ; résiliation → avantages jusqu'à l'échéance payée ; estimation d'économie calculée sur l'historique réel de l'acheteuse.

### 6. Frontend
L'avantage livraison est **dominant** à l'écran, et l'estimation d'économie est **personnalisée** — un argument chiffré sur ses propres commandes convertit mieux qu'une liste de bénéfices.

```issues
feature: F18.3
titre: JP Club, abonnement acheteuse
epic: "18"
phase: P2
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F3.15, F4.1]
```

---

## F18.4 — Badge créatrice vérifiée

`P1 · S · moyen` — **Voir** F0.7

**Conception** — même mécanique que le badge boutique *(F0.7)*, libellé distinct : « Créatrice vérifiée ». Affiché sur le profil, les contenus, la sélection, et partout où la créatrice apparaît.

**Trois variantes du badge existent donc** : boutique vérifiée, particulier vérifié *(R-H6)*, créatrice vérifiée. Un seul composant partagé `packages/ui/src/BadgeVerifie.tsx` *(F0.7)*, trois libellés — pas trois implémentations.

**Base de données** — `profil_createur.badge_verifie` *(CDC §3.1)*.

**Tests** : badge présent sur toutes les surfaces où une créatrice apparaît (test paramétré) ; libellé distinct du badge boutique ; absent si non vérifiée.

```issues
feature: F18.4
titre: Badge créatrice vérifiée
epic: "18"
phase: P1
prio: S
etapes: [conception, design, backend, frontend]
depend: [F0.7, F15.1]
```

---

## F18.1 — « JP Sélect », sélection éditoriale

`P2 · S · moyen`

**Conception** — sélection éditoriale de boutiques et d'articles, curée par l'équipe. **La sélection est ce qui crée la valeur** — c'est le même raisonnement que la validation des candidatures d'événement *(R-W3)*.

**Ce que JP Sélect apporte à une petite boutique** : une visibilité qu'elle ne pourrait pas acheter *(F10.5)*, et un signal de qualité qui n'est pas un score calculé *(F6.2)* mais un choix assumé.

**Ce qu'il ne doit pas devenir** : un emplacement vendu. Si JP Sélect devient payant, il perd exactement ce qui le rend crédible. À garder distinct de la mise en avant sponsorisée *(F8.6)*, y compris visuellement.

**Base de données** — `selection_editoriale (id, titre, description, visuel, position, actif)`, `selection_editoriale_element (selection_id, cible_type, cible_id, position)`.

**Backend** — `GET /jp-select`, **sélection par règles automatiques** *(`DP-05`)* — il n'y a plus de back-office.

**Design** — Prompt Stitch : *"JP Sélect" section on the home feed with an editorial header, a short curator note in italics ("Notre sélection de la semaine : les cotonnades légères"), and a horizontal carousel of curated product cards each with a small editorial ribbon; visually distinct from the sponsored cards (no "Sponsorisé" label, different ribbon shape) so the two are never confused.*

**Tests** : sélection affichée ; visuellement distincte du sponsorisé ; élément retiré de la vente → retiré de la sélection sans casser la page.

```issues
feature: F18.1
titre: JP Sélect, sélection éditoriale
epic: "18"
phase: P2
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F8.1]
```

---

## F18.6 / F18.9 — Espace marque, campagnes et mesure

`P3 · S · moyen`

**Conception** — **PM** crée une campagne → brief, budget, profil de créatrices recherché, articles concernés → les créatrices candidatent → elle sélectionne → suit les publications, les vues, les clics et **les ventes générées** → paie via la plateforme, **JP prélève sa part**.

**C'est la forme rentable de la publicité à cette échelle** — de la campagne mesurée jusqu'à la vente, pas de l'impression au CPM. Le CPM sur une audience malgache est trop faible pour financer quoi que ce soit ; la vente attribuée, elle, a une valeur réelle.

**F18.9 — mesure de campagne** : le livrable vendu à la marque n'est pas une audience, c'est un **chiffre d'affaires attribué**. Réutilise l'attribution d'affiliation *(F15.4)* avec une dimension supplémentaire.

**Étiquetage obligatoire** *(F18.8)* sur tout contenu de campagne, automatiquement.

**Base de données** :
```
campagne
  id PK · marque_id FK · titre · brief · budget · statut
  profil_recherche jsonb · debut_le · fin_le
campagne_candidature
  campagne_id FK · createur_id FK · statut · decide_le
campagne_contenu
  campagne_id FK · contenu_id FK · remuneration
```

**Backend** — `POST /marque/campagnes`, `POST /campagnes/:id/candidatures`, `GET /marque/campagnes/:id/mesure`.

**Design** — Prompt Stitch : *brand campaign dashboard (desktop) with a campaign header, a creator roster showing each participant with her published content, views, clicks and, in bold, the attributed revenue; a funnel summary; and a spend-versus-generated-revenue comparison card with a plain verdict line "Budget 500 000 Ar → 2 100 000 Ar de ventes attribuées".*

**Tests** : candidature et sélection ; contenu de campagne **étiqueté automatiquement** *(F18.8)* ; ventes attribuées à la campagne **et** à la créatrice sans double comptage ; rémunération versée au portefeuille créatrice *(F15.10)* ; part JP prélevée.

```issues
feature: F18.6
titre: Espace marque, campagnes et briefs
epic: "18"
phase: P3
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F15.4, F18.8]
```
```issues
feature: F18.9
titre: Mesure de campagne pour la marque
epic: "18"
phase: P3
prio: S
etapes: [conception, design, backend, frontend]
depend: [F18.6]
```

---

## F18.2 — « Le Journal JP », éditorial et lookbooks

`P2 · C · cadre`

**Conception** — contenu éditorial : tendances, lookbooks, portraits de boutiques. **Chaque article éditorial porte des produits achetables** — la règle d'or de l'épique 14 s'applique aussi à l'éditorial, sinon c'est un blog.

**Impact base de données** — `article_editorial (id, titre, corps, visuel, publie_le)`, réutilise `evenement_element` pour les produits rattachés ou une table équivalente.

**Point d'attention** — c'est une charge de production continue. Sans quelqu'un pour l'alimenter, un journal vide est pire qu'une absence de journal.

```issues
feature: F18.2
titre: Le Journal JP, éditorial et lookbooks
epic: "18"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F18.1]
```

---

## F18.7 — Place de marché des collaborations marque ↔ créatrice

`P3 · S · cadre`

**Conception** — extension de `F18.6` : les créatrices se rendent découvrables par les marques, avec leurs statistiques réelles *(F15.6)*.

**Le point qui la rend délicate** : exposer les statistiques d'une créatrice à des marques est une donnée sensible pour elle (son taux de conversion est son argument de négociation). Elle doit **choisir** ce qu'elle expose, et le produit ne doit pas transformer sa transparence en désavantage.

```issues
feature: F18.7
titre: Place de marché des collaborations marque et créatrice
epic: "18"
phase: P3
prio: S
etapes: [conception, bdd, backend, frontend]
depend: [F18.6]
```

---

## F18.5 — Conciergerie / personal shopper

`P3 · W · cadre`

**Conception** — un service humain d'accompagnement à l'achat pour les paniers élevés, notamment sur le canal cadeau *(EP16)* où le donateur ne connaît pas les tailles de la destinataire.

**Ce n'est pas une fonctionnalité logicielle, c'est un service** : sa faisabilité dépend d'un coût humain par panier, à comparer au panier moyen du canal cadeau. À évaluer avec les chiffres du pilote *(F11.7)*, pas avant.

```issues
feature: F18.5
titre: Conciergerie et personal shopper
epic: "18"
phase: P3
prio: W
etapes: [conception, backend, frontend]
depend: [F16.4]
```

---

## F18.10 — Régie publicitaire display ⚠️

`P3 · W · cadre` — **aucun développement en V1**

**Conception** — **à ouvrir seulement quand l'audience le justifie**, avec des annonceurs locaux (télécoms, banques, grande consommation), **pas de programmatique**.

**Le raisonnement, et il est définitif pour la V1** : le CPM sur une audience malgache est trop faible pour en faire un pilier. C'est **le sixième revenu du modèle, pas le premier** — après la commission, l'abonnement boutique, les mises en avant, le JP Club et les campagnes de marque, qui rapportent tous davantage et **sans dégrader l'expérience**.

**Et le coût caché est le vrai argument** : une bannière display abîme la confiance et le budget de données *(C1, C2)* — les deux actifs du produit — pour un revenu marginal. Aucun développement en V1, et la mention ici sert à documenter le refus, pas à préparer la fonctionnalité.

```issues
feature: F18.10
titre: Régie publicitaire display
epic: "18"
phase: P3
prio: W
etapes: [conception]
depend: []
```

---

*Toutes les épiques sont couvertes. Voir [PLAN_INDEX](PLAN_INDEX.md) pour la carte complète, et `../docs/JP_CAS_UTILISATION.md` pour les cas d'utilisation et les diagrammes de séquence.*
