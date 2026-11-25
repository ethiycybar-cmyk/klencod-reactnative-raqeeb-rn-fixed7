const reactNativeConfig = require('@react-native/eslint-config/flat');

module.exports = [
  { ignores: ['node_modules/**', 'android/**', '**/build/**', '**/.gradle/**', 'coverage/**'] },
  ...reactNativeConfig,
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
      },
    },
  },
];
