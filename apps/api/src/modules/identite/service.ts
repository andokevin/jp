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
    params: { email: string; finalite?: 'inscription' | 'connexion' },
  ) {
    const email = params.email.toLowerCase();
    const utilisateurExistant = await depot.trouverParEmail(db, email);

    const finalite = params.finalite ?? 'inscription';

    if (
      (finalite === 'inscription' && utilisateurExistant) ||
      (finalite === 'connexion' && !utilisateurExistant)
    ) {
      return { ok: true, expireDansS: auth.OTP_TTL_SECONDS };
    }

    const code = randomInt(100000, 999999).toString();
    await depot.enregistrerCodeOtp(
      db,
      email,
      hashOtp(code),
      new Date(Date.now() + auth.OTP_TTL_SECONDS * 1000),
    );

    mesurer(EVENEMENTS.codeOtpEnvoye, { finalite });
    return { ok: true, expireDansS: auth.OTP_TTL_SECONDS };
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
        motDePasseEmpreinte: params.motDePasse ? hashMotDePasse(params.motDePasse) : null,
      });
      mesurer(EVENEMENTS.compteCree);
    } else {
      // Cas : utilisateur existant, mais il définit son mot de passe ou ses préférences
      if (params.motDePasse && !utilisateur.motDePasseEmpreinte) {
        await depot.definirMotDePasse(db, utilisateur.id, hashMotDePasse(params.motDePasse));
      }
      if (params.preferencesVetement && params.preferencesVetement.length > 0) {
        await depot.mettreAJourProfilAcheteur(db, utilisateur.id, params.preferencesVetement);
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
      jeton: session.jeton,
      expireLe: Date.now() + auth.SESSION_TTL_MS,
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        genre: utilisateur.genre,
        langue: utilisateur.langue,
        dateNaissance: utilisateur.dateNaissance,
        telephone: utilisateur.telephone,
        photoUrl: utilisateur.photoUrl,
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
      throw ERREURS.IDENTIFIANTS_INCORRECTS();
    }

    const hash = hashMotDePasse(params.motDePasse);
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
      jeton: session.jeton,
      expireLe: Date.now() + auth.SESSION_TTL_MS,
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        genre: utilisateur.genre,
        langue: utilisateur.langue,
        dateNaissance: utilisateur.dateNaissance,
        telephone: utilisateur.telephone,
        photoUrl: utilisateur.photoUrl,
        hasPassword: true,
        isNew: false,
      },
    };
  },
} as const;
