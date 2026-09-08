/**
 * seed.mts — le jeu de données de développement
 *
 * **Idempotent** : rejouable autant de fois qu'on veut, le résultat est le
 * même. C'est ce qui permet de l'appeler depuis `db:reset` sans réfléchir, et
 * ce qu'un test vérifie.
 *
 * Il ne sème que les paramètres. Ils viennent de `packages/contracts`, où ils
 * ont leurs bornes codées : le seed ne réinvente aucune valeur, il applique le
 * registre. Une valeur écrite ici et une autre là-bas divergeraient au premier
 * changement.
 *
 * Il utilise `pg` et non Prisma, pour deux raisons : c'est du SQL
 * d'administration, et cela évite que `prisma/` importe le client généré dans
 * `apps/api/` — une dépendance à contresens de nos règles.
 *
 * L'extension `.mts` force l'ESM : la racine n'est pas `"type": "module"`, et
 * sans elle `tsx` compilerait en CommonJS, où l'attente de premier niveau est
 * interdite.
 *
 * Lancé par `pnpm db:seed`.
 */
import pg from 'pg';
import { PARAMETERS, validate } from '../packages/contracts/src/exploitation.js';
import { UNIVERSES } from '../packages/contracts/src/universes.js';

try {
  process.loadEnvFile();
} catch {
  // Pas de .env : les variables viennent de l'environnement.
}

// Le seed est une opération d'administration : il tourne avec le PROPRIÉTAIRE,
// pas avec le rôle applicatif restreint.
const url = process.env['DATABASE_URL'];
if (!url) {
  console.error('✗ DATABASE_URL est requis. Copiez .env.example vers .env.');
  process.exit(1);
}

// Contrôle de cohérence du registre AVANT toute écriture : une valeur par
// défaut hors de ses propres bornes est une faute de frappe qu'il vaut mieux
// voir ici que six mois plus tard dans le back-office.
for (const p of PARAMETERS) {
  const probleme = validate(p.key, p.default);
  if (probleme) {
    console.error(`✗ ${p.key} : valeur par défaut invalide — ${probleme}`);
    process.exit(1);
  }
}

const client = new pg.Client({ connectionString: url });
await client.connect();

let poses = 0;
let inchanges = 0;

try {
  for (const p of PARAMETERS) {
    // `ON CONFLICT DO NOTHING` : on crée si absent, on ne touche à rien si
    // présent. C'est ce qui rend le seed rejouable sans écraser un réglage
    // qu'on aurait ajusté à la main pendant le pilote.
    const { rowCount } = await client.query(
      `INSERT INTO parametre (cle, valeur, type, description)
       VALUES ($1, $2, $3::type_parametre, $4)
       ON CONFLICT (cle) DO NOTHING`,
      [p.key, p.default, p.type, `${p.description} [${p.source}]`],
    );
    if (rowCount === 1) poses++;
    else inchanges++;
  }

  console.log(`✓ paramètres : ${poses} posés, ${inchanges} déjà présents (inchangés)`);

  // ── Les univers ─────────────────────────────────────────────────────────
  // Les cinq sont semés, deux ouverts. Les règles structurelles restent dans
  // le code ; seuls l'ouverture et le taux de commission passent en base,
  // parce qu'eux doivent être modifiables sans déploiement pendant le pilote.
  let uPoses = 0;
  let uInchanges = 0;
  for (const [rang, u] of UNIVERSES.entries()) {
    const { rowCount } = await client.query(
      `INSERT INTO univers (cle, nom, signature, onglet, ouvert, commission_pour_mille, rang)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (cle) DO NOTHING`,
      [u.key, u.name, u.signature, u.tab, u.open, u.commissionPerMille, rang],
    );
    if (rowCount === 1) uPoses++;
    else uInchanges++;
  }
  const ouverts = UNIVERSES.filter((u) => u.open)
    .map((u) => u.name)
    .join(', ');
  console.log(`✓ univers : ${uPoses} posés, ${uInchanges} déjà présents — ouverts : ${ouverts}`);
} finally {
  await client.end();
}
