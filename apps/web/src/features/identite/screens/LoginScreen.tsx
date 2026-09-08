/**
 * Le parcours d'authentification web — F0.1
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
import { avecTemps, langueEcran, LIBELLES, type LangueEcran } from '@jp/identite';
import { useAuthOtp } from '../hooks/useAuthOtp.js';

const ID_ERREUR = 'jp-erreur-auth';
const ID_AIDE = 'jp-aide-auth';

export function LoginScreen(props: {
  readonly base: string;
  readonly langueInitiale?: Language;
  readonly surSession?: (session: auth.ReponseSession) => void;
}) {
  const [langue, setLangue] = useState<LangueEcran>(() =>
    props.langueInitiale ? langueEcran(props.langueInitiale) : 'mg',
  );

  const parcours = useAuthOtp({
    base: props.base,
    langue,
    ...(props.surSession ? { surSession: props.surSession } : {}),
  });
  const { etat, envoyer } = parcours;
  const t = LIBELLES[langue];

  // Hors ligne masque l'erreur : la préséance est portée par le réducteur,
  // on ne fait que la refléter.
  const erreur = etat.horsLigne ? null : etat.panne;
  const decritPar = erreur ? ID_ERREUR : undefined;

  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    parcours.soumettre();
  };

  return (
    <PageAuth langue={langue} horsLigne={etat.horsLigne} surLangue={setLangue}>
      <form onSubmit={soumettre} noValidate>
        {etat.etape === 'email' || etat.etape === 'termine' ? (
          <>
            <h1 className="jp-titre">{t.ecran1Titre}</h1>
            <p className="jp-soutien">{t.ecran1Soutien}</p>
            <ChampTexte
              id="jp-email"
              type="email"
              autoComplete="email"
              label={t.ecran1Label}
              exemple={t.ecran1Exemple}
              valeur={etat.email}
              enErreur={erreur !== null}
              decritPar={decritPar ?? ID_AIDE}
              surSaisie={(valeur) => envoyer({ type: 'saisirEmail', valeur })}
            />
            {erreur ? <MessageErreur id={ID_ERREUR} texte={erreur.message} /> : null}
            <p className="jp-aide" id={ID_AIDE}>
              {t.ecran1Aide}
            </p>
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
            <h1 className="jp-titre">{t.ecran3Titre}</h1>
            <ChampTexte
              id="jp-prenom"
              type="text"
              autoComplete="given-name"
              label={t.ecran3Label}
              exemple={t.ecran3Exemple}
              valeur={etat.prenom}
              enErreur={erreur !== null}
              decritPar={decritPar ?? ID_AIDE}
              surSaisie={(valeur) => envoyer({ type: 'saisirPrenom', valeur })}
            />
            {erreur ? <MessageErreur id={ID_ERREUR} texte={erreur.message} /> : null}
            <p className="jp-aide" id={ID_AIDE}>
              {t.ecran3Aide}
            </p>
            <BoutonPrincipal
              libelle={t.ecran3Bouton}
              libelleAttente={t.attente}
              enCours={etat.enCours}
              actif={parcours.peutEnvoyer}
              surAppui={parcours.soumettre}
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
      <h1 className="jp-titre">{t.ecran2Titre}</h1>
      <p className="jp-soutien">
        {t.ecran2Envoye} <strong>{etat.email}</strong>{' '}
        <button
          type="button"
          className="jp-modifier"
          onClick={() => envoyer({ type: 'changerEmail' })}
        >
          {t.modifier}
        </button>
      </p>

      <OtpInputForm
        cases={etat.cases}
        label={t.ecran2Label}
        enErreur={erreur !== null}
        {...(erreur ? { decritPar: ID_ERREUR } : {})}
        surPose={(index, texte) => envoyer({ type: 'poserCode', index, texte })}
        surEffacement={(index) => envoyer({ type: 'effacerCase', index })}
      />

      {erreur ? <MessageErreur id={ID_ERREUR} texte={erreur.message} /> : null}

      {timer ? (
        <p className="jp-minuteur" style={{ color: timer.color }}>
          <IconeHorloge />
          <span>{avecTemps(t.ecran2Validite, timer.label)}</span>
        </p>
      ) : null}

      <button
        type="button"
        className="jp-renvoi"
        disabled={!parcours.peutRenvoyer}
        onClick={parcours.renvoyer}
      >
        {t.ecran2Renvoi}
      </button>

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
