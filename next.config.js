/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "i.ytimg.com",
        protocol: "https",
      },
      {
        hostname: "yt3.ggpht.com",
        protocol: "https",
      },
      {
        hostname: "sincere-ferret-226.convex.cloud",
        protocol: "https",
      },
      {
        hostname: "sincere-ferret-226.convex.site",
        protocol: "https",
      },
    ],
  },
};

module.exports = nextConfig;
