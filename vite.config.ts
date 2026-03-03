import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
            return "react-vendor";
          }

          if (id.includes("@radix-ui") || id.includes("class-variance-authority") || id.includes("cmdk") || id.includes("vaul")) {
            return "ui-vendor";
          }

          if (id.includes("framer-motion")) {
            return "motion-vendor";
          }

          if (id.includes("@supabase")) {
            return "supabase-vendor";
          }

          if (id.includes("react-markdown") || id.includes("remark-") || id.includes("rehype-") || id.includes("micromark")) {
            return "markdown-vendor";
          }

          if (id.includes("@tanstack")) {
            return "query-vendor";
          }
        },
      },
    },
  },
}));
