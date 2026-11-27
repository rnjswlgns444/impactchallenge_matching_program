// '친구에게 공유하기'의 갈래를 정한다: 휴대폰의 공유 창 → 안 되면 주소 복사 → 그것도 안 되면 실패.
// 보내는 것은 공유 글과 앱 주소뿐이다. 고른 답이나 결과는 보내지 않는다.
// 브라우저의 기능(share, copy)은 밖에서 받는다. 테스트에서는 가짜를 넣는다.

export type ShareOutcome =
  | "shared" // 공유 창으로 보냈다
  | "cancelled" // 공유 창을 본인이 닫았다
  | "copied" // 공유 창이 없어 주소를 복사했다
  | "failed"; // 복사도 못 했다(주소를 글로 보여 준다)

export type ShareTools = {
  share?: (data: { text: string; url: string }) => Promise<void>;
  copy?: (value: string) => Promise<void>;
};

function isAbort(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

export async function shareApp(message: string, url: string, tools: ShareTools): Promise<ShareOutcome> {
  if (tools.share) {
    try {
      await tools.share({ text: message, url });
      return "shared";
    } catch (error) {
      if (isAbort(error)) return "cancelled";
      // 공유 창을 띄우지 못했다. 주소 복사로 넘어간다
    }
  }
  if (tools.copy) {
    try {
      await tools.copy(url);
      return "copied";
    } catch {
      // 아래에서 실패로 알린다
    }
  }
  return "failed";
}
