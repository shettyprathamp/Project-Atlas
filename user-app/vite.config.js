import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  base: "./",

  preview: {
    allowedHosts: [
      "project-atlas-frontend-r3ce.onrender.com",
    ],
  },
});