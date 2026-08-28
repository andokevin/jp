# JP — Je prends
## Cahier des charges · volet technique

| | |
|---|---|
| **Public** | Équipe de développement |
| **Périmètre** | Version 1 (phase 1) |
| **Version** | 1.0 · Août 2026 |
| **Amont** | `JP_CAHIER_DES_CHARGES.md` (règles `R-xx`) · `JP_BACKLOG.md` (`Fxx.y`) · `JP_EXPRESSION_DE_BESOIN.md` (`Bx.y`, `Nx.y`) |

> Ce document décrit **quoi construire et sous quelles contraintes**, pas les choix d'implémentation ligne à ligne. Les propositions de pile technique sont des **recommandations argumentées** ; l'équipe peut en retenir d'autres à condition de tenir les contraintes de la section 2.

---

# 1. Les cinq contraintes qui commandent l'architecture

Toute décision technique se justifie contre cette liste.

| # | Contrainte | Conséquence |
|---|---|---|
| **C1** | **Terminal d'entrée de gamme** — peu de mémoire, peu de stockage, processeur modeste | Application légère, pas de bibliothèque lourde superflue, images dimensionnées côté serveur, listes recyclées |
| **C2** | **Réseau lent et intermittent, données payantes** | Charges utiles minimales, pagination stricte, cache agressif, reprise automatique, mode économie réel |
| **C3** | **Intégrité du stock absolue** — la survente est un échec de recette | Décrément atomique côté serveur, jamais côté client. Verrouillage au niveau de la variante. |
| **C4** | **Argent conservé pour compte de tiers** | Journal financier inaltérable, idempotence de bout en bout, réconciliation quotidienne, traçabilité complète |
| **C5** | **Pic du soir 18 h – 23 h** | Dimensionnement sur le pic, pas sur la moyenne. Une indisponibilité à 20 h coûte une soirée entière de chiffre d'affaires. |

---

# 2. Architecture cible

## 2.1 Vue d'ensemble

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  App mobile  │  │  App livreur │  │  App relais  │  │ Web (cadeau, │
│   Android    │  │              │  │              │  │  back-office)│
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       └─────────────────┴─────────┬───────┴─────────────────┘
                                   │  HTTPS / WebSocket
                          ┌────────▼─────────┐
                          │   API passerelle │  authentification, quotas,
                          │                  │  journalisation, idempotence
                          └────────┬─────────┘
      ┌──────────┬──────────┬──────┴────┬──────────┬──────────┐
      │          │          │           │          │          │
 ┌────▼───┐ ┌───▼────┐ ┌───▼─────┐ ┌───▼────┐ ┌───▼────┐ ┌───▼─────┐
 │Identité│ │Catalog.│ │Commande │ │Paiement│ │Contenu │ │Modérat. │
 │  KYC   │ │ Stock  │ │ Litige  │ │Séquestre│ │  Fil   │ │Signalt. │
 └────────┘ └────────┘ └─────────┘ └───┬────┘ └───┬────┘ └─────────┘
                                       │          │
                          ┌────────────▼──┐  ┌────▼──────────┐
                          │  Prestataires │  │ Vidéo : ingest│
                          │  MVola/Orange │  │ transcodage   │
                          │  Airtel/carte │  │ diffusion CDN │
                          └───────────────┘  └───────────────┘
      ┌──────────────┬───────────────┬──────────────┬───────────────┐
 ┌────▼────┐  ┌──────▼──────┐  ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼────┐
 │PostgreSQL│  │Redis (cache,│  │File de    │  │Stockage   │  │Recherche │
 │ (vérité) │  │ verrous,    │  │ messages  │  │objet      │  │/ fil     │
 │          │  │ temps réel) │  │(asynchrone)│  │(médias)  │  │          │
 └──────────┘  └─────────────┘  └───────────┘  └───────────┘  └──────────┘
```

## 2.2 Recommandations de pile

| Couche | Recommandation | Justification |
|---|---|---|
| **Mobile** | **React Native (Expo)** — *décision arrêtée* | Une base pour l'application principale et pour les applications de terrain (livreur, relais), et la même langue que le back-end et le back-office. **Contrepartie à surveiller comme un risque de recette** : le poids de l'APK et l'empreinte mémoire (**C1**) sont moins maîtrisés qu'en natif. À instrumenter dès la première livraison, avec le plafond de poids fixé en J0 comme critère bloquant. |
| **Back-end** | **Node.js 22 + TypeScript**, service unique modulaire, pas de micro-services | À cette taille d'équipe, les micro-services coûtent plus qu'ils ne rapportent. Modules séparés par domaine, base commune, découpage possible plus tard. Le partage des types et des schémas de validation avec les clients supprime une classe entière de défauts de contrat. |
| **Back-office et pages publiques** | **React + Vite** | Tableaux, files de modération, page cadeau, page événement, vitrines partageables. Rendu côté serveur là où le partage social l'exige (aperçus de lien). |
| **Base** | **PostgreSQL** | Transactions strictes indispensables pour le stock (**C3**) et l'argent (**C4**). Ce point n'est pas négociable, quelle que soit la pile retenue. |
| **Cache / verrous / temps réel** | **Redis** | Verrous de réservation, compteurs de stock en direct, diffusion des événements du direct |
| **Temps réel** | WebSocket, repli par sondage long | Stock en direct, commandes, chat |
| **Asynchrone** | File de messages durable | Transcodage, notifications, factures, expirations, réconciliation |
| **Médias** | Stockage objet + CDN | Poste de coût principal, à surveiller dès le premier jour |
| **Vidéo directe** | ⚠️ **Décision majeure** — service géré contre auto-hébergé | Voir §7. Recommandation : **service géré en V1**. |
| **Recherche et fil** | Index dédié, ou PostgreSQL avec index adaptés en V1 | Ne pas introduire un moteur de recherche tant que le volume ne le justifie pas |
| **Back-office** | Application web séparée | Pas dans l'application mobile |

---

# 3. Modèle de données

Notation : `PK` clé primaire · `FK` clé étrangère · `UQ` unique · `IDX` index requis.

## 3.1 Identité

```
utilisateur
  id PK · email UQ · email_verifie_le          -- identifiant du compte (R-C1)
  telephone NULL · telephone_verifie_le NULL   -- contact de livraison (R-C15)
  prenom · photo_url · langue(mg|fr)
  date_naissance          -- requis pour publier (R-X8)
  statut(actif|suspendu|supprime)
  cree_le · derniere_connexion_le
  -- le téléphone n'est PLUS unique ni obligatoire : un foyer peut partager
  -- un numéro de livraison. L'unicité porte sur l'email seul.

