import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: "dist",
    emptyOutDir: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(__dirname, "src/content/content.tsx"),
      output: {
        entryFileNames: "assets/content.js",
        assetFileNames: "assets/[name].[ext]",
        format: "iife",
        inlineDynamicImports: true
      }
    }
  }
});
