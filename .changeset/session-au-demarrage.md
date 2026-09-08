---
'@jp/mobile': minor
---

**On ne redemande plus un code à quelqu'un qui a déjà une session.**

La route lit le trousseau au montage. Une session valide mène directement à la
suite ; une session absente mène au parcours d'authentification. C'était la
dernière pièce manquante entre `etatSession` — écrit et testé depuis S8.2 — et
une application qui s'en sert.

**Un jeton mort ne reste plus dans le trousseau.** Une session périmée et une
session absente mènent au même écran, mais pas au même ménage :
`etatSession` refuse le jeton périmé à chaque démarrage, donc plus rien ne le
relit — et il resterait là pour la vie de l'appareil, revente d'occasion sur un
marché comprise. `departDepuis` porte cette obligation dans le TYPE plutôt que
dans un commentaire : on ne peut pas lire `quoi` sans voir `nettoyer` à côté.
Quatre tests la tiennent, dont un bout à bout qui vérifie que le trousseau est
bien vide après.

**Un quatrième état pour le démarrage : « on lit ».** Il ne porte aucun
tourniquet — la lecture dure quelques millisecondes, une animation n'aurait pas
le temps de faire un tour et ne produirait qu'un clignotement. Elle affiche le
wordmark, rien d'autre. Montrer l'écran d'adresse pour le retirer un instant
plus tard à quelqu'un qui a déjà une session est exactement le défaut que ce
changeset supprime.

**Ce qui n'est PAS fait, et pourquoi.** `session.ts` distingue « aucune » de
« périmée » parce que les deux ne se racontent pas pareil — « connectez-vous »
contre « votre session a expiré ». **L'écran ne fait pas cette distinction.**
La maquette `JP Auth Flow` ne dessine aucun emplacement pour un tel avis, et en
inventer un serait décider seul d'un écran. La différence est conservée dans le
type, prête à être affichée le jour où la maquette dira où — c'est une question
de conception, pas de code.
