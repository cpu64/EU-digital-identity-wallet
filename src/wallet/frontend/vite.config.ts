import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
