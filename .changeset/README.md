# Les changesets

Un **changeset** est un fichier Markdown qui décrit un changement : quels
paquets il touche, à quel niveau, et ce qu'il faut en dire aux autres.

Ce dossier est **une file d'attente en clair dans le dépôt**. Les fichiers s'y
accumulent au fil des pull requests, et `changeset version` les consomme d'un
coup pour bumper les versions et écrire les `CHANGELOG.md`.

## En créer un

```bash
pnpm changeset
```

L'outil demande les paquets touchés, le niveau — `patch`, `minor`, `major` — et
un résumé. Il écrit un fichier ici. **Ce fichier fait partie de votre pull
request** : la CI le vérifie.

**Le résumé est lu par quelqu'un d'autre, dans six mois.** Écrivez ce qui
change pour l'utilisateur, pas le nom de la fonction que vous avez modifiée.

## Quand un changement ne mérite pas de version

Une correction de documentation, un renommage interne, une mise à jour du plan :
il n'y a rien à versionner, mais la CI veut un changeset.

```bash
pnpm changeset --empty
```

Cela produit un changeset vide, qui satisfait la vérification **sans** bumper
quoi que ce soit. C'est un choix explicite, pas un contournement.

## Ce que la configuration a de particulier ici

**`privatePackages: { version: true, tag: false }`** — les neuf paquets de JP
sont `private: true`. Par défaut, Changesets les ignorerait entièrement : il est
fait pour publier sur npm, et un paquet privé n'a rien à publier. Sans cette
ligne, l'outil tournerait sans jamais rien produire.

**`fixed: [["@jp/*"]]`** — les neuf paquets partagent **une seule version**. JP
n'est pas une collection de bibliothèques indépendantes, c'est un produit qui se
déploie d'un bloc. `@jp/ui` en 0.3.0 face à `@jp/api` en 1.2.0 ne décrirait rien
de réel.

**`baseBranch: "master"`** — c'est la branche à laquelle `changeset status` se
compare pour décider si la pull request apporte un changeset.

**Aucune publication.** Rien n'est envoyé à un registre. `release.yml` ouvre une
pull request « Version Packages » et s'arrête là.

---

*Documentation amont : <https://github.com/changesets/changesets>*
