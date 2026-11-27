import { Suspense } from "react";
import type { Metadata } from "next";

import { ScreenSkeleton } from "@/components/common/screen-skeleton";
import { Tune } from "@/components/features/tune/tune";
import { Screen } from "@/components/layout/screen";
import { text } from "@/content/text";

export const metadata: Metadata = { title: text.screens.tune };

// 조금 더 맞춰 보기. 설문을 마친 뒤 결과를 보기 전에 한 번 거친다(전부 선택 사항).
export default function TunePage() {
  return (
    <Screen>
      <Suspense fallback={<ScreenSkeleton />}>
        <Tune />
      </Suspense>
    </Screen>
  );
}
