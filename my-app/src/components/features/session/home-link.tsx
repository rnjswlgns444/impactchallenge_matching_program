"use client";

import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { text } from "@/content/text";
import { hasAnswers, useSurveyStore } from "@/stores/survey-store";

// 머리띠의 ANTI. 누르면 처음 화면으로 간다.
// 답이 있으면 먼저 되묻고, '처음으로 가기'를 눌러야 답을 지우고 간다.
// 답은 누르는 순간에만 읽으므로(그리는 중에 읽지 않음) <Suspense>가 필요 없다.

export function HomeLink() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // 화면을 오가도 상태가 남으므로, 이 화면이 숨겨질 때 창을 닫아 둔다.
  useLayoutEffect(() => () => setOpen(false), []);

  return (
    <>
      <Link
        href="/"
        aria-label={text.toStart}
        className="rounded-sm hover:underline"
        onNavigate={(event) => {
          if (hasAnswers(useSurveyStore.getState())) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        {text.appName}
      </Link>
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
