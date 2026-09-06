#!/usr/bin/env node
/**
 * check-architecture.mjs — les règles de dépendance mordent-elles vraiment ?
 *
 * Une règle d'architecture déclarée dans `eslint.config.mjs` mais qui ne
 * déclenche rien est pire qu'absente : elle donne l'illusion d'une garantie.
 * Ce script écrit des fichiers volontairement fautifs aux endroits qui
 * comptent, les passe à ESLint, et exige que chacun soit refusé.
 *
 * Il vérifie aussi le contraire — qu'un import légitime au même endroit passe.
 * Sans ce second contrôle, une règle trop large paraîtrait correcte.
 *
 * Usage : node scripts/check-architecture.mjs
 */
import { ESLint } from 'eslint';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');

/** @type {{nom: string, fichier: string, code: string, doitEchouer: boolean}[]} */
const CAS = [
  {
    nom: 'un paquet partagé importe une application',
    fichier: 'packages/money/src/__verif_archi.ts',
    code: `import { NOM } from '@jp/api';\nexport const x = NOM;\n`,
    doitEchouer: true,
  },
  {
    nom: 'un paquet partagé importe un autre paquet partagé',
    fichier: 'packages/ui/src/__verif_archi.ts',
    code: `import { NOM } from '@jp/i18n';\nexport const x = NOM;\n`,
    doitEchouer: false,
  },
  {
    nom: 'un paquet partagé importe React',
    fichier: 'packages/identite/src/__verif_archi.ts',
    code: `import { useReducer } from 'react';\nexport const x = useReducer;\n`,
    doitEchouer: true,
  },
  {
    nom: 'la plateforme importe un module métier',
    fichier: 'apps/api/src/plateforme/__verif_archi.ts',
    code: `import { service } from '../modules/catalogue/service.js';\nexport const x = service;\n`,
    doitEchouer: true,
  },
  {
    nom: 'un module importe le dépôt d’un autre module',
    fichier: 'apps/api/src/modules/commande/__verif_archi.ts',
    code: `import { depot } from '../catalogue/repository.js';\nexport const x = depot;\n`,
    doitEchouer: true,
  },
  {
    nom: 'un module importe la plateforme',
    fichier: 'apps/api/src/modules/commande/__verif_archi_ok.ts',
    code: `import { erreur } from '../../plateforme/erreurs.js';\nexport const x = erreur;\n`,
    doitEchouer: false,
  },
  {
    nom: 'un flottant hors de @jp/money',
    fichier: 'apps/api/src/modules/paiement/__verif_archi.ts',
    code: `export const total = (m: number): string => m.toFixed(2);\n`,
    doitEchouer: true,
  },
  {
    nom: 'un arrondi dans @jp/money',
    fichier: 'packages/money/src/__verif_archi_ok.ts',
    code: `export const brut = (m: number): string => m.toFixed(0);\n`,
    doitEchouer: false,
  },
];

const eslint = new ESLint({ cwd: RACINE });
const crees = new Set();

// On écrit les fichiers, on lint, on nettoie — quoi qu'il arrive.
try {
  for (const cas of CAS) {
    const abs = join(RACINE, cas.fichier);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, cas.code);
    crees.add(abs);
  }

  let echecs = 0;
  console.log('');

  for (const cas of CAS) {
    const abs = join(RACINE, cas.fichier);
    const resultats = await eslint.lintFiles([abs]);
    const erreurs = resultats.reduce((n, r) => n + r.errorCount, 0);
    const refuse = erreurs > 0;
    const conforme = refuse === cas.doitEchouer;

    const attendu = cas.doitEchouer ? 'doit être refusé' : 'doit passer';
    console.log(
      `${conforme ? '✓' : '✗'} ${cas.nom.padEnd(46)} ${attendu.padEnd(18)} ` +
        `${refuse ? `${erreurs} erreur(s)` : 'aucune erreur'}`,
    );

    if (!conforme) {
      echecs++;
      for (const r of resultats) {
        for (const m of r.messages) console.log(`     ${m.ruleId ?? 'parse'} — ${m.message}`);
      }
    }
  }

  console.log('');
  if (echecs) {
    console.error(`✗ ${echecs} règle(s) d'architecture ne se comportent pas comme annoncé.`);
    process.exitCode = 1;
  } else {
    console.log(`✓ les ${CAS.length} contrôles d'architecture se comportent comme annoncé`);
  }
} finally {
  for (const abs of crees) rmSync(abs, { force: true });
}
