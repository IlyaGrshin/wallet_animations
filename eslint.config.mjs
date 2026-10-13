import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default [
    {
        ignores: ['build/', 'node_modules/'],
    },
    js.configs.recommended,
    {
        files: ['src/**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.browser,
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooks,
        },
        rules: {
            ...reactPlugin.configs.flat.recommended.rules,
            ...reactPlugin.configs.flat['jsx-runtime'].rules,
            ...reactHooks.configs.flat.recommended.rules,

            'react/prop-types': 'error',
            'react/display-name': 'off',
            'react/jsx-key': 'error',
            'react-hooks/set-state-in-effect': 'off',
            // React Compiler handles dependency tracking; this static check is redundant under it.
            'react-hooks/exhaustive-deps': 'off',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
        },
    },
    {
        // UI layer talks to the host only through the platform adapter, so it
        // keeps working outside Telegram. Showcases are app code and may use it.
        files: ['src/components/**/*.{js,jsx}', 'src/hooks/**/*.{js,jsx}'],
        ignores: ['**/*.showcase.{js,jsx}', 'src/components/ModalView/Modals/**'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['**/lib/twa', '**/lib/twa/*', '@lib/twa', '@lib/twa/*'],
                            message: 'Use usePlatform() from lib/platform instead of the Telegram wrapper.',
                        },
                    ],
                },
            ],
        },
    },
    prettierConfig,
];
