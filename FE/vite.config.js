import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,

    allowedHosts: ["c894-2409-40c1-28-94c8-cc49-8f09-bd63-e9af.ngrok-free.app"],

    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },

  preview: {
    allowedHosts: ["c894-2409-40c1-28-94c8-cc49-8f09-bd63-e9af.ngrok-free.app"],
  },
});
