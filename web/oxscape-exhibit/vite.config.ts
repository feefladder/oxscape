import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  base: "/oxscape/",
  plugins: [vue()],
    server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
    build: {
    target: "esnext",
    rollupOptions: { output: { format: "es" } },
  },
  worker: {
    format: "es", // ensures web workers are ES modules
  },
});
