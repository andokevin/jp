#!/usr/bin/env node
/**
 * push-issues.mjs — crée les issues GitHub depuis plan/.issues.jsonl
 *
 * Étranglé et reprenable :
 *   · un point de reprise est écrit dans plan/.issues-state.json après CHAQUE issue ;
 *   · une interruption (Ctrl-C, coupure réseau, plantage) se reprend là où elle
 *     s'est arrêtée, sans doublon ;
 *   · GitHub limite la création de contenu à ~500 requêtes par heure : le délai
 *     par défaut de 7,2 s respecte cette limite.
 *
 * Usage
 *   node scripts/push-issues.mjs                    # tout, dans l'ordre du fichier
 *   node scripts/push-issues.mjs --phase P1         # seulement la phase 1
 *   node scripts/push-issues.mjs --dry-run          # n'écrit rien, montre le plan
 *   node scripts/push-issues.mjs --delai 3000       # accélérer (attention aux limites)
 *   node scripts/push-issues.mjs --limite 50        # les 50 premières seulement
 *
 * Prérequis : gh CLI authentifié (`gh auth status`).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENTREE = join(RACINE, 'plan', '.issues.jsonl');
const ETAT = join(RACINE, 'plan', '.issues-state.json');

const args = process.argv.slice(2);
const opt = (nom, defaut) => {
  const i = args.indexOf(`--${nom}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : defaut;
};
const drapeau = (nom) => args.includes(`--${nom}`);

const DEPOT = opt('depot', 'andokevin/jp');
const DELAI_MS = Number(opt('delai', 7200));
const PHASE = opt('phase', null);
const LIMITE = Number(opt('limite', Infinity));
const SEC = drapeau('dry-run');

const gh = (params, options = {}) =>
  execFileSync('gh', params, { encoding: 'utf8', ...options }).trim();

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Labels ───────────────────────────────────────────────────────────────────
const LABELS = [
  ...['00','01','02','03','04','05','06','07','08','09','10',
      '11','12','13','14','15','16','17','18','19','20']
    .map((n) => [`epic:${n}`, '1D76DB', `Épique ${n}`]),
  ['epic:socle', '000000', 'Vague 0 — le socle, avant toute fonctionnalité'],
  ['step:socle',      '000000', 'Élément de socle — vague 0'],
  ['step:conception', 'C5DEF5', 'Spécification fonctionnelle et technique'],
  ['step:squelette',  'BFD4F2', 'Arborescence des fichiers et modules'],
  ['step:bdd',        '5319E7', 'Schéma, migration, index, contraintes'],
  ['step:design',     'D93F0B', 'Maquettes et prompt Stitch'],
  ['step:backend',    '0E8A16', 'Endpoints, logique métier, tests'],
  ['step:frontend',   'FBCA04', 'Composants, écrans, intégration API'],
  ['prio:M', 'B60205', 'Must — indispensable au lancement'],
  ['prio:S', 'D93F0B', 'Should — important'],
  ['prio:C', 'FEF2C0', 'Could — confort'],
  ['prio:W', 'EEEEEE', "Won't — plus tard"],
  ['phase:P1', '0052CC', 'Phase 1 — produit minimum'],
  ['phase:P2', '5319E7', 'Phase 2'],
  ['phase:P3', 'BFDADC', 'Phase 3'],
  ['status:todo',  'EDEDED', 'À faire'],
  ['status:doing', 'FBCA04', 'En cours'],
  ['status:done',  '0E8A16', 'Terminé'],
  ['tranche:0', '000000', 'Vague 0 — socle, bloque tout le reste'],
  ['tranche:1', '0E8A16', 'Tranche 1 — la première vente réelle'],
  ['decision-ouverte', 'E99695', 'Bloqué par un arbitrage produit'],
];

async function creerLabels() {
  console.log(`\n── Labels (${LABELS.length}) ──`);
  const existants = new Set(
    JSON.parse(gh(['label', 'list', '-R', DEPOT, '--limit', '200', '--json', 'name']))
      .map((l) => l.name),
  );
  for (const [nom, couleur, description] of LABELS) {
    if (existants.has(nom)) { process.stdout.write('·'); continue; }
    if (SEC) { process.stdout.write('+'); continue; }
    try {
      gh(['label', 'create', nom, '-R', DEPOT, '-c', couleur, '-d', description],
         { stdio: ['ignore', 'pipe', 'pipe'] });
      process.stdout.write('+');
    } catch { process.stdout.write('!'); }
    await dormir(400);
  }
  console.log('  (· existant, + créé, ! échec)');
}

// ── Milestones ───────────────────────────────────────────────────────────────
async function creerMilestones(issues) {
  const voulues = [...new Set(issues.map((i) => i.milestone))].sort();
  console.log(`\n── Milestones (${voulues.length}) ──`);
  const existantes = new Map(
    JSON.parse(gh(['api', `repos/${DEPOT}/milestones?state=all&per_page=100`]))
      .map((m) => [m.title, m.number]),
  );
  for (const titre of voulues) {
    if (existantes.has(titre)) { process.stdout.write('·'); continue; }
    if (SEC) { process.stdout.write('+'); continue; }
    try {
      const cree = JSON.parse(
        gh(['api', `repos/${DEPOT}/milestones`, '-f', `title=${titre}`]),
      );
      existantes.set(titre, cree.number);
      process.stdout.write('+');
    } catch { process.stdout.write('!'); }
    await dormir(400);
  }
  console.log('');
  return existantes;
}

// ── Publication ──────────────────────────────────────────────────────────────
async function publier() {
  if (!existsSync(ENTREE)) {
    console.error(`✗ ${ENTREE} absent. Lancez d'abord : node scripts/gen-issues.mjs`);
    process.exit(1);
  }

  let issues = readFileSync(ENTREE, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  if (PHASE) issues = issues.filter((i) => i.labels.includes(`phase:${PHASE}`));

  const etat = existsSync(ETAT)
    ? JSON.parse(readFileSync(ETAT, 'utf8'))
    : { creees: {}, demarre: new Date().toISOString() };

  const restantes = issues.filter((i) => !etat.creees[i.cle]).slice(0, LIMITE);
  const dejaFaites = issues.length - issues.filter((i) => !etat.creees[i.cle]).length;

  console.log(`\n╭─ Publication sur ${DEPOT}`);
  console.log(`│  à créer      ${restantes.length}`);
  console.log(`│  déjà créées  ${dejaFaites}`);
  console.log(`│  délai        ${DELAI_MS} ms  (limite GitHub ≈ 500/h)`);
  const heures = (restantes.length * DELAI_MS) / 3_600_000;
  console.log(`│  durée        ≈ ${heures < 1 ? `${Math.ceil(heures * 60)} min` : `${heures.toFixed(1)} h`}`);
  if (SEC) console.log('│  MODE SEC — rien ne sera écrit');
  console.log('╰─');

  if (!restantes.length) { console.log('\n✓ Rien à faire, tout est déjà créé.'); return; }

  await creerLabels();
  const milestones = await creerMilestones(issues);

  console.log(`\n── Issues ──`);
  let ok = 0, echecs = 0;
  const debut = Date.now();

  for (const [n, issue] of restantes.entries()) {
    if (SEC) {
      console.log(`  [sec] ${issue.title}`);
      continue;
    }

    // Le corps passe par un fichier : il contient des retours à la ligne et du markdown.
    const tmp = join(mkdtempSync(join(tmpdir(), 'jp-issue-')), 'body.md');
    writeFileSync(tmp, issue.body);

    const params = ['issue', 'create', '-R', DEPOT,
      '-t', issue.title, '-F', tmp];
    for (const l of issue.labels) params.push('-l', l);
    const numMilestone = milestones.get(issue.milestone);
    if (numMilestone) params.push('-m', issue.milestone);

    try {
      const url = gh(params, { stdio: ['ignore', 'pipe', 'pipe'] });
      etat.creees[issue.cle] = url.split('/').pop();
      writeFileSync(ETAT, JSON.stringify(etat, null, 2));   // reprise après CHAQUE issue
      ok++;
    } catch (e) {
      echecs++;
      const msg = String(e.stderr ?? e.message).split('\n')[0];
      console.log(`\n  ✗ ${issue.cle} — ${msg}`);
      if (/rate limit|secondary|abuse/i.test(msg)) {
        console.log('    limite atteinte, pause de 60 s…');
        await dormir(60_000);
      }
    }

    const fait = n + 1;
    if (fait % 10 === 0 || fait === restantes.length) {
      const ecoule = (Date.now() - debut) / 1000;
      const reste = ((restantes.length - fait) * DELAI_MS) / 60_000;
      process.stdout.write(
        `\r  ${fait}/${restantes.length}  ✓${ok} ✗${echecs}  `
        + `· ${Math.round(ecoule / 60)} min écoulées, ≈ ${Math.round(reste)} min restantes   `,
      );
    }

    if (fait < restantes.length) await dormir(DELAI_MS);
  }

  console.log(`\n\n✓ ${ok} issues créées · ${echecs} échecs`);
  console.log(`  Point de reprise : ${ETAT}`);
  if (echecs) console.log('  Relancez la même commande : seules les manquantes seront créées.');
}

publier().catch((e) => { console.error('\n✗', e.message); process.exit(1); });
