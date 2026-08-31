#!/usr/bin/env node
/**
 * avancement.mjs — écrit LEARNING-MAP.md depuis l'état RÉEL des issues
 *
 * Un tableau d'avancement tenu à la main ment au bout de trois jours. Celui-ci
 * est régénéré depuis GitHub : il ne peut pas diverger de ce qui est fermé.
 *
 * Usage : pnpm avancement
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEPOT = 'andokevin/jp';

const gh = (p) => execFileSync('gh', p, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

const socle = JSON.parse(
  gh([
    'issue',
    'list',
    '-R',
    DEPOT,
    '--label',
    'tranche:0',
    '--state',
    'all',
    '--limit',
    '60',
    '--json',
    'number,title,state',
  ]),
);
const tranche1 = JSON.parse(
  gh([
    'issue',
    'list',
    '-R',
    DEPOT,
    '--label',
    'tranche:1',
    '--state',
    'all',
    '--limit',
    '400',
    '--json',
    'number,state,labels',
  ]),
);

// ── Regroupement par élément de socle ────────────────────────────────────────
const NOMS = {
  S1: 'Monorepo, TypeScript strict, intégration continue',
  S2: 'Paquets fondamentaux — money, i18n, contracts',
  S3: 'Plateforme API — le transverse écrit une fois',
  S4: 'Base de données — Prisma, migrations, Testcontainers',
  S5: 'Travail asynchrone — BullMQ, files, reprise',
  S6: 'Temps réel — WebSocket, canaux, resynchronisation',
  S7: 'Design system — jetons, primitives, les quatre états',
  S8: 'Coquille Expo — navigation, session, hors ligne',
  S9: 'Coquilles Vite — tableau de bord interne et pages publiques',
  S10: 'Observabilité — journaux, métriques, alertes',
};

const parElement = new Map();
for (const i of socle) {
  const m = i.title.match(/^(S\d+)\./);
  if (!m) continue;
  const cle = m[1];
  if (!parElement.has(cle)) parElement.set(cle, []);
  parElement.get(cle).push(i);
}

const ordre = Object.keys(NOMS);
const lignes = [];
let totalFait = 0;
for (const cle of ordre) {
  const liste = (parElement.get(cle) ?? []).sort((a, b) => a.number - b.number);
  const fait = liste.filter((i) => i.state === 'CLOSED').length;
  totalFait += fait;
  const jauge = '●'.repeat(fait) + '○'.repeat(liste.length - fait);
  const etat =
    liste.length === 0 ? '—' : fait === liste.length ? '**fait**' : `${fait}/${liste.length}`;
  const numeros = liste.length ? `#${liste[0].number}–#${liste[liste.length - 1].number}` : '—';
  lignes.push(`| \`${cle}\` | ${NOMS[cle]} | \`${jauge}\` | ${etat} | ${numeros} |`);
}

// Une issue fermée n'est pas forcément faite : 172 ont été fermées comme
// devenues sans objet par la refonte produit (voir docs/JP_DECISIONS_PRODUIT.md).
// Sans distinction, le tableau d'avancement compterait une annulation comme un
// achèvement — exactement le mensonge que ce fichier existe pour éviter.
const t1Annulees = tranche1.filter(
  (i) => i.state === 'CLOSED' && !(i.labels ?? []).some((l) => l.name === 'status:done'),
).length;
const t1Fait = tranche1.filter(
  (i) => i.state === 'CLOSED' && (i.labels ?? []).some((l) => l.name === 'status:done'),
).length;
const prochaine = socle.filter((i) => i.state === 'OPEN').sort((a, b) => a.number - b.number)[0];

// ── Ce que le dépôt contient réellement ──────────────────────────────────────
const compter = (cmd) =>
  execFileSync('bash', ['-c', cmd], { cwd: RACINE, encoding: 'utf8' }).trim();
const tests = compter(
  `grep -rhoE "^\\s*(it|test)\\(" --include='*.test.ts' packages apps 2>/dev/null | wc -l`,
);
const fichiersTs = compter(
  `find apps packages -name '*.ts' -not -path '*/node_modules/*' -not -path '*/genere/*' | wc -l`,
);
const migrations = compter(`ls -d prisma/migrations/*/ 2>/dev/null | wc -l`);

const md = `# Learning Map

