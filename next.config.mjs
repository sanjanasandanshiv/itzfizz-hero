const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages: static export under /<repo-name>
  output: "export",
  basePath: isProd ? "/itzfizz-hero" : "",
  images: { unoptimized: true },

  // Tailwind (Next.js 16 wires it here, not in postcss.config)
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;