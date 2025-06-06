import { defineConfig, loadEnv } from "vite";
import path from "path";

// Only import dev dependencies in development mode
const plugins = [];

// Production checks to avoid importing dev dependencies
if (process.env.NODE_ENV !== "production") {
  // These imports will only be loaded in development mode
  const react = await import("@vitejs/plugin-react").then(m => m.default);
  const runtimeErrorOverlay = await import("@replit/vite-plugin-runtime-error-modal").then(m => m.default);
  const themePlugin = await import("@replit/vite-plugin-shadcn-theme-json").then(m => m.default);
  
  // Type assertion to allow pushing to the plugins array
  (plugins as any[]).push(
    react(),
    runtimeErrorOverlay(),
    themePlugin()
  );

  // Only add cartographer in development and when REPL_ID is defined
  if (process.env.REPL_ID !== undefined) {
    const cartographer = await import("@replit/vite-plugin-cartographer").then(m => m.cartographer);
    (plugins as any[]).push(cartographer());
  }
}

async function devOnlyPlugins() {
  if (process.env.NODE_ENV === 'production') return []
  return [
    await (await import('@replit/vite-plugin-runtime-error-modal').then(m => m.default))(),
    await (await import('@replit/vite-plugin-shadcn-theme-json').then(m => m.default))(),
    process.env.REPL_ID
      ? (await import('@replit/vite-plugin-cartographer').then(m => m.cartographer))()
      : null,
  ].filter(Boolean)
}



// vite.config.ts
import react from '@vitejs/plugin-react'
import { apiPlugin } from './client/vite-plugin-api'

export default defineConfig(async ({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Make env vars available to the API plugin
  process.env.OPENAI_API_KEY = env.OPENAI_API_KEY || env.OPENROUTER_API_KEY;
  
  return {
    plugins: [
      react(),               // ① always include react plugin
      ...await devOnlyPlugins(),   // ② keep the dev‑time plugins conditional
      apiPlugin(),           // Add API plugin for handling AI requests
    ],
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
  };
});
