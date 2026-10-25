// ND1: kodo kokybės analizė. Programos kodas nekeičiamas, konfigūracija tik šiame aplanke.
// Leidžiama iš repozitorijos šaknies su -c, todėl keliai skaičiuojami nuo šaknies.
import js from '@eslint/js'
import globals from 'globals'
import sonarjs from 'eslint-plugin-sonarjs'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  { ignores: ['**/node_modules/**', '**/coverage/**', '**/dist/**'] },
  js.configs.recommended,
  sonarjs.configs.recommended,
  {
    files: ['server/src/**/*.js'],
    languageOptions: { ecmaVersion: 2024, sourceType: 'module', globals: globals.node },
  },
  {
    files: ['client/src/**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.jest, ...globals.node },
    },
    settings: { react: { version: '18.3' } },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/prop-types': 'off',
    },
  },
  {
    // Testų ir CommonJS failų globalai (jest, module, require)
    files: ['**/*.test.{js,jsx}', '**/*.cjs'],
    languageOptions: { globals: { ...globals.jest, ...globals.node }, sourceType: 'commonjs' },
  },
  {
    files: ['**/*.test.{js,jsx}'],
    languageOptions: { sourceType: 'module' },
  },
  {
    // Sudėtingumo slenksčiai: CC > 10 ir kognityvinis > 15 (SonarSource numatytasis)
    rules: {
      complexity: ['warn', { max: 10 }],
      'sonarjs/cognitive-complexity': ['warn', 15],
    },
  },
]
