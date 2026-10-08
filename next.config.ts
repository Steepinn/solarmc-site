import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["node:sqlite"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "mcsolar.gitbook.io" },
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "www.minecraft.net" },
      { protocol: "https", hostname: "minecraft.net" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
