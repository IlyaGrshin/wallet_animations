import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import react19 from 'eslint-plugin-react-19-upgrade';
import prettierPlugin from 'eslint-plugin-prettier';
import babelParser from '@babel/eslint-parser';

export default [
    {
        ignores: ['build/', 'node_modules/'],
        files: ['src/**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parser: babelParser,
            parserOptions: {
                requireConfigFile: true,
                babelOptions: {
                    rootMode: 'upward',
                },
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
            'react-19-upgrade': react19,
            prettier: prettierPlugin,
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            
            // Используем recommended preset из react-hooks, который включает правила React Compiler
            ...(reactHooks.configs?.recommended?.rules ?? {}),

            ...(react19.configs?.recommended?.rules ?? {}),

            'react/jsx-uses-vars': 'error',
            'prettier/prettier': 'error',
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'error',
            'react/display-name': 'off',
            'react/jsx-key': 'error',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
        },
    },
];
