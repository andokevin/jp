#!/usr/bin/env node
/**
 * gen-issues.mjs — plan/EP*.md  →  plan/.issues.jsonl
 *
 * Extrait les blocs ```issues des fichiers de plan et produit une issue
 * par étape de chaque fonctionnalité.
 *
 * Aucune dépendance : Node 18+ suffit.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOSSIER_PLAN = join(RACINE, 'plan');
const SORTIE = join(DOSSIER_PLAN, '.issues.jsonl');

/** Intitulé lisible de chaque étape, et ce qu'elle produit. */
const ETAPES = {
  conception: {
    titre: 'Conception',
    attendu: [
      'Spécification fonctionnelle : parcours par persona, cas d\'échec, règles de gestion',
      'Spécification technique : décisions, invariants, points de contention, hors périmètre',
      'Décisions ouvertes identifiées et tranchées, ou escaladées',
    ],
  },
  squelette: {
    titre: 'Structure de code',
    attendu: [
      'Arborescence créée côté back-end (module, routes, service, repository, events, erreurs)',
      'Arborescence créée côté front-end (écrans, composants, hooks, api)',
      'Schémas Zod ajoutés dans packages/contracts',
    ],
  },
  bdd: {
    titre: 'Base de données',
    attendu: [
      'Migration écrite, nommée, réversible',
      'Index et contraintes en place (y compris les CHECK de garantie)',
      'Modèle Prisma à jour',
      'Script de reprise de données si nécessaire',
    ],
  },
  design: {
    titre: 'Design',
    attendu: [
      'Maquettes générées depuis le prompt Stitch du mini-plan',
      'Les quatre états couverts : vide, chargement, erreur, hors ligne',
      'Vérifié en malgache et en français (libellés 30 % plus longs en malgache)',
      'Cibles tactiles ≥ 48 dp, contraste ≥ 4,5:1',
    ],
  },
  backend: {
    titre: 'Développement backend',
    attendu: [
      'Endpoints implémentés avec validation Zod',
      'Logique métier et invariants respectés',
      'Effets asynchrones idempotents',
      'Tests unitaires, intégration et cas limites au vert',
    ],
  },
  frontend: {
    titre: 'Développement frontend',
    attendu: [
      'Écrans et composants implémentés',
      'Intégration API, gestion du cache et des erreurs',
      'Comportement hors ligne et mode économie de données',
      'Tests de rendu et parcours au vert',
    ],
  },
};

const NOMS_EPIQUES = {
  '00': 'Compte, identité et vérification',
  '01': 'Catalogue, articles, stock et vente hors direct',
  '02': 'Le direct',
  '03': 'Panier, commande et remises',
  '04': 'Paiement, séquestre et argent',
  '05': 'Livraison',
  '06': 'Confiance, avis et litiges',
  '07': 'Communauté : abonnements, promotions, fidélisation',
  '08': 'Découverte, recherche et navigation',
  '09': 'Statistiques vendeur',
  '10': 'Monétisation et abonnement vendeur',
  '11': 'Back-office JP',
  '12': 'Assistant du vendeur',
  '13': 'Socle technique et non fonctionnel',
  '14': 'Contenu et fil social',
  '15': 'Créatrices, affiliation et précommande',
  '16': 'Cadeau, panier partagé et diaspora',
  '17': 'Gamification, habitude et dressing',
  '18': 'Premium, JP Club et marques',
  '19': 'Modération et sécurité des personnes',
  '20': 'Événements thématiques',
};

