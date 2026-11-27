import { Suspense } from "react";
import type { Metadata } from "next";

import { ScreenSkeleton } from "@/components/common/screen-skeleton";
import { Places } from "@/components/features/places/places";
import { Screen } from "@/components/layout/screen";
import { text } from "@/content/text";

export const metadata: Metadata = { title: text.screens.places };

// 유형의 나머지 곳 목록. 어느 곳을 보여 줄지는 브라우저에서 답과 정보표로 정한다.
export default function PlacesPage() {
  return (
    <Screen>
      <Suspense fallback={<ScreenSkeleton />}>
        <Places />
      </Suspense>
    </Screen>
  );
}
