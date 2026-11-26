import type { Metadata, Viewport } from "next";
// 한글 글꼴. 글자 범위별로 쪼갠 조각이라 화면에 쓰인 글자의 조각만 받는다.
// 이 줄을 빼도 앱은 기기 글꼴로 그대로 돈다(globals.css의 --font-sans).
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ANTI - 안산 다음걸음 유형 찾기",
    template: "%s | ANTI",
  },
  description: "질문에 답하면 내 유형과, 안산에서 가 볼 곳을 알려 드려요.",
};

// 주소창 색은 metadata가 아니라 viewport에 둔다. 확대는 막지 않는다.
export const viewport: Viewport = {
  themeColor: "#FEE500",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        {/* isolate: Base UI의 창(포털)이 본문 위에 제대로 뜨게 한다 */}
        <div className="isolate flex min-h-dvh flex-col">{children}</div>
      </body>
    </html>
  );
}
