import { Suspense } from "react";
import type { Metadata } from "next";

import { ScreenSkeleton } from "@/components/common/screen-skeleton";
import { Pick } from "@/components/features/pick/pick";
import { Screen } from "@/components/layout/screen";
import { text } from "@/content/text";

export const metadata: Metadata = { title: text.screens.pick };

// 가장 높은 유형이 여럿일 때 먼저 볼 유형을 고르는 화면.
export default function PickPage() {
  return (
    <Screen>
      <Suspense fallback={<ScreenSkeleton />}>
        <Pick />
      </Suspense>
    </Screen>
  );
}
