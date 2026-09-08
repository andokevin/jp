/**
 * Le parcours d'authentification natif — F0.1
 *
 * **Un seul écran pour l'inscription ET la connexion.** Entrer une adresse
 * ouvre un compte existant ou en crée un ; il n'y a donc ni onglet, ni lien
 * « créer un compte » — le proposer obligerait la personne à savoir ce qu'elle
 * est avant d'avoir commencé, et ferait de l'écran un annuaire des inscrits
 * *(R-C9)*.
 *
 * Trois étapes, un seul écran, aucune route : l'historique de navigation n'a
 * rien à mémoriser ici, et un retour arrière au milieu d'un code à usage
 * unique ne mènerait nulle part.
 *
 * **Pas de bascule de langue**, contrairement au web. La maquette n'en met
 * pas : l'appareil en porte déjà une, et un second sélecteur dans
 * l'application donnerait deux réponses à la même question. L'écran LIT donc
 * la langue de l'appareil — et `langueInitiale` reste là pour qu'un appelant
 * puisse forcer, en test comme dans un futur réglage.
 *
 * Conséquence à connaître : un téléphone réglé en français affiche le
 * français, ce qui sera le cas de la plupart. Le malgache est la langue
 * d'AUTORITÉ de la maquette — celle sur laquelle les boîtes sont dimensionnées
 * — pas un défaut d'affichage imposé à quelqu'un qui a choisi autre chose.
 */
import { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getLocales } from 'expo-localization';
import { langueEcran, LIBELLES, avecTemps, type LangueEcran } from '@jp/identite';
import { reservationTimer } from '@jp/ui';
import type { Language } from '@jp/i18n';
import type { auth } from '@jp/contracts';

import { CasesCode } from '../composants/CasesCode.js';
import { PageAuth, Ressort } from '../composants/chrome.js';
import {
  Aide,
  BoutonPrincipal,
  ChampTexte,
  LienRenvoi,
  MessageErreur,
  Soutien,
  Titre,
} from '../composants/champs.js';
import { IconeHorloge } from '../composants/icones.js';
import { PALETTE } from '../theme.js';
import { useAuthOtp } from '../hooks/useAuthOtp.js';
import { langueDepuisEtiquettes } from '../../../noyau/langue.js';

