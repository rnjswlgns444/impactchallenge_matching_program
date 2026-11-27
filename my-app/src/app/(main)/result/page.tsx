import { Suspense } from "react";
import type { Metadata } from "next";

import { ScreenSkeleton } from "@/components/common/screen-skeleton";
import { Result } from "@/components/features/result/result";
import { Screen } from "@/components/layout/screen";
import { text } from "@/content/text";

export const metadata: Metadata = { title: text.screens.result };

// 결과 화면. 답은 브라우저에만 있어서, 유형 판정과 후보 거르기도 브라우저에서 한다.
export default function ResultPage() {
  return (
    <Screen>
      <Suspense fallback={<ScreenSkeleton />}>
        <Result />
      </Suspense>
    </Screen>
  );
}
