import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// Hosted at https://<user>.github.io/sight_reading/
export default defineConfig({
  base: "/sight_reading/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon-32x32.png", "apple-touch-icon.png"],
      workbox: {
        // VexFlow bundles into a ~1.2 MB chunk; raise the precache limit so
        // the whole app is available offline.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
      },
      manifest: {
        name: "Sight Reading Trainer",
        short_name: "Sight Reading",
        description:
          "A playful music sight reading practice tool. Learn to read notes on the treble and bass clef.",
        theme_color: "#7c3aed",
        background_color: "#faf5ff",
        display: "standalone",
        orientation: "any",
        categories: ["education", "music"],
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
