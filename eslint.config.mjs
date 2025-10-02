import globals from 'globals';
import pluginJs from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest, // Добавляем глобальные переменные Jest (describe, test, expect и др.)
      },
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'warn',
      'eqeqeq': 'error',
      'curly': 'error',
      'indent': ['error', 2],
      'quotes': ['error', 'single']
    },
  },
  pluginJs.configs.recommended,
];