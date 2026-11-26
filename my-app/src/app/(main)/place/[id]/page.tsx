import { Suspense } from "react";
import type { Metadata } from "next";

import { ScreenSkeleton } from "@/components/common/screen-skeleton";
import { Screen } from "@/components/layout/screen";
import { text } from "@/content/text";

export const metadata: Metadata = { title: text.screens.place };

// 아직 내용을 넣지 않은 화면이다. 자료가 생기면 generateStaticParams를 더한다.
export default function PlacePage({ params }: PageProps<"/place/[id]">) {
  return (
    <Screen title={text.screens.place}>
      <Suspense fallback={<ScreenSkeleton />}>
        <Body params={params} />
      </Suspense>
    </Screen>
  );
}

async function Body({ params }: Pick<PageProps<"/place/[id]">, "params">) {
  const { id } = await params;
  return <p className="text-sm text-muted-foreground">{id}</p>;
}
