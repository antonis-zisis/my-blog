import nextConfig from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      curly: ['error', 'all'],
      'id-length': ['warn', { min: 2, exceptions: ['_', 'r'] }],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'block-like', next: '*' },
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
    },
  },
];

export default eslintConfig;
