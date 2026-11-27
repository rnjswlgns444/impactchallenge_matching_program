import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ScreenSkeleton } from "@/components/common/screen-skeleton";
import { Place } from "@/components/features/place/place";
import { Screen } from "@/components/layout/screen";
import { text } from "@/content/text";
import { appData, getProgram } from "@/data";

export const metadata: Metadata = { title: text.screens.place };

// 안내 중인 곳(매칭가능 Y)의 화면을 빌드 때 미리 만든다.
// 날짜가 지났는지, 이 사람에게 맞는 곳인지는 여기서 따지지 않는다.
// 그것은 브라우저에서 후보 거르기가 한다(components/features/place/place.tsx).
export function generateStaticParams() {
  return appData.programs
    .filter((program) => program["매칭가능"] === "Y")
    .map((program) => ({ id: program.id }));
}

export default function PlacePage({ params }: PageProps<"/place/[id]">) {
  return (
    <Screen>
      <Suspense fallback={<ScreenSkeleton />}>
        <Body params={params} />
      </Suspense>
    </Screen>
  );
}

async function Body({ params }: Pick<PageProps<"/place/[id]">, "params">) {
  const { id } = await params;
  // 없는 id와 끝난 프로그램(매칭가능 N)은 주소를 직접 쳐도 보여 주지 않는다
  if (getProgram(id)?.["매칭가능"] !== "Y") notFound();
  return <Place programId={id} />;
}
