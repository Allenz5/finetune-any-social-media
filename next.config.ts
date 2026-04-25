import type { NextConfig } from 'next';

const config: NextConfig = {
  serverExternalPackages: ['playwright', 'playwright-core'],
  outputFileTracingRoot: __dirname,
};

export default config;
