import { defineConfig } from "vite";
import path from "path";

// Only import dev dependencies in development mode
const plugins = [];

// Production checks to avoid importing dev dependencies
if (process.env.NODE_ENV !== "production") {
  // These imports will only be loaded in development mode
  const react = await import("@vitejs/plugin-react").then(m => m.default);
  const runtimeErrorOverlay = await import("@replit/vite-plugin-runtime-error-modal").then(m => m.default);
  const themePlugin = await import("@replit/vite-plugin-shadcn-theme-json").then(m => m.default);
  
  plugins.push(
    react(),
    runtimeErrorOverlay(),
    themePlugin()
  );

  // Only add cartographer in development and when REPL_ID is defined
  if (process.env.REPL_ID !== undefined) {
    const cartographer = await import("@replit/vite-plugin-cartographer").then(m => m.cartographer);
    plugins.push(cartographer());
  }
}

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
});
