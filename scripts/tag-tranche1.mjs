#!/usr/bin/env node
/**
 * tag-tranche1.mjs — marque les issues de la tranche 1
 *
 * Lit les identifiants `Fxx.y` des tables de plan/TRANCHE1.md, retrouve les
 * issues correspondantes dans plan/.issues-state.json, puis :
 *   · ajoute le label `tranche:1`
 *   · déplace l'issue dans le milestone « Tranche 1 — la première vente réelle »
 *
 * L'épique reste lisible par le label `epic:XX` : rien n'est perdu, et le
 * milestone porte enfin une barre de progression qui veut dire quelque chose.
 *
 * Étranglé et reprenable, comme push-issues.mjs.
 *
 * Usage
 *   node scripts/tag-tranche1.mjs --dry-run
 *   node scripts/tag-tranche1.mjs
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const TRANCHE = join(RACINE, 'plan', 'TRANCHE1.md');
const ETAT_ISSUES = join(RACINE, 'plan', '.issues-state.json');
const ETAT = join(RACINE, 'plan', '.tranche1-state.json');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const DEPOT = opt('depot', 'andokevin/jp');
const DELAI_MS = Number(opt('delai', 2000));
const SEC = args.includes('--dry-run');
const MILESTONE = 'Tranche 1 — la première vente réelle';

const gh = (p, o = {}) => execFileSync('gh', p, { encoding: 'utf8', ...o }).trim();
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Les fonctionnalités de la tranche, lues dans le document ─────────────────
const texte = readFileSync(TRANCHE, 'utf8');
const features = [...new Set(
  [...texte.matchAll(/^\| (F\d+\.\d+) \|/gm)].map((m) => m[1]),
)];

if (!features.length) {
  console.error('✗ Aucun identifiant Fxx.y trouvé dans plan/TRANCHE1.md');
  process.exit(1);
}

if (!existsSync(ETAT_ISSUES)) {
  console.error('✗ plan/.issues-state.json absent — publiez d\'abord les issues.');
  process.exit(1);
}
const creees = JSON.parse(readFileSync(ETAT_ISSUES, 'utf8')).creees;

// clé « F4.1#backend » → numéro d'issue
const cibles = [];
const introuvables = new Set(features);
for (const [cle, numero] of Object.entries(creees)) {
  const id = cle.split('#')[0];
  if (features.includes(id)) { cibles.push({ cle, numero }); introuvables.delete(id); }
}

console.log(`\n╭─ Tranche 1 sur ${DEPOT}`);
console.log(`│  fonctionnalités   ${features.length}`);
console.log(`│  issues trouvées   ${cibles.length}`);
if (introuvables.size) {
  console.log(`│  ⚠ pas encore publiées : ${[...introuvables].join(', ')}`);
}
if (SEC) console.log('│  MODE SEC — rien ne sera écrit');
console.log('╰─');

if (SEC) process.exit(0);

// ── Milestone ────────────────────────────────────────────────────────────────
let numMilestone;
const existantes = JSON.parse(gh(['api', `repos/${DEPOT}/milestones?state=all&per_page=100`]));
const trouvee = existantes.find((m) => m.title === MILESTONE);
if (trouvee) {
  numMilestone = trouvee.number;
  console.log(`· milestone existant (#${numMilestone})`);
} else {
  const cree = JSON.parse(gh([
    'api', `repos/${DEPOT}/milestones`,
    '-f', `title=${MILESTONE}`,
    '-f', 'description=Le plus court chemin où de l’argent réel circule. Détail : plan/TRANCHE1.md',
  ]));
  numMilestone = cree.number;
  console.log(`+ milestone créé (#${numMilestone})`);
}

// ── Marquage ─────────────────────────────────────────────────────────────────
const etat = existsSync(ETAT) ? JSON.parse(readFileSync(ETAT, 'utf8')) : { faites: {} };
const restantes = cibles.filter((c) => !etat.faites[c.cle]);

console.log(`\n── ${restantes.length} issues à marquer (${cibles.length - restantes.length} déjà faites) ──`);

let ok = 0, echecs = 0;
for (const [n, { cle, numero }] of restantes.entries()) {
  try {
    gh(['api', '--method', 'PATCH', `repos/${DEPOT}/issues/${numero}`,
        '-F', `milestone=${numMilestone}`],
       { stdio: ['ignore', 'pipe', 'pipe'] });
    gh(['issue', 'edit', String(numero), '-R', DEPOT, '--add-label', 'tranche:1'],
       { stdio: ['ignore', 'pipe', 'pipe'] });
    etat.faites[cle] = numero;
    writeFileSync(ETAT, JSON.stringify(etat, null, 2));
    ok++;
  } catch (e) {
    echecs++;
    const msg = String(e.stderr ?? e.message).split('\n')[0];
    console.log(`\n  ✗ ${cle} (#${numero}) — ${msg}`);
    if (/rate limit|secondary|abuse/i.test(msg)) {
      console.log('    limite atteinte, pause de 60 s…');
      await dormir(60_000);
    }
  }
  const fait = n + 1;
  if (fait % 10 === 0 || fait === restantes.length) {
    process.stdout.write(`\r  ${fait}/${restantes.length}  ✓${ok} ✗${echecs}   `);
  }
  if (fait < restantes.length) await dormir(DELAI_MS);
}

console.log(`\n\n✓ ${ok} issues marquées · ${echecs} échecs`);
if (echecs) console.log('  Relancez la même commande : seules les manquantes seront traitées.');
