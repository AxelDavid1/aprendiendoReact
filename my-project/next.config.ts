import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  // 1. REDIRECTS: Para el usuario final (UX)
  async redirects() {
    return [
      {
        source: '/',
        destination: '/screens/home',
        permanent: true,
      },
    ];
  },

  // 2. REWRITES: Vital para que funcione en tu PC Local
  async rewrites() {
    return [
      {
        source: "/api/:path*", 
        // Cuando Next vea "/api", lo manda a tu backend local
        destination: "http://localhost:5000/api/:path*", 
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:5000/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;