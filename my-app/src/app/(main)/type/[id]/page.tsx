import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ScreenSkeleton } from "@/components/common/screen-skeleton";
import { TypeIntro } from "@/components/features/browse/type-intro";
import { Screen } from "@/components/layout/screen";
import { text } from "@/content/text";
import { appData, getType } from "@/data";

export const metadata: Metadata = { title: text.screens.type };

// 유형 12개의 화면을 빌드 때 미리 만든다.
export function generateStaticParams() {
  return appData.types.map((type) => ({ id: type.id }));
}

export default function TypePage({ params }: PageProps<"/type/[id]">) {
  return (
    <Screen>
      <Suspense fallback={<ScreenSkeleton />}>
        <Body params={params} />
      </Suspense>
    </Screen>
  );
}

async function Body({ params }: Pick<PageProps<"/type/[id]">, "params">) {
  const { id } = await params;
  const type = getType(id);
  if (!type) notFound();
  return <TypeIntro type={type} />;
}
