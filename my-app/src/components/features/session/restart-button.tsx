"use client";

import { useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { text } from "@/content/text";
import { useSurveyStore } from "@/stores/survey-store";

// 결과 화면의 '처음부터 다시 하기'. 되묻는 창을 거쳐야만 답을 지우고 처음 화면으로 간다.

export function RestartButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // 화면을 오가도 상태가 남으므로, 이 화면이 숨겨질 때 창을 닫아 둔다.
  useLayoutEffect(() => () => setOpen(false), []);

  return (
    <>
      <Button variant="link" size="touch" className="w-auto self-center" onClick={() => setOpen(true)}>
        {text.restartButton}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={text.restartAskTitle}
        body={text.restartAskBody}
        stayLabel={text.restartKeep}
        goLabel={text.restartGo}
        onGo={() => {
          setOpen(false); // 화면을 옮기기 전에 닫는다
          useSurveyStore.getState().reset();
          router.push("/");
        }}
      />
    </>
  );
}
