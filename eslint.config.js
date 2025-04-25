import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
        '@stylistic': stylistic,
    },
    rules: {
        ...stylistic.configs.recommended.rules,
        "@stylistic/max-len": [ "warn",{ "code": 140, "ignoreComments": true, "ignoreStrings": true, "ignoreTemplateLiterals": true, "ignoreRegExpLiterals": true } ],
        '@typescript-eslint/no-unused-vars': ['warn', {
          "args": "all",
          "argsIgnorePattern": "^_",
          "caughtErrors": "all",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "ignoreRestSiblings": true
      }],
        "@stylistic/indent": ["warn", 4, { "SwitchCase": 1 }],
        "@stylistic/semi": ['error', 'always'],
        '@stylistic/comma-dangle': ['error', 'always-multiline'],
        '@stylistic/brace-style': ['error', '1tbs'],
        '@stylistic/arrow-parens': ['error', 'always'],
        '@stylistic/member-delimiter-style': ['error', {
            'multiline': {
                'delimiter': 'comma',
                'requireLast': true
            },
            'singleline': {
                'delimiter': 'comma',
                'requireLast': true
            },
            'multilineDetection': 'brackets'
        }],
    },
  },
)
