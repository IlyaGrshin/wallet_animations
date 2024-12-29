import reactPlugin from 'eslint-plugin-react';
import prettierPlugin from 'eslint-plugin-prettier';
import babelParser from '@babel/eslint-parser';

export default [
  {
    ignores: ['build/', 'node_modules/'], // Игнорируемые файлы
    files: ['src/**/*.{js,jsx,ts,tsx}'], // Проверяемые файлы
    languageOptions: {
      ecmaVersion: 'latest', // Версия ECMAScript
      sourceType: 'module', // Используем модули
      parser: babelParser, // Используем Babel Parser
      parserOptions: {
        requireConfigFile: true, // Включение поддержки .babelrc
        babelOptions: {
          rootMode: 'upward', // Поддержка корневого файла Babel (если проект монорепозиторий)
        },
      },
    },
    settings: {
      react: {
        version: 'detect', // Автоопределение версии React
      },
    },
    plugins: {
      react: reactPlugin, // Плагин React
      prettier: prettierPlugin, // Плагин Prettier
    },
    rules: {
      ...reactPlugin.configs.recommended.rules, // Рекомендованные правила React
      'react/jsx-uses-vars': 'error', // Поддержка используемых переменных
      'prettier/prettier': 'error', // Интеграция Prettier
      'react/react-in-jsx-scope': 'off', // Отключение правила
      'react/prop-types': 'off', // Отключение правила
      'react/display-name': 'off', // Отключение правила
    },
  },
];
