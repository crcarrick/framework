/** @type {import('eslint').Linter.BaseConfig} */
module.exports = {
  root: true,
  extends: ['@crcarrick/eslint-config'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [
      './tsconfig.eslint.json',
      './packages/*/tsconfig.json',
      './example/tsconfig.json',
    ],
  },
}
