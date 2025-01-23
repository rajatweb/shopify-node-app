import "dotenv/config";

import { defineConfig } from "vite";
import { dirname } from 'path'
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";

export default defineConfig({
  define: {
    "process.env.SHOPIFY_API_KEY": JSON.stringify(process.env.SHOPIFY_API_KEY),
    appOrigin: JSON.stringify(
      process.env.SHOPIFY_APP_URL?.replace(/https:\/\//, "")
    ),
  },
  server: {
    allowedHosts: [process.env.SHOPIFY_APP_URL?.replace(/https?:\/\//, "") || ""],
  },
  plugins: [react()],
  build: {
    outDir: "../dist/client/",
  },
  root: dirname(fileURLToPath(import.meta.url)),
  resolve: {
    preserveSymlinks: true,
  },
});
