import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
  test: {
    // "forks" pool breaks on Windows when the repo path contains "&" (e.g. this
    // repo's "Finance & Accounting" segment) — worker processes never respond.
    pool: "threads",
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "app/generated/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary", "json"],
      include: ["app/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}", "auth.ts", "auth.config.ts", "proxy.ts"],
      exclude: [
        "app/generated/**",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
      ],
    },
  },
});
