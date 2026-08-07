# vp/ — le modèle UML, pour Visual Paradigm

## Ce qu'il y a dans le dossier

| Fichier | Contenu |
|---|---|
| **`JP.xmi`** | Le modèle complet, en XMI 2.1 / UML 2.x — **le fichier à importer** |
| `plantuml/classes.puml` | Le diagramme de classes en PlantUML |
| `plantuml/cas-utilisation.puml` | Le diagramme de cas d'utilisation en PlantUML |
| `plantuml/sequence-uc-XX.puml` | Un diagramme de séquence par cas d'utilisation |

Contenu du modèle :

| Élément | Nombre |
|---|---|
| Classes | **98** |
| Attributs | 561 |
| Associations avec multiplicités | 89 |
| Acteurs | 16 |
| Cas d'utilisation | **30** |
| Liens acteur ↔ cas d'utilisation | 93 |
| Diagrammes de séquence | **30** — un par cas d'utilisation |
| Messages | 625 |

Le modèle est **généré**, jamais écrit à la main :

```bash
node scripts/gen-xmi.mjs
```

Sa source est le corpus markdown — `JP_CONCEPTION_BDD.md` pour les classes, `JP_CAS_UTILISATION.md` pour les acteurs, les cas d'utilisation et les séquences. Un changement dans les documents se répercute d'une commande. **Ne modifiez pas `JP.xmi` à la main** : la prochaine génération l'écraserait.

---

## Importer dans Visual Paradigm

**Le format natif `.vpp` est propriétaire.** Il ne peut pas être écrit en dehors de Visual Paradigm — aucun outil externe ne le produit. XMI est le chemin d'import documenté, et c'est celui-ci.

1. **File → Import → XMI…**
2. Choisir `vp/JP.xmi`, version XMI **2.1**
3. Importer dans un projet vide

Les éléments arrivent dans le **Model Explorer**, rangés en trois paquets :

```
JP — Je prends
├─ Types
├─ 1 — Modèle du domaine        98 classes, par domaine
├─ 2 — Cas d'utilisation        Acteurs + un paquet par paquetage
└─ 3 — Diagrammes de séquence   30 collaborations, une par cas d'utilisation
```

**À savoir avant de commencer.** XMI transporte le **modèle**, pas la mise en page. Visual Paradigm n'a aucune coordonnée à lire : les éléments arrivent, les diagrammes sont à composer. C'est une limite du format, pas du fichier.

Pour obtenir un diagramme à partir du modèle importé :

- **Diagramme de classes** — clic droit sur un paquet du Model Explorer → *Create Diagram* → *Class Diagram*, puis glisser les classes du paquet, puis **Diagram → Layout → Auto Layout**. Procédez **paquet par paquet** : 98 classes sur une seule page ne se lisent pas.
- **Diagramme de cas d'utilisation** — même chose depuis le paquet `2 — Cas d'utilisation`. Les associations acteur ↔ cas d'utilisation apparaissent automatiquement dès que les deux extrémités sont sur le diagramme.
- **Diagramme de séquence** — clic droit sur une collaboration `UC-xx` → *Sub Diagrams* → *Sequence Diagram*. Les lignes de vie et les messages sont déjà dans l'interaction, dans l'ordre.

---

## Deux conversions assumées

**Les cardinalités.** La notation « patte de corbeau » des diagrammes ER est traduite en multiplicités UML :

| ER | UML |
|---|---|
| `\|\|` | `1..1` |
| `\|o` `o\|` | `0..1` |
| `}o` `o{` | `0..*` |
| `}\|` `\|{` | `1..*` |

**Les fragments combinés.** Les `alt` / `else` / `opt` / `loop` des diagrammes source ne sont **pas** transportés comme `CombinedFragment` UML : ils sont aplatis, et leur garde est reportée **en préfixe du nom du message**.

```
[débit dépassé] 429 + délai restant
[palier perdu entre-temps (A3)] retire la remise, la commande n'échoue pas
```

C'est un choix, pas un oubli. Un `CombinedFragment` mal formé fait échouer l'import entier ou produit un diagramme vide ; un préfixe de garde conserve l'information et importe toujours. **Les diagrammes complets, avec leurs vrais fragments, sont ceux de `JP_CAS_UTILISATION.md`** — GitHub les rend nativement. Le XMI est là pour alimenter l'outil, pas pour remplacer le document.

---

## Le second chemin : PlantUML

`plantuml/` contient les mêmes diagrammes en PlantUML, avec — cette fois — les fragments préservés. Utile pour :

- une lecture ou une revue rapide, sans ouvrir Visual Paradigm ;
- l'export en PNG ou SVG, à coller dans un document :
  ```bash
  plantuml -tsvg vp/plantuml/*.puml
  ```
- tout outil de modélisation qui lit PlantUML.

---

## Ce que le modèle ne contient pas

- **Les machines à états.** Les cinq `stateDiagram-v2` de `JP_CONCEPTION_BDD.md` ne sont pas convertis. Ce sont les états de `commande`, `reservation`, `paiement`, `colis`, `promotion` et `evenement` : ils se lisent dans le document, et se redessinent en quelques minutes dans Visual Paradigm si vous en avez besoin comme diagrammes d'état.
- **Les diagrammes d'activité et de composants.** L'architecture applicative est décrite dans `JP_CONCEPTION_APP.md`, sous forme de diagrammes de dépendance entre modules — pas en UML formel.
- **Les 17 tables du domaine Exploitation** n'ont pas d'attributs : elles sont documentées sous forme de tableau dans `JP_CONCEPTION_BDD.md`, sans diagramme ER. Elles sont présentes comme classes, avec leur rôle en commentaire, pour que le modèle soit complet — mais elles arriveront vides.

Une redondance à connaître : les clés étrangères apparaissent **deux fois** — comme attributs `«FK»` de la classe, parce qu'elles sont dans les diagrammes ER source, **et** comme associations. C'est la trace de l'origine relationnelle du modèle. Si vous voulez un diagramme de classes strictement UML, masquez les attributs `«FK»` à l'affichage plutôt que de les supprimer : la prochaine génération les remettrait.
