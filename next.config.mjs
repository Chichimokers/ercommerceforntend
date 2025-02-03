/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Configuraciones de CORS o seguridad estricta
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' }
        ]
      }
    ]
  },

  // Configuración de redirects o rewrites
  async redirects() {
    return [
      // Redirecciones que pueden interferir
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true
      }
    ]
  },

  // Optimización de imágenes
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "dummyimage.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co", // Nuevo dominio de placeholder
      },
      {
        protocol: "https",
        hostname: "placekitten.com",
      },
      {
        protocol: "https",
        hostname: "dummyimage.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
    formats: ["image/avif", "image/webp"], // Formatos modernos
    minimumCacheTTL: 86400, // 1 día de caché
  },

  // Mejor manejo de MDX
  experimental: {
    turbo: {
      rules: {
        "*.mdx": ["@mdx-js/loader"],
      },
      resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js"], // Extensiones adicionales
    },
  },

  // Compresión avanzada
  compress: true,
  webpack: (config) => {
    config.plugins.push(new (require("compression-webpack-plugin"))({
      algorithm: "gzip",
      test: /\.(js|css|html|svg|json)$/,
    }));
    config.plugins.push(new (require("compression-webpack-plugin"))({
      algorithm: "brotliCompress",
      filename: "[path][base].br",
      test: /\.(js|css|html|svg|json)$/,
    }));
    return config;
  },
};

// Corrección usando import dinámico
const withBundleAnalyzer = (await import("@next/bundle-analyzer")).default({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
