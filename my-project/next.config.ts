import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  // 1. REDIRECCIÓN: Para que al entrar a tuweb.com te lleve a /screens/home
  async redirects() {
    return [
      {
        source: '/',
        destination: '/screens/home',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;