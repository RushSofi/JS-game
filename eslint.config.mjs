import globals from 'globals';
import pluginJs from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'warn',
      'eqeqeq': 'error',
      'curly': 'error',
      'indent': ['error', 2],
      'quotes': ['error', 'single']
    },
  },
  pluginJs.configs.recommended,
];