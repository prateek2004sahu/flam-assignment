import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Forward /api calls to the Express server so the browser never sees the key
  server: { proxy: { "/api": "http://localhost:3001" } },
});
