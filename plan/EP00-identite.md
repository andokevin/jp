# EP00 — Compte, identité et vérification

> 16 fonctionnalités · vague 1 · **le premier domaine à construire** : tout le reste en dépend.
> Socle supposé connu : [PLAN_SOCLE.md](PLAN_SOCLE.md). Module back-end : `identite`.

**Ce qui change dans cette épique** — l'adresse électronique remplace le numéro de téléphone comme identifiant *(R-C1)*. Le SMS n'est plus dépensé qu'au code de retrait d'un colis. Conséquence structurelle : le compte survit à un changement de carte SIM, qui était la première cause de perte de compte.

| ID | Fonctionnalité | Phase | Prio | Détail |
|---|---|---|---|---|
| F0.1 ★ | Inscription et connexion par email + code OTP | P1 | M | complet |
| F0.2 | Connexion, session longue, multi-appareil | P1 | M | complet |
| F0.3 ★ | Récupération de compte | P1 | S | complet |
| ~~F0.4~~ | ~~Bascule de rôle~~ ❌ **supprimée** *(`DP-02`)* — un compte a un type, et un seul, choisi à l'inscription | — | — | — |
| F0.5 | Profil acheteur | P1 | S | moyen |
| F0.6 | Vérification boutique (KYC) | P1 | M | complet |
| F0.7 | Badge boutique vérifiée | P1 | M | complet |
| F0.8 | Choix de la langue mg / fr | P1 | S | moyen |
| F0.9 | Mode économie de données | P1 | S | moyen |
| F0.10 | Consultation en invité | P1 | S | moyen |
| F0.11 | Suppression et désactivation de compte | P1 | M | complet |
| F0.12 | Blocage d'un utilisateur | P2 | C | cadre |
| F0.13 ★ | Connexion Google (OAuth) | P1 | S | complet |
| F0.14 ★ | Débit, renvoi, anti-énumération | P1 | M | complet |
| F0.15 ★ | Changement d'adresse email | P1 | S | complet |
| F0.16 ★ | Téléphone en contact de livraison | P1 | S | complet |

---

## F0.1 — Inscription et connexion par email + code OTP ★

`P1 · M · complet` — **Dépend de** S3, S4, S8 · **Bloque** tout le produit · **Règles** R-C1 à R-C10 · **Stories** US-AUTH-01, US-AUTH-02

### 1. Conception

**Fonctionnel.** Parcours unique et indifférencié : la même saisie crée le compte ou ouvre le compte existant *(R-C4)*. L'utilisateur saisit son adresse, reçoit un code à 6 chiffres valable 10 minutes, le saisit, choisit un prénom **et un mot de passe**, arrive sur le fil.

**Le mot de passe est exigé en plus de l'OTP.** L'OTP prouve l'accès à la boîte courriel à un instant donné ; il ne survit pas à la perte de cette boîte, et il coûte un aller-retour réseau à chaque connexion — sur un réseau lent, c'est la marche la plus haute du parcours. Le mot de passe donne une seconde voie d'entrée, et une entrée immédiate.

La colonne `utilisateur.mot_de_passe_empreinte` reste **nullable** : un compte ouvert par Google n'en a jamais choisi. L'exigence tient à l'inscription, pas dans le type de la colonne.

**Facultatif à l'inscription** — le genre et les trois types de vêtements préférés sont demandés en une question qu'on peut sauter. Sauter et répondre « aucune » sont deux faits différents, et seul le second crée une ligne `profil_acheteur`.

- **A** : adresse → code → prénom → fil. Le quiz de style *(F17.9)* est proposé et **passable**.
- **V** : même parcours, puis « Vous voulez vendre ? » → `F0.6`.
- **AN** : parcourt sans compte *(F0.10)* ; l'inscription est déclenchée au « Je prends », **réservation déjà posée** *(US-VENTE-08)*.

**Technique.** Trois invariants portent toute la sécurité de l'authentification :

1. **Un seul code actif par adresse.** L'émission invalide le précédent, dans la même transaction *(R-C6)*. Sans cette règle, deux codes en vol créent une fenêtre exploitable.
2. **Le code est haché** (Argon2id ou bcrypt), jamais stocké en clair *(R-C6)*. Une fuite de la table `code_otp` ne doit pas être une fuite de comptes.
3. **La réponse est indiscernable** selon que le compte existe ou non — message, code HTTP **et temps de réponse** *(R-C9)*. Voir F0.14, qui porte cette exigence.

**Hors périmètre** : magic link cliquable (un lien dans un courriel ouvre le mauvais navigateur et casse la session sur Android d'entrée de gamme), authentification à deux facteurs.

**Décision — pourquoi un code à saisir et non un lien à cliquer.** Le lien paraît plus simple. Sur le terrain il l'est moins : il ouvre le navigateur par défaut, pas l'application, et le retour vers l'app dépend de liens profonds qui échouent silencieusement sur les surcouches constructeur. Le code à 6 chiffres se copie-colle et fonctionne partout.

### 2. Structure de code

```
apps/api/src/modules/identite/
├─ routes.ts                POST /auth/otp · POST /auth/otp/verifier
├─ service.ts               demanderCode() · verifierCode() · creerOuOuvrirCompte()
├─ repository.ts            accès utilisateur, code_otp, identite_externe
├─ otp.ts                   génération, hachage, comparaison à temps constant
├─ erreurs.ts               OTP_EXPIRE · OTP_INVALIDE · OTP_DEBIT_DEPASSE
└─ service.test.ts

apps/api/src/plateforme/
├─ session.ts               émission et vérification du jeton, session longue (F0.2)
└─ debit.ts                 limitation partagée (F0.14)

packages/contracts/src/auth.ts        schémas Zod : DemandeCode, VerificationCode
apps/mobile/src/features/auth/
├─ ecrans/EcranAccueil.tsx            adresse + « Continuer avec Google »
├─ ecrans/EcranCodeOtp.tsx            6 cases, collage automatique, renvoi
├─ ecrans/EcranPrenom.tsx
├─ hooks/useDemandeCode.ts · hooks/useVerificationCode.ts
└─ api/authApi.ts
apps/mobile/src/noyau/session.ts      stockage sécurisé du jeton, rafraîchissement
```

### 3. Base de données

Migration `..._f0_1_auth_email_otp` :

```prisma
model Utilisateur {
  id                 String    @id @default(uuid())
  email              String    @unique
  emailVerifieLe     DateTime?
  telephone          String?              // plus unique, plus obligatoire (R-C15)
  telephoneVerifieLe DateTime?
  prenom             String?
  photoUrl           String?
  langue             Langue    @default(mg)
  dateNaissance      DateTime?
  statut             StatutUtilisateur @default(actif)
  creeLe             DateTime  @default(now())
  derniereConnexionLe DateTime?
}

model CodeOtp {
  id            String    @id @default(uuid())
  email         String
  codeEmpreinte String
  tentatives    Int       @default(0)
  expireLe      DateTime
  consommeLe    DateTime?
  adresseIp     String?
  creeLe        DateTime  @default(now())
  @@index([email, expireLe])
}
```

**Migration depuis le schéma initial** : `telephone` perd son `UNIQUE NOT NULL`, `email` en gagne un. Si des comptes existent déjà en recette, prévoir une étape de collecte d'adresse avant de rendre `email` obligatoire — en développement, la base est recréée.

**Purge** : les `code_otp` consommés ou expirés depuis plus de 24 h sont supprimés par une tâche quotidienne. Cette table grossit vite et ne sert à rien passé le délai.

### 4. Design

> **Écart constaté le 06/09/2026, à trancher.** La version WEB de ces écrans a
> été livrée (`apps/web/src/features/identite`) d'après une maquette qui
> contredit cette section sur trois points : **pas de bouton « Continuer avec
> Google »**, pas de séparateur « ou », et pas de lien « J'ai perdu l'accès à
> mon email » — aucune route n'implémente d'ailleurs `ConnexionExterneSchema`.
> Ce qui a été retenu d'ici : la vérification automatique à la sixième saisie,
> le lien « Modifier », et la phrase d'aide du prénom. Le bouton de validation
> est conservé en repli, contrairement au « sans bouton » écrit plus bas : au
> clavier, il faut pouvoir valider soi-même.
>
> Noter aussi que le §5 ci-dessous cite `POST /auth/otp` et
> `/auth/otp/verifier` : les routes réellement implémentées sont
> `POST /identite/otp/emettre` et `/identite/otp/verifier`.

Trois écrans, quatre états chacun.

- **Accueil** — logo, une phrase de proposition de valeur, **« Continuer avec Google » d'abord** (un appui, pas d'attente de courriel), séparateur « ou », champ email, bouton pleine largeur « Continuer ». Lien discret « J'ai perdu l'accès à mon email » *(F0.3)*.
- **Code** — 6 cases, clavier numérique ouvert d'emblée, adresse rappelée avec un lien « Modifier », décompte puis bouton « Renvoyer le code ». Vérification automatique à la sixième saisie, **sans bouton**.
- **Prénom** — un champ, une phrase expliquant qu'il sera visible des boutiques.