/** Ancre GitHub d'un titre de section de mini-plan. */
function ancre(id, titre) {
  return (`${id} — ${titre}`)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** Lit un bloc « clé: valeur », les listes en ligne `[a, b]` et les listes en tirets. */
function lireBloc(texte) {
  const obj = {};
  let listeCourante = null;
  for (const ligne of texte.split('\n')) {
    const tiret = ligne.match(/^\s+-\s+(.*)$/);
    if (tiret && listeCourante) {
      obj[listeCourante].push(tiret[1].trim().replace(/^["']|["']$/g, ''));
      continue;
    }
    const m = ligne.match(/^([a-z_]+):\s*(.*)$/);
    if (!m) continue;
    const [, cle, brut] = m;
    const valeur = brut.replace(/\s*#.*$/, '').trim();
    listeCourante = null;
    if (valeur.startsWith('[')) {
      obj[cle] = valeur.slice(1, -1).split(',').map((v) => v.trim()).filter(Boolean);
    } else if (valeur === '') {
      obj[cle] = [];              // liste en tirets sur les lignes suivantes
      listeCourante = cle;
    } else {
      obj[cle] = valeur.replace(/^["']|["']$/g, '');
    }
  }
  return obj;
}

const fichiers = readdirSync(DOSSIER_PLAN).filter((f) => /^EP\d\d-.*\.md$/.test(f)).sort();
const issues = [];
const parFonctionnalite = new Map();

// ── Vague 0 : le socle ───────────────────────────────────────────────────────
// Publié en premier : rien ne peut démarrer avant. Une issue par tâche.
const FICHIER_SOCLE = 'VAGUE0-socle.md';
const MILESTONE_SOCLE = 'Vague 0 — le socle';

function ancreSocle(id, titre) {
  return (`${id} — ${titre}`)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

try {
  const contenu = readFileSync(join(DOSSIER_PLAN, FICHIER_SOCLE), 'utf8');
  for (const [, brut] of contenu.matchAll(/```issues\n([\s\S]*?)```/g)) {
    const b = lireBloc(brut);
    if (!b.socle || !b.titre) continue;
    const taches = b.taches ?? [];
    const lien = `plan/${FICHIER_SOCLE}#${ancreSocle(b.socle, b.titre)}`;

    taches.forEach((tache, i) => {
      const corps = [
        `**Élément de socle :** \`${b.socle}\` — ${b.titre}`,
        `**Tâche :** ${i + 1} sur ${taches.length}`,
        '',
        `📄 **Détail :** [${FICHIER_SOCLE} → ${b.socle}](${lien})`,
        '',
        '## Attendu',
        `- [ ] ${tache}`,
        '',
        '## Définition de terminé',
        '- [ ] Le critère « terminé quand » de la section est atteint',
        '- [ ] Testé, et le test tourne en intégration continue',
        '- [ ] Les conventions de `plan/PLAN_SOCLE.md` sont respectées',
        '',
        `## Les autres tâches de ${b.socle}`,
        ...taches.map((t, j) => `- ${j === i ? `**${t}** ← cette issue` : t}`),
      ];
      if ((b.depend ?? []).length) {
        corps.push('', '## Dépend de', ...b.depend.map((d) => `- \`${d}\``));
      }
      corps.push('', '---', '',
        `<sub>Vague 0. Rien ne démarre avant. Généré depuis \`plan/${FICHIER_SOCLE}\`.</sub>`);

      issues.push({
        cle: `${b.socle}#${i + 1}`,
        title: `${b.socle}.${i + 1} · [socle] ${tache.length > 70 ? tache.slice(0, 67) + '…' : tache}`,
        body: corps.join('\n'),
        labels: ['epic:socle', 'step:socle', 'prio:M', 'phase:P1', 'status:todo', 'tranche:0'],
        milestone: MILESTONE_SOCLE,
      });
    });
  }
} catch (e) {
  if (e.code !== 'ENOENT') throw e;
  console.warn(`⚠  ${FICHIER_SOCLE} absent — aucune issue de socle`);
}
const nbSocle = issues.length;

for (const fichier of fichiers) {
  const contenu = readFileSync(join(DOSSIER_PLAN, fichier), 'utf8');
  const blocs = [...contenu.matchAll(/```issues\n([\s\S]*?)```/g)];

  for (const [, brut] of blocs) {
    const b = lireBloc(brut);
    if (!b.feature || !b.titre) continue;

    const etapes = (b.etapes ?? []).filter((e) => ETAPES[e]);
    if (!etapes.length) {
      console.warn(`⚠  ${b.feature} : aucune étape valide, ignoré`);
      continue;
    }

    parFonctionnalite.set(b.feature, {
      titre: b.titre, epic: b.epic, phase: b.phase, prio: b.prio,
      etapes, depend: b.depend ?? [], fichier,
    });
  }
}

/** Ordre de publication : P1 d'abord, puis prio, puis épique. */
const ordrePhase = { P1: 0, P2: 1, P3: 2 };
const ordrePrio = { M: 0, S: 1, C: 2, W: 3 };
const ordreEtape = Object.keys(ETAPES);

const features = [...parFonctionnalite.entries()].sort((a, b) => {
  const [ia, fa] = a; const [ib, fb] = b;
  return (ordrePhase[fa.phase] ?? 9) - (ordrePhase[fb.phase] ?? 9)
      || (ordrePrio[fa.prio] ?? 9) - (ordrePrio[fb.prio] ?? 9)
      || fa.epic.localeCompare(fb.epic)
      || ia.localeCompare(ib, 'fr', { numeric: true });
});

for (const [id, f] of features) {
  const lien = `plan/${f.fichier}#${ancre(id, f.titre)}`;
  const autresEtapes = f.etapes;

  for (const etape of f.etapes.slice().sort((x, y) => ordreEtape.indexOf(x) - ordreEtape.indexOf(y))) {
    const e = ETAPES[etape];
    const corps = [
      `**Fonctionnalité :** \`${id}\` — ${f.titre}`,
      `**Épique :** ${f.epic} — ${NOMS_EPIQUES[f.epic] ?? ''}`,
      `**Étape :** ${e.titre}`,
      `**Phase / priorité :** ${f.phase} / ${f.prio}`,
      '',
      `📄 **Mini-plan détaillé :** [${f.fichier} → ${id}](${lien})`,
      '',
      '## Attendu',
      ...e.attendu.map((a) => `- [ ] ${a}`),
      '',
      '## Définition de terminé',
      '- [ ] Le mini-plan a été relu et suivi',
      '- [ ] Les règles `R-xx` citées dans le mini-plan sont respectées',
      '- [ ] Les tests de l\'étape passent en intégration continue',
      '- [ ] Aucune régression sur les critères de recette bloquants concernés',
      '',
      '## Les autres étapes de cette fonctionnalité',
      ...autresEtapes.map((s) => `- ${s === etape ? `**${ETAPES[s].titre}** ← cette issue` : ETAPES[s].titre}`),
    ];

    if (f.depend.length) {
      corps.push('', '## Dépend de', ...f.depend.map((d) => `- \`${d}\``));
    }

    corps.push(
      '',
      '---',
      '',
      `<sub>Généré depuis \`${f.fichier}\` par \`scripts/gen-issues.mjs\`. `
      + `Amont : \`JP_BACKLOG.md\` · \`JP_USER_STORIES.md\` · \`JP_CAS_UTILISATION.md\` · `
      + `\`JP_CAHIER_DES_CHARGES.md\`.</sub>`,
    );

    issues.push({
      cle: `${id}#${etape}`,
      title: `${id} · [${etape}] ${f.titre}`,
      body: corps.join('\n'),
      labels: [
        `epic:${f.epic}`, `step:${etape}`,
        `prio:${f.prio}`, `phase:${f.phase}`, 'status:todo',
      ],
      milestone: `Épique ${f.epic} — ${NOMS_EPIQUES[f.epic] ?? ''}`,
    });
  }
}

writeFileSync(SORTIE, issues.map((i) => JSON.stringify(i)).join('\n') + '\n');

// ── Récapitulatif ────────────────────────────────────────────────────────────
const parEtape = {};
const parPhase = {};
for (const i of issues) {
  const step = i.labels.find((l) => l.startsWith('step:')).slice(5);
  const phase = i.labels.find((l) => l.startsWith('phase:')).slice(6);
  parEtape[step] = (parEtape[step] ?? 0) + 1;
  parPhase[phase] = (parPhase[phase] ?? 0) + 1;
}

console.log(`\n✓ ${issues.length} issues générées depuis ${features.length} fonctionnalités`);
console.log(`  → ${SORTIE}\n`);
console.log('Par étape :');
for (const [k, v] of Object.entries(parEtape).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(12)} ${v}`);
}
console.log('\nPar phase :');
for (const [k, v] of Object.entries(parPhase).sort()) {
  console.log(`  ${k.padEnd(12)} ${v}`);
}
console.log('\nOrdre de publication : P1 d\'abord, puis par priorité MoSCoW, puis par épique.');
