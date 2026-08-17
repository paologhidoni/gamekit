import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "tests/api/**/*.test.ts"],
    environment: "jsdom",
    setupFiles: ["./tests/msw/setup.ts"],
    env: {
      VITE_NEON_AUTH_URL: "http://127.0.0.1:54321/auth",
      VITE_NEON_DATA_API_URL: "http://127.0.0.1:54321/rest/v1",
    },
  },
});
