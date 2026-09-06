---
'@jp/api': patch
'@jp/mobile': patch
---

**Deux défauts que le typage ne pouvait pas voir.**

`OTP_INVALIDE` passait `variables: { essais }` à un gabarit qui réclame
`{restantes}`. `traduire` ne substitue que par nom et laisse le jeton visible
sinon — délibérément, pour qu'un trou se remarque en recette. Encore
faut-il que quelqu'un regarde : l'écran affichait « Ce code est incorrect.
{restantes} essais restants. », et le nombre qui dit s'il reste une chance ou
quatre n'arrivait jamais. Le serveur traduisant lui-même ses messages, aucun
client ne pouvait rattraper le coup.

Rien ne mesurait cet écart. Les tests d'i18n comparent les catalogues **entre
eux** — et les trois langues étaient parfaitement d'accord sur `{restantes}`.
Le désaccord était entre le catalogue et son appelant, et `variables` étant un
`Record<string, …>`, TypeScript acceptait n'importe quelle clé.
`apps/api/test/identite-erreurs.test.ts` ferme la classe entière : il construit
les dix-sept erreurs du dépôt, les met en forme dans les trois langues, et
refuse qu'un seul jeton `{nom}` survive. Une erreur ajoutée demain avec un nom
approximatif y tombera sans que personne ait à y penser.

**Le client API mobile lie enfin `fetch`.** Rangé dans un champ puis appelé en
`this.f(…)`, `fetch` reçoit l'instance comme `this`, ce qu'un navigateur
refuse — « Illegal invocation ». Hermes ne s'en émeut pas, son `fetch` étant un
polyfill JS ordinaire ; Expo Web, si. Et comme l'échec est un `TypeError`, le
`catch` du client le prenait pour une coupure : « pas de connexion » affiché à
quelqu'un de parfaitement connecté, sur chaque requête. Le défaut est le même
que celui corrigé côté web ; les deux fichiers sont jumeaux, seul l'un des deux
avait été soigné.

Le chemin `?? globalThis.fetch` n'était couvert par aucun test — tous injectent
un faux `fetch`. Il l'est désormais, par un double qui refuse le mauvais `this`
comme le ferait un navigateur.
