/**
 * Le flow d'authentification natif — F0.1
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
 * **Pas de bascule de language**, contrairement au web. La maquette n'en met
 * pas : l'appareil en porte déjà une, et un second sélecteur dans
 * l'application donnerait deux réponses à la même question. L'écran LIT donc
 * la language de l'appareil — et `initialLanguage` reste là pour qu'un appelant
 * puisse forcer, en test comme dans un futur réglage.
 *
 * Conséquence à connaître : un téléphone réglé en français affiche le
 * français, ce qui sera le cas de la plupart. Le malgache est la language
 * d'AUTORITÉ de la maquette — celle sur laquelle les boîtes sont dimensionnées
 * — pas un défaut d'affichage imposé à quelqu'un qui a choisi autre chose.
 */
import { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getLocales } from 'expo-localization';
import { screenLanguage, LABELS, withTime, type ScreenLanguage } from '@jp/identite';
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
  readonly initialLanguage?: Language;
  /**
   * Pourquoi cet écran s'ouvre.
   *
   * Une union fermée, pas une chaîne libre : l'écran rend des motifs qu'il
   * CONNAÎT, donc dans la language courante. Un texte passé par l'appelant
   * arriverait dans la language de l'appelant — c'est-à-dire en français, quoi
   * qu'affiche le reste de l'écran.
   */
  readonly motif?: 'session-expiree';
  readonly onSession?: (session: auth.SessionResponse) => void;
}) {
  /*
   * `getLocales()` est synchrone et rend les locales DANS L'ORDRE de
   * préférence de la personne. On ne garde que la première que l'on sait
   * rendre — le reste du travail est fait par `langueDepuisEtiquettes`, qui
   * réutilise l'analyseur d'`Accept-Language` plutôt que d'en écrire un
   * second.
   */
  const language: ScreenLanguage = useMemo(
    () =>
      screenLanguage(
        props.initialLanguage ?? langueDepuisEtiquettes(getLocales().map((l) => l.languageTag)),
      ),
    [props.initialLanguage],
  );
  const flow = useAuthOtp({
    base: props.base,
    language,
    ...(props.onSession ? { onSession: props.onSession } : {}),
  });
  const { state, dispatch } = flow;
  const t = LABELS[language];

  // Hors ligne masque l'error : la préséance est portée par le réducteur,
  // l'écran ne fait que la refléter.
  const error = state.offline ? null : state.failure;

  return (
    <PageAuth horsLigne={state.offline} texteHorsLigne={t.offline}>
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
          {state.step === 'email' || state.step === 'done' ? (
            <>
              <Titre texte={t.screen1Title} />
              {/*
               * L'avis PREND LA PLACE du soutien, il ne s'y ajoute pas. Les
               * deux ne sont jamais utiles ensemble : « nous vous enverrons un
               * code » dit ce qui va se passer, « votre session a expiré » dit
               * pourquoi vous êtes là — et sous-entend la même suite. La boîte
               * réserve déjà deux lignes, donc l'échange ne décale rien.
               */}
              <Soutien>
                {props.motif === 'session-expiree' ? t.sessionExpired : t.screen1Support}
              </Soutien>
              <ChampTexte
                label={t.screen1Label}
                exemple={t.screen1Example}
                valeur={state.email}
                enErreur={error !== null}
                surSaisie={(value) => dispatch({ type: 'setEmail', value })}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                onSubmitEditing={flow.submit}
              />
              {error ? <MessageErreur texte={error.message} /> : null}
              <Aide texte={t.screen1Help} />
              <Ressort />
              <BoutonPrincipal
                libelle={t.screen1Button}
                libelleAttente={t.waiting}
                enCours={state.pending}
                actif={flow.canSubmit}
                surAppui={flow.submit}
              />
            </>
          ) : null}

          {state.step === 'code' ? <EtapeCode flow={flow} language={language} /> : null}

          {state.step === 'firstName' ? (
            <>
              <Titre texte={t.screen3Title} />
              <ChampTexte
                label={t.screen3Label}
                exemple={t.screen3Example}
                valeur={state.firstName}
                enErreur={error !== null}
                surSaisie={(value) => dispatch({ type: 'setFirstName', value })}
                autoCapitalize="words"
                autoComplete="given-name"
                textContentType="givenName"
                onSubmitEditing={flow.submit}
              />
              {error ? <MessageErreur texte={error.message} /> : null}
              <Aide texte={t.screen3Help} />
              <Ressort />
              <BoutonPrincipal
                libelle={t.screen3Button}
                libelleAttente={t.waiting}
                enCours={state.pending}
                actif={flow.canSubmit}
                surAppui={flow.submit}
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
  flow,
  language,
}: {
  readonly flow: ReturnType<typeof useAuthOtp>;
  readonly language: ScreenLanguage;
}) {
  const { state, dispatch } = flow;
  const t = LABELS[language];
  const error = state.offline ? null : state.failure;

  const timer = state.expiresAt
    ? reservationTimer(new Date(state.expiresAt), new Date(flow.now))
    : null;

  return (
    <>
      <Titre texte={t.screen2Title} />
      <Soutien>
        {t.screen2Sent} <Text style={styles.adresse}>{state.email}</Text>
        {' · '}
        <Text
          style={styles.modifier}
          onPress={() => dispatch({ type: 'changeEmail' })}
          accessibilityRole="button"
        >
          {t.edit}
        </Text>
      </Soutien>

      <CasesCode
        cases={state.boxes}
        label={t.screen2Label}
        enErreur={error !== null}
        surPose={(index, text) => dispatch({ type: 'setCodeBox', index, text })}
        surEffacement={(index) => dispatch({ type: 'clearCodeBox', index })}
      />

      {error ? <MessageErreur texte={error.message} /> : null}

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
            {withTime(t.screen2Validity, timer.label)}
          </Text>
        </View>
      ) : null}

      <LienRenvoi texte={t.screen2Resend} ouvert={flow.canResend} surAppui={flow.resend} />

      <Ressort />

      <BoutonPrincipal
        libelle={t.screen2Button}
        libelleAttente={t.waiting}
        enCours={state.pending}
        actif={flow.canSubmit}
        surAppui={flow.submit}
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
