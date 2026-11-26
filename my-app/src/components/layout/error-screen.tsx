"use client";

import { LinkButton } from "@/components/common/link-button";
import { Button } from "@/components/ui/button";
import { text } from "@/content/text";

import { Screen } from "./screen";

// 화면을 그리다 오류가 났을 때 보여 주는 내용. 묶음마다의 error.tsx가 쓴다.

export function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <Screen title={text.errorTitle}>
      <p>{text.errorBody}</p>
      <Button variant="cta" size="touch" onClick={onRetry}>
        {text.errorRetry}
      </Button>
      <LinkButton href="/" variant="outline">
        {text.goStart}
      </LinkButton>
    </Screen>
  );
}
