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
import { EVENEMENTS, mesurer } from '../../observabilite/index.js';
import { EMIS } from './events.js';
import { auth } from '@jp/contracts';

// Hash du mot de passe (SHA-256 pour la structure actuelle, Argon2id plus tard)
function hashMotDePasse(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// Hash du code OTP
function hashOtp(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

export const service = {
  /** Étape 1 : Demande d'envoi d'un code OTP. (R-C9 : réponse identique) */
  async demanderCode(db: PrismaClient, params: { email: string; purpose?: 'signup' | 'login' }) {
    const email = params.email.toLowerCase();
    const utilisateurExistant = await depot.trouverParEmail(db, email);

    const purpose = params.purpose ?? 'signup';

    if (
      (purpose === 'signup' && utilisateurExistant) ||
      (purpose === 'login' && !utilisateurExistant)
    ) {
      return { ok: true, expiresInS: auth.OTP_TTL_SECONDS };
    }

    const code = randomInt(100000, 999999).toString();
    await depot.enregistrerCodeOtp(
      db,
      email,
      hashOtp(code),
      new Date(Date.now() + auth.OTP_TTL_SECONDS * 1000),
    );

    mesurer(EVENEMENTS.codeOtpEnvoye, { purpose });
    return { ok: true, expiresInS: auth.OTP_TTL_SECONDS };
  },

  /** Étape 2 : Vérification de l'OTP, création de compte complet et ouverture de session. */
  async verifierCode(
    db: PrismaClient,
    params: auth.VerifyOtpSchema, // Type complet du contrat
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

    // ⬇️ Si nouveau compte, on crée TOUT : utilisateur + profil acheteur
    if (!utilisateur) {
      utilisateur = await depot.creerUtilisateur(db, {
        ...params, // On passe toutes les infos
        motDePasseEmpreinte: params.password ? hashMotDePasse(params.password) : null,
      });
      mesurer(EVENEMENTS.compteCree);
    } else {
      // Cas : utilisateur existant, mais il définit son mot de passe ou ses préférences
      if (params.password && !utilisateur.motDePasseEmpreinte) {
        await depot.definirMotDePasse(db, utilisateur.id, hashMotDePasse(params.password));
      }
      if (params.clothingPreferences && params.clothingPreferences.length > 0) {
        await depot.mettreAJourProfilAcheteur(db, utilisateur.id, params.clothingPreferences);
      }
    }

    const ctx = contexte();
    const session = await ouvrirSession(db, {
      utilisateurId: utilisateur.id,
      ...(ctx?.adresseIp ? { adresseIp: ctx.adresseIp } : {}),
    });

    await journaliser(db, {
      action: estNouveau ? EMIS[0] : EMIS[1],
      cibleType: 'utilisateur',
      cibleId: utilisateur.id,
    });

    return {
      token: session.jeton,
      expiresAt: Date.now() + auth.SESSION_TTL_MS,
      user: {
        id: utilisateur.id,
        email: utilisateur.email,
        firstName: utilisateur.prenom,
        hasPassword: Boolean(utilisateur.motDePasseEmpreinte),
        isNew: estNouveau,
      },
    };
  },

  /** Connexion classique par Email + Mot de passe. */
  async connexionEmailMotDePasse(db: PrismaClient, params: { email: string; password: string }) {
    const email = params.email.toLowerCase();
    const utilisateur = await depot.trouverParEmail(db, email);

    if (!utilisateur || !utilisateur.motDePasseEmpreinte) {
      throw ERREURS.IDENTIFIANTS_INCORRECTS();
    }

    const hash = hashMotDePasse(params.password);
    if (hash !== utilisateur.motDePasseEmpreinte) {
      throw ERREURS.IDENTIFIANTS_INCORRECTS();
    }

    const ctx = contexte();
    const session = await ouvrirSession(db, {
      utilisateurId: utilisateur.id,
      ...(ctx?.adresseIp ? { adresseIp: ctx.adresseIp } : {}),
    });

    await journaliser(db, {
      action: EMIS[1],
      cibleType: 'utilisateur',
      cibleId: utilisateur.id,
    });

    return {
      token: session.jeton,
      expiresAt: Date.now() + auth.SESSION_TTL_MS,
      user: {
        id: utilisateur.id,
        email: utilisateur.email,
        firstName: utilisateur.prenom,
        hasPassword: true,
        isNew: false,
      },
    };
  },
} as const;