**États** : chargement (bouton en attente, non re-appuyable), erreur (message sous le champ, code conservé), hors ligne (bandeau, bouton inactif avec explication), vide (sans objet ici).

**Prompt Stitch** — préambule commun de [PLAN_SOCLE §8](PLAN_SOCLE.md), puis :

```
Screen 1 — "Bienvenue sur JP" (sign in / sign up, single unified screen).
Vertical order: app logo; one-line tagline "Achetez en confiance, partout à
Madagascar"; a full-width white button with the Google logo labelled
"Continuer avec Google"; a thin "ou" divider; an email text field labelled
"Votre adresse email" with placeholder "hanta@gmail.com"; a full-width primary
button "Continuer"; a small centered text link "J'ai perdu l'accès à mon email".
No password field anywhere.

Screen 2 — "Entrez votre code".
Vertical order: back arrow; title "Entrez votre code"; a subtitle "Nous avons
envoyé un code à 6 chiffres à hanta@gmail.com" with an inline "Modifier" link;
six separate square digit boxes, the first one focused; a centered muted
countdown "Renvoyer le code dans 0:24" that becomes an active text link
"Renvoyer le code"; a small text link "Vérifiez vos spams".
No submit button — verification happens on the sixth digit.

Screen 3 — "Comment vous appelez-vous ?".
Vertical order: title; a single text field labelled "Prénom" placeholder "Hanta";
a small helper line "Les boutiques verront ce prénom sur vos commandes";
full-width primary button "Continuer".

Also produce: Screen 2 with a red error state under the boxes reading
"Code incorrect — il vous reste 3 essais", digits still visible.
```

### 5. Backend

| Route | Corps | Réponses |
|---|---|---|
| `POST /auth/otp` | `{ email }` | `200 { delaiRenvoiS }` — **toujours 200** *(R-C9)* · `429 OTP_DEBIT_DEPASSE` avec `retryAfter` |
| `POST /auth/otp/verifier` | `{ email, code }` | `200 { jeton, utilisateur, estNouveau }` · `400 OTP_INVALIDE { essaisRestants }` · `410 OTP_EXPIRE` |

**Logique de `demanderCode`** — une transaction : vérifier le débit *(F0.14)* → invalider tout code actif de cette adresse → générer 6 chiffres par générateur cryptographique → hacher → insérer avec `expireLe = maintenant + otp_ttl_s` → publier un travail d'envoi de courriel. **L'envoi est asynchrone** : la réponse HTTP ne doit pas attendre le fournisseur de courriel, sinon le temps de réponse trahit l'existence du compte et la latence devient inacceptable en réseau lent.

**Logique de `verifierCode`** — transaction avec verrou sur la ligne : rejeter si consommé, expiré ou `tentatives >= max` → comparer **à temps constant** → sur échec, incrémenter `tentatives` et invalider au seuil → sur succès, marquer `consommeLe`, créer le compte si l'adresse est inconnue, émettre le jeton, émettre `identite.compte_cree` si nouveau.

**Tests**
- Code correct → session ; adresse inconnue → compte créé ; adresse connue → **aucun doublon**.
- Code expiré, code déjà consommé, 6e tentative → refus avec le bon code d'erreur.
- Émission d'un second code → le premier ne fonctionne plus.
- **Réponses indiscernables** : compte existant contre inexistant, corps identique **et écart de temps sous le seuil** *(R-C9)* — test statistique sur 100 appels, pas une seule mesure.
- La table ne contient jamais le code en clair : assertion sur `codeEmpreinte`.

### 6. Frontend

- `useDemandeCode` — mutation, décompte de renvoi persisté (survit à une mise en arrière-plan), désactivation du bouton pendant l'appel.
- `EcranCodeOtp` — 6 champs contrôlés, `Clipboard` lu au retour au premier plan pour proposer le collage, soumission automatique au sixième chiffre, **conservation des chiffres saisis en cas d'erreur réseau** *(US-AUTH-02 CA4)*.
- `session.ts` — jeton dans `expo-secure-store`, jamais dans `AsyncStorage`. Session longue *(F0.2)*.
- Hors ligne : le bouton « Continuer » affiche « Connexion indisponible » et n'envoie rien plutôt que d'échouer après 30 s d'attente.
- i18n : tous les libellés dans `packages/i18n`, mg et fr, **le malgache étant 30 % plus long** — vérifier qu'aucun bouton ne tronque.

