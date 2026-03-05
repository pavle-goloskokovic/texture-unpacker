import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig(
    // 1) Ignore build artifacts
    {
        ignores: ['dist/**', 'build/**', 'coverage/**', 'node_modules/**'],
    },

    // 2) Base JS + stylistic rules for JS & TS
    {
        files: ['**/*.{js,cjs,mjs,ts,tsx}'],
        ...eslint.configs.recommended,
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            '@stylistic': stylistic,
        },
        rules: {
            // Core style rules migrated from .eslintrc.json
            'space-before-function-paren': ['error', 'always'],
            'no-trailing-spaces': 'error',
            'semi': 'off',
            'no-unused-expressions': ['error', {
                allowShortCircuit: true,
                allowTernary: true,
            }],
            'quotes': ['error', 'single'],
            'key-spacing': ['error', {
                beforeColon: false,
                afterColon: true,
                mode: 'strict',
            }],
            'indent': ['error', 4, {
                VariableDeclarator: 1,
                SwitchCase: 1,
            }],
            'lines-between-class-members': ['error', 'always', {
                exceptAfterSingleLine: true,
            }],
            'keyword-spacing': ['error', {
                overrides: {
                    this: { before: false },
                },
            }],
            'object-curly-spacing': ['error', 'always'],
            '@stylistic/semi': ['error', 'always'],
            // Replace obsolete brace-rules/brace-on-same-line with core brace-style
            'brace-style': ['error', 'allman', {
                allowSingleLine: true,
            }],
        },
    },

    // 3) Non-typed TS rules (safe everywhere TS is parsed)
    ...tseslint.configs.recommended.map((config) => ({
        ...config,
        files: ['**/*.{ts,tsx}'],
    })),

    // 4) Typed TS rules – scoped to TS/TSX and with projectService enabled
    ...tseslint.configs.recommendedTypeChecked.map((config) => ({
        ...config,
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ...(config.languageOptions ?? {}),
            parserOptions: {
                ...(config.languageOptions?.parserOptions ?? {}),
                // Enable type-aware linting using your tsconfig
                projectService: true,
            },
        },
        rules: {
            ...(config.rules ?? {}),
            // TypeScript-specific rules migrated and aligned with modern best practices
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/consistent-type-assertions': 'off',
            '@stylistic/member-delimiter-style': ['error', {
                multiline: {
                    delimiter: 'semi',
                    requireLast: true,
                },
                singleline: {
                    delimiter: 'comma',
                    requireLast: false,
                },
            }],
            '@stylistic/type-annotation-spacing': ['error', {
                before: false,
                after: true,
            }],
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-inferrable-types': 'error',
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-import-type-side-effects': 'error',
            '@typescript-eslint/no-unused-expressions': ['error', {
                allowShortCircuit: true,
                allowTernary: true,
            }],
        },
    })),
);
