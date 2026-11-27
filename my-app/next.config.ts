import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 같은 와이파이의 휴대폰에서 개발 서버를 열 수 있게 한다(npm run dev:phone).
  // 이 버전은 다른 기기에서 온 개발용 요청을 기본으로 막는다. 집·학교 와이파이의 사설 주소만 허용한다.
  allowedDevOrigins: ["192.168.*.*", "172.*.*.*", "10.*.*.*"],
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
