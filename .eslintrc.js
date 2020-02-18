module.exports = {
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaFeatures: {
      legacyDecorators: true
    }
  },
  env: {
    browser: true,
    node: true
  },
  extends: ['plugin:vue/recommended'],
  plugins: ['@typescript-eslint', 'prettier', 'json'],
  rules: {
    'no-undef': 'off',
    'no-unused-vars': 'off',
    strict: 'off',
    quotes: ['error', 'single'],
    'space-in-parens': ['error', 'always'],
    '@typescript-eslint/explicit-member-accessibility': 'warn',
    '@typescript-eslint/camelcase': 'warn',
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/indent': ['error', 2],
    'no-empty': 'warn',
    'getter-return': 'warn',
    globals: {
      jQuery: true,
      googletag: true,
      $: true
    },

    // vue recommended のカスタマイズ
    'vue/max-attributes-per-line': false
  }
}
