// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      // add this if you will use Supabase Storage public URLs
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

module.exports = nextConfig;
