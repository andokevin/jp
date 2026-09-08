---
'@jp/identite': patch
---

**Les libellés d'écran n'avaient aucun filet.**

Ils ne sont pas dans `@jp/i18n` — ils n'ont pas d'équivalent anglais, et le test
de largeur de ce paquet mesure tout contre l'anglais. Ils sont donc arrivés
dans `@jp/identite` sans qu'aucun test ne les regarde. Vingt-huit en posent un,
sur les trois choses qu'un test PEUT juger :

- **les deux catalogues portent les mêmes clés.** Une clé d'un seul côté rendrait
  `undefined` dans une langue sans que le typage bronche, les deux objets étant
  typés par la même interface ;
- **les mêmes jetons `{…}` de part et d'autre.** C'est la moitié fermable de la
  classe de défauts déjà vécue ici : `OTP_INVALIDE` passait `{essais}` à un
  gabarit qui réclamait `{restantes}`, et le nombre n'arrivait jamais ;
- **les trois titres tiennent dans leurs deux lignes.** La boîte fait 88 dp de
  hauteur FIXE, pour que le malgache et le français aient le même rythme
  vertical. Une troisième ligne ne serait pas coupée, elle serait tronquée en
  silence. Le budget est estimé et l'estimation est dite dans le fichier.

**Ce qu'aucun test ne saura juger** — la justesse du malgache — part en
relecture chez un locuteur, avec trois doutes déjà argumentés :

1. `ecran2Validite` — le français dit « valide encore 9:42 », une DURÉE qui
   décompte ; le malgache semble dire « jusqu'à l'arrivée de 9:42 », une heure.
   Les deux langues ne décrivent pas la même chose.
2. `anarana` traduit `prénom` dans trois chaînes. Si le mot se comprend comme le
   nom complet, une commande affichera deux noms là où l'écran est dessiné pour
   un.
3. `ecran2Envoye` — « Nalefa tany amin'ny » : `tany` devant une adresse e-mail.

**Sept phrases contredisent la maquette au passage.** Elle pose que les boîtes
sont dimensionnées sur le malgache et que le français s'y glisse sans retouche.
C'est faux pour sept des vingt-et-une : `attente` va jusqu'à × 1,75
(« Andrasana... » contre « Veuillez patienter... »). Rien ne casse aujourd'hui,
les boîtes ayant de la marge — mais la prémisse est fausse, et elle est écrite
dans la maquette comme si elle tenait.
