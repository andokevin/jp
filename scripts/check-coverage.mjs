#!/usr/bin/env node
/**
 * check-coverage.mjs — le plan est-il encore à jour ?
 *
 * Compare les identifiants `Fxx.y` déclarés dans JP_BACKLOG.md aux blocs
 * ```issues des fichiers plan/EPxx-*.md.
 *
 *   · manquant  — une fonctionnalité du backlog sans mini-plan
 *   · orphelin  — un mini-plan sans fonctionnalité au backlog
 *
 * Sort en code 1 si l'un des deux n'est pas vide : c'est ce qui empêche le plan
 * de dériver silencieusement du backlog.
 *
 * Vérifie aussi que la tranche 1 et le socle ne citent rien d'inexistant.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const lire = (...p) => readFileSync(join(RACINE, ...p), 'utf8');

// ── Le backlog ───────────────────────────────────────────────────────────────
const backlog = lire('JP_BACKLOG.md');
const duBacklog = [...backlog.matchAll(/^\|\s*(F\d+\.\d+)\b/gm)].map((m) => m[1]);
const doublons = duBacklog.filter((id, i) => duBacklog.indexOf(id) !== i);
const ensembleBacklog = new Set(duBacklog);

// ── Le plan ──────────────────────────────────────────────────────────────────
const duPlan = new Set();
for (const f of readdirSync(join(RACINE, 'plan')).filter((f) => /^EP\d\d-.*\.md$/.test(f))) {
  for (const m of lire('plan', f).matchAll(/^feature:\s*(F\d+\.\d+)\s*$/gm)) duPlan.add(m[1]);
}

const manquants = [...ensembleBacklog].filter((id) => !duPlan.has(id));
const orphelins = [...duPlan].filter((id) => !ensembleBacklog.has(id));

// ── La tranche 1 ─────────────────────────────────────────────────────────────
const tranche = lire('plan', 'TRANCHE1.md');
const deLaTranche = [
  ...new Set([...tranche.matchAll(/^\|\s*(F\d+\.\d+)\s*\|/gm)].map((m) => m[1])),
];
const trancheInconnues = deLaTranche.filter((id) => !ensembleBacklog.has(id));

// ── Le socle ─────────────────────────────────────────────────────────────────
const socle = lire('plan', 'VAGUE0-socle.md');
const elementsSocle = [...socle.matchAll(/^socle:\s*(S\d+)\s*$/gm)].map((m) => m[1]);

// ── Rapport ──────────────────────────────────────────────────────────────────
console.log('');
console.log(`fonctionnalités au backlog   ${ensembleBacklog.size}`);
console.log(`fonctionnalités planifiées   ${duPlan.size}`);
console.log(`doublons d'identifiant       ${doublons.length}`);
console.log(`manquantes au plan           ${manquants.length}`);
console.log(`mini-plans orphelins         ${orphelins.length}`);
console.log(`fonctionnalités tranche 1    ${deLaTranche.length}`);
console.log(`éléments de socle            ${elementsSocle.length}`);
console.log('');

let echec = false;
const signaler = (etiquette, liste) => {
  if (!liste.length) return;
  echec = true;
  console.error(`✗ ${etiquette} : ${liste.join(', ')}`);
};

signaler("doublons d'identifiant dans le backlog", [...new Set(doublons)]);
signaler('fonctionnalités sans mini-plan', manquants);
signaler('mini-plans sans fonctionnalité au backlog', orphelins);
signaler('tranche 1 citant des identifiants inconnus', trancheInconnues);
if (!elementsSocle.length) {
  echec = true;
  console.error('✗ aucun élément de socle trouvé dans plan/VAGUE0-socle.md');
}

if (echec) {
  console.error('\nLe plan a dérivé du backlog. Corrigez avant de continuer.');
  process.exit(1);
}
console.log('✓ le plan couvre le backlog, sans manque ni orphelin');
