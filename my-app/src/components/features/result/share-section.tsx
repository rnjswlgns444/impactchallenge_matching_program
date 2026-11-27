"use client";

import { useLayoutEffect, useState } from "react";

import { Notice } from "@/components/common/notice";
import { Button } from "@/components/ui/button";
import { text } from "@/content/text";
import { shareApp, type ShareOutcome } from "@/lib/share";

// '친구에게 공유하기': 공유 글과 앱 주소만 보낸다. 고른 답이나 결과는 보내지 않는다.
// 휴대폰의 공유 창을 띄우고, 안 되면 주소를 복사하고, 그것도 안 되면 주소를 글로 보여 준다.

export function ShareSection() {
  const [outcome, setOutcome] = useState<ShareOutcome | null>(null);
  const [url, setUrl] = useState("");

  // 화면을 오가도 상태가 남으므로, 이 화면이 숨겨질 때 안내를 지운다.
  useLayoutEffect(() => () => setOutcome(null), []);

  const share = async () => {
    const address = window.location.origin; // 지금 열려 있는 앱의 첫 화면
    setUrl(address);
    setOutcome(
      await shareApp(text.shareMessage, address, {
        share: navigator.share ? (data) => navigator.share(data) : undefined,
        copy: navigator.clipboard ? (value) => navigator.clipboard.writeText(value) : undefined,
      })
    );
  };

  return (
    <section className="flex flex-col gap-[0.5rem]">
      <p className="text-[0.9rem] leading-[1.55] text-pretty text-muted-foreground">{text.shareHelp}</p>
      <Button variant="outline" size="touch" className="font-bold" onClick={share}>
        {text.shareButton}
      </Button>
      {outcome === "copied" ? (
        <Notice kind="info" live>
          {text.shareCopied}
        </Notice>
      ) : null}
      {outcome === "failed" ? (
        <Notice live>
          {text.shareFailed}
          <span className="mt-[0.3rem] block font-semibold break-all select-all">{url}</span>
        </Notice>
      ) : null}
    </section>
  );
}
