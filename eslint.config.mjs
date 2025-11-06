import eslintReact from '@eslint-react/eslint-plugin';
import eslintJs from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['node_modules/**', 'dist/**', 'src-tauri/**']
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      eslintJs.configs.recommended,
      tseslint.configs.recommended,
      eslintReact.configs['recommended-typescript']
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true
      }
    },
    rules: {
      '@eslint-react/no-missing-key': 'warn',
      '@eslint-react/hooks-extra/no-direct-set-state-in-use-effect': 'off'
    }
  }
]);
