---
'@jp/mobile': minor
---

**Les deux lectures d'appareil que l'écran natif attendait.**

Le changeset précédent livrait l'écran avec deux manques nommés : pas de
détection réseau proactive, et la langue passée en paramètre plutôt que lue.
Les deux sont comblés.

**Le réseau — `@react-native-community/netinfo@12.0.1`** *(version épinglée par
Expo 57)*. Le bouton se désactive maintenant AVANT la tentative, et le bandeau
paraît à l'ouverture d'une application lancée alors que le réseau est déjà
tombé — cas que le web doit rattraper à la main avec `navigator.onLine`, parce
qu'aucun événement `offline` ne viendra jamais l'annoncer.

La règle d'interprétation est sortie du module natif dans `noyau/reseau.ts`,
et c'est le point qui compte : **le doute n'est pas une coupure**.
`isInternetReachable` vaut `null` pendant que NetInfo vérifie — au lancement, et
à chaque changement de réseau. Le lire comme un « non » ferait clignoter « pas
de connexion » sur un téléphone parfaitement connecté et désactiverait le bouton
sous le doigt de quelqu'un qui vient de le viser. D'où `!== false` : on
n'exige pas la preuve que ça marche, on exige la preuve que ça ne marche pas.
`isConnected` est lu strictement, lui — il répond sur l'interface, pas sur
Internet.

Sortie du natif, la règle est vérifiable : `vitest` ne sait pas charger NetInfo,
et une décision enfermée dedans n'aurait jamais été mise à l'épreuve.

**La langue — `expo-localization@~57.0.1`.** L'écran lit les locales de
l'appareil dans leur ordre de préférence. `langueInitiale` reste, pour forcer
en test ou depuis un futur réglage.

**Aucun analyseur n'a été écrit.** Une liste de locales ordonnée a exactement la
forme d'un `Accept-Language` — « la première que tu connais gagne » — et
`langueDepuisEnTete` de `@jp/i18n` sait déjà le faire. `noyau/langue.ts` joint
les étiquettes par des virgules et lui passe la main. Un second analyseur, ce
serait deux réponses possibles à « quelle langue ? » : une côté serveur, une
côté appareil.

**Un changement de comportement à connaître.** L'écran affichait le malgache par
défaut ; il affiche désormais la langue de l'appareil, donc **le français pour
la plupart des téléphones à Madagascar**. C'est voulu : le malgache est la
langue d'AUTORITÉ de la maquette — celle sur laquelle les boîtes sont
dimensionnées — pas un défaut imposé à quelqu'un qui a choisi autre chose. Une
personne dont l'appareil est en anglais lit le français, comme le prévoit
`libelles.ts`.

**Deux dépendances natives de plus** : `prebuild` requis avant le prochain
build, au même titre que `react-native-svg`.
