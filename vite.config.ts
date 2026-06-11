import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  // FOOTBALL_API_KEY has no VITE_ prefix on purpose — it must never reach the
  // client bundle. The dev proxy injects it server-side; in production the
  // Netlify function does the equivalent.
  const env = loadEnv(mode, process.cwd(), "");
  const footballApiKey = env.FOOTBALL_API_KEY ?? "";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/football-api": {
          target: "https://api.football-data.org",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/football-api/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (footballApiKey) proxyReq.setHeader("X-Auth-Token", footballApiKey);
            });
          },
        },
      },
    },
  };
});
