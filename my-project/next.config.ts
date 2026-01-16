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

  // 2. REESCRITURAS: Para conectar con el Backend (Vital para desarrollo local)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;