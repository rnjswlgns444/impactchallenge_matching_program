import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // 흐름 테스트(Playwright)의 `use`는 React의 use가 아니다
  { files: ["e2e/**"], rules: { "react-hooks/rules-of-hooks": "off" } },
  // 테스트가 남기는 기록
  globalIgnores(["test-results/**", "playwright-report/**"]),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
