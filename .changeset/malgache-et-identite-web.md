---
'@jp/i18n': minor
'@jp/contracts': minor
'@jp/web': minor
---

**Le malgache revient, et `apps/web` porte l'authentification.**

`LANGUES` passe de deux à trois valeurs : `en`, `fr`, `mg`. La décision du
19/08/2026 qui l'avait retiré est annulée — `EP00 §6` n'avait jamais cessé de
prévoir « mg et fr », et les écrans d'identité sont écrits en malgache d'abord.
Le français reste la langue PAR DÉFAUT : c'est le repli d'un `Accept-Language`
illisible, et il doit tomber sur ce que le serveur sait rendre partout.

**Ce qu'il faut savoir avant d'y toucher.**

- Les 26 chaînes du catalogue malgache sont **à faire relire par un locuteur**.
  Elles sont proposées, pas certifiées.
- Le test de largeur mesure désormais chaque langue contre l'anglais, avec sa
  propre marge : 20 % pour le français, **30 % pour le malgache**
  (`RALLONGEMENT_MALGACHE`). Il échouait déjà sur `master` — trois libellés
  français ajoutés pour F0.1 dépassaient la marge ; ils sont raccourcis.
- `Intl` ne connaît pas forcément `mg` : `format.ts` mappe la langue malgache
  sur la locale `fr-FR`, explicitement, plutôt que de laisser un repli
  silencieux sur la locale du système.
- `balisesApercu` choisissait sa locale Open Graph par un ternaire, qui aurait
  envoyé le malgache sur `en_US` sans que rien ne casse. C'est une table.

**Les schémas de réponse de `contracts/auth.ts` décrivent enfin le serveur.**
`ReponseSessionSchema` annonçait `{ token, user, expiresAt }` là où l'API rend
`{ jeton, expireLe, utilisateur }` ; `ReponseOtpSchema` annonçait
`{ message, resendAfter }` pour `{ ok, expireDansS }`. Aucun client ne pouvait
lire une réponse réelle avec ces schémas — ils n'étaient consommés nulle part,
ce qui explique que la divergence ait tenu. `genre` et `langue` en sortent : le
serveur ne les renvoie pas.

**`apps/web` gagne un point de montage** — il n'en avait aucun — et le parcours
d'identité : adresse, code à six chiffres, prénom. Inscription et connexion
sont le même parcours. La charte du paquet est amendée en conséquence : le
compte quitte la liste des exclusions, panier, paiement et studio y restent, et
les cinq pages partageables restent cinq.
