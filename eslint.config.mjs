import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

/**
 * Les règles de dépendance de `plan/PLAN_SOCLE.md` §3 et §4 sont ici, appliquées
 * automatiquement. Une règle d'architecture qu'on se rappelle en revue de code
 * est une règle qui sera violée ; celle-ci fait échouer l'intégration continue.
 */
export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/.expo/**',
      'vp/**',
      'prisma/migrations/**',
      '**/genere/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,

  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // ── Aucun flottant, nulle part ────────────────────────────────────────────
  // Les montants sont des entiers en Ariary. `packages/money` est le seul
  // endroit autorisé à convertir, et il le fait explicitement.
  {
    files: ['apps/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}'],
    ignores: ['packages/money/**'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'parseFloat',
          message: 'Aucun flottant. Les montants passent par @jp/money.',
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          property: 'toFixed',
          message: 'Aucun flottant. Formatez les montants avec @jp/money.',
        },
        {
          object: 'Number',
          property: 'parseFloat',
          message: 'Aucun flottant. Les montants passent par @jp/money.',
        },
      ],
    },
  },

  // ── Un paquet partagé ne connaît aucune application, ni aucun moteur de rendu ─
  // La seconde règle est ce qui rend la première tenable dans le temps. Un
  // paquet qui importe React choisit son moteur de rendu, donc son client : il
  // cesse d'être partageable entre `apps/web` (DOM) et `apps/mobile` (RN) le
  // jour où quelqu'un ajoute « juste un petit hook ». `@jp/ui` le dit dans son
  // en-tête, `@jp/identite` aussi ; désormais l'intégration continue le dit.
  {
    files: ['packages/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/apps/**', '@jp/api', '@jp/mobile', '@jp/admin', '@jp/web'],
              message:
                'Un paquet partagé ne dépend jamais d’une application. La dépendance va dans l’autre sens.',
            },
            {
              group: ['react', 'react-dom', 'react-dom/*', 'react-native', 'react-native/*'],
              message:
                'Un paquet partagé ne connaît aucun moteur de rendu. Les décisions ici, le rendu dans apps/.',
            },
          ],
        },
      ],
    },
  },

  // ── La plateforme ne connaît pas les domaines ─────────────────────────────
  // `plateforme/` porte l'auth, l'idempotence, les erreurs, la pagination.
  // Si elle importe un module métier, ce n'est plus une plateforme.
  {
    files: ['apps/api/src/plateforme/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/modules/**', '../modules/*', '../../modules/*'],
              message:
                'La plateforme ne dépend d’aucun module métier. Inversez la dépendance ou passez par un événement.',
            },
          ],
        },
      ],
    },
  },

  // ── Un module n'entre pas dans les entrailles d'un autre ──────────────────
  // Les échanges passent par l'`index.ts` exposé, ou par un événement.
  {
    files: ['apps/api/src/modules/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '../*/repository',
                '../*/repository.js',
                '../*/routes',
                '../*/routes.js',
                '../*/erreurs',
                '../*/erreurs.js',
                '../../modules/*/repository',
                '../../modules/*/routes',
              ],
              message:
                'Passez par l’index.ts du module, ou par un événement. Le dépôt et les routes d’un module sont internes.',
            },
          ],
        },
      ],
    },
  },

  // ── Les scripts d'outillage ───────────────────────────────────────────────
  {
    files: ['scripts/**/*.mjs', '*.config.{mjs,ts}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
);
