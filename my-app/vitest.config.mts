import path from "node:path";

import { defineConfig } from "vitest/config";

// 테스트 실행: npm test
export default defineConfig({
  test: {
    include: ["scripts/**/*.test.ts", "src/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
});
