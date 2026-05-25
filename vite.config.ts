import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Hosted at https://<user>.github.io/sight_reading/
export default defineConfig({
  base: "/sight_reading/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
