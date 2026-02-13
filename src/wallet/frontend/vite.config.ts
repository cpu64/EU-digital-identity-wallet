import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/wallet": {
        target: "http://backend:5000",
        changeOrigin: true,
      },
    },
    host: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
});
