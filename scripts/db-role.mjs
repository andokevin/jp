#!/usr/bin/env node
/**
 * db-role.mjs — pose le mot de passe du rôle applicatif depuis .env
 *
 * La migration crée `jp_app` SANS mot de passe : un secret ne va pas dans un
 * fichier versionné, identique dans tous les environnements. Ce script lit
 * `DATABASE_URL_APP`, en extrait l'utilisateur et le mot de passe, et les
 * applique en se connectant avec le propriétaire (`DATABASE_URL`).
 *
 * Idempotent : rejouable autant de fois qu'on veut.
 * Développement uniquement — en production, l'administrateur pose le secret.
 *
 * Usage : pnpm db:role
 */
import pg from 'pg';

try {
  process.loadEnvFile();
} catch {
  // Pas de .env : les variables viennent de l'environnement lui-même.
}

const proprietaire = process.env.DATABASE_URL;
const applicatif = process.env.DATABASE_URL_APP;

if (!proprietaire || !applicatif) {
  console.error('✗ DATABASE_URL et DATABASE_URL_APP sont requis.');
  console.error('  Copiez .env.example vers .env, puis renseignez-les.');
  process.exit(1);
}

const url = new URL(applicatif);
const role = decodeURIComponent(url.username);
const motDePasse = decodeURIComponent(url.password);

if (!role || !motDePasse) {
  console.error('✗ DATABASE_URL_APP doit contenir un utilisateur ET un mot de passe.');
  process.exit(1);
}

// `ALTER ROLE` n'accepte pas de paramètre lié pour un mot de passe : il faut
// l'écrire dans la requête. On double donc les apostrophes — c'est
// l'échappement d'une chaîne littérale en SQL. Sans lui, un mot de passe
// contenant une apostrophe casserait la requête, ou pire, l'ouvrirait.
const litteral = (s) => `'${s.replaceAll("'", "''")}'`;
const identifiant = (s) => `"${s.replaceAll('"', '""')}"`;

const client = new pg.Client({ connectionString: proprietaire });
await client.connect();
try {
  await client.query(`ALTER ROLE ${identifiant(role)} WITH LOGIN PASSWORD ${litteral(motDePasse)}`);
  console.log(`✓ mot de passe posé sur le rôle ${role}`);
} finally {
  await client.end();
}

// Contre-épreuve : on se reconnecte VRAIMENT avec le rôle applicatif. Sans ce
// contrôle, une faute de frappe dans .env ne se verrait qu'au premier appel de
// l'API, bien plus tard et bien plus loin de sa cause.
const verif = new pg.Client({ connectionString: applicatif });
try {
  await verif.connect();
  const { rows } = await verif.query('SELECT current_user AS moi');
  console.log(`✓ connexion vérifiée en tant que ${rows[0].moi}`);
  await verif.end();
} catch (e) {
  console.error(`✗ le rôle ne peut pas se connecter : ${e.message}`);
  process.exit(1);
}
