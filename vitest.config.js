import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "my-project/vitest.config.js",
      "library-backend/vitest.config.js",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
      },
    },
  },
});
