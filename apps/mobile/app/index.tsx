/**
 * La route « / » — le parcours d'authentification
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
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { auth } from '@jp/contracts';

import { EcranConnexion } from '../src/features/identite/index.js';
import { baseApi } from '../src/noyau/config.js';
import { ouvrirSession } from '../src/noyau/session.js';
import { secret } from '../src/noyau/stockage.js';

const BASE = baseApi(process.env);

export default function Accueil() {
  const [ouverte, setOuverte] = useState(false);

  const surSession = useCallback((session: auth.ReponseSession) => {
    /*
     * Le rangement est lancé sans être attendu, et c'est assumé : `secret`
     * avale ses erreurs *(voir `stockage.ts`)*. Un trousseau indisponible —
     * certains Android sans verrouillage d'écran le refusent — ne doit pas
     * retenir l'écran. La conséquence est bornée : la session sera à rouvrir
     * au prochain lancement, jamais une application bloquée sur un écran.
     */
    void ouvrirSession(session.jeton, session.expireLe, secret);
    setOuverte(true);
  }, []);

  if (ouverte) return <AccueilProvisoire />;

  return <EcranConnexion base={BASE} surSession={surSession} />;
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
  jalon: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  jalonTitre: { fontSize: 22, fontWeight: '700' },
  jalonTexte: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
});
