export default {
  extends: ['stylelint-config-standard'],
  rules: {
    'at-rule-no-unknown': [true, { ignoreAtRules: ['-moz-document'] }],
    'at-rule-no-vendor-prefix': [true, { ignoreAtRules: ['-moz-document'] }],
    'selector-class-pattern': null,
    'selector-id-pattern': null,
  },
};
