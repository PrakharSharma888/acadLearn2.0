import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // ✅ required for ngrok
    allowedHosts: [
      "9106-157-119-214-135.ngrok-free.app"
    ],
    strictPort: true,
    cors: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});