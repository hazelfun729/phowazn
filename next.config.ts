import type { NextConfig } from 'next';
import { withOpenNext } from '@opennextjs/cloudflare';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.dev.coze.site'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
};

export default withOpenNext(nextConfig);
