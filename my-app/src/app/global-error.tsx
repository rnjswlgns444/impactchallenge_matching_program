"use client";

import { text } from "@/content/text";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          padding: "24px 16px",
          background: "#F8FBF7",
          color: "#263C37",
          fontFamily: '"Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
          fontSize: 20,
          lineHeight: 1.62,
          wordBreak: "keep-all",
        }}
      >
        <title>{text.errorTitle}</title>
        <h1 style={{ fontSize: 26, color: "#143F3C", margin: "0 0 12px" }}>
          {text.errorTitle}
        </h1>
        <p style={{ margin: "0 0 20px" }}>{text.errorBody}</p>
        <button
          type="button"
          onClick={() => retry()}
          style={{
            width: "100%",
            minHeight: 62,
            border: "1.5px solid #857810",
            borderRadius: 14,
            background: "#FEE500",
            color: "#202E27",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          {text.errorRetry}
        </button>
      </body>
    </html>
  );
}
