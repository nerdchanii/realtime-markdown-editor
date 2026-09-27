import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // apps/web keeps 5173 until it is removed.
  server: { port: 5174 },
});
