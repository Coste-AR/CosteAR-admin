// @ts-check
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

/**
 * Configuración de ESLint 9 (formato "flat"), igual a la de CosteAR-frontend.
 *
 * Por qué existe: el `package.json` tenía el script `"lint"` reemplazado por
 * un `echo` porque ESLint NO estaba entre las dependencias — el script real
 * fallaba con "eslint no se reconoce como un comando". Nunca corrió.
 *
 * Lo que aporta sobre `tsc`: las reglas de React Hooks. `tsc` no puede ver que
 * un `useEffect` olvidó una dependencia o que un hook se llama dentro de un
 * condicional, y esos son justamente los bugs de React que no se manifiestan
 * hasta que un usuario hace algo en un orden inesperado.
 *
 * Las reglas que dependen de información de tipos quedan fuera a propósito: son
 * valiosas pero exigen otra pasada de compilación y dispararían cientos de
 * hallazgos preexistentes de una sola vez.
 */
export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', '*.config.js', '*.config.ts'],
  },

  {
    linterOptions: { reportUnusedDisableDirectives: 'off' },
  },

  js.configs.recommended,

  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.browser },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // Estas dos reglas base no entienden TypeScript y dan falsos positivos
      // (tipos ambiente, sobrecargas de función). `tsc` ya cubre ambos casos.
      'no-undef': 'off',
      'no-redeclare': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],

      // Hay `any` deliberados sobre payloads de la API. Se avisa, no se corta.
      '@typescript-eslint/no-explicit-any': 'warn',

      'react-refresh/only-export-components': 'warn',

      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },

  {
    files: ['src/**/*.test.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
];
