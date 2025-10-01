import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  // Override for generated files (Prisma client)
  {
    files: ['src/generated/**/*.ts', 'src/generated/**/*.js'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'no-unused-private-class-members': 'off',
    },
  },
  // Override for database interfaces and repositories
  {
    files: [
      'src/lib/database/**/*.ts',
      'src/lib/logger.ts',
      'src/lib/tenant/TenantContext.ts'
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-case-declarations': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  // Override for test files
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
])
