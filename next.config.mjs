/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "www.gravatar.com",
      },
    ],
  },
  experimental: {
    turbo: {
      rules: {
        "*.mdx": ["@mdx-js/loader"],
      },
    },
  },
};

// Corrección usando import dinámico
const withBundleAnalyzer = (await import("@next/bundle-analyzer")).default({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
