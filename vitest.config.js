import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./tests/setupTests.jsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reporterDirectory: "./coverage",
      all: true,
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      exclude: [
        "src/main.jsx",
        "src/index.css"
      ]
    }
  }
});