> **Fichier généré.** \`pnpm avancement\` le réécrit depuis l'état réel des
> issues GitHub. Ne le modifiez pas à la main — un tableau d'avancement tenu
> à la main ment au bout de trois jours.
>
> Dernière génération : ${new Date().toISOString().slice(0, 10)}

## Projet en cours

**JP** — marketplace mode pour Madagascar. Commerce en direct, vente hors
direct, couche sociale. La promesse : **vous savez à qui vous payez** —
boutique vérifiée, transaction historisée, traçabilité *(DP-07, D-21)*.

## Objectif

Terminer la **vague 0 — le socle** (\`S1\` → \`S10\`), qui ne livre aucune
fonctionnalité visible mais que les 257 fonctionnalités supposent en place.
Ensuite seulement, la **tranche 1** : la première vente réelle.

## Le socle

| | Élément | | État | Issues |
|---|---|---|---|---|
${lignes.join('\n')}

**${totalFait} / ${socle.length}** issues de socle fermées.

## La suite

| | |
|---|---|
| Tranche 1 — première vente réelle | ${t1Fait} / ${tranche1.length - t1Annulees} |
| *dont annulées par la refonte produit* | ${t1Annulees} |
| Prochaine issue | ${prochaine ? `**#${prochaine.number}** — ${prochaine.title.replace(/ · \[socle\]/, '')}` : '— socle terminé —'} |

## Ce que le dépôt contient

| | |
|---|---|
| Fichiers TypeScript écrits | ${fichiersTs} |
| Tests | ${tests} |
| Migrations appliquées | ${migrations} |

## Notions pratiquées

- **Union littérale et \`as const\`** — une liste écrite une fois, le type en découle
- **Prédicat de type** (\`valeur is Langue\`) — informer le compilateur, pas seulement répondre
- **\`noUncheckedIndexedAccess\`** — pourquoi \`tableau[0]\` peut être \`undefined\`
- **Droits PostgreSQL** — \`REVOKE\` ne vaut que si l'application n'est pas propriétaire
- **\`ALTER TYPE … RENAME VALUE\`** — renommer sans réécrire les lignes
- **\`ON DELETE RESTRICT\` contre \`SET NULL\`** — un \`SET NULL\` sur un journal en
  ajout seul serait une porte dérobée
- **Migration corrective** — une migration appliquée ne se réécrit jamais
- **Dépendances fantômes** — pnpm exige qu'on déclare ce qu'on importe
- **Pagination par curseur** — un décalage saute des lignes sur un jeu qui bouge
- **Tests dans les deux sens** — sans les cas qui doivent passer, une règle trop
  large paraît correcte

## Points de vigilance connus

- **\`ALTER DEFAULT PRIVILEGES\`** accorde \`UPDATE\`/\`DELETE\` aux tables futures.
  \`ecriture_financiere\` *(migration n° 12)* devra porter son propre \`REVOKE\`.
- **L'intégration continue n'a jamais tourné** sur GitHub. À confirmer à la
  première pull request.
- **Deux décisions produit ouvertes**, semées avec une valeur provisoire :
  \`taux_commission_defaut = 80\` *(8 %)* et
  \`duree_reservation_catalogue_s = 1800\` *(30 min)*.
- **Le réseau de développement est lent** — environ 18 s par requête au registre
  npm. Les installations lourdes (\`S7\`, \`S8\`) doivent être lancées en tâche de
  fond très en amont.

## Commandes

\`\`\`bash
pnpm verifier      # typage · style · tests · architecture · contrat
pnpm db:reset      # reconstruit la base en ~22 s
pnpm avancement    # régénère ce fichier
pnpm couverture    # le plan couvre-t-il encore le backlog ?
\`\`\`
`;

writeFileSync(join(RACINE, 'LEARNING-MAP.md'), md);
console.log(
  `✓ LEARNING-MAP.md — socle ${totalFait}/${socle.length}, tranche 1 ${t1Fait}/${tranche1.length - t1Annulees} (${t1Annulees} annulées)`,
);