code_otp                                       -- R-C5 à R-C8
  id PK · email · code_empreinte               -- haché, jamais en clair (R-C6)
  tentatives int · expire_le · consomme_le NULL
  adresse_ip · cree_le
  IDX(email, expire_le)
  -- un seul code actif par email : l'émission d'un nouveau code invalide
  -- le précédent dans la même transaction

identite_externe                               -- R-C11, R-C12
  id PK · utilisateur_id FK
  fournisseur(google) · sujet_externe · email_verifie bool
  UQ(fournisseur, sujet_externe)
  -- rattachement à un compte existant si l'email correspond : jamais de doublon

profil_acheteur
  utilisateur_id PK/FK
  taille_haut · taille_bas · taille_chaussure · morphologie
  budget_min · budget_max · styles[] · couleurs[]
  -- alimente le fil « Pour toi » (R-K8) et la présélection de taille (R-J1)

profil_vendeur
  id PK · utilisateur_id FK UQ
  type_vendeur(boutique|particulier)   -- R-H5, R-H6
  nom_boutique NULL · description · adresse_enlevement
  statut_verification(brouillon|en_cours|verifie|refuse)
  msisdn_mobile_money · operateur_mm
  affiliation_autorisee bool     -- R-N3
  score_confiance · delai_expedition_moyen
  politique_retour
  nb_abonnes int                 -- dénormalisé, R-Q2
  fidelite_activee bool          -- R-R4
  -- nom_boutique est NULL pour un particulier : on ne lui demande pas
  -- d'inventer un nom de commerce (R-H5)

profil_createur
  id PK · utilisateur_id FK UQ
  nom_public · bio · reseaux[]
  statut_verification(...)
  msisdn_mobile_money · operateur_mm
  palier · badge_verifie bool

document_identite
  id PK · utilisateur_id FK
  type(cin_recto|cin_verso|sefie) · url_chiffree · empreinte
  -- chiffré au repos, accès journalisé (N3.1)

membre_equipe                    -- F10.4
  id PK · vendeur_id FK · utilisateur_id FK
  permissions[]  -- voir_commandes, preparer, moderer_chat, creer_article
  -- jamais : portefeuille, retrait, modification de prix (R matrice §3.2 du CDC)
```

## 3.2 Catalogue et stock

```
article
  id PK · vendeur_id FK · nom · description · categorie_id FK
  marque · matiere · prix_ariary int
  prix_barre_ariary int null
  statut(brouillon|en_ligne|masque|epuise)
  piece_unique bool               -- F1.14
  type_vente(stock|precommande)   -- F15.8
  etat_vetement(neuf_etiquette|tres_bon|bon|correct) null   -- R-H4
  mesures jsonb null              -- epaules_cm, poitrine_cm, taille_cm, longueur_cm
  achat_direct_actif bool         -- R-H1, achat hors direct autorisé
  cree_le · IDX(vendeur_id, statut)
  -- `mesures` est un jsonb et non des colonnes : les champs pertinents varient
  -- par catégorie (chaussures ≠ robe). Bornes validées applicativement (R-H4).

question_article                  -- F1.20, R-H9
  id PK · article_id FK · auteur_id FK
  texte · reponse_texte null · repondu_le null · repondu_par_id null
  statut(publiee|masquee)         -- filtrage automatique (R-X1)
  cree_le · IDX(article_id, statut, cree_le)

variante
  id PK · article_id FK
  taille · couleur · sku
  quantite_stock int              -- vérité
  quantite_reservee int           -- toujours <= quantite_stock
  UQ(article_id, taille, couleur)
  CONTRAINTE quantite_reservee >= 0 AND quantite_reservee <= quantite_stock
  -- disponible = quantite_stock - quantite_reservee  (R-S2)

reservation                       -- F1.10, cœur du système
  id PK · variante_id FK · utilisateur_id FK
  quantite int · statut(active|consommee|expiree|annulee)
  origine(direct|catalogue|clip|story|evenement)   -- R-H2
  direct_id FK null               -- renseigné si origine=direct
  cree_le · expire_le · suspendu_depuis null
  rang int                        -- file d'attente F2.7
  IDX(variante_id, statut) · IDX(expire_le) WHERE statut='active'
  -- La durée initiale dépend de l'origine (R-H3) : paramètres
  -- duree_reservation_direct_s et duree_reservation_catalogue_s.
  -- Une fois posée, la réservation est traitée par le même moteur
  -- d'expiration quelle que soit son origine : un seul chemin de code.

mouvement_stock
  id PK · variante_id FK · type(entree|vente|retour|correction|expiration)
  quantite_delta · reference · auteur_id · cree_le
```

## 3.3 Commande, paiement, séquestre

```
commande
  id PK · numero UQ · acheteur_id FK
  createur_id FK null             -- attribution affiliation (R-N1)
  donateur_ref null               -- commande cadeau (F16)
  statut(voir §4.1)
  origine(direct|catalogue|clip|story|evenement)   -- R-H2
  direct_id FK null · evenement_id FK null         -- selon l'origine
  mode_livraison(domicile|relais) · adresse_id FK null · relais_id FK null
  code_promo null                 -- figé à la commande (R-U9)
  sous_total · frais_livraison · remise · total   -- tous en Ariary, int
  cree_le · IDX(acheteur_id, cree_le) · IDX(statut)
  IDX(origine, cree_le)           -- statistiques par canal, F9.2

ligne_commande
  id PK · commande_id FK · variante_id FK · vendeur_id FK
  quantite · prix_unitaire · commission_jp · commission_createur
  remise_ligne int DEFAULT 0 · promotion_id FK null   -- R-U7, traçabilité
  -- prix figé à la commande : une modification ultérieure ne le change pas
  -- une seule promotion par ligne, jamais deux : la colonne est scalaire,
  -- et c'est volontaire — la structure interdit le cumul (R-U7)

paiement
  id PK · commande_id FK
  moyen(mvola|orange|airtel|carte|especes)
  montant · statut(voir §4.2)
  reference_externe · cle_idempotence UQ         -- R-M2
  payeur_utilisateur_id null · payeur_pays null  -- diaspora F16.4
  cree_le · confirme_le

sequestre                         -- R-E1
  id PK · commande_id FK
  montant_retenu · statut(retenu|libere|rembourse|partiel)
  liberable_le                    -- calculé à la livraison (R-E4)
  libere_le · motif_liberation(confirmation|unboxing|automatique|arbitrage)

