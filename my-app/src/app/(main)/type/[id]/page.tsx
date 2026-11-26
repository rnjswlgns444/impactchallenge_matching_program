import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ScreenSkeleton } from "@/components/common/screen-skeleton";
import { Screen } from "@/components/layout/screen";
import { text } from "@/content/text";
import { appData, getType } from "@/data";

export const metadata: Metadata = { title: text.screens.type };

// 유형 12개의 화면을 빌드 때 미리 만든다.
export function generateStaticParams() {
  return appData.types.map((type) => ({ id: type.id }));
}

// 아직 내용을 넣지 않은 화면이다. 유형 이름과 설명만 보여 준다.
export default function TypePage({ params }: PageProps<"/type/[id]">) {
  return (
    <Suspense
      fallback={
        <Screen>
          <ScreenSkeleton />
        </Screen>
      }
    >
      <Body params={params} />
    </Suspense>
  );
}

async function Body({ params }: Pick<PageProps<"/type/[id]">, "params">) {
  const { id } = await params;
  const type = getType(id);
  if (!type) notFound();

  return (
    <Screen title={type.name}>
      <p>{type.statement}</p>
    </Screen>
  );
}