export function EcranConnexion(props: {
  readonly base: string;
  readonly langueInitiale?: Language;
  /**
   * Pourquoi cet écran s'ouvre.
   *
   * Une union fermée, pas une chaîne libre : l'écran rend des motifs qu'il
   * CONNAÎT, donc dans la langue courante. Un texte passé par l'appelant
   * arriverait dans la langue de l'appelant — c'est-à-dire en français, quoi
   * qu'affiche le reste de l'écran.
   */
  readonly motif?: 'session-expiree';
  readonly surSession?: (session: auth.SessionResponse) => void;
}) {
  /*
   * `getLocales()` est synchrone et rend les locales DANS L'ORDRE de
   * préférence de la personne. On ne garde que la première que l'on sait
   * rendre — le reste du travail est fait par `langueDepuisEtiquettes`, qui
   * réutilise l'analyseur d'`Accept-Language` plutôt que d'en écrire un
   * second.
   */
  const langue: LangueEcran = useMemo(
    () =>
      langueEcran(
        props.langueInitiale ?? langueDepuisEtiquettes(getLocales().map((l) => l.languageTag)),
      ),
    [props.langueInitiale],
  );
  const parcours = useAuthOtp({
    base: props.base,
    langue,
    ...(props.surSession ? { surSession: props.surSession } : {}),
  });
  const { etat, envoyer } = parcours;
  const t = LIBELLES[langue];

  // Hors ligne masque l'erreur : la préséance est portée par le réducteur,
  // l'écran ne fait que la refléter.
  const erreur = etat.horsLigne ? null : etat.panne;

  return (
    <PageAuth horsLigne={etat.horsLigne} texteHorsLigne={t.horsLigne}>
      {/*
       * Le clavier ne doit jamais recouvrir le champ en cours : sur iOS il se
       * pose PAR-DESSUS la vue, sur Android il redimensionne la fenêtre — d'où
       * les deux comportements distincts plutôt qu'un seul qui marcherait à
       * moitié des deux côtés.
       */}
      <KeyboardAvoidingView
        style={styles.plein}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.defilement}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {etat.etape === 'email' || etat.etape === 'termine' ? (
            <>
              <Titre texte={t.ecran1Titre} />
              {/*
               * L'avis PREND LA PLACE du soutien, il ne s'y ajoute pas. Les
               * deux ne sont jamais utiles ensemble : « nous vous enverrons un
               * code » dit ce qui va se passer, « votre session a expiré » dit
               * pourquoi vous êtes là — et sous-entend la même suite. La boîte
               * réserve déjà deux lignes, donc l'échange ne décale rien.
               */}
              <Soutien>
                {props.motif === 'session-expiree' ? t.sessionExpiree : t.ecran1Soutien}
              </Soutien>
              <ChampTexte
                label={t.ecran1Label}
                exemple={t.ecran1Exemple}
                valeur={etat.email}
                enErreur={erreur !== null}
                surSaisie={(valeur) => envoyer({ type: 'saisirEmail', valeur })}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                onSubmitEditing={parcours.soumettre}
              />
              {erreur ? <MessageErreur texte={erreur.message} /> : null}
              <Aide texte={t.ecran1Aide} />
              <Ressort />
              <BoutonPrincipal
                libelle={t.ecran1Bouton}
                libelleAttente={t.attente}
                enCours={etat.enCours}
                actif={parcours.peutEnvoyer}
                surAppui={parcours.soumettre}
              />
            </>
          ) : null}

          {etat.etape === 'code' ? <EtapeCode parcours={parcours} langue={langue} /> : null}

          {etat.etape === 'prenom' ? (
            <>
              <Titre texte={t.ecran3Titre} />
              <ChampTexte
                label={t.ecran3Label}
                exemple={t.ecran3Exemple}
                valeur={etat.prenom}
                enErreur={erreur !== null}
                surSaisie={(valeur) => envoyer({ type: 'saisirPrenom', valeur })}
                autoCapitalize="words"
                autoComplete="given-name"
                textContentType="givenName"
                onSubmitEditing={parcours.soumettre}
              />
              {erreur ? <MessageErreur texte={erreur.message} /> : null}
              <Aide texte={t.ecran3Aide} />
              <Ressort />
              <BoutonPrincipal
                libelle={t.ecran3Bouton}
                libelleAttente={t.attente}
                enCours={etat.enCours}
                actif={parcours.peutEnvoyer}
                surAppui={parcours.soumettre}
              />
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </PageAuth>
  );
}

/**
 * L'écran du code — le seul qui porte un minuteur.
 *
 * Le décompte se calcule depuis l'échéance rendue par le SERVEUR
 * (`reservationTimer`), jamais depuis une durée décidée ici : une horloge
 * locale dérive, et un minuteur qui ment sur un code encore valide fait
 * redemander un code pour rien.
 */
function EtapeCode({
  parcours,
  langue,
}: {
  readonly parcours: ReturnType<typeof useAuthOtp>;
  readonly langue: LangueEcran;
}) {
  const { etat, envoyer } = parcours;
  const t = LIBELLES[langue];
  const erreur = etat.horsLigne ? null : etat.panne;

  const timer = etat.expireLe
    ? reservationTimer(new Date(etat.expireLe), new Date(parcours.maintenant))
    : null;

  return (
    <>
      <Titre texte={t.ecran2Titre} />
      <Soutien>
        {t.ecran2Envoye} <Text style={styles.adresse}>{etat.email}</Text>
        {' · '}
        <Text
          style={styles.modifier}
          onPress={() => envoyer({ type: 'changerEmail' })}
          accessibilityRole="button"
        >
          {t.modifier}
        </Text>
      </Soutien>

      <CasesCode
        cases={etat.cases}
        label={t.ecran2Label}
        enErreur={erreur !== null}
        surPose={(index, texte) => envoyer({ type: 'poserCode', index, texte })}
        surEffacement={(index) => envoyer({ type: 'effacerCase', index })}
      />

      {erreur ? <MessageErreur texte={erreur.message} /> : null}

      {/*
       * Une RANGÉE, pas une icône imbriquée dans le texte. React Native
       * accepte une vue dans un `Text`, mais l'aligne mal sur Android dès que
       * la taille de police du système change — et la maquette dessine bien
       * une rangée flex.
       */}
      {timer ? (
        <View style={styles.timer}>
          <IconeHorloge taille={15} couleur={timer.color} />
          <Text style={[styles.timerText, { color: timer.color }]}>
            {avecTemps(t.ecran2Validite, timer.label)}
          </Text>
        </View>
      ) : null}

      <LienRenvoi
        texte={t.ecran2Renvoi}
        ouvert={parcours.peutRenvoyer}
        surAppui={parcours.renvoyer}
      />

      <Ressort />

      <BoutonPrincipal
        libelle={t.ecran2Bouton}
        libelleAttente={t.attente}
        enCours={etat.enCours}
        actif={parcours.peutEnvoyer}
        surAppui={parcours.soumettre}
      />
    </>
  );
}

const styles = StyleSheet.create({
  plein: { flex: 1 },
  // `flexGrow` et non `flex` : le contenu doit pouvoir DÉPASSER quand le
  // clavier est ouvert, tout en remplissant l'écran quand il ne l'est pas.
  // C'est cette nuance qui permet au ressort de coller le bouton en bas sans
  // empêcher le défilement.
  defilement: { flexGrow: 1 },
  adresse: { fontWeight: '500', color: PALETTE.texte },
  modifier: { color: PALETTE.action, textDecorationLine: 'underline' },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 },
  timerText: { fontSize: 13, lineHeight: 17 },
});
