import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ScreenSkeleton } from "@/components/common/screen-skeleton";
import { TasteScreen } from "@/components/features/place/taste";
import { Screen } from "@/components/layout/screen";
import { text } from "@/content/text";
import { appData, getProgram } from "@/data";

export const metadata: Metadata = { title: text.screens.taste };

// 기관 화면(../page.tsx)과 같은 곳들을 빌드 때 미리 만든다.
// 이 사람의 후보에 있는 곳인지는 브라우저에서 따진다(components/features/place/taste.tsx).
export function generateStaticParams() {
  return appData.programs
    .filter((program) => program["매칭가능"] === "Y")
    .map((program) => ({ id: program.id }));
}

export default function TastePage({ params }: PageProps<"/place/[id]/taste">) {
  return (
    <Screen>
      <Suspense fallback={<ScreenSkeleton />}>
        <Body params={params} />
      </Suspense>
    </Screen>
  );
}

async function Body({ params }: Pick<PageProps<"/place/[id]/taste">, "params">) {
  const { id } = await params;
  // 없는 id와 끝난 프로그램(매칭가능 N)은 주소를 직접 쳐도 보여 주지 않는다
  if (getProgram(id)?.["매칭가능"] !== "Y") notFound();
  return <TasteScreen programId={id} />;
}
