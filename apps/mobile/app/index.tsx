/**
 * La route « / » — session au démarrage, puis authentification
 *
 * **Elle ne décide rien du parcours** : elle branche l'écran sur les trois
 * choses que seul le point d'entrée connaît — l'URL de l'API gravée à la
 * construction, le trousseau de l'appareil, et ce qui vient après.
 *
 * `baseApi(process.env)` est appelé au CHARGEMENT du module, volontairement.
 * Une URL manquante doit faire échouer le démarrage avec une phrase qui nomme
 * la variable, pas produire une application qui s'ouvre et échoue à la
 * première requête en accusant le réseau de la personne.
 */
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { auth } from '@jp/contracts';

import { EcranConnexion } from '../src/features/identite/index.js';
import { PALETTE, SERIF } from '../src/features/identite/theme.js';
import { baseApi } from '../src/noyau/config.js';
import { departDepuis, etatSession, fermerSession, ouvrirSession } from '../src/noyau/session.js';
import { secret } from '../src/noyau/stockage.js';

const BASE = baseApi(process.env);

/** Le quatrième état, propre au démarrage : on n'a pas encore lu le trousseau. */
type Depart = ReturnType<typeof departDepuis> | { readonly quoi: 'lecture' };

export default function Accueil() {
  const [depart, setDepart] = useState<Depart>({ quoi: 'lecture' });

  useEffect(() => {
    /*
     * `vivant` protège d'une écriture d'état après démontage. La lecture du
     * trousseau prend quelques millisecondes, mais « quelques » n'est pas
     * « zéro » : sur un appareil lent, quelqu'un qui ferme l'application
     * pendant ce laps déclencherait un avertissement React, et sur les
     * versions où cela fuit, une référence retenue.
     */
    let vivant = true;
    void etatSession(secret).then(async (session) => {
      const suite = departDepuis(session);
      /*
       * Le nettoyage AVANT l'affichage. Une session périmée laisse un jeton
       * mort dans le trousseau ; rien ne le relira jamais, puisque
       * `etatSession` le refuse à chaque démarrage. L'effacer ici est le seul
       * moment où quelqu'un s'en occupe.
       */
      if (suite.quoi === 'connexion' && suite.nettoyer) await fermerSession(secret);
      if (vivant) setDepart(suite);
    });
    return () => {
      vivant = false;
    };
  }, []);

  const surSession = useCallback((session: auth.ReponseSession) => {
    /*
     * Le rangement est lancé sans être attendu, et c'est assumé : `secret`
     * avale ses erreurs *(voir `stockage.ts`)*. Un trousseau indisponible —
     * certains Android sans verrouillage d'écran le refusent — ne doit pas
     * retenir l'écran. La conséquence est bornée : la session sera à rouvrir
     * au prochain lancement, jamais une application bloquée sur un écran.
     */
    void ouvrirSession(session.jeton, session.expireLe, secret);
    setDepart({ quoi: 'accueil', jeton: session.jeton });
  }, []);

  if (depart.quoi === 'lecture') return <Attente />;
  if (depart.quoi === 'accueil') return <AccueilProvisoire />;

  return <EcranConnexion base={BASE} surSession={surSession} />;
}

/**
 * L'attente du trousseau — le wordmark, et rien d'autre.
 *
 * **Pas de tourniquet.** La lecture dure quelques millisecondes : une
 * animation de chargement n'aurait pas le temps de faire un tour, elle
 * produirait un clignotement. Et surtout, montrer l'écran d'adresse pour le
 * retirer un instant plus tard à quelqu'un qui a déjà une session est le
 * défaut que cette route existe pour éviter.
 */
function Attente() {
  return (
    <SafeAreaView style={styles.attente}>
      <Text style={styles.marque}>
        JP<Text style={styles.marqueSuite}> — Je prends</Text>
      </Text>
    </SafeAreaView>
  );
}

/**
 * Ce qu'il y a APRÈS la connexion — pas encore écrit.
 *
 * Cet écran est un jalon, pas un début d'accueil : la vitrine, le catalogue et
 * le panier sont la tranche 1 *(F1.x)*. Il existe parce que l'alternative
 * serait pire — sans lui, `etape: 'termine'` ramène l'écran d'adresse, et une
 * personne qui vient de se connecter croirait avoir échoué.
 */
function AccueilProvisoire() {
  return (
    <View style={styles.jalon}>
      <Text style={styles.jalonTitre}>Session ouverte</Text>
      <Text style={styles.jalonTexte}>
        L’accueil arrive avec la tranche 1. Le jeton est rangé dans le trousseau de l’appareil.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Ni couleur ni fonte écrites ici : elles viennent du thème, qui les lit
  // lui-même de `@jp/ui`. Un `#7C2D92` recopié dans une route serait le
  // premier à diverger le jour où la marque bouge.
  attente: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.fond,
  },
  marque: { fontFamily: SERIF, fontSize: 19, fontWeight: '600', color: PALETTE.identite },
  marqueSuite: { fontWeight: '400' },
  jalon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
    backgroundColor: PALETTE.fond,
  },
  jalonTitre: { fontSize: 22, fontWeight: '700', color: PALETTE.texte },
  jalonTexte: { fontSize: 16, lineHeight: 24, textAlign: 'center', color: PALETTE.texteSecondaire },
});
