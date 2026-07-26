/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    if (dev) {
      // Mematikan disk cache webpack sementara saat dev mode
      // untuk mencegah error lock file ENOENT akibat sinkronisasi OneDrive
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