ecriture_financiere               -- journal inaltérable, C4
  id PK · type · reference · montant · sens(debit|credit)
  compte(sequestre|portefeuille_vendeur|portefeuille_createur|commission_jp|especes)
  titulaire_id · cree_le
  -- APPEND ONLY : aucune modification, aucune suppression
  -- toute correction est une écriture inverse

portefeuille
  id PK · titulaire_id FK · type(vendeur|createur)
  solde_en_attente · solde_disponible          -- R-E6, distincts
  -- dérivés du journal, jamais saisis directement

retrait
  id PK · portefeuille_id FK · montant · msisdn_destination
  statut · reference_externe · cle_idempotence UQ

facture
  id PK · commande_id FK UQ · numero UQ
  url_pdf · emise_le  -- horodatage inaltérable (R-F1)
```

## 3.4 Livraison

```
adresse
  id PK · utilisateur_id FK
  libelle · quartier · reperes · telephone_destinataire
  -- pas de code postal (R-L3)
  -- jamais exposée hors du couple acheteur/transporteur (R-L8, RB8)

point_relais
  id PK · nom · quartier · latitude · longitude
  horaires · photo_devanture · delai_garde_jours
  statut(actif|inactif)

colis
  id PK · commande_id FK · vendeur_id FK
  statut(voir §4.3) · livreur_id null · relais_id null
  code_retrait char(6) null       -- usage unique, R-L6
  preuve_remise_url · remis_le

evenement_livraison
  id PK · colis_id FK · statut · auteur_id · horodatage · commentaire
  -- historique partagé, identique des deux côtés (R-L4)
```

## 3.5 Contenu

```
contenu
  id PK · auteur_id FK · type(story|clip|photo|unboxing)
  media_url · miniature_url · duree_s · statut(brouillon|publie|retire)
  commande_source_id FK null      -- obligatoire si type=unboxing (R-K2)
  commentaires_ouverts(tous|abonnes|aucun)   -- R-X1
  publie_le · expire_le           -- story : +24 h
  empreinte_video                 -- détection de republication, R-X7
  IDX(auteur_id, publie_le) · IDX(type, publie_le)

contenu_article                   -- R-K1, table de liaison OBLIGATOIRE
  contenu_id FK · article_id FK · createur_id FK null · position
  PK(contenu_id, article_id)
  -- CONTRAINTE APPLICATIVE : un contenu publié DOIT avoir >= 1 ligne ici.
  -- À faire respecter par transaction ET par contrainte différée en base.
  -- Critère de recette bloquant RB5.

statistique_contenu
  contenu_id PK/FK
  vues · duree_moyenne_s · clics_article · je_prends · ventes · gains
  -- l'entonnoir complet, pas un compteur de vues (R-K15)

interaction
  id PK · contenu_id FK · utilisateur_id FK
  type(vue|reaction|commentaire|partage|favori) · texte null · cree_le

abonnement                        -- R-Q1
  suiveur_id FK · suivi_id FK · type(vendeur|createur) · cree_le
  notifications_promo bool DEFAULT true    -- R-Q6, réglage par vendeur
  PK(suiveur_id, suivi_id)
  IDX(suivi_id, cree_le)          -- liste des abonnés côté vendeur, R-Q3
  -- profil_vendeur.nb_abonnes et profil_createur.nb_abonnes sont dénormalisés
  -- et maintenus par déclencheur : compter 200 000 lignes à chaque affichage
  -- de vitrine est exclu (C1, C2)
```

## 3.6 Créatrice, affiliation, précommande

```
selection                         -- F15.3
  id PK · createur_id FK · nom_theme · position

selection_article
  selection_id FK · article_id FK · position

clic_affiliation                  -- R-N2, fenêtre d'attribution
  id PK · createur_id FK · article_id FK · utilisateur_id FK
  cree_le · expire_le
  IDX(utilisateur_id, article_id, expire_le)

precommande                       -- F15.8
  id PK · article_id FK UQ · organisateur_id FK
  seuil int · date_limite · delai_livraison_annonce
  compteur_actuel int
  statut(ouverte|seuil_atteint|expiree|remboursee|livree)
  avance_liberee int              -- R-N9, à trancher
  date_expedition_max             -- R-N10, à trancher

precommande_engagement
  id PK · precommande_id FK · commande_id FK · statut
```

## 3.7 Fidélisation et rang client

```
palier_fidelite                   -- R-R4
  id PK · vendeur_id FK
  nom · rang_ordre int            -- 1 = le plus bas
  seuil_montant int null · seuil_commandes int null
  avantage_texte
  UQ(vendeur_id, rang_ordre)
  -- au moins un des deux seuils est renseigné
  -- les seuils DOIVENT être strictement croissants avec rang_ordre :
  -- contrôle applicatif à la sauvegarde de l'ensemble des paliers

rang_client                       -- R-R1, R-R2, R-R3
  id PK · vendeur_id FK · utilisateur_id FK
  palier_id FK null
  score int                       -- entier, jamais un flottant
  montant_cumule int · nb_commandes int
  premiere_commande_le · derniere_commande_le
  nb_litiges_perdus int · nb_annulations int
  calcule_le
  UQ(vendeur_id, utilisateur_id)
  IDX(vendeur_id, score DESC)     -- le classement, R-R7
  IDX(vendeur_id, derniere_commande_le)  -- filtre « inactives depuis X »
  -- PAR VENDEUR, jamais global (R-R1). Il n'existe volontairement AUCUN
  -- index ni aucune vue permettant d'agréger le montant d'un client
  -- tous vendeurs confondus : l'absence de chemin d'accès est la garantie.

note_client                       -- R-R7, note privée du vendeur
  id PK · vendeur_id FK · utilisateur_id FK · texte · modifie_le
  UQ(vendeur_id, utilisateur_id)
  -- jamais exposée au client, sur aucune interface

vente_confirmee_journal           -- R-R11, à créer DÈS LA PHASE 1
  id PK · vendeur_id FK · utilisateur_id FK · commande_id FK UQ
  montant_confirme int · confirme_le
  IDX(vendeur_id, utilisateur_id, confirme_le)
  -- écrit à l'entrée en statut CONFIRMEE, dans la même transaction.
  -- Alimente le recalcul de rang_client, y compris en rattrapage sur
  -- l'historique. L'unicité sur commande_id rend le rattrapage idempotent.
```

## 3.8 Promotions

```
promotion                         -- R-U1
  id PK · vendeur_id FK · evenement_id FK null
  type(pourcentage|montant|livraison_offerte)
  valeur int                      -- pourcentage entier, ou montant en Ariary
  perimetre(boutique|categorie|selection) · categorie_id FK null
  cible(tous|abonnes|palier|clients_nommes) · palier_min_id FK null
  code UQ null                    -- null pour une promotion sans code
  plafond_utilisation int null · utilisations int DEFAULT 0
  debut_le · fin_le
  statut(brouillon|programmee|active|terminee|annulee)
  notifier_abonnes bool · notifiee_le null        -- R-U3, R-U4
  cree_par_id · cree_le
  IDX(vendeur_id, statut, debut_le) · IDX(statut, debut_le) WHERE statut='programmee'
  -- `notifiee_le` non nul est le verrou d'idempotence de la notification :
  -- après un incident du planificateur, la promotion ne renotifie pas (R-U3)

promotion_article                 -- perimetre = selection
  promotion_id FK · article_id FK
  PK(promotion_id, article_id)

promotion_beneficiaire            -- cible = clients_nommes, R-U6
  promotion_id FK · utilisateur_id FK
  code_personnel UQ null · utilise_le null · commande_id FK null
  PK(promotion_id, utilisateur_id)
  -- un code personnel est nominatif ET à usage unique : l'unicité de
  -- code_personnel plus le contrôle de utilise_le dans la transaction
  -- de création de commande interdisent le double usage.
```

**Calcul de la remise** *(R-U7)* — appliqué au calcul du panier, côté serveur :

1. Rassembler les promotions **éligibles** pour ce couple (article, acheteur) : période active, périmètre incluant l'article, cible satisfaite (tous / abonné vérifié / palier atteint / bénéficiaire nommé), plafond non atteint.
2. Séparer les remises **sur articles** des remises **sur livraison** — les deux seules assiettes distinctes autorisées à coexister.
3. Dans chaque assiette, retenir **la plus favorable à l'acheteur**, en entiers d'Ariary. Jamais d'addition.
4. Écrire `remise_ligne` et `promotion_id` sur la ligne de commande, et le libellé sur la facture *(R-U8)*.
5. Le total présenté à l'écran de paiement est celui prélevé. Si une promotion expire entre les deux, une confirmation explicite est demandée *(R-U2, RB7)*.

## 3.9 Événements thématiques

```
evenement                         -- R-W1
  id PK · portee(jp|vendeur) · proprietaire_id FK null
  nom · theme · slug UQ · description
  visuel_url · couleur_accent · hashtag null
  debut_le · fin_le
  statut(brouillon|annonce|en_cours|termine|annule)
  candidatures_ouvertes bool
  cree_par_id · cree_le
  IDX(statut, debut_le) · IDX(portee, statut)
  -- proprietaire_id est NULL si portee=jp, renseigné si portee=vendeur (R-W8)
  -- les bascules annonce → en_cours → termine sont pilotées par les dates
  -- par une tâche périodique ; l'annonce reste une action humaine

evenement_participation           -- R-W3, R-W4
  id PK · evenement_id FK · participant_id FK
  role(vendeur|createur)
  statut(candidate|acceptee|refusee|refusee_sans_reponse)
  motif_refus null · decide_par_id null · decide_le null
  cree_le · UQ(evenement_id, participant_id)
  IDX(evenement_id, statut)
  -- `refusee_sans_reponse` est posé automatiquement à l'ouverture de
  -- l'événement pour toute candidature restée en attente (R-W4)

evenement_element                 -- R-W5
  evenement_id FK · cible_type(article|promotion|contenu|direct) · cible_id
  participation_id FK · position int
  PK(evenement_id, cible_type, cible_id)
  IDX(cible_type, cible_id)       -- « cet article est-il dans un événement ? »
  -- polymorphe assumé : quatre types de cibles pour une même page.
  -- L'intégrité référentielle est applicative, contrôlée à l'insertion.

evenement_rappel                  -- R-W9
  evenement_id FK · utilisateur_id FK
  demande_le · notifications_envoyees int
  PK(evenement_id, utilisateur_id)
  -- le compteur plafonne à 3 (R-W9) et partage le budget de R-U4
```

## 3.10 Litige, modération

```
litige
  id PK · commande_id FK · ouvert_par_id FK
  motif(non_recu|abime|non_conforme|mauvaise_taille|autre)
  statut(ouvert|en_discussion|arbitrage|resolu|clos)
  decision_texte · decide_par_id · decide_le    -- R-T2, obligatoire
  cree_le

message_litige
  id PK · litige_id FK · auteur_id FK · texte · pieces_jointes[] · cree_le

signalement                       -- F19.3
  id PK · cible_type(contenu|commentaire|utilisateur) · cible_id
  signale_par_id FK · motif · niveau(ordinaire|urgence)   -- R-X4
  statut(nouveau|en_cours|traite|classe)
  traite_par_id · decision · traite_le
  IDX(niveau, statut, cree_le)   -- urgence en tête de file

sanction
  id PK · utilisateur_id FK
  type(avertissement|retrait|restriction|suspension|exclusion)
  motif_texte · duree · applique_par_id · applique_le
  conteste bool · resultat_contestation      -- R-X6

avis                              -- F6.1
  id PK · commande_id FK UQ · auteur_id FK · vendeur_id FK
  note int · texte · photo_url
  conformite_taille(conforme|petit|grand)
  contenu_id FK null              -- si généré par un unboxing (R-T7)
```

## 3.11 Exploitation

```
parametre                         -- R-O1
  cle PK · valeur · type · modifie_par_id · modifie_le
  -- duree_reservation_direct_s, duree_reservation_catalogue_s,
  -- delai_liberation_auto_j, taux_commission_<categorie>,
  -- credit_unboxing_ariary, fenetre_affiliation_j, delai_garde_relais_j...
  -- délai d'acceptation vendeur : delai_acceptation_direct_s
  --                               delai_acceptation_catalogue_s  (R-H8)
  -- bascule particulier : seuil_bascule_ventes, seuil_bascule_montant  (R-H11)
  -- authentification : otp_ttl_s, otp_max_par_heure, otp_max_par_jour,
  --                    otp_max_tentatives  (R-C5, R-C7)
  -- notifications : promo_max_par_vendeur_24h, promo_seuil_regroupement,
  --                 evenement_max_notifications  (R-U4, R-W9)
  -- rang client : poids_montant, poids_frequence, poids_recence,
  --               poids_fiabilite, demi_vie_recence_j  (R-R3)

