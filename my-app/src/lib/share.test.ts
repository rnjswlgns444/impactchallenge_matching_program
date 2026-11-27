import { describe, expect, it, vi } from "vitest";

import { shareApp } from "./share";

const MESSAGE = "함께 해 봐요";
const URL = "https://example.com";
const abort = () => Promise.reject(Object.assign(new Error("닫음"), { name: "AbortError" }));
const broken = () => Promise.reject(new Error("안 됨"));

describe("친구에게 공유하기", () => {
  it("공유 창이 있으면 공유 글과 주소만 보낸다", async () => {
    const share = vi.fn(() => Promise.resolve());
    const copy = vi.fn(() => Promise.resolve());
    expect(await shareApp(MESSAGE, URL, { share, copy })).toBe("shared");
    expect(share).toHaveBeenCalledWith({ text: MESSAGE, url: URL });
    expect(copy).not.toHaveBeenCalled();
  });

  it("공유 창을 본인이 닫으면 주소를 복사하지 않는다", async () => {
    const copy = vi.fn(() => Promise.resolve());
    expect(await shareApp(MESSAGE, URL, { share: abort, copy })).toBe("cancelled");
    expect(copy).not.toHaveBeenCalled();
  });

  it("공유 창이 없으면 주소를 복사한다", async () => {
    const copy = vi.fn(() => Promise.resolve());
    expect(await shareApp(MESSAGE, URL, { copy })).toBe("copied");
    expect(copy).toHaveBeenCalledWith(URL);
  });

  it("공유 창을 띄우지 못하면 주소를 복사한다", async () => {
    const copy = vi.fn(() => Promise.resolve());
    expect(await shareApp(MESSAGE, URL, { share: broken, copy })).toBe("copied");
  });

  it("복사도 못 하면 실패로 알린다", async () => {
    expect(await shareApp(MESSAGE, URL, { copy: broken })).toBe("failed");
    expect(await shareApp(MESSAGE, URL, {})).toBe("failed");
  });
});
