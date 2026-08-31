---
'@jp/api': patch
---

Le module `livraison` change de sens : **JP n'opère plus aucune logistique**
*(`DP-04`)*. La boutique fait parvenir le colis par le moyen de son choix ; le
module n'enregistre plus que ce qu'elle déclare et ce que l'acheteur confirme.

**Le point à connaître avant de coder dessus** : `EXPEDIEE` est une déclaration
de la boutique que **personne ne vérifie** *(`R-L9`)*. Aucun tiers neutre ne
constate la remise — il n'y a ni preuve, ni arbitre, ni argent retenu. C'est un
invariant que le module ne peut pas garantir, et qu'il ne faut donc pas
supposer ailleurs.

L'application `@jp/terrain` — livreur et point relais — est supprimée avec la
logistique. Elle ne peut pas porter son propre changeset, n'existant plus.
