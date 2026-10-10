/** @type {import('stylelint').Config} */
export default {
  ignoreFiles: ['**/node_modules/**', 'dist/**', 'src/styles/tokens.css', 'tokens/**'],
  rules: {
    'color-no-hex': true,
    'color-named': 'never',
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla', 'hwb'],
    'unit-disallowed-list': ['px'],
  },
  overrides: [
    {
      files: ['**/*.astro'],
      customSyntax: 'postcss-html',
    },
  ],
};
