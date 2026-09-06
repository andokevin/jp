---
'@jp/identite': minor
'@jp/web': minor
---

**Le parcours d'authentification quitte `apps/web` pour `@jp/identite`.**

Machine à états, cases du code et libellés mg/fr vivaient dans
`apps/web/src/features/identite/`. Rien de tout cela n'a besoin du DOM, et
l'écran mobile de F0.1 en aura besoin à l'identique. Les laisser là, c'était
signer pour une seconde machine à états — écrite plus tard, sous pression, par
quelqu'un qui n'aurait pas relu `US-AUTH-02 CA4`. Les deux auraient divergé, et
la divergence serait tombée sur l'écran de connexion, celui que tout le monde
traverse.

Ce qui **reste** dans `apps/web` est ce qui est vraiment web : le rendu HTML, le
client `fetch`, et `theme.ts` — qui produit des variables CSS et importe
`CSSProperties` de React. La frontière est celle de `@jp/ui`, appliquée à un
domaine : le paquet porte les décisions, l'application les affiche.

**La condition d'existence du paquet est écrite dans le plan** *(`PLAN_SOCLE`
§2)*, parce qu'un premier paquet de domaine invite à en faire seize : deux
applications rendent le même parcours, et ses règles ne tiennent ni au DOM ni à
React Native. Tant qu'un seul client rend un parcours, il reste dans
`apps/<client>/src/features/<domaine>/`.

**Deux garde-fous ajoutés.**

- `eslint.config.mjs` interdit `react`, `react-dom` et `react-native` dans
  `packages/**`. `@jp/ui` promettait déjà « aucun composant React » dans son
  en-tête, et rien ne le vérifiait ; une promesse de docstring cède au premier
  « juste un petit hook ». `check-architecture.mjs` prouve que la règle mord —
  huit contrôles au lieu de sept.
- Les treize tests des règles du parcours suivent le code dans
  `packages/identite/` : le mobile héritera de ces garanties sans qu'on les
  réécrive.

**Un doublon en moins.** `apps/web` testait `etatDepuis` mot pour mot comme
`packages/ui/src/index.test.ts:201` — et le testait depuis un dossier dont
aucun écran n'appelle `etatDepuis`. Le test est supprimé, pas la couverture :
la règle « hors ligne AVANT erreur » reste vérifiée à ses deux vraies adresses,
dans `@jp/ui` pour l'état d'écran et dans `@jp/identite` pour le réducteur.
