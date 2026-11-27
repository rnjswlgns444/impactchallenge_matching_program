import { defineConfig, devices } from "@playwright/test";

// 화면 흐름 테스트. 실행: npm run test:e2e
// - 휴대폰 크기의 크롬으로 본다.
// - 개발 서버(3000번)가 켜져 있으면 그것을 쓰고, 없으면 켠다.
// - 실제 AI는 부르지 않는다. e2e/fixtures.ts가 AI 창구(/api/recommend)를 가짜 답으로 막는다.
export default defineConfig({
  testDir: "e2e",
  outputDir: "test-results",
  fullyParallel: false,
  workers: 1, // 개발 서버 하나를 함께 쓰므로 차례로 돌린다
  retries: 0,
  timeout: 90_000, // 개발 서버는 화면을 처음 열 때 만드느라 느리다
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    ...devices["Pixel 7"],
    locale: "ko-KR",
    timezoneId: "Asia/Seoul",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
