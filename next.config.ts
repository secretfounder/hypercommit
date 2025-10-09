import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      // Git HTTP protocol rewrites
      {
        source: '/:owner/:repo.git/info/refs',
        destination: '/api/git/:owner/:repo/info/refs',
      },
      {
        source: '/:owner/:repo.git/git-upload-pack',
        destination: '/api/git/:owner/:repo/git-upload-pack',
      },
      {
        source: '/:owner/:repo.git/git-receive-pack',
        destination: '/api/git/:owner/:repo/git-receive-pack',
      },
    ];
  },
};

export default nextConfig;