journal_audit                     -- N3.4, append only
  id PK · acteur_id · action · cible_type · cible_id
  avant · apres · adresse_ip · horodatage
```

---

# 4. Machines à états

Toute transition non listée est interdite et doit lever une erreur.

## 4.1 Commande

```
                    ┌──────────────┐
                    │  BROUILLON   │ (panier)
                    └──────┬───────┘
                    validation panier
                    ┌──────▼───────┐
          ┌─────────│ EN_ATTENTE_  │──── échec / abandon ───┐
          │         │  PAIEMENT    │                        │
          │         └──────┬───────┘                   ┌────▼─────┐
          │        paiement confirmé                   │ ANNULEE  │
          │         ┌──────▼───────┐                   └──────────┘
          │         │    PAYEE     │──── annulation acheteur ──┐
          │         └──────┬───────┘     (avant préparation)   │
          │      vendeur accepte / prépare                     │
          │         ┌──────▼───────┐                      ┌────▼──────┐
          │         │ EN_PREPARATION├─── refus vendeur ───►│ REMBOURSEE│
          │         └──────┬───────┘                      └───────────┘
          │           remise transport                          ▲
          │         ┌──────▼───────┐                            │
          │         │  EXPEDIEE    │                            │
          │         └──────┬───────┘                            │
          │            remise faite                             │
          │         ┌──────▼───────┐                            │
          │         │   LIVREE     │──── litige ──► ARBITRAGE ──┤
          │         └──────┬───────┘                            │
          │   confirmation OU unboxing OU délai automatique     │
          │         ┌──────▼───────┐                            │
          └────────►│  CONFIRMEE   │  → libération séquestre ───┘
                    └──────────────┘     (R-E1, R-E3, R-E4)
```

**Précommande** — un état `EN_ATTENTE_SEUIL` s'insère entre `PAYEE` et `EN_PREPARATION`. Sortie vers `EN_PREPARATION` si le seuil est atteint, vers `REMBOURSEE` **automatiquement** à la date limite sinon *(R-N8, RB3)*.

## 4.2 Paiement

```
INITIE → EN_ATTENTE_OPERATEUR → CONFIRME
                │                    │
                ├─ ECHOUE            └─→ REMBOURSE (total ou partiel)
                └─ EXPIRE
```

- **Idempotence obligatoire** : chaque tentative porte une clé unique. Un rejeu avec la même clé renvoie le résultat initial sans nouveau prélèvement *(R-M2, RB10)*.
- **Rappels asynchrones** (webhooks) des prestataires : signature vérifiée, traitement idempotent, réception avant même la réponse synchrone possible.
- **Réconciliation** : tout paiement resté `EN_ATTENTE_OPERATEUR` au-delà d'un délai est réinterrogé activement, jamais abandonné silencieusement.

## 4.3 Colis

```
A_PREPARER → PRET → ENLEVE → EN_LIVRAISON ──────────► REMIS
                                    │                   ▲
                                    └─► AU_RELAIS ──────┘
                                            │ (délai de garde dépassé)
              ECHEC_LIVRAISON ◄─────────────┴─► RETOUR_VENDEUR
```

## 4.4 Réservation *(le plus sensible)*

```
                 ┌───────────┐
      « Je prends »│  ACTIVE  │── paiement confirmé ─► CONSOMMEE
                 └─────┬─────┘
        ┌──────────────┼──────────────┐
   expire_le atteint   │        annulation utilisateur
        │              │              │
   ┌────▼────┐   suspension       ┌───▼────┐
   │ EXPIREE │◄── (paiement en    │ANNULEE │
   └────┬────┘     cours ou       └───┬────┘
        │          coupure réseau)    │
        └──── remise en stock immédiate ──► notification du suivant en file
                                            (R-S6, R-S7)
```

**Suspension du minuteur** *(R-S5)* : `suspendu_depuis` est renseigné à l'entrée en attente opérateur ou lors d'une coupure vendeur ; à la reprise, `expire_le` est repoussé de la durée écoulée.

**Durée initiale selon l'origine** *(R-H3)* : la seule différence entre une réservation de direct et une réservation de catalogue est la valeur de `expire_le` à la création. Ensuite, un seul moteur d'expiration, un seul chemin de code, une seule série de tests de concurrence.

## 4.5 Promotion

```
BROUILLON ──┬──► PROGRAMMEE ──(date de début)──► ACTIVE ──(date de fin)──► TERMINEE
            │                     │                 │
            └─────────────────────┴─────► ANNULEE ◄──┘
```

- **PROGRAMMEE → ACTIVE** : par tâche périodique. La notification aux abonnés est envoyée **une seule fois**, garantie par `notifiee_le` *(R-U3, R-U4)*. Après un incident du planificateur, une promotion dont la date est dépassée démarre en retard mais **jamais deux fois**.
- **ACTIVE → TERMINEE** : les prix d'origine sont rétablis automatiquement *(R-U11)*.
- **Modification** : interdite après le début, à l'exception de l'annulation. Une commande passée conserve son prix et sa remise figés *(R-U9)*.
- **ANNULEE depuis ACTIVE** : les commandes déjà passées ne sont pas affectées.

## 4.6 Événement

```
BROUILLON ──(annonce, action humaine)──► ANNONCE
                                            │ (date de début)
                                       ┌────▼─────┐
                                       │ EN_COURS │──(date de fin)──► TERMINE
                                       └────┬─────┘                      │
                                            └──────► ANNULE ◄────────────┘
```

- **ANNONCE → EN_COURS** : à l'ouverture, toute `evenement_participation` restée `candidate` passe **automatiquement** en `refusee_sans_reponse` avec notification *(R-W4)*.
- **EN_COURS → TERMINE** : le bilan est produit, y compris s'il est mauvais *(R-W11)*.
- **Participation** : `candidate → acceptee | refusee | refusee_sans_reponse`. Une candidature acceptée ne redevient jamais candidate ; un retrait est une suppression d'éléments, pas un retour en arrière.

---

# 5. Le point critique : intégrité du stock

**RB1 est un critère de recette bloquant. Le traiter comme tel dès la conception, pas après.**

## 5.1 Règle

```
disponible(variante) = quantite_stock − quantite_reservee
```

Une réservation n'est acceptée que si `disponible >= quantite demandée`, et l'incrément de `quantite_reservee` doit être **atomique**.

## 5.2 Mise en œuvre attendue

**En base, dans une transaction unique** — c'est la source de vérité :

```sql
BEGIN;
  SELECT quantite_stock, quantite_reservee
    FROM variante WHERE id = :id FOR UPDATE;   -- verrou de ligne
  -- vérifier disponible >= :q, sinon ROLLBACK et erreur STOCK_INSUFFISANT
  UPDATE variante SET quantite_reservee = quantite_reservee + :q
    WHERE id = :id;
  INSERT INTO reservation (...);
