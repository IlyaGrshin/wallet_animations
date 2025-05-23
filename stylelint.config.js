/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    'selector-pseudo-class-no-unknown': [true, {
      ignorePseudoClasses: ['global'],
    }],
    'selector-class-pattern': [
      '^(?:[a-z][a-z0-9]*(?:-[a-z0-9]+)*|[A-Z][a-zA-Z0-9]*)$',
      { message: 'Разрешён kebab- или PascalCase' },
    ],
  },
};
