import { type Config } from 'prettier';

const config: Config = {
  trailingComma: 'none',
  singleQuote: true,
  arrowParens: 'avoid',
  singleAttributePerLine: true,
  plugins: ['@trivago/prettier-plugin-sort-imports']
};

export default config;
