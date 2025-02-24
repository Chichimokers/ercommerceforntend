/** @type {import('next').NextConfig} */
//import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";


const nextConfig: NextConfig = {

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/old-path",
        destination: "/new-path",
        permanent: true,
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "dummyimage.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "placekitten.com" },
      { protocol: "https", hostname: "dummyimage.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },

  compress: true,

  webpack: (config, { isServer }) => {
    const CompressionPlugin = require("compression-webpack-plugin");
    const BrotliPlugin = require("brotli-webpack-plugin");

    // Gzip
    config.plugins.push(
      new CompressionPlugin({
        algorithm: "gzip",
        test: /\.(js|css|html|svg|json)$/,
      })
    );

    // Brotli (solo en cliente)
    if (!isServer) {
      config.plugins.push(
        new BrotliPlugin({
          asset: "[path].br[query]",
          test: /\.(js|css|html|svg|json)$/,
          threshold: 10240,
          minRatio: 0.8,
        })
      );
    }

    return config;
  },
};

/*export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);*/
