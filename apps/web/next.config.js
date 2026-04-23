const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output for Docker; Vercel handles output automatically
  ...(process.env.DOCKER_BUILD === 'true'
    ? { output: 'standalone', outputFileTracingRoot: path.join(__dirname, '../../') }
    : {}),
  reactStrictMode: true,
  transpilePackages: ['@path-connect/shared', '@path-connect/ui'],

  async rewrites() {
    const apiUrl = process.env.API_INTERNAL_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
