/**
 * Le flow d'authentification web — F0.1
 *
 * **Un seul écran pour l'inscription ET la connexion.** Entrer une adresse
 * ouvre un compte existant ou en crée un ; il n'y a donc ni onglet, ni lien
 * « créer un compte » — le proposer obligerait la personne à savoir ce qu'elle
 * est avant d'avoir commencé, et ferait de la page un annuaire des inscrits
 * *(R-C9)*.
 *
 * Trois étapes dans une seule page, sans routeur : l'URL n'a rien à mémoriser
 * ici, et un rechargement au milieu d'un code à usage unique ne mènerait nulle
 * part.
 */
import { useState } from 'react';
import type { FormEvent } from 'react';
import { reservationTimer } from '@jp/ui';
import type { Language } from '@jp/i18n';
import type { auth } from '@jp/contracts';

import '../auth.css';
import { BoutonPrincipal, ChampTexte, IconeHorloge, MessageErreur } from '../components/champs.js';
import { OtpInputForm } from '../components/OtpInputForm.js';
import { PageAuth } from '../components/chrome.js';
import { withTime, screenLanguage, LABELS, type ScreenLanguage } from '@jp/identite';
import { useAuthOtp } from '../hooks/useAuthOtp.js';

const ID_ERREUR = 'jp-error-auth';
const ID_AIDE = 'jp-aide-auth';

export function LoginScreen(props: {
  readonly base: string;
  readonly initialLanguage?: Language;
  readonly onSession?: (session: auth.SessionResponse) => void;
}) {
  const [language, setLanguage] = useState<ScreenLanguage>(() =>
    props.initialLanguage ? screenLanguage(props.initialLanguage) : 'mg',
  );

  const flow = useAuthOtp({
    base: props.base,
    language,
    ...(props.onSession ? { onSession: props.onSession } : {}),
  });
  const { state, dispatch } = flow;
  const t = LABELS[language];

  // Hors ligne masque l'error : la préséance est portée par le réducteur,
  // on ne fait que la refléter.
  const error = state.offline ? null : state.failure;
  const decritPar = error ? ID_ERREUR : undefined;

  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    flow.submit();
  };

  return (
    <PageAuth language={language} offline={state.offline} onLanguage={setLanguage}>
      <form onSubmit={soumettre} noValidate>
        {state.step === 'email' || state.step === 'done' ? (
          <>
            <h1 className="jp-titre">{t.screen1Title}</h1>
            <p className="jp-soutien">{t.screen1Support}</p>
            <ChampTexte
              id="jp-email"
              type="email"
              autoComplete="email"
              label={t.screen1Label}
              exemple={t.screen1Example}
              valeur={state.email}
              enErreur={error !== null}
              decritPar={decritPar ?? ID_AIDE}
              surSaisie={(value) => dispatch({ type: 'setEmail', value })}
            />
            {error ? <MessageErreur id={ID_ERREUR} texte={error.message} /> : null}
            <p className="jp-aide" id={ID_AIDE}>
              {t.screen1Help}
            </p>
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
            <h1 className="jp-titre">{t.screen3Title}</h1>
            <ChampTexte
              id="jp-prenom"
              type="text"
              autoComplete="given-name"
              label={t.screen3Label}
              exemple={t.screen3Example}
              valeur={state.firstName}
              enErreur={error !== null}
              decritPar={decritPar ?? ID_AIDE}
              surSaisie={(value) => dispatch({ type: 'setFirstName', value })}
            />
            {error ? <MessageErreur id={ID_ERREUR} texte={error.message} /> : null}
            <p className="jp-aide" id={ID_AIDE}>
              {t.screen3Help}
            </p>
            <BoutonPrincipal
              libelle={t.screen3Button}
              libelleAttente={t.waiting}
              enCours={state.pending}
              actif={flow.canSubmit}
              surAppui={flow.submit}
            />
          </>
        ) : null}
      </form>
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
      <h1 className="jp-titre">{t.screen2Title}</h1>
      <p className="jp-soutien">
        {t.screen2Sent} <strong>{state.email}</strong>{' '}
        <button
          type="button"
          className="jp-modifier"
          onClick={() => dispatch({ type: 'changeEmail' })}
        >
          {t.edit}
        </button>
      </p>

      <OtpInputForm
        cases={state.boxes}
        label={t.screen2Label}
        enErreur={error !== null}
        {...(error ? { decritPar: ID_ERREUR } : {})}
        surPose={(index, text) => dispatch({ type: 'setCodeBox', index, text })}
        surEffacement={(index) => dispatch({ type: 'clearCodeBox', index })}
      />

      {error ? <MessageErreur id={ID_ERREUR} texte={error.message} /> : null}

      {timer ? (
        <p className="jp-minuteur" style={{ color: timer.color }}>
          <IconeHorloge />
          <span>{withTime(t.screen2Validity, timer.label)}</span>
        </p>
      ) : null}

      <button type="button" className="jp-renvoi" disabled={!flow.canResend} onClick={flow.resend}>
        {t.screen2Resend}
      </button>

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
