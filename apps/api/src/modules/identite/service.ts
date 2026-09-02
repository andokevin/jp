/**
 * Identite — la logique métier
 *
 * Transactions et invariants. Le service est le seul point d’entrée du
 * module pour les autres modules.
 */
import { createHash, randomInt } from 'node:crypto';
import type { PrismaClient } from '../../genere/prisma/client.js';
import { depot } from './repository.js';
import { ERREURS } from './erreurs.js';
import { ouvrirSession } from '../../plateforme/auth.js'; // Déjà implémenté en S3
import { journaliser } from '../../plateforme/audit.js';
import { contexte } from '../../plateforme/contexte.js';
import { mesurer } from '../../observabilite/index.js';
import { EMIS } from './events.js';
import { auth } from '@jp/contracts';

// Hash du mot de passe (SHA-256 pour la structure actuelle, Argon2id plus tard)
function hashMotDePasse(motDePasse: string): string {
  return createHash('sha256').update(motDePasse).digest('hex');
}

// Hash du code OTP
function hashOtp(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

export const service = {
  /** Étape 1 : Demande d'envoi d'un code OTP. (R-C9 : réponse identique) */
  async demanderCode(
    db: PrismaClient,
    // ⬇️ `finalite` est désormais OPTIONNEL pour correspondre au schéma de `contracts`
    params: { email: string; finalite?: 'inscription' | 'connexion' },
  ) {
    const email = params.email.toLowerCase();
    const utilisateurExistant = await depot.trouverParEmail(db, email);

    // ⬇️ On applique la valeur par défaut ici, de manière déterministe
    const finalite = params.finalite ?? 'inscription';

    // Si finalité = inscription et que le compte existe, ou inverse, on renvoie la
    // même réponse pour ne pas révéler l'existence du compte.
    if (
      (finalite === 'inscription' && utilisateurExistant) ||
      (finalite === 'connexion' && !utilisateurExistant)
    ) {
      return { ok: true, expireDansS: auth.OTP_TTL_SECONDS };
    }

    // Génération et enregistrement de l'OTP
    const code = randomInt(100000, 999999).toString();
    await depot.enregistrerCodeOtp(
      db,
      email,
      hashOtp(code),
      new Date(Date.now() + auth.OTP_TTL_SECONDS * 1000),
    );

    // 🔒 TODO ICI : Appeler le module `notification` pour envoyer le code par email.
    // console.log(`[DEV] Code OTP pour ${email}: ${code}`); // Pour tester en local

    mesurer('identite.code_otp_envoye', { finalite });
    return { ok: true, expireDansS: auth.OTP_TTL_SECONDS };
  },

  /** Étape 2 : Vérification de l'OTP, création de compte et ouverture de session. */
  async verifierCode(
    db: PrismaClient,
    params: {
      email: string;
      code: string;
      prenom?: string;
      motDePasse?: string; // Si fourni, on le stocke dès l'inscription
    },
  ) {
    const email = params.email.toLowerCase();
    const otp = await depot.trouverDernierOtp(db, email);

    if (!otp) throw ERREURS.OTP_EXPIRE();
    if (otp.tentatives >= auth.OTP_MAX_ATTEMPTS) throw ERREURS.OTP_TENTATIVES_DEPASSEES();

    if (otp.codeEmpreinte !== hashOtp(params.code)) {
      await depot.incrementerTentativeOtp(db, otp.id);
      throw ERREURS.OTP_INVALIDE(auth.OTP_MAX_ATTEMPTS - otp.tentatives - 1);
    }

    await depot.consommerOtp(db, otp.id);

    let utilisateur = await depot.trouverParEmail(db, email);
    const estNouveau = !utilisateur;

    if (!utilisateur) {
      utilisateur = await depot.creerUtilisateur(db, {
        email,
        prenom: params.prenom ?? null,
        motDePasseEmpreinte: params.motDePasse ? hashMotDePasse(params.motDePasse) : null,
      });
      mesurer('identite.compte_cree');
    } else if (params.motDePasse && !utilisateur.motDePasseEmpreinte) {
      // Cas : l'utilisateur s'est inscrit par OTP sans mot de passe, et le définit
      // maintenant (ou lors d'une connexion ultérieure).
      await depot.definirMotDePasse(db, utilisateur.id, hashMotDePasse(params.motDePasse));
    }

    // Ouvre une session standard via la plateforme.
    const ctx = contexte();
    const session = await ouvrirSession(db, {
      utilisateurId: utilisateur.id,
      ...(ctx?.adresseIp ? { adresseIp: ctx.adresseIp } : {}),
    });

    // Journalisation de l'événement.
    await journaliser(db, {
      action: estNouveau ? EMIS[0] : EMIS[1], // 'identite.compte_cree' ou 'identite.compte_connecte'
      cibleType: 'utilisateur',
      cibleId: utilisateur.id,
    });

    return {
      jeton: session.jeton,
      expireLe: Date.now() + auth.SESSION_TTL_MS,
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        prenom: utilisateur.prenom,
        hasPassword: Boolean(utilisateur.motDePasseEmpreinte),
        isNew: estNouveau,
      },
    };
  },

  /** Connexion classique par Email + Mot de passe. */
  async connexionEmailMotDePasse(db: PrismaClient, params: { email: string; motDePasse: string }) {
    const email = params.email.toLowerCase();
    const utilisateur = await depot.trouverParEmail(db, email);

    if (!utilisateur || !utilisateur.motDePasseEmpreinte) {
      // On ne dit pas si l'email existe ou non : on renvoie la même erreur.
      throw ERREURS.IDENTIFIANTS_INCORRECTS();
    }

    const hash = hashMotDePasse(params.motDePasse);
    if (hash !== utilisateur.motDePasseEmpreinte) {
      throw ERREURS.IDENTIFIANTS_INCORRECTS();
    }

    // Ouvre une session.
    const ctx = contexte();
    const session = await ouvrirSession(db, {
      utilisateurId: utilisateur.id,
      ...(ctx?.adresseIp ? { adresseIp: ctx.adresseIp } : {}),
    });

    await journaliser(db, {
      action: EMIS[1], // 'identite.compte_connecte'
      cibleType: 'utilisateur',
      cibleId: utilisateur.id,
    });

    return {
      jeton: session.jeton,
      expireLe: Date.now() + auth.SESSION_TTL_MS,
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        prenom: utilisateur.prenom,
        hasPassword: true,
        isNew: false,
      },
    };
  },
} as const;
