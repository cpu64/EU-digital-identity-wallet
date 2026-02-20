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
        target: "https://wallet-backend.wallet.test",
        changeOrigin: true,
        secure: false,
      },
    },
    host: true,
    port: 8000,
    allowedHosts: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
});