COMMIT;
```

- `FOR UPDATE` sérialise les appuis simultanés sur la dernière pièce. C'est exactement le cas de test de RB1.
- La contrainte `quantite_reservee <= quantite_stock` en base est le dernier filet : même en cas de bogue applicatif, la survente est refusée par la base.
- **Redis sert d'accélérateur d'affichage, jamais d'autorité.** Le compteur en cache peut diverger ; la base tranche.

## 5.3 Expiration

Deux mécanismes, complémentaires :
1. **Tâche périodique** (toutes les quelques secondes) traitant les réservations dont `expire_le` est dépassé.
2. **Vérification paresseuse** à chaque lecture de disponibilité, pour éviter d'afficher un stock faux entre deux passages de la tâche.

À l'expiration : décrément de `quantite_reservee`, écriture d'un `mouvement_stock`, notification de l'acheteur et du suivant en file.

## 5.4 Diffusion du stock en direct

Le décrément publie un événement sur le canal du direct ; les clients connectés mettent à jour le bandeau. En cas de perte de WebSocket, le client resynchronise à la reconnexion — **il n'extrapole jamais**.

---

# 6. Interfaces de programmation

Convention : REST, JSON, `Authorization: Bearer`, en-tête `Idempotency-Key` obligatoire sur toute écriture financière.

## 6.1 Principales ressources

```
POST   /auth/otp                        envoi du code par courriel, débit limité
POST   /auth/otp/verifier               → jeton de session
POST   /auth/google                     échange du jeton du fournisseur
POST   /auth/email/changement           → code à l'ancienne adresse  (R-C13)
POST   /auth/email/changement/confirmer → code à la nouvelle adresse
POST   /auth/recuperation               demande instruite par un opérateur
POST   /moi/telephone                   → code SMS, à la 1re livraison  (R-C15)

GET    /fil?curseur=&type=              fil « Pour toi »
GET    /fil/abonnements                 directs · nouveautés · promos · événements
GET    /directs/en-cours
GET    /contenus/:id
POST   /contenus                        publication  → 422 si aucun article attaché
POST   /contenus/:id/interactions

GET    /articles/:id
GET    /articles/:id/questions          questions publiques  (R-H9)
POST   /articles/:id/questions
POST   /articles/:id/questions/:qid/reponse
GET    /vendeurs/:id/vitrine
GET    /createurs/:id
GET    /recherche?q=&taille=&prix_max=&categorie=

POST   /abonnements                     suivre, un appui  (R-Q1)
DELETE /abonnements/:suivi_id
GET    /moi/abonnements
PATCH  /moi/abonnements/:suivi_id       couper les promos sans se désabonner
GET    /vendeurs/:id/abonnes            vendeur seulement, sans coordonnées

POST   /reservations                    ← « Je prends », Idempotency-Key requis
                                        corps : origine (direct|catalogue|…)
DELETE /reservations/:id
GET    /panier
POST   /panier/valider                  → commande EN_ATTENTE_PAIEMENT
POST   /panier/code-promo               application et vérification d'un code
POST   /commandes/:id/paiement          Idempotency-Key requis
GET    /commandes/:id
POST   /commandes/:id/confirmer         confirmation de réception
POST   /commandes/:id/litige

POST   /commandes/:id/cadeau            → lien public
GET    /cadeau/:jeton                   public, sans authentification
POST   /cadeau/:jeton/paiement          public, Idempotency-Key requis

POST   /directs                         planifier
POST   /directs/:id/demarrer            → identifiants d'ingest
POST   /directs/:id/article-a-lecran
WS     /directs/:id/flux                stock, commandes, chat, spectateurs

GET    /createur/tableau-de-bord
POST   /createur/selection
POST   /precommandes
GET    /precommandes/:id

GET    /portefeuille
POST   /portefeuille/retrait            Idempotency-Key requis

GET    /vendeur/clients                 classement, tri, filtres  (R-R7)
GET    /vendeur/clients/:uid            fiche client + note privée
PUT    /vendeur/clients/:uid/note
GET    /vendeur/paliers                 paliers de fidélité
PUT    /vendeur/paliers                 remplacement de l'ensemble, validé en bloc
GET    /moi/avantages                   mon palier et ma progression par vendeur

GET    /vendeur/promotions
POST   /vendeur/promotions              → notification différée si notifier_abonnes
PATCH  /vendeur/promotions/:id          interdit après le début, sauf annulation
DELETE /vendeur/promotions/:id
POST   /vendeur/promotions/:id/codes    codes nominatifs pour une liste de clients
GET    /vendeur/promotions/:id/stats    notifiés · ouvertures · ventes  (R-U4)
GET    /moi/offres                      codes · promos éligibles · cagnotte

GET    /evenements                      calendrier public
GET    /evenements/:slug                page publique, sans authentification
POST   /admin/evenements                opérateur  (R-W1)
POST   /admin/evenements/:id/annoncer
GET    /admin/evenements/:id/candidatures
POST   /admin/evenements/:id/candidatures/:cid/decision   motif requis si refus
POST   /evenements/:id/participations    candidature vendeur ou créatrice
POST   /evenements/:id/elements          rattachement article/promo/contenu/direct
DELETE /evenements/:id/elements/:type/:cible_id
POST   /evenements/:id/rappel            « me prévenir à l'ouverture »
GET    /evenements/:id/bilan             vendeur : son bilan · opérateur : global

POST   /signalements
POST   /contenus/:id/parametres-commentaires

