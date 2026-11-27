"use client";

import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { text } from "@/content/text";
import { hasAnswers, useSurveyStore } from "@/stores/survey-store";

// 머리띠의 ANTI. 어느 화면에서든 누르면 처음 화면으로 간다(11/28 사용자 결정. 그전에는 설문 중에 글자뿐이었다).
// 답이 있으면 먼저 되묻고, '처음으로 가기'를 눌러야 답을 지우고 간다.
// 결과가 나오기 전 화면(설문·동점 고르기·맞춰 보기)에서는 저장 안내 대신 설문용 글을 쓴다.
// 이미 처음 화면이면 창 없이 맨 위로만 간다.
// 답과 주소는 누르는 순간에만 읽으므로(그리는 중에 읽지 않음) <Suspense>가 필요 없다.

const BEFORE_RESULT = ["/survey", "/pick", "/tune"];

export function HomeLink() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [beforeResult, setBeforeResult] = useState(false);

  // 화면을 오가도 상태가 남으므로, 이 화면이 숨겨질 때 창을 닫아 둔다.
  useLayoutEffect(() => () => setOpen(false), []);

  return (
    <>
      <Link
        href="/"
        aria-label={text.toStart}
        className="rounded-sm hover:underline"
        onNavigate={(event) => {
          const path = window.location.pathname;
          if (path === "/") {
            event.preventDefault();
            window.scrollTo({ top: 0 });
            return;
          }
          if (hasAnswers(useSurveyStore.getState())) {
            event.preventDefault();
            setBeforeResult(BEFORE_RESULT.includes(path));
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
        body={beforeResult ? text.restartAskSurveyBody : text.restartAskBody}
        stayLabel={beforeResult ? text.restartKeepSurvey : text.restartKeep}
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
