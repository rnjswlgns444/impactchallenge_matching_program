import { Suspense } from "react";
import type { Metadata } from "next";

import { ScreenSkeleton } from "@/components/common/screen-skeleton";
import { Survey } from "@/components/features/survey/survey";
import { Screen } from "@/components/layout/screen";
import { text } from "@/content/text";

export const metadata: Metadata = { title: text.screens.survey };

// 설문 화면. 답은 브라우저에만 있어서, 내용은 브라우저에서 그린다(그 전에는 뼈대 그림이 보인다).
export default function SurveyPage() {
  return (
    <Screen>
      <Suspense fallback={<ScreenSkeleton />}>
        <Survey />
      </Suspense>
    </Screen>
  );
}
