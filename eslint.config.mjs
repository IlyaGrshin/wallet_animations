import reactPlugin from 'eslint-plugin-react';
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
            prettier: prettierPlugin,
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            'react/jsx-uses-vars': 'error',
            'prettier/prettier': 'error',
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/display-name': 'off',
            'react/jsx-key': 'error',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
        },
    },
];
