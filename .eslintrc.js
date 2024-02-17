/** @type {import('eslint').Linter.BaseConfig} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [
      './tsconfig.eslint.json',
      './packages/*/tsconfig.json',
      './example/tsconfig.json',
    ],
  },
  plugins: [
    '@eslint-community/eslint-comments',
    '@typescript-eslint',
    'import',
    'react',
    'react-hooks',
  ],
  extends: [
    'eslint:recommended',
    'plugin:import/typescript',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@eslint-community/eslint-comments/recommended',
  ],
  rules: {
    semi: 'off',
    '@eslint-community/eslint-comments/no-unused-disable': 'error',
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
        },
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
        ],
      },
    ],
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: { '{}': false },
        extendDefaults: true,
      },
    ],
    '@typescript-eslint/semi': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
  },
  settings: {
    'import/internal-regex': '^@framework/',
    'import/parsers': {
      '@typescript/eslint-parser': ['.ts', '.tsx'],
    },
    react: {
      version: 'detect',
    },
  },
}
