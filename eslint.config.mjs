import antfu from '@antfu/eslint-config'
import unusedImports from 'eslint-plugin-unused-imports'

export default antfu({
  // Type of the project. 'lib' for libraries, the default is 'app'
  type: 'lib',

  plugins: {
    'unused-imports': unusedImports,
  },

  // Enable stylistic formatting rules
  // stylistic: true,

  // Or customize the stylistic rules
  stylistic: {
    indent: 2, // 4, or 'tab'
    quotes: 'single', // or 'double'
    overrides: {
      'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    },
  },

  // TypeScript and Vue are autodetected, you can also explicitly enable them:
  typescript: {
    overrides: {
      'ts/explicit-function-return-type': 'off',
      'ts/consistent-type-definitions': 'off',
      'no-console': 'off',
    },
  },

  vue: {
    overrides: {
      'vue/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    },
  },

  rules: {
    'no-unused-vars': 'off', // or "@typescript-eslint/no-unused-vars": "off",
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },

  // Disable jsonc and yaml support
  jsonc: false,
  yaml: false,

  // `.eslintignore` is no longer supported in Flat config, use `ignores` instead
  ignores: [
    'package.json',
    'node_modules',
    'dist',
  ],
})
