---
'@jp/identite': minor
'@jp/mobile': minor
---

**« Votre session a expiré » se dit enfin.**

`session.ts` distinguait « aucune » de « périmée » depuis S8.2 en expliquant que
les deux ne se racontent pas pareil — mais rien ne les racontait. L'écran
s'ouvrait à l'identique dans les deux cas.

**L'avis prend la place de la ligne de soutien**, il ne s'y ajoute pas. Elle est
sous le titre, sa boîte réserve déjà deux lignes, donc l'échange ne décale rien
et n'ajoute aucun élément à une maquette qui n'en prévoyait pas. Les deux
messages ne sont jamais utiles ensemble : « nous vous enverrons un code » dit ce
qui va se passer, « votre session a expiré » dit pourquoi vous êtes là — et
sous-entend la même suite.

**`departDepuis` rend un motif, plus un drapeau `nettoyer`.** Le motif porte
maintenant deux conséquences — effacer le jeton mort, et le dire à l'écran — et
deux champs séparés auraient dû rester d'accord pour toujours en décrivant le
même fait. Un seul motif, deux comportements qui en dérivent.

**Le motif est une union fermée, pas une chaîne libre.** L'écran rend des motifs
qu'il CONNAÎT, donc dans la langue courante. Un texte passé par l'appelant
arriverait dans la langue de l'appelant — c'est-à-dire en français, quoi
qu'affiche le reste de l'écran.

**La chaîne malgache n'est pas certifiée**, au même titre que les vingt-et-une
autres : « Lany daty ny fidiranao. Ampidiro indray ny mailakao. » Elle est
marquée comme telle dans `libelles.ts` et ajoutée à la fiche de relecture, pour
que le même locuteur la traite dans la même passe. Le français y est plus long
que le malgache (× 1,08), ce qui la range parmi les huit phrases qui contredisent
la prémisse de la maquette.
