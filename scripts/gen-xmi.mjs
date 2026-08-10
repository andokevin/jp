#!/usr/bin/env node
/**
 * gen-xmi.mjs — le corpus markdown  →  vp/JP.xmi  (XMI 2.1 / UML 2.x)
 *
 * Produit un modèle UML importable dans Visual Paradigm
 * (File → Import → XMI…), contenant :
 *
 *   · un diagramme de classes    ← les blocs erDiagram de JP_CONCEPTION_BDD.md
 *   · un diagramme de cas d'utilisation ← les acteurs et les UC de JP_CAS_UTILISATION.md
 *   · un diagramme de séquence par cas d'utilisation qui en possède un
 *
 * Le format natif de Visual Paradigm (.vpp) est propriétaire et ne peut pas
 * être écrit hors de l'outil. XMI est le chemin d'import documenté.
 *
 * Émet aussi vp/plantuml/*.puml, lisible par tout outil qui parle PlantUML.
 *
 * Usage : node scripts/gen-xmi.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const SORTIE = join(RACINE, 'vp');
mkdirSync(join(SORTIE, 'plantuml'), { recursive: true });

const lire = (f) => readFileSync(join(RACINE, f), 'utf8');
const ech = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

let compteur = 0;
const id = (prefixe) => `${prefixe}_${++compteur}`;

// ═══════════════════════════════════════════════════════════════════════════
// 1. Le modèle de classes, depuis les blocs erDiagram
// ═══════════════════════════════════════════════════════════════════════════

const CARD = {
  '||': ['1', '1'],
  '|o': ['0', '1'],
  'o|': ['0', '1'],
  '}o': ['0', '*'],
  'o{': ['0', '*'],
  '}|': ['1', '*'],
  '|{': ['1', '*'],
};

function nomClasse(brut) {
  return brut
    .toLowerCase()
    .split('_')
    .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
    .join('');
}

function extraireBlocs(texte, type) {
  const blocs = [];
  const lignes = texte.split('\n');
  let titre = 'Modèle';
  for (let i = 0; i < lignes.length; i++) {
    const h = lignes[i].match(/^#{1,4}\s+(.*)$/);
    if (h) titre = h[1].replace(/[*`★]/g, '').trim();
    if (!/^```mermaid\s*$/.test(lignes[i])) continue;
    const debut = i + 1;
    let fin = debut;
    while (fin < lignes.length && !/^```\s*$/.test(lignes[fin])) fin++;
    const corps = lignes.slice(debut, fin);
    if (corps.some((l) => l.trim().startsWith(type))) {
      blocs.push({ titre, lignes: corps, ligneDebut: debut });
    }
    i = fin;
  }
  return blocs;
}

const bddTexte = lire('JP_CONCEPTION_BDD.md');
const classes = new Map(); // NOM_TABLE → { nom, paquet, attributs[] }
const associations = [];

for (const bloc of extraireBlocs(bddTexte, 'erDiagram')) {
  const paquet = bloc.titre;
  let entiteCourante = null;

  for (const ligneBrute of bloc.lignes) {
    const l = ligneBrute.trim();
    if (!l || l === 'erDiagram') continue;

    if (entiteCourante) {
      if (l === '}') {
        entiteCourante = null;
        continue;
      }
      // « string email UK "commentaire" »
      const mc = l.match(/^(.*?)\s*"(.*)"\s*$/);
      const sansCommentaire = (mc ? mc[1] : l).trim();
      const commentaire = mc ? mc[2] : '';
      const jetons = sansCommentaire.split(/\s+/).filter(Boolean);
      if (jetons.length < 2) continue;
      const [type, nom, ...cles] = jetons;
      entiteCourante.attributs.push({ nom, type, cles, commentaire });
      continue;
    }

    // « ENTITE { »
    const me = l.match(/^([A-Z_][A-Z0-9_]*)\s*\{$/);
    if (me) {
      const cle = me[1];
      if (!classes.has(cle)) classes.set(cle, { paquet, attributs: [] });
      entiteCourante = classes.get(cle);
      continue;
    }

    // « A ||--o{ B : "libellé" »
    const ma = l.match(
      /^([A-Z_][A-Z0-9_]*)\s+([|}o][|{o])--([|}o][|{o])\s+([A-Z_][A-Z0-9_]*)\s*:\s*"?(.*?)"?$/,
    );
    if (ma) {
      const [, gauche, cardG, cardD, droite, libelle] = ma;
      for (const c of [gauche, droite]) {
        if (!classes.has(c)) classes.set(c, { paquet, attributs: [] });
      }
      associations.push({ gauche, droite, cardG, cardD, libelle: libelle.trim() });
    }
  }
}

// Le domaine Exploitation est documenté sous forme de tableau, sans diagramme
// ER : ses tables sont reprises ici pour que le modèle soit complet, avec leur
// rôle en commentaire à défaut d'attributs.
for (const m of bddTexte.matchAll(/^\|\s*`([a-z_]+)`(?:\s*\/\s*`([a-z_]+)`)?\s*\|\s*([^|]+)\|/gm)) {
  for (const nom of [m[1], m[2]].filter(Boolean)) {
    const cle = nom.toUpperCase();
    if (classes.has(cle)) continue;
    classes.set(cle, {
      paquet: 'Domaine Exploitation',
      attributs: [],
      note: m[3].replace(/[*`]/g, '').trim(),
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. Acteurs et cas d'utilisation
// ═══════════════════════════════════════════════════════════════════════════

const ucTexte = lire('JP_CAS_UTILISATION.md');
const lignesUC = ucTexte.split('\n');

const acteurs = new Map(); // code → { code, nom, systeme }
for (const l of lignesUC) {
  const m = l.match(/^\|\s*\*\*([A-Z]{1,4})\*\*\s*\|\s*([^|]+?)\s*\|/);
  if (!m) continue;
  const [, code, nom] = m;
  if (acteurs.has(code)) continue;
  acteurs.set(code, { code, nom: nom.replace(/[*`]/g, '').trim() });
}

const casUtilisation = [];
let paquetUC = "Cas d'utilisation";
for (let i = 0; i < lignesUC.length; i++) {
  const mp = lignesUC[i].match(/^#\s+\d+\.\s+Paquetage\s+(.*)$/);
  if (mp) {
    paquetUC = mp[1].trim();
    continue;
  }

  const m = lignesUC[i].match(/^##\s+(UC-\d+)\s+—\s+(.*?)\s*★?\s*$/);
  if (!m) continue;
  const [, code, intitule] = m;

  // les acteurs sont dans le tableau des dix lignes suivantes
  const fenetre = lignesUC.slice(i, i + 14).join('\n');
  const lireLigne = (etiquette) => {
    const mm = fenetre.match(new RegExp(`\\|\\s*\\*\\*${etiquette}\\*\\*\\s*\\|\\s*([^|]*)\\|`));
    return mm ? mm[1] : '';
  };
  const codesDe = (texte) => [
    ...new Set(
      [...texte.matchAll(/\b([A-Z]{1,4})\b/g)].map((x) => x[1]).filter((c) => acteurs.has(c)),
    ),
  ];

  casUtilisation.push({
    code,
    intitule: intitule.trim(),
    paquet: paquetUC,
    principaux: codesDe(lireLigne('Acteur principal')),
    secondaires: codesDe(lireLigne('Acteurs secondaires')),
    ligne: i,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Les interactions, depuis les blocs sequenceDiagram
// ═══════════════════════════════════════════════════════════════════════════

const interactions = [];
for (const bloc of extraireBlocs(ucTexte, 'sequenceDiagram')) {
  // le cas d'utilisation le plus proche au-dessus
  const uc = [...casUtilisation].reverse().find((u) => u.ligne < bloc.ligneDebut);
  const participants = [];
  const messages = [];
  const pile = []; // contexte alt / opt / loop

  for (const ligneBrute of bloc.lignes) {
    const l = ligneBrute.trim();
    if (!l || l === 'sequenceDiagram' || l.startsWith('%%')) continue;

    const mp = l.match(/^(actor|participant)\s+(\S+)(?:\s+as\s+(.*))?$/);
    if (mp) {
      participants.push({ alias: mp[2], nom: (mp[3] ?? mp[2]).trim(), acteur: mp[1] === 'actor' });
      continue;
    }

    if (/^(alt|opt|loop|par|critical)\b/.test(l)) {
      pile.push(l.replace(/^\w+\s*/, '').trim());
      continue;
    }
    if (/^else\b/.test(l)) {
      pile[pile.length - 1] = l.replace(/^else\s*/, '').trim();
      continue;
    }
    if (/^end\b/.test(l)) {
      pile.pop();
      continue;
    }
    if (/^(Note|rect|activate|deactivate|autonumber)\b/.test(l)) continue;

    const mm = l.match(/^(\S+?)\s*(-{1,2}>>?|-\)|--\))\s*(\S+?)\s*:\s*(.*)$/);
    if (!mm) continue;
    const [, de, fleche, vers, texte] = mm;
    const garde = pile.filter(Boolean).join(' / ');
    messages.push({
      de,
      vers,
      nom: garde ? `[${garde}] ${texte.trim()}` : texte.trim(),
      reponse: fleche.startsWith('--'),
    });
  }

  // un participant cité sans avoir été déclaré
  const declares = new Set(participants.map((p) => p.alias));
  for (const m of messages) {
    for (const a of [m.de, m.vers]) {
      if (!declares.has(a)) {
        participants.push({ alias: a, nom: a, acteur: false });
        declares.add(a);
      }
    }
  }

  interactions.push({
    code: uc ? uc.code : `SEQ-${interactions.length + 1}`,
    intitule: uc ? uc.intitule : bloc.titre,
    participants,
    messages,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Écriture du XMI
// ═══════════════════════════════════════════════════════════════════════════

const out = [];
const P = (n, s) => out.push('  '.repeat(n) + s);

P(0, '<?xml version="1.0" encoding="UTF-8"?>');
P(0, '<xmi:XMI xmi:version="2.1"');
P(0, '         xmlns:xmi="http://schema.omg.org/spec/XMI/2.1"');
P(0, '         xmlns:uml="http://schema.omg.org/spec/UML/2.1">');
P(1, '<xmi:Documentation exporter="jp/scripts/gen-xmi.mjs" exporterVersion="1.0"/>');
P(1, '<uml:Model xmi:type="uml:Model" xmi:id="modele_jp" name="JP — Je prends">');

// ── 4.1 Types primitifs ──────────────────────────────────────────────────────
const typesUtilises = new Map();
for (const c of classes.values())
  for (const a of c.attributs) {
    if (!typesUtilises.has(a.type)) typesUtilises.set(a.type, id('type'));
  }
P(2, '<packagedElement xmi:type="uml:Package" xmi:id="pkg_types" name="Types">');
for (const [nom, tid] of typesUtilises) {
  P(3, `<packagedElement xmi:type="uml:PrimitiveType" xmi:id="${tid}" name="${ech(nom)}"/>`);
}
P(2, '</packagedElement>');

// ── 4.2 Diagramme de classes ─────────────────────────────────────────────────
const idClasse = new Map();
for (const nom of classes.keys()) idClasse.set(nom, id('cls'));

const paquetsClasses = new Map();
for (const [nom, c] of classes) {
  if (!paquetsClasses.has(c.paquet)) paquetsClasses.set(c.paquet, []);
  paquetsClasses.get(c.paquet).push(nom);
}

P(2, '<packagedElement xmi:type="uml:Package" xmi:id="pkg_domaine" name="1 — Modèle du domaine">');
for (const [paquet, noms] of paquetsClasses) {
  const pid = id('pkg');
  P(3, `<packagedElement xmi:type="uml:Package" xmi:id="${pid}" name="${ech(paquet)}">`);
  for (const nom of noms) {
    const c = classes.get(nom);
    P(
      4,
      `<packagedElement xmi:type="uml:Class" xmi:id="${idClasse.get(nom)}" name="${ech(nomClasse(nom))}">`,
    );
    if (c.note) {
      P(5, `<ownedComment xmi:type="uml:Comment" xmi:id="${id('com')}" body="${ech(c.note)}"/>`);
    }
    for (const a of c.attributs) {
      const aid = id('att');
      const visibilite = a.cles.includes('PK') ? 'public' : 'private';
      P(
        5,
        `<ownedAttribute xmi:type="uml:Property" xmi:id="${aid}" name="${ech(a.nom)}"` +
          ` visibility="${visibilite}" type="${typesUtilises.get(a.type)}">`,
      );
      const notes = [...a.cles, a.commentaire].filter(Boolean).join(' · ');
      if (notes) {
        P(6, `<ownedComment xmi:type="uml:Comment" xmi:id="${id('com')}" body="${ech(notes)}"/>`);
      }
      P(5, '</ownedAttribute>');
    }
    P(4, '</packagedElement>');
  }
  P(3, '</packagedElement>');
}

for (const a of associations) {
  const gid = idClasse.get(a.gauche);
  const did = idClasse.get(a.droite);
  if (!gid || !did) continue;
  const aid = id('asso');
  const e1 = id('fin');
  const e2 = id('fin');
  const [bg, hg] = CARD[a.cardG] ?? ['0', '*'];
  const [bd, hd] = CARD[a.cardD] ?? ['0', '*'];
  P(
    3,
    `<packagedElement xmi:type="uml:Association" xmi:id="${aid}" name="${ech(a.libelle)}" memberEnd="${e1} ${e2}">`,
  );
  const fin = (fid, type, bas, haut) => {
    P(4, `<ownedEnd xmi:type="uml:Property" xmi:id="${fid}" type="${type}" association="${aid}">`);
    P(5, `<lowerValue xmi:type="uml:LiteralInteger" xmi:id="${id('bas')}" value="${bas}"/>`);
    P(
      5,
      `<upperValue xmi:type="uml:LiteralUnlimitedNatural" xmi:id="${id('haut')}" value="${haut}"/>`,
    );
    P(4, '</ownedEnd>');
  };
  fin(e1, gid, bg, hg);
  fin(e2, did, bd, hd);
  P(3, '</packagedElement>');
}
P(2, '</packagedElement>');

// ── 4.3 Diagramme de cas d'utilisation ───────────────────────────────────────
const idActeur = new Map();
P(2, '<packagedElement xmi:type="uml:Package" xmi:id="pkg_uc" name="2 — Cas d\'utilisation">');
P(3, '<packagedElement xmi:type="uml:Package" xmi:id="pkg_acteurs" name="Acteurs">');
for (const [code, a] of acteurs) {
  const aid = id('act');
  idActeur.set(code, aid);
  P(
    4,
    `<packagedElement xmi:type="uml:Actor" xmi:id="${aid}" name="${ech(code + ' · ' + a.nom)}"/>`,
  );
}
P(3, '</packagedElement>');

const paquetsUC = new Map();
for (const uc of casUtilisation) {
  if (!paquetsUC.has(uc.paquet)) paquetsUC.set(uc.paquet, []);
  paquetsUC.get(uc.paquet).push(uc);
}
const idUC = new Map();
const liens = [];
for (const [paquet, liste] of paquetsUC) {
  const pid = id('pkg');
  P(3, `<packagedElement xmi:type="uml:Package" xmi:id="${pid}" name="${ech(paquet)}">`);
  for (const uc of liste) {
    const uid = id('uc');
    idUC.set(uc.code, uid);
    P(
      4,
      `<packagedElement xmi:type="uml:UseCase" xmi:id="${uid}" name="${ech(uc.code + ' — ' + uc.intitule)}"/>`,
    );
    for (const c of uc.principaux) liens.push({ acteur: c, uc: uc.code, principal: true });
    for (const c of uc.secondaires) liens.push({ acteur: c, uc: uc.code, principal: false });
  }
  P(3, '</packagedElement>');
}
for (const l of liens) {
  const aid = idActeur.get(l.acteur);
  const uid = idUC.get(l.uc);
  if (!aid || !uid) continue;
  const asso = id('asso');
  const e1 = id('fin');
  const e2 = id('fin');
  P(
    3,
    `<packagedElement xmi:type="uml:Association" xmi:id="${asso}"` +
      ` name="${l.principal ? '' : 'secondaire'}" memberEnd="${e1} ${e2}">`,
  );
  P(4, `<ownedEnd xmi:type="uml:Property" xmi:id="${e1}" type="${aid}" association="${asso}"/>`);
  P(4, `<ownedEnd xmi:type="uml:Property" xmi:id="${e2}" type="${uid}" association="${asso}"/>`);
  P(3, '</packagedElement>');
}
P(2, '</packagedElement>');

// ── 4.4 Diagrammes de séquence ───────────────────────────────────────────────
P(2, '<packagedElement xmi:type="uml:Package" xmi:id="pkg_seq" name="3 — Diagrammes de séquence">');
for (const inter of interactions) {
  const colId = id('col');
  const intId = id('int');
  P(
    3,
    `<packagedElement xmi:type="uml:Collaboration" xmi:id="${colId}"` +
      ` name="${ech(inter.code + ' — ' + inter.intitule)}">`,
  );

  // Une propriété de collaboration par participant. La ligne de vie la
  // « représente » : sans ce lien, Visual Paradigm importe des lignes de vie
  // orphelines et le diagramme est vide.
  const propId = new Map();
  const lifeId = new Map();
  for (const p of inter.participants) {
    const pid = id('prop');
    propId.set(p.alias, pid);
    P(4, `<ownedAttribute xmi:type="uml:Property" xmi:id="${pid}" name="${ech(p.alias)}"/>`);
  }

  P(
    4,
    `<ownedBehavior xmi:type="uml:Interaction" xmi:id="${intId}"` +
      ` name="${ech(inter.code + ' — ' + inter.intitule)}">`,
  );
  for (const p of inter.participants) {
    const lid = id('ll');
    lifeId.set(p.alias, lid);
    P(
      5,
      `<lifeline xmi:type="uml:Lifeline" xmi:id="${lid}" name="${ech(p.nom)}"` +
        ` represents="${propId.get(p.alias)}"/>`,
    );
  }

  const occ = [];
  for (const m of inter.messages) {
    const de = lifeId.get(m.de);
    const vers = lifeId.get(m.vers);
    if (!de || !vers) continue;
    const mid = id('msg');
    const envoi = id('occ');
    const recep = id('occ');
    occ.push({ mid, envoi, recep, de, vers, nom: m.nom, reponse: m.reponse });
  }
  for (const o of occ) {
    P(
      5,
      `<fragment xmi:type="uml:MessageOccurrenceSpecification" xmi:id="${o.envoi}"` +
        ` covered="${o.de}" message="${o.mid}"/>`,
    );
    P(
      5,
      `<fragment xmi:type="uml:MessageOccurrenceSpecification" xmi:id="${o.recep}"` +
        ` covered="${o.vers}" message="${o.mid}"/>`,
    );
  }
  for (const o of occ) {
    P(
      5,
      `<message xmi:type="uml:Message" xmi:id="${o.mid}" name="${ech(o.nom)}"` +
        ` messageSort="${o.reponse ? 'reply' : 'synchCall'}"` +
        ` sendEvent="${o.envoi}" receiveEvent="${o.recep}"/>`,
    );
  }
  P(4, '</ownedBehavior>');
  P(3, '</packagedElement>');
}
P(2, '</packagedElement>');

P(1, '</uml:Model>');
P(0, '</xmi:XMI>');

writeFileSync(join(SORTIE, 'JP.xmi'), out.join('\n') + '\n');

// ═══════════════════════════════════════════════════════════════════════════
// 5. PlantUML, en second chemin
// ═══════════════════════════════════════════════════════════════════════════

// 5.1 classes
{
  const p = ['@startuml JP-classes', 'skinparam classAttributeIconSize 0', 'hide circle', ''];
  for (const [paquet, noms] of paquetsClasses) {
    p.push(`package "${paquet.replace(/"/g, "'")}" {`);
    for (const nom of noms) {
      const c = classes.get(nom);
      p.push(`  class ${nomClasse(nom)} {`);
      for (const a of c.attributs) {
        const marque = a.cles.includes('PK') ? '+' : a.cles.includes('FK') ? '#' : '-';
        p.push(
          `    ${marque} ${a.nom} : ${a.type}${a.cles.length ? ' «' + a.cles.join(',') + '»' : ''}`,
        );
      }
      p.push('  }');
    }
    p.push('}', '');
  }
  for (const a of associations) {
    const [, hg] = CARD[a.cardG] ?? ['0', '*'];
    const [, hd] = CARD[a.cardD] ?? ['0', '*'];
    const [bg] = CARD[a.cardG] ?? ['0'];
    const [bd] = CARD[a.cardD] ?? ['0'];
    p.push(
      `${nomClasse(a.gauche)} "${bg}..${hg}" -- "${bd}..${hd}" ${nomClasse(a.droite)}` +
        (a.libelle ? ` : ${a.libelle}` : ''),
    );
  }
  p.push('@enduml');
  writeFileSync(join(SORTIE, 'plantuml', 'classes.puml'), p.join('\n') + '\n');
}

// 5.2 cas d'utilisation
{
  const p = ['@startuml JP-cas-utilisation', 'left to right direction', ''];
  for (const [code, a] of acteurs) p.push(`actor "${code} · ${a.nom}" as ${code}`);
  p.push('');
  for (const [paquet, liste] of paquetsUC) {
    p.push(`rectangle "${paquet.replace(/"/g, "'")}" {`);
    for (const uc of liste) {
      p.push(
        `  usecase "${uc.code}\\n${uc.intitule.replace(/"/g, "'")}" as ${uc.code.replace('-', '')}`,
      );
    }
    p.push('}', '');
  }
  for (const l of liens) {
    p.push(`${l.acteur} --${l.principal ? '' : '.'} ${l.uc.replace('-', '')}`);
  }
  p.push('@enduml');
  writeFileSync(join(SORTIE, 'plantuml', 'cas-utilisation.puml'), p.join('\n') + '\n');
}

// 5.3 une séquence par cas d'utilisation
for (const inter of interactions) {
  const nom = inter.code.toLowerCase();
  const p = [
    `@startuml ${inter.code}`,
    `title ${inter.code} — ${inter.intitule}`,
    'autonumber',
    '',
  ];
  for (const part of inter.participants) {
    p.push(
      `${part.acteur ? 'actor' : 'participant'} "${part.nom.replace(/"/g, "'")}" as ${part.alias}`,
    );
  }
  p.push('');
  for (const m of inter.messages) {
    p.push(`${m.de} ${m.reponse ? '-->' : '->'} ${m.vers} : ${m.nom.replace(/\n/g, ' ')}`);
  }
  p.push('@enduml');
  writeFileSync(join(SORTIE, 'plantuml', `sequence-${nom}.puml`), p.join('\n') + '\n');
}

// ═══════════════════════════════════════════════════════════════════════════
console.log(`\n✓ vp/JP.xmi`);
console.log(`  classes            ${classes.size}`);
console.log(
  `  attributs          ${[...classes.values()].reduce((n, c) => n + c.attributs.length, 0)}`,
);
console.log(`  associations       ${associations.length}`);
console.log(`  acteurs            ${acteurs.size}`);
console.log(`  cas d'utilisation  ${casUtilisation.length}`);
console.log(`  liens acteur ↔ UC  ${liens.length}`);
console.log(`  interactions       ${interactions.length}`);
console.log(`  messages           ${interactions.reduce((n, i) => n + i.messages.length, 0)}`);
console.log(`\n✓ vp/plantuml/ — ${2 + interactions.length} fichiers`);

const sansSequence = casUtilisation.filter((u) => !interactions.some((i) => i.code === u.code));
if (sansSequence.length) {
  console.log(`\n⚠  ${sansSequence.length} cas d'utilisation sans diagramme de séquence :`);
  console.log(`   ${sansSequence.map((u) => u.code).join(', ')}`);
}
