import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/mmc6950-liptak-capstone",
  plugins: [react()],
  server: {
    allowedHosts: [".ngrok-free.app"],
  },
});
