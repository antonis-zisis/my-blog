import nextConfig from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      curly: ['error', 'all'],
    },
  },
];

export default eslintConfig;