POST   /webhooks/paiement/:prestataire  signature vérifiée, idempotent
```

## 6.2 Règles transversales

| Règle | Exigence |
|---|---|
| **Pagination** | Par curseur, jamais par numéro de page. Taille de page réduite par défaut (**C2**). |
| **Charge utile** | Aucune réponse ne renvoie de champ non utilisé par l'écran appelant. |
| **Images** | Dimensions demandées par le client, redimensionnement côté serveur. Jamais d'image pleine résolution dans une liste. |
| **Erreurs** | Code stable, message traduit en malgache et en français, indication de l'action possible. |
| **Idempotence** | Toute écriture financière. Clé conservée 24 h minimum. |
| **Horodatage** | UTC en base, conversion à l'affichage. |
| **Montants** | Entiers en Ariary. **Aucun flottant nulle part**, ni en base, ni en transport, ni en calcul. |
| **Versionnement** | Préfixe de version, compatibilité ascendante — le parc ne se met pas à jour vite. |

---

# 7. Vidéo — le poste le plus incertain

**⚠️ Décision majeure à prendre en J0. C'est le principal risque technique et le principal risque de coût du projet.**

## 7.1 Les trois besoins

| Besoin | Contrainte |
|---|---|
| **Direct** | Diffusion depuis un téléphone modeste, latence compatible avec l'interaction, qualité adaptative, reprise sous 2 min *(R-D3)* |
| **Clips et stories** | Enregistrement, transcodage en plusieurs qualités, diffusion, expiration à 24 h pour les stories |
| **Enregistrement du direct** | Conservation en vue du replay achetable (phase 2) et de l'instruction des litiges *(R-X9)* |

## 7.2 Recommandation

**Service géré en V1.** Construire une chaîne d'ingest, de transcodage et de diffusion en interne est un projet en soi, et le budget de lancement n'est pas un budget d'infrastructure. Le surcoût unitaire d'un service géré est très inférieur au coût de construction et d'exploitation d'une chaîne propre à ce stade.

**Mais** : l'abstraction derrière une interface interne dès le premier jour est obligatoire, pour pouvoir internaliser plus tard sans réécrire l'application.

## 7.3 Contraintes de coût

- Le coût de diffusion croît avec les vues, pas avec les ventes. **À surveiller dès le premier jour** avec une alerte de dépassement.
- Résolutions plafonnées : la qualité maximale doit être calibrée sur ce que les terminaux du parc peuvent réellement afficher. Diffuser du 1080p à des téléphones qui affichent moins est du budget jeté.
- Durée maximale d'un clip à plafonner.
- Politique de rétention à définir : stories supprimées à 24 h, clips conservés, enregistrements de direct conservés une durée bornée.
- Les miniatures sont générées côté serveur et servies très agressivement en cache.

---

# 8. Notifications

| Canal | Usage | Repli |
|---|---|---|
| **Push** | Direct démarré, commande, réservation, contenu | — |
| **SMS** | **Colis arrivé au relais, code de retrait, expiration imminente de réservation** | Aucun — c'est déjà le repli *(N5.2)* |
| **Dans l'application** | Historique complet | — |

**Règles**
- Regroupement obligatoire : une seule notification de direct par soirée, même si l'utilisateur suit quinze vendeuses. Sans cela, il coupe tout — et l'on perd alors les notifications utiles, ce qui coûte beaucoup plus cher.
- Réglage fin par catégorie.
- Aucune notification sans contenu réel *(N6.4)*.
- Un seul rappel de panier abandonné, et seulement s'il reste du stock *(F17.12)*.

---

# 9. Sécurité et données personnelles

| Domaine | Exigence |
|---|---|
| **Transport** | TLS partout, épinglage de certificat recommandé sur mobile |
| **Pièces d'identité** | Chiffrées au repos, clé distincte, **chaque accès journalisé avec l'identité de l'agent** |
| **Adresses** | Jamais exposées au donateur, à la créatrice, ni publiquement *(RB8)*. À vérifier en revue de chaque interface. |
| **Paiement** | Aucun secret de carte ni de compte ne transite par JP *(N3.3)*. Redirection ou composant du prestataire. |
| **Journal financier** | `ecriture_financiere` en écriture seule. Une correction est une écriture inverse, jamais une modification. |
| **Journal d'audit** | Toute action de back-office, avec valeur avant et après |
| **Mineurs** | Contrôle de l'âge au moment de la publication, pas seulement à l'inscription *(RB6)* |
| **Contenus retirés** | Conservés le temps de l'instruction d'un litige, même supprimés par l'auteur *(R-X9)* |
| **Suppression de compte** | Effacement des données personnelles, **conservation des écritures financières et des factures** — obligation comptable. À expliquer clairement à l'utilisateur. |
| **Secrets** | Hors du dépôt de code, rotation possible |
| **Quotas** | Sur l'authentification, la publication, le signalement, la création de compte |

---

# 10. Performance et budget de données

## 10.1 Budgets à tenir comme des contraintes de recette

| Élément | Budget | Pourquoi |
|---|---|---|
| Poids de l'application installée | ⚠️ Plafond à fixer en J0 | Stockage saturé = désinstallation |
| Réponse du fil | Charge utile minimale, curseur | **C2** |
| Image de liste | Miniature dimensionnée, jamais l'originale | **C1, C2** |
| Préchargement en mode économie | **Un seul** contenu à l'avance | **C2** |
| Mémoire pendant le défilement | Recyclage strict, libération des lecteurs vidéo hors écran | **C1** |
| « Je prends » → confirmation | < 30 s bout en bout *(hypothèse)* | RP1 |

## 10.2 Mode économie de données *(F0.9)*

Ce n'est pas un simple interrupteur. Il doit réellement :
- réduire la qualité vidéo par défaut ;
- désactiver la lecture automatique ;
- limiter le préchargement à un seul élément ;
- servir des images en basse définition ;
- s'activer **automatiquement** sur détection d'un débit faible, avec un bandeau proposant la bascule.

## 10.3 Fonctionnement hors ligne *(N1.5)*

Consultables sans réseau une fois chargés : liste des commandes et leurs statuts, **code de retrait**, factures téléchargées, panier. Le code de retrait hors ligne est indispensable : l'acheteuse est devant le relais, souvent sans données.

## 10.4 Charge

Dimensionner sur le pic 18 h – 23 h *(C5)*, avec un scénario de référence : plusieurs directs simultanés, pic de « Je prends » sur un même article, chat actif. Ce scénario doit être rejoué avant chaque mise en production.

---

# 11. Observabilité

**Deux familles distinctes, à ne pas confondre.**

**Technique** — journaux structurés avec identifiant de corrélation traversant tous les services · métriques par point d'entrée (latence, erreurs, débit) · suivi des tâches asynchrones · alertes sur : taux d'échec de paiement, retard de la file de messages, dépassement du budget de diffusion vidéo, écart de réconciliation.

**Métier** *(F11.7, exigence contractuelle R-O2)* — **le tableau de bord des quatre mesures fondatrices doit être opérationnel dès le premier direct du pilote.** Il n'est pas livrable après le lancement : mesurer est un objectif du projet.

À instrumenter dès le premier jour :

| Événement | Sert à |
|---|---|
| `direct_vu`, `je_prends_appuye`, `feuille_ouverte`, `paiement_lance`, `paiement_confirme` | Entonnoir de conversion en direct |
| `reservation_expiree` | Stock immobilisé — mesure fondatrice n° 4 |
| `paiement_abandonne` + étape | Demande bloquée par la confiance — mesure n° 3 |
| `contenu_vu`, `article_clique`, `contenu_converti` | Conversion d'un clip contre un direct |
| `unboxing_publie` / `commande_livree` | Taux de production de contenu |
| `vente_affiliee` + créatrice | Coût d'acquisition par créatrice |
| `commande_cadeau` + pays du payeur | Axe diaspora |
| `litige_ouvert`, `litige_resolu` + délai | Qualité du service |
| `signalement_urgence` + délai de traitement | Engagement de modération |
| `otp_demande`, `otp_verifie`, `otp_echoue` + motif | Où l'on perd les gens à l'entrée *(R-C7)* |
| `commande_creee` + **origine** | Part du chiffre d'affaires réalisée hors direct *(R-H2)* |
| `abonnement_cree`, `abonnement_supprime` | Ce que le vendeur construit réellement |
| `promo_notifiee`, `promo_ouverte`, `promo_convertie` | Efficacité réelle d'une promotion *(R-U4)* |
| `notification_coupee` + canal | **Signal d'alerte** : sommes-nous en train de saturer l'attention ? |
| `evenement_page_vue`, `evenement_converti` | Un événement mérite-t-il d'être reconduit *(R-W11)* |

---

# 12. Environnements et livraison

| Environnement | Usage | Paiement |
|---|---|---|
| Développement | Local | Prestataires simulés |
| Recette | Tests d'intégration | **Bacs à sable des prestataires** — à obtenir en J0 |
| Pilote | Vendeurs pilotes, **argent réel** | Production, volume limité |
| Production | Ouverture publique | Production |

**Exigences**
- Migrations de base versionnées, réversibles, jouées automatiquement.
- Déploiement sans interruption — **jamais entre 18 h et 23 h** *(C5)*.
- Sauvegardes quotidiennes, **restauration testée**, pas seulement configurée.
- Drapeaux de fonctionnalité pour livrer sans exposer.
- Paramètres économiques modifiables **sans déploiement** *(R-O1)*.

---

# 13. Tests

## 13.1 Couverture minimale

| Domaine | Exigence |
|---|---|
| **Stock et réservation** | Tests de concurrence obligatoires : N appuis simultanés sur `stock = 1` → exactement une réservation. **RB1.** |
| **Paiement** | Rejeu avec la même clé d'idempotence · rappel reçu deux fois · rappel reçu avant la réponse synchrone · coupure à chaque étape |
| **Séquestre** | Chaque chemin de libération : confirmation, unboxing, délai automatique, arbitrage, remboursement |
| **Précommande** | Seuil atteint / non atteint → **remboursement automatique intégral sans intervention. RB3.** |
| **Contenu** | Publication refusée sans article attaché, sur chaque type. **RB5.** |
| **Mineur** | Publication vidéo refusée. **RB6.** |
| **Confidentialité** | Aucune interface ne renvoie l'adresse de l'acheteur à un donateur ou à une créatrice. **RB8.** |
| **Machines à états** | Toute transition non prévue est rejetée |
| **Authentification** | Réponse indiscernable entre compte existant et inexistant, **temps de réponse compris** *(R-C9)* · un seul code valide à la fois · code invalidé après usage · débit respecté · rattachement Google sans doublon *(R-C12)* |
| **Vente hors direct** | Concurrence **inter-canaux** : un appui en direct et un appui sur catalogue sur `stock = 1` → exactement une réservation. La somme des réservations n'excède jamais le stock physique, quelle que soit l'origine *(R-H1)*. |
| **Particulier** | Publication possible sans vérification · **encaissement impossible** sans elle · refus de vérification sur commande payée → remboursement intégral *(R-H5, R-H10)* |
| **Remises** | **Aucun cumul** : deux promotions éligibles sur une ligne → une seule appliquée, la plus favorable · articles et livraison sont les deux seules assiettes distinctes · le total affiché est le total prélevé · une promotion modifiée après commande ne change pas la commande *(R-U7, R-U9)* |
| **Notifications** | Plafond respecté : deux promotions du même vendeur en 24 h → une seule notification · regroupement au-delà du seuil · promotion démarrée deux fois par le planificateur → **une seule** notification *(R-U3, R-U4)* |
| **Rang client** | Calcul **par vendeur** : aucune interface, aucune requête ne permet d'agréger un client tous vendeurs confondus *(R-R1)* · commande remboursée exclue du score *(R-R2)* · rattrapage sur l'historique **idempotent et relançable** *(R-R11)* |
| **Événements** | Candidature sans réponse à l'ouverture → refusée automatiquement avec notification *(R-W4)* · page publique accessible sans compte · article dans deux événements → une seule pastille et une seule remise *(R-W5, R-W7)* |

## 13.2 Tests terrain — non substituables

Les tests automatisés ne peuvent pas valider ce produit à eux seuls. Conditions de recette RT1 à RT9 du cahier des charges fonctionnel : appareil d'entrée de gamme réel, connexion mobile réelle en heure de pointe, direct complet avec argent réel, livraison et retrait menés à terme, litige arbitré, précommande dans les deux issues, signalement d'urgence traité, parcours vérifié en malgache, paiement cadeau depuis l'étranger.

---

# 14. Décisions techniques à prendre en J0

| # | Décision | Bloque |
|---|---|---|
| 1 | ~~**Natif Android ou Flutter**~~ → **tranchée : React Native (Expo)**, voir §2.2 | *Résolu* |
| 2 | **Vidéo : service géré ou auto-hébergé**, et lequel | L'architecture et le budget |
| 3 | **Appareil de référence, version Android minimale, plafond de poids** | Tous les arbitrages d'implémentation |
| 4 | **Prestataires de paiement retenus**, et obtention des bacs à sable | Toute la chaîne de paiement |
| 5 | **Modalité juridique et technique de conservation des fonds** | Le séquestre — cœur du produit |
| 6 | **Fournisseur SMS** et coût par message | Le repli de notification |
| 7 | **Hébergement** : région, latence depuis Madagascar, coût de sortie de données | La performance perçue |
| 8 | **Politique de rétention des médias** | Le coût de stockage |
| 9 | **iOS et page web** : périmètre exact | Les livrables |

---

*Volet fonctionnel : `JP_CAHIER_DES_CHARGES.md`. Parcours détaillés par persona : `JP_BACKLOG.md`.*
