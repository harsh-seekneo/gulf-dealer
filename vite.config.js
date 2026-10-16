import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import { validateProductionUrls } from "./scripts/validateProductionEnv.mjs";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command, mode }) => {
  if (command === "build") {
    validateProductionUrls(
      { ...loadEnv(mode, process.cwd(), ""), ...process.env },
      ["VITE_API_BASE_URL", "VITE_USER_APP_URL"],
    );
  }
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: "127.0.0.1",
      port: 5175,
      strictPort: true,
    },
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  };
});