**Tests** : Maestro sur inscription complète et sur reconnexion ; test unitaire sur le collage automatique et sur la conservation des chiffres après erreur.

```issues
feature: F0.1
titre: Inscription et connexion par email + code OTP
epic: "00"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: []
```

---

## F0.14 — Renvoi de code, limitation de débit, anti-énumération ★

`P1 · M · complet` — **Dépend de** F0.1 · **Règles** R-C7 à R-C10 · **Stories** US-AUTH-03, US-AUTH-04

### 1. Conception

Deux préoccupations distinctes, réunies ici parce qu'elles partagent la même implémentation.

**Le débit** protège le budget d'envoi de courriels et l'utilisateur contre lui-même : 1 code par adresse toutes les 60 s, 5 par heure, 10 par jour ; 5 tentatives de saisie par code *(R-C7)*. Tout refus affiche **le délai restant en clair** *(R-C8)* — un blocage muet est vécu comme une panne et fait désinstaller.

**L'anti-énumération** protège les utilisatrices : l'écran de connexion ne doit pas permettre de dresser la liste des comptes. Trois fuites possibles, à fermer toutes les trois :
- le **message** (« ce compte n'existe pas ») — évité par le parcours indifférencié ;
- le **code HTTP** — toujours 200 sur `/auth/otp` ;
- le **temps de réponse** — le plus subtil : si le compte existe, on écrit une ligne et on envoie un courriel ; sinon on ne fait rien et on répond plus vite. **C'est la fuite réelle**, et c'est pourquoi l'envoi est asynchrone et le chemin d'exécution identique dans les deux cas.

**Décision.** Une adresse inconnue **crée le compte** à la vérification du code, pas à la demande. La demande écrit donc une ligne `code_otp` dans les deux cas : même travail, même durée, aucune fuite.

### 2. Structure de code

```
apps/api/src/plateforme/debit.ts          fenêtre glissante Redis, réutilisable
apps/api/src/plateforme/debit.test.ts
apps/api/src/modules/identite/service.ts  application des trois compteurs
apps/api/src/modules/exploitation/        file « anomalies d'authentification »
apps/admin/src/pages/anomalies/           tableau de bord interne (lecture seule, DP-05)
```

### 3. Base de données

Aucune table nouvelle. Les compteurs sont dans **Redis** (`otp:min:<email>`, `otp:heure:<email>`, `otp:jour:<email>`, `otp:ip:<ip>`), expirés naturellement par TTL. `code_otp.tentatives` porte le compteur de saisie, en base parce qu'il est transactionnel avec la vérification.

Paramètres dans `parametre` *(R-O1)* : `otp_ttl_s`, `otp_max_par_minute`, `otp_max_par_heure`, `otp_max_par_jour`, `otp_max_tentatives`, `otp_max_par_ip_10min`.

**Redis n'est pas autorité ici non plus** : sa perte rouvre le débit, ce qui est un incident acceptable (on renvoie quelques courriels de trop). La perte du compteur de *tentatives*, elle, ne serait pas acceptable — c'est pour cela qu'il est en base.

### 4. Design

Pas d'écran propre : des états de l'écran de code *(F0.1)*.

- Décompte « Renvoyer le code dans 0:24 », puis lien actif.
- Après 2 renvois : bandeau d'aide « Vérifiez vos spams » + lien « Utiliser une autre adresse ».
- Débit dépassé : message d'attente chiffré, bouton inactif, **jamais** un message d'erreur rouge — ce n'est pas une faute de l'utilisatrice.
- Back-office : table des adresses en anomalie (demandes, IP distinctes, échecs), triable, avec action de blocage temporaire.

**Prompt Stitch** — préambule commun, puis :

```
Screen — "Entrez votre code", rate-limited state (variant of the OTP screen).
Vertical order: back arrow; title "Entrez votre code"; six digit boxes, empty
and dimmed; a neutral (not red) information card with a clock icon reading
"Trop de demandes — réessayez dans 4 minutes"; below it a muted helper block
titled "Vous ne recevez rien ?" with two bullet lines "Vérifiez vos courriers
indésirables" and "L'adresse est peut-être mal écrite"; a secondary text link
"Utiliser une autre adresse". The primary button is present but disabled.
The tone is helpful, not accusatory — this is not the user's fault.
```

### 5. Backend

`plateforme/debit.ts` expose `consommer(cle, limite, fenetreS)` → `{ autorise, resteS }`, en fenêtre glissante (`ZADD` + `ZREMRANGEBYSCORE` + `ZCARD` dans un script Lua, donc atomique).

Appliqué à `POST /auth/otp` dans l'ordre : IP → jour → heure → minute. Le refus le plus large d'abord, pour ne pas révéler par la granularité du refus qu'une adresse est connue.

**Tests**
- 2 demandes en 30 s → la seconde refusée avec `resteS` correct.
- 6 demandes en 1 h → refus ; après la fenêtre → autorisation.
- 5 codes faux → invalidation ; un nouveau code fonctionne.
- 51 demandes depuis une IP en 10 min → refus par IP, anomalie visible au tableau de bord *(`F11.7`)*.
- **Écart de temps** entre adresse connue et inconnue sous le seuil, sur 100 appels *(R-C9)*.
- Aucune adresse en clair dans les journaux *(R-C10)* : assertion sur la sortie du journaliseur.

### 6. Frontend

Décompte persisté (`AsyncStorage`, comparaison d'horodatage) : quitter l'application ne remet pas le compteur à zéro. En cas de `429`, `retryAfter` alimente le même décompte. Aucun renvoi automatique — jamais.

```issues
feature: F0.14
titre: Renvoi de code, limitation de débit, anti-énumération
epic: "00"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F0.1]
```

---

## F0.13 — Connexion Google (OAuth) ★

`P1 · S · complet` — **Dépend de** F0.1 · **Règles** R-C11, R-C12 · **Story** US-AUTH-05

### 1. Conception

Un appui, aucune attente de courriel. Sur un réseau lent, c'est le chemin d'inscription le plus fiable — d'où sa position **au-dessus** du champ email.

**Deux règles portent tout le risque :**
- L'adresse Google n'est acceptée que si le fournisseur la déclare **vérifiée** *(R-C11)*. Sinon n'importe qui créant un compte Google avec l'adresse d'autrui prendrait son compte JP.
- Si l'adresse correspond à un compte existant, **rattachement** au même compte, jamais création d'un doublon *(R-C12)*. Un doublon coupe l'utilisatrice de son historique, de sa cagnotte et de ses commandes en cours : c'est le pire défaut possible sur ce parcours.

**Technique.** Vérification du jeton d'identité **côté serveur** (signature, `aud`, `iss`, `exp`) ; le client ne fait que transporter. Aucune confiance accordée à un profil décodé côté application.

### 2. Structure de code

```
apps/api/src/modules/identite/
├─ routes.ts        + POST /auth/google
├─ google.ts        vérification du jeton d'identité, cache des clés publiques
└─ service.ts       + rattacherOuCreerParFournisseur()
apps/mobile/src/features/auth/hooks/useConnexionGoogle.ts
apps/mobile/src/features/auth/composants/BoutonGoogle.tsx
apps/mobile/src/features/reglages/ecrans/EcranMethodesConnexion.tsx
```

### 3. Base de données

Migration `..._f0_13_identite_externe` : table `IdentiteExterne` (`utilisateurId`, `fournisseur`, `sujetExterne`, `emailVerifie`, unique sur `(fournisseur, sujetExterne)`).

**Le `sujetExterne` est l'identifiant stable, pas l'adresse.** Une adresse Google peut changer ; le sujet non. Rattacher sur l'adresse seule casserait le lien au premier changement.

### 4. Design

Bouton Google en tête de l'écran d'accueil : fond blanc, bordure, logo, libellé « Continuer avec Google ». Écran de réglages « Méthodes de connexion » listant les méthodes actives avec possibilité d'en ajouter une.

**Prompt Stitch** — préambule commun, puis :

```
Screen — "Méthodes de connexion" (settings sub-screen).
Vertical order: back arrow and title "Méthodes de connexion"; a section label
"Actives"; a card row with a mail icon, primary text "hanta@gmail.com",
secondary text "Code par email", and a right-aligned green check; a second card
row with the Google logo, primary text "Google", secondary text "Connecté",
right-aligned green check; a section label "Ajouter"; a dashed-border row with a
plus icon reading "Ajouter une méthode de connexion"; at the bottom a muted
explanatory line "Plusieurs méthodes rendent votre compte plus facile à
récupérer." No password option anywhere.
```

### 5. Backend

`POST /auth/google` `{ jetonIdentite }` → 200 `{ jeton, utilisateur, estNouveau }` · 401 `GOOGLE_JETON_INVALIDE` · 409 `EMAIL_NON_VERIFIE_PAR_FOURNISSEUR`.

Algorithme, dans une transaction : vérifier le jeton → refuser si `email_verified` faux → chercher `identite_externe` par `(google, sub)` → si trouvé, ouvrir la session → sinon chercher `utilisateur` par email → si trouvé, **créer le rattachement** → sinon créer le compte et le rattachement.

**Tests** : jeton valide nouveau → compte créé ; jeton valide dont l'adresse existe → **rattachement, un seul utilisateur en base** ; `email_verified` faux → refus ; jeton expiré, mauvaise audience, signature invalide → refus ; deux appels concurrents avec le même jeton → un seul compte (unicité en base comme dernier filet).

### 6. Frontend

`expo-auth-session` ou le module Google natif. Annulation du sélecteur → retour à l'accueil **sans erreur bloquante** *(US-AUTH-05 CA4)*. Le jeton d'identité n'est jamais journalisé.

```issues
feature: F0.13
titre: Connexion Google (OAuth)
epic: "00"
phase: P1
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F0.1]
```

---

## F0.15 — Changement d'adresse email avec double vérification ★

`P1 · S · complet` — **Dépend de** F0.1 · **Règles** R-C13 · **Story** US-AUTH-06

### 1. Conception

**C'est un parcours de sécurité, pas un réglage.** ⚠️ **Le raisonnement d'origine reposait sur le portefeuille, supprimé** *(`DP-07`)* — mais **le risque augmente** : le compte porte désormais `boutique.msisdn_mobile_money`, **la destination de tous les encaissements**. Prendre le contrôle du compte, c'est détourner les ventes futures. Ancienne rédaction : le compte porte un portefeuille : quiconque change l'adresse prend le contrôle des retraits. D'où la double vérification — code à l'ancienne adresse (autorisation), puis code à la nouvelle (vérification) — l'information de l'ancienne adresse, et l'inscription au journal d'audit.

**Cas d'échec dimensionnant** : l'utilisatrice **n'a plus accès** à l'ancienne adresse. C'est fréquent, et c'est précisément pourquoi elle veut changer. Le parcours doit alors basculer vers `F0.3`, la récupération assistée — jamais laisser l'utilisatrice dans une impasse.

**Décision.** ⚠️ **À reformuler** *(`DP-07`)* : il n'y a plus de solde. Ce que le changement d'adresse doit protéger est **le numéro mobile money de destination** — un changement d'adresse suivi d'un changement de `msisdn` est le scénario d'attaque à bloquer. Ancienne rédaction : le changement d'adresse d'un compte portant un solde disponible **ne gèle pas** les retraits (ce serait punir un usage légitime), mais il est notifié, journalisé, et remonte dans la file d'anomalies du back-office. Le gel, lui, est réservé à la récupération assistée *(R-C14)*, où l'identité n'est pas prouvée.

### 2. Structure de code

```
apps/api/src/modules/identite/
├─ routes.ts            + POST /auth/email/changement · .../confirmer
├─ changementEmail.ts   machine à deux étapes, jeton de transition
└─ service.ts           + journal d'audit, notification de l'ancienne adresse
apps/mobile/src/features/reglages/ecrans/EcranChangementEmail.tsx
```

### 3. Base de données

Migration `..._f0_15_changement_email` :

```
demande_changement_email
  id PK · utilisateur_id FK
  nouvel_email · etape(ancienne_verifiee|terminee|abandonnee)
  expire_le · cree_le
  UQ(utilisateur_id) WHERE etape='ancienne_verifiee'
```

Les codes réutilisent `code_otp`, avec un usage distinct pour éviter qu'un code de connexion serve de code de changement.

### 4. Design

Trois pas dans un même écran, avec une frise de progression. Bandeau d'avertissement dès le premier pas si le compte porte un solde disponible.

**Prompt Stitch** — préambule commun, puis :

```
Screen — "Changer mon email", step 1 of 3.
Vertical order: back arrow, title "Changer mon email"; a three-dot step
indicator with step 1 active and labels "Vérifier", "Nouvelle adresse",
"Confirmer"; an amber warning card with a shield icon reading "Votre
numéro Mobile Money reçoit vos ventes. Pour votre sécurité, nous vérifions les deux
adresses."; a read-only field showing the current address "hanta@gmail.com";
explanatory text "Nous allons envoyer un code à cette adresse"; full-width
primary button "Envoyer le code"; a secondary text link at the very bottom
"Je n'ai plus accès à cette adresse".
```

### 5. Backend

| Route | Effet |
|---|---|
| `POST /auth/email/changement` | code à l'ancienne adresse |
| `POST /auth/email/changement/verifier-ancienne` `{ code }` | → `etape=ancienne_verifiee` |
| `POST /auth/email/changement/nouvelle` `{ nouvelEmail }` | refus si adresse déjà prise, **sans le révéler** → code à la nouvelle |
| `POST /auth/email/changement/confirmer` `{ code }` | bascule, courriel à l'ancienne, audit, `identite.email_change` |

**Tests** : parcours complet ; nouvelle adresse déjà utilisée → refus **neutre** *(US-AUTH-06 CA5)* ; code de l'ancienne adresse rejoué au dernier pas → refus ; demande expirée ; l'ancienne adresse reçoit bien la notification ; l'entrée d'audit contient avant/après et l'IP.

### 6. Frontend

Un écran, trois pas, retour arrière possible sans perdre l'avancement. Lien « Je n'ai plus accès à cette adresse » toujours visible, menant à `F0.3`.

```issues
feature: F0.15
titre: Changement d'adresse email avec double vérification
epic: "00"
phase: P1
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F0.1]
```

---

## F0.3 — Récupération de compte ★

`P1 · S · complet` — **Dépend de** F0.1, F0.6 · **Règles** R-C14 · **Story** US-AUTH-07

### 1. Conception

**Trois cas, un seul difficile.**

| Cas | Traitement |
|---|---|
| Boîte mail accessible | **Il n'y a rien à récupérer** : un code suffit. C'est le bénéfice direct de `F0.1` |
| Changement de carte SIM | **Aucun effet sur le compte.** Mise à jour du contact de livraison *(F0.16)* |
| Accès perdu à la boîte mail | Récupération assistée, instruite par un opérateur sous 24 h |

Le troisième cas : formulaire (prénom, dernière commande, montant approximatif, numéro de téléphone de livraison), numéro de dossier, engagement de 24 h, **gel des retraits** si le compte porte un solde *(R-C14)*, décision motivée dans les deux sens.

**Pourquoi une instruction humaine.** Automatiser la récupération, c'est créer une porte d'entrée : quiconque connaîtrait le prénom et une commande approximative prendrait le compte. Sur un produit qui conserve l'argent d'autrui, la lenteur est ici une fonctionnalité.

### 2. Structure de code

```
apps/api/src/modules/identite/
├─ routes.ts        + POST /auth/recuperation
├─ recuperation.ts  création du dossier, gel, réattribution
apps/api/src/modules/exploitation/  file « récupérations »
apps/admin/src/pages/recuperations/{Liste,Dossier}.tsx
apps/mobile/src/features/auth/ecrans/EcranRecuperation.tsx
```

### 3. Base de données

Migration `..._f0_3_recuperation_compte` :

```
demande_recuperation
  id PK · numero UQ · utilisateur_cible_id FK null
  email_ancien · email_nouveau null
  prenom_declare · derniere_commande_ref null · montant_approximatif null
  telephone_declare null
  statut(nouvelle|en_instruction|validee|refusee)
  motif_decision null · decide_par_id null · decide_le null
  cree_le · IDX(statut, cree_le)
```

⚠️ **`portefeuille.retraits_geles` est supprimé** *(`DP-07`)*. Le verrou équivalent porte sur `boutique.msisdn_mobile_money` : **aucun changement de numéro pendant une procédure de récupération**. Ancienne rédaction : le gel doit être un état lisible, pas une règle implicite éparpillée.

### 4. Design

Formulaire côté acheteuse, en langage simple, sans jargon. Back-office : file par ancienneté, dossier affichant côte à côte les déclarations et **l'historique réel du compte visé**, pour comparer.

**Prompt Stitch** — préambule commun, puis :

```
Screen — "Récupérer mon compte" (buyer-facing form).
Vertical order: back arrow, title "Récupérer mon compte"; an explanatory
paragraph "Nous allons vérifier que ce compte est bien le vôtre. Une réponse
vous sera donnée sous 24 heures."; field "Votre ancienne adresse email"
placeholder "hanta@gmail.com"; field "Votre prénom" placeholder "Hanta";
field "Votre dernière commande" with helper "Le nom d'un article suffi t —
par exemple : robe wax bleue"; field "Montant approximatif" with an "Ar"
suffix and helper "Une estimation suffit"; field "Numéro de téléphone de
livraison" placeholder "034 12 345 67"; a muted card reading "Vos retraits
sont temporairement bloqués pendant la vérification, pour protéger votre
argent."; full-width primary button "Envoyer ma demande".
```

### 5. Backend

`POST /auth/recuperation` → 202 `{ numeroDossier, delaiHeures: 24 }` — **toujours 202**, même si l'adresse est inconnue *(R-C9)*.
`POST /admin/recuperations/:id/decision` `{ decision, motif, nouvelEmail? }` — motif obligatoire, réattribution suivie d'une vérification par code de la nouvelle adresse, dégel des retraits, audit.

**Tests** : demande sur adresse inconnue → 202 sans fuite ; validation → nouvelle adresse **vérifiée avant** ouverture de session ; refus → compte inchangé, motif notifié ; compte avec solde → `retraits_geles` vrai, retrait refusé pendant l'instruction ; décision journalisée.

### 6. Frontend

Formulaire acheteuse + suivi du dossier par son numéro. **Instruction automatique par `SYS`** *(`DP-05`)* : comparaison sur seuil de concordance, points comparés journalisés. ⚠️ **Aucun recours en cas de refus.** Ancienne rédaction : Back-office : file, dossier, comparaison, décision. Le motif de refus est affiché intégralement à l'utilisatrice — une décision non motivée est vécue comme arbitraire.

```issues
feature: F0.3
titre: Récupération de compte
epic: "00"
phase: P1
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F0.1, F0.6]
```

---

## F0.16 — Téléphone en contact de livraison ★

`P1 · S · complet` — **Dépend de** F0.1, F3.3 · **Règles** R-C15, R-C16 · **Story** US-AUTH-08

### 1. Conception

Le numéro est demandé **à la première livraison**, pas à l'inscription. Vérifié par SMS à ce moment-là seulement : le SMS coûte, autant ne le dépenser que là où il sert.

**La règle qui compte** *(R-C16)* : un SMS non reçu **ne bloque jamais un paiement**. Au-delà de 60 s, la commande se poursuit avec un numéro non vérifié, signalé comme tel sur le bordereau. Bloquer un encaissement sur la réception d'un SMS est le pire compromis possible — on perd la vente **et** la confiance, pour un problème qui n'est pas celui de l'acheteuse.

Le numéro n'est **pas unique** : un foyer partage un téléphone, une acheteuse fait livrer chez sa sœur. L'unicité serait une contrainte inventée qui casserait des cas réels.

### 2. Structure de code

```
apps/api/src/modules/identite/routes.ts   + POST /moi/telephone · .../verifier
apps/api/src/modules/notification/sms.ts  fournisseur SMS, repli, coût journalisé
apps/mobile/src/features/livraison/composants/ChampTelephone.tsx
apps/mobile/src/features/livraison/hooks/useVerificationTelephone.ts
```

### 3. Base de données

Aucune table nouvelle : `utilisateur.telephone` et `telephoneVerifieLe` existent depuis `F0.1`. `expedition` gagne `telephone_verifie bool`, figé à la création — **la boutique doit savoir si le numéro qu'elle compose a été confirmé** *(`DP-04`)*.

### 4. Design

Champ intégré au choix de livraison, pas d'écran séparé. Après envoi, 6 cases en ligne et un lien « Continuer sans vérifier » **qui apparaît au bout de 60 s**.

**Prompt Stitch** — préambule commun, puis :

```
Screen — delivery step with phone verification inline.
Vertical order: title "Où livrer votre commande ?"; a selected address card
"Analamahitsy — près de l'épicerie Tsara"; a field labelled "Numéro du
destinataire" pre-filled "034 12 345 67" with a right-aligned "Vérifier" link;
below it, once tapped, an inline block: helper text "Code envoyé par SMS au
034 12 345 67", six small digit boxes, and a muted countdown "0:47"; after the
countdown a secondary text link appears reading "Continuer sans vérifier";
then the order summary rows (sous-total, livraison, total) and a full-width
primary button "Payer 62 000 Ar".
The payment button must never be disabled by the verification state.
```

### 5. Backend

`POST /moi/telephone` `{ telephone }` → code SMS, débit partagé avec l'OTP courriel.
`POST /moi/telephone/verifier` `{ code }` → `telephoneVerifieLe`.
Le paiement ne consulte **jamais** `telephoneVerifieLe` : aucune vérification n'est une condition de paiement *(R-C16)*.

**Tests** : inscription sans numéro demandé ; première livraison à domicile → demandé ; livraison en relais → demandé aussi (le code de retrait part par SMS) ; **paiement autorisé avec numéro non vérifié** ; deuxième commande → pré-rempli, non re-vérifié ; `colis.telephone_verifie` correctement figé.

### 6. Frontend

Champ avec masque `03X XX XXX XX`, clavier numérique, normalisation avant envoi. Le bouton de paiement **n'est jamais désactivé** par l'état de vérification — c'est une assertion de test, pas une intention.

```issues
feature: F0.16
titre: Téléphone en contact de livraison
epic: "00"
phase: P1
prio: S
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F0.1, F3.3]
```

---

## F0.2 — Connexion, session longue, multi-appareil

`P1 · M · complet` — **Dépend de** F0.1 · **Règles** R-C2

### 1. Conception
Une reconnexion fréquente est rédhibitoire *(R-C2)*. Jeton d'accès court (15 min) et jeton de rafraîchissement long (90 jours, rotatif), plusieurs appareils simultanés, liste des sessions consultable et révocable.

**Pourquoi la rotation du jeton de rafraîchissement.** Un jeton long non rotatif volé donne un accès permanent. Avec rotation et détection de réutilisation, un vol est détecté au premier conflit et toute la famille de jetons est révoquée.

### 2. Structure de code
`apps/api/src/plateforme/session.ts` · `modules/identite/sessions.ts` · `apps/mobile/src/noyau/session.ts` (rafraîchissement transparent, file d'attente des requêtes pendant le renouvellement) · `apps/mobile/src/features/reglages/ecrans/EcranSessions.tsx`.

### 3. Base de données
```
session
  id PK · utilisateur_id FK · famille_id
  empreinte_rafraichissement · appareil_libelle · derniere_utilisation_le
  expire_le · revoquee_le null
  IDX(utilisateur_id, revoquee_le)
```

### 4. Design
Écran « Mes appareils » : liste, appareil courant marqué, « Déconnecter » par ligne et « Déconnecter partout ».

**Prompt Stitch** — préambule commun, puis :
```
Screen — "Mes appareils" (settings).
A list of device rows, each with a phone icon, device name in primary text
("Tecno Spark 8", "Navigateur Chrome"), secondary text with last activity
("Actif maintenant", "Il y a 3 jours"), and a red text link "Déconnecter".
The current device row shows a green "Cet appareil" badge instead of the link.
At the bottom, a full-width secondary destructive button "Déconnecter partout".
```

### 5. Backend
`POST /auth/rafraichir` (rotation, détection de réutilisation → révocation de la famille) · `GET /moi/sessions` · `DELETE /moi/sessions/:id` · `DELETE /moi/sessions`.

**Tests** : rafraîchissement nominal ; réutilisation d'un jeton déjà tourné → **toute la famille révoquée** ; expiration ; révocation d'une session sans affecter les autres ; deux appareils simultanés.

### 6. Frontend
Intercepteur : sur 401, un seul rafraîchissement en vol, les requêtes concurrentes attendent puis rejouent. Sur échec, retour à l'accueil sans perte de contexte de navigation.

```issues
feature: F0.2
titre: Connexion, session longue, multi-appareil
epic: "00"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F0.1]
```

---

## F0.6 — Vérification boutique (KYC)

`P1 · M · complet` — **Dépend de** F0.1, S3 · **Règles** R-V1 à R-V6 · **Recette** RB… (encaissement)

### 1. Conception
Nom de boutique ou nom public → pièce d'identité recto/verso (CIN, permis, passeport) **ou NIF/STAT pour une entreprise** → photographie du visage → numéro mobile money **au même nom que la pièce** *(R-V2)* → adresse d'enlèvement → soumission.

En statut *en cours*, la boutique **peut** préparer son catalogue, elle ne **peut** ni publier de contenu, ni diffuser, ni encaisser *(R-V1)*. Aucun encaissement sans vérification validée : c'est le mécanisme central de confiance du produit.

Refus **motivé, précis sur ce qui manque** *(R-V3)*. Moins de 18 ans : refus définitif *(R-V6, RB6)*.

### 2. Structure de code
`modules/identite/verification.ts` · `modules/identite/documents.ts` (chiffrement au repos, accès journalisé) · `apps/mobile/src/features/verification/ecrans/{Etape1Boutique,Etape2Piece,Etape3Selfie,Etape4MobileMoney,Etape5Adresse,EcranStatut}.tsx` · `apps/admin/src/pages/verifications/{File,Dossier}.tsx`.

### 3. Base de données
`boutique.statut_verification`, `profil_createur.statut_verification`, table `document_identite` (`url_chiffree`, `empreinte`), `demande_verification` (statut, motif, décideur, horodatage). Accès aux documents journalisé dans `journal_audit` *(R-V5, N3.1)*.

### 4. Design
Cinq pas, un par écran, progression visible et reprise possible. Cadre de capture avec repères pour la pièce. Écran de statut avec délai cible affiché *(R-V4)* et bannière permanente rappelant ce qui manque.

**Prompt Stitch** — préambule commun, puis :
```
Screen — KYC step 2 of 5, "Votre pièce d'identité".
Vertical order: back arrow, title, a five-segment progress bar with segment 2
filled; instruction line "Photographiez le recto de votre CIN"; a large camera
viewport with a bright rectangular guide frame and corner marks, and a small
overlay hint "Placez la carte dans le cadre"; three checklist lines below with
grey check icons: "Photo nette", "Pas de reflet", "Les 4 coins visibles";
full-width primary button "Prendre la photo" and a secondary text link
"Choisir dans la galerie".
Also produce the same screen after capture: the photo as a thumbnail, a green
"Recto ajouté" row, and the primary button now reading "Photographier le verso".
```

### 5. Backend
`POST /boutique/verification` (multipart, chiffrement immédiat) · `GET /boutique/verification` · **décision automatique par `SYS` et le prestataire** *(`DP-05`, `UC-52`)*. **Blocage de la mise en vente** contrôlé dans la publication d'article **et** le démarrage de direct *(`DP-07`)* — plus dans le paiement : l'argent va directement à la boutique, il serait trop tard.

**Tests** : encaissement refusé en `en_cours` et en `refuse` ; catalogue autorisé en `en_cours` ; publication refusée ; discordance de nom → refus ; accès à un document journalisé ; mineur → refus définitif.

### 6. Frontend
Capture avec compression avant envoi (le réseau est lent, les photos sont lourdes), reprise après interruption, statut visible en permanence dans le studio.

```issues
feature: F0.6
titre: Vérification boutique (KYC)
epic: "00"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F0.1]
```

---

## F0.7 — Badge boutique vérifiée

`P1 · M · complet` — **Dépend de** F0.6 · **Règles** R-V… , badge

### 1. Conception
Le badge apparaît sur : vignette de direct, fil, fiche produit, vitrine, profil créatrice, panier, écran de paiement, facture *(CDC §5.1.3)*. Un appui affiche une phrase : *« Identité et compte mobile money vérifiés par JP. »*

~~**Le badge du particulier est distinct**~~ ❌ *(`DP-01`)* — il n'y a plus qu'un badge, « Boutique vérifiée ». Ancienne rédaction : *(R-H6)* : « Particulier vérifié » ne dit pas la même chose que « Boutique vérifiée », et l'acheteuse doit pouvoir faire la différence.

### 2. Structure de code
`packages/ui/src/BadgeVerifie.tsx` — un composant, utilisé partout, jamais réimplémenté. `packages/contracts` : le résumé boutique porte `{ verifie, typeVendeur }` dans **toutes** les réponses qui affichent une boutique.

### 3. Base de données
Aucune table. `boutique.statut_verification` et `type_boutique` suffisent. Le champ est inclus dans les projections de liste pour éviter une requête par vignette.

### 4. Design
Pastille compacte, **une seule variante** *(`DP-01`)*, trois tailles. Feuille explicative au toucher.

**Prompt Stitch** — préambule commun, puis :
```
Component sheet — verified badge variants.
Show a 3x3 grid of the same badge component: rows are sizes (small inline in a
list row, medium on a product card, large on a shop header); columns are
variants ("Boutique vérifiée" with a shield check, "Particulier vérifié" with a
person check, "Non vérifié" greyed out).
Then show a bottom sheet that opens on tap: a shield icon, title "Boutique
vérifié", body "Identité et compte mobile money vérifiés par JP.", and a
full-width button "J'ai compris".
```

### 5. Backend
Le champ est ajouté aux projections de boutique dans catalogue, direct, contenu, commande, facture. **Test transverse** : aucune réponse affichant une boutique ne l'omet.

### 6. Frontend
Composant partagé, utilisé aux 8 emplacements. Test de rendu par emplacement.

```issues
feature: F0.7
titre: Badge boutique vérifiée
epic: "00"
phase: P1
prio: M
etapes: [conception, squelette, design, backend, frontend]
depend: [F0.6]
```

---

## F0.11 — Suppression et désactivation de compte

`P1 · M · complet` — **Règles** conformité, N3.x

### 1. Conception
Deux gestes différents, à ne pas confondre. **Désactivation** : réversible, le compte disparaît des vues publiques. **Suppression** : irréversible, anonymisation.

**Ce qui est conservé après suppression, et pourquoi** — les écritures financières et les factures *(C4)* : elles sont la preuve en cas de litige et une obligation comptable. Elles sont **désolidarisées de l'identité** : `utilisateur` est anonymisé, `ecriture_financiere` conserve le montant et la référence, plus le nom.

Blocages : suppression impossible avec une commande en cours, un litige ouvert, ou un solde non retiré. Chaque blocage est expliqué avec **l'action pour le lever**.

### 2. Structure de code
`modules/identite/suppression.ts` (anonymisation, cascade contrôlée) · `jobs/suppressionCompte.ts` (différé de 30 jours, annulable) · `apps/mobile/src/features/reglages/ecrans/{EcranDesactivation,EcranSuppression}.tsx`.

### 3. Base de données
`utilisateur.statut(actif|desactive|supprime)`, `suppression_demandee_le`. Anonymisation : `email = 'supprime+<id>@jp.invalid'`, `prenom = 'Utilisateur supprimé'`, photo effacée, `identite_externe` supprimée, documents d'identité **effacés** (pas anonymisés).

### 4. Design
Écran de suppression listant les conséquences en clair et les blocages éventuels. Double confirmation par saisie.

**Prompt Stitch** — préambule commun, puis :
```
Screen — "Supprimer mon compte".
Vertical order: back arrow, title; a red-bordered card listing consequences with
X icons: "Vos commandes passées ne seront plus consultables", "Votre cagnotte de
4 500 Ar sera perdue", "Vos avis resteront en ligne, sans votre nom"; a blocking
amber card with a lock icon reading "1 commande en cours — vous pourrez supprimer
votre compte après la livraison" and a link "Voir ma commande"; a field labelled
'Tapez "SUPPRIMER" pour confirmer'; a full-width red destructive button
"Supprimer définitivement", disabled; a secondary text link "Désactiver
temporairement à la place".
```

### 5. Backend
`POST /moi/desactivation` · `POST /moi/suppression` (contrôle des blocages, différé 30 jours) · `DELETE /moi/suppression` (annulation).

**Tests** : suppression refusée avec commande en cours, litige, solde ; anonymisation effective ; **écritures financières conservées** ; documents d'identité effacés ; annulation dans les 30 jours ; les listes d'abonnés et de clientes sont à jour après suppression *(US-SOCIAL-04, US-FID-03)*.

### 6. Frontend
Parcours volontairement peu fluide : deux écrans, une saisie de confirmation. Alternative de désactivation toujours proposée.

```issues
feature: F0.11
titre: Suppression et désactivation de compte
epic: "00"
phase: P1
prio: M
etapes: [conception, squelette, bdd, design, backend, frontend]
depend: [F0.1]
```

---

## F0.5 — Profil acheteur

`P1 · S · moyen`

**Conception** — prénom, photo, tailles (haut, bas, chaussures), morphologie, budget habituel, styles, couleurs. Alimente le fil « Pour toi » *(R-K8)*, la présélection de taille au « Je prends » *(R-J1)*, le filtre par taille *(F8.3)* et la comparaison aux mesures d'un article *(R-H4)*. Renseigné au quiz de style *(F17.9)*, modifiable ensuite.

**Base de données** — `profil_acheteur` (CDC §3.1), un enregistrement par utilisateur.

**Backend** — `GET/PUT /moi/profil`. Les tailles sont des chaînes normalisées (« M », « 38 »), avec table de correspondance dans `packages/contracts` : « 38 » et « M » doivent filtrer pareil.

**Design** — écran de réglages en sections. Prompt Stitch : *profile settings screen, sections "Mes tailles" (three dropdown rows: Haut, Bas, Chaussures), "Ma morphologie" (four selectable illustrated cards), "Mon budget habituel" (a range slider showing "10 000 – 80 000 Ar"), "Mes styles" (multi-select chips: Classique, Moderne, Wax, Sport, Soirée), each section with a muted helper line explaining what it improves.*

**Frontend** — `features/profil/`. Les valeurs pré-remplissent les filtres et la feuille « Je prends ».

```issues
feature: F0.5
titre: Profil acheteur
epic: "00"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F0.1]
```

---

## F0.8 — Choix de la langue malgache / français

`P1 · S · moyen`

**Conception** — bascule à tout moment, sans redémarrage. Le malgache est **la langue par défaut**, avec détection de la langue de l'appareil au premier lancement. **Contrainte de conception permanente** : les libellés malgaches sont environ 30 % plus longs — aucun bouton ni onglet ne doit tronquer, et c'est un point de recette visuelle, pas une découverte tardive.

**Base de données** — `utilisateur.langue(mg|fr)`. Les notifications et les courriels utilisent cette valeur, jamais la langue de l'appareil au moment de l'envoi.

**Backend** — `PUT /moi/langue`. Les messages d'erreur sont traduits **côté serveur** à partir du code stable, pas côté client.

**Design** — deux lignes dans les réglages. Prompt Stitch : *language settings, two large selectable rows "Malagasy" and "Français", each with a radio on the right and the language name written in that language; a muted line at the bottom "Les notifications et les factures utiliseront cette langue."*

**Frontend** — `packages/i18n`, changement à chaud, formats de date et de montant liés à la langue.

```issues
feature: F0.8
titre: Choix de la langue malgache / français
epic: "00"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: []
```

---

## F0.9 — Mode économie de données

`P1 · S · moyen`

**Conception** — ce n'est pas un interrupteur décoratif *(CDC §10.2)*. Il doit réellement : réduire la qualité vidéo par défaut, désactiver la lecture automatique, limiter le préchargement à **un seul** contenu, servir des images en basse définition, et **s'activer automatiquement** sur détection d'un débit faible, avec un bandeau proposant la bascule.

**Base de données** — `utilisateur.mode_economie bool` + réglage local (le mode doit fonctionner avant même la connexion).

**Backend** — l'en-tête `X-Mode-Economie` fait varier les tailles d'image servies et la qualité vidéo proposée. Aucun écran ne demande une image pleine résolution dans une liste, mode économie ou non *(C1, C2)*.

**Design** — un interrupteur dans les réglages, un bandeau contextuel. Prompt Stitch : *settings row with a toggle labelled "Économie de données", helper text "Images allégées, vidéos sans lecture automatique"; and separately a slim top banner over a feed reading "Connexion lente — passer en mode léger ?" with "Activer" and a dismiss X.*

**Frontend** — contexte global lu par le lecteur vidéo, le composant image et le préchargeur du fil.

```issues
feature: F0.9
titre: Mode économie de données
epic: "00"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: []
```

---

## F0.10 — Consultation en invité

`P1 · S · moyen`

**Conception** — tout est consultable sans compte : fil, clips, stories, fiches, vitrines, replays, pages d'événement *(R-W6)*. L'inscription se déclenche **au « Je prends »**, et **la réservation est posée avant l'inscription** *(US-VENTE-08 CA2)*. Perdre l'article pendant l'inscription tue la première conversion — c'est le point critique de cette fonctionnalité, pas l'accès invité lui-même.

**Base de données** — `reservation.utilisateur_id` doit accepter une réservation rattachée à une **session invitée** puis transférée au compte créé. Table `session_invitee (id, cree_le, expire_le)`, transfert dans la transaction de création de compte.

**Backend** — routes publiques marquées explicitement dans le routeur (liste blanche, jamais l'inverse). `POST /reservations` accepte un jeton d'invité et pose la réservation ; le rattachement se fait à l'ouverture de session.

**Design** — bandeau d'explication de JP en une phrase pour l'invité, aucun mur de connexion. Prompt Stitch : *a product feed with a slim persistent bottom bar reading "Vos achats sont protégés par JP" and a "Créer mon compte" link, and a product sheet where the primary button reads "Je prends" with a small line underneath "Inscription en 2 écrans, votre article est réservé".*

**Frontend** — session invitée locale, reprise exacte du parcours après inscription (article, taille, quantité conservés).

```issues
feature: F0.10
titre: Consultation en invité
epic: "00"
phase: P1
prio: S
etapes: [conception, bdd, design, backend, frontend]
depend: [F0.1]
```

---

## F0.12 — Blocage d'un utilisateur

`P2 · C · cadre`

**Conception** — un utilisateur peut en bloquer un autre : plus de commentaires, plus de questions, plus de visibilité mutuelle des contenus. Distinct de la **sanction** *(F6.8, F19.9)*, qui est une décision de la plateforme. Se combine avec la restriction de commentaires *(F19.2)* et le filtre de mots *(F19.11)*.

**Impact base de données** — table `blocage (bloqueur_id, bloque_id, cree_le)`, PK composite. À filtrer dans : commentaires, questions d'article, chat de direct, listes d'abonnés, fil.

**Endpoints pressentis** — `POST /blocages`, `DELETE /blocages/:id`, `GET /moi/blocages`.

**Point d'attention** — un blocage n'empêche **pas** une transaction déjà engagée d'aller à son terme, ni un litige d'être instruit. Ne pas mélanger la protection sociale et l'exécution commerciale.

```issues
feature: F0.12
titre: Blocage d'un utilisateur
epic: "00"
phase: P2
prio: C
etapes: [conception, bdd, backend, frontend]
depend: [F0.1]
```

---

*Épique suivante : [EP01-catalogue](EP01-catalogue.md) — catalogue et vente hors direct.*
