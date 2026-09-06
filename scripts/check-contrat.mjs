#!/usr/bin/env node
/**
 * check-contrat.mjs — le contrat API est-il vraiment partagé ?
 *
 * `packages/contracts` prétend être la source unique du contrat : le serveur
 * valide avec, les clients infèrent depuis. Cette prétention ne vaut que si
 * une violation du contrat **fait échouer la compilation d'un client**.
 *
 * Le script écrit des fichiers dans `apps/api`, lance `tsc`, et exige le bon
 * verdict — dans les DEUX sens. Sans les cas qui doivent passer, un contrat
 * tellement strict que rien ne compile paraîtrait correct.
 *
 * Usage : pnpm contrat
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOSSIER = join(RACINE, 'apps', 'api', 'src', '__verif_contrat');

/** @type {{nom: string, code: string, doitEchouer: boolean}[]} */
const CAS = [
  {
    nom: 'une erreur sans message',
    doitEchouer: true,
    code: `import type { Erreur } from '@jp/contracts';
export const x: Erreur = { code: 'STOCK_INSUFFISANT' };
`,
  },
  {
    nom: 'une erreur complète',
    doitEchouer: false,
    code: `import type { Erreur } from '@jp/contracts';
export const x: Erreur = { code: 'STOCK_INSUFFISANT', message: 'Plus de stock.' };
`,
  },
  {
    nom: 'une page sans curseur suivant',
    doitEchouer: true,
    code: `import type { Page } from '@jp/contracts';
export const x: Page<string> = { elements: [] };
`,
  },
  {
    nom: 'une page dont le curseur est explicitement nul',
    doitEchouer: false,
    code: `import type { Page } from '@jp/contracts';
export const x: Page<string> = { elements: [], curseurSuivant: null };
`,
  },
  {
    nom: 'une langue qui n’existe pas',
    doitEchouer: true,
    // Était « mg » jusqu'au 06/09/2026, date à laquelle le malgache est entré
    // dans `LANGUES` — et ce contrôle s'est mis à passer, ce qui est
    // exactement ce qu'on lui demande de détecter.
    code: `import type { Langue } from '@jp/i18n';
export const x: Langue = 'pt';
`,
  },
  {
    nom: 'une langue du catalogue',
    doitEchouer: false,
    code: `import type { Langue } from '@jp/i18n';
export const x: Langue = 'fr';
export const y: Langue = 'mg';
`,
  },
  {
    nom: 'une clé de message inconnue',
    doitEchouer: true,
    code: `import { traduire } from '@jp/i18n';
export const x = traduire('cle.qui.nexiste.pas');
`,
  },
  {
    nom: 'une clé de message du catalogue',
    doitEchouer: false,
    code: `import { traduire } from '@jp/i18n';
export const x = traduire('etat.vide', 'fr');
`,
  },
];

function typecheckPasse() {
  try {
    execFileSync('pnpm', ['--filter', '@jp/api', 'exec', 'tsc', '--noEmit'], {
      cwd: RACINE,
      stdio: 'pipe',
    });
    return true;
  } catch {
    return false;
  }
}

mkdirSync(DOSSIER, { recursive: true });
let echecs = 0;
console.log('');

try {
  for (const cas of CAS) {
    const fichier = join(DOSSIER, 'cas.ts');
    writeFileSync(fichier, cas.code);
    const compile = typecheckPasse();
    const conforme = compile !== cas.doitEchouer;
    const attendu = cas.doitEchouer ? 'doit être refusé' : 'doit compiler';
    console.log(
      `${conforme ? '✓' : '✗'} ${cas.nom.padEnd(48)} ${attendu.padEnd(18)} ` +
        `${compile ? 'compile' : 'refusé'}`,
    );
    if (!conforme) echecs++;
    rmSync(fichier, { force: true });
  }
} finally {
  rmSync(DOSSIER, { recursive: true, force: true });
}

console.log('');
if (echecs) {
  console.error(`✗ ${echecs} contrôle(s) : le contrat ne se comporte pas comme annoncé.`);
  console.error("  Un contrat qui n'est pas imposé par le typage n'est pas un contrat.");
  process.exitCode = 1;
} else {
  console.log(`✓ les ${CAS.length} contrôles de contrat se comportent comme annoncé`);
}
