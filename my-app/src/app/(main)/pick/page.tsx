import type { Metadata } from "next";

import { ScreenSkeleton } from "@/components/common/screen-skeleton";
import { Screen } from "@/components/layout/screen";
import { text } from "@/content/text";

export const metadata: Metadata = { title: text.screens.pick };

// 아직 내용을 넣지 않은 화면이다. 틀만 있다.
export default function PickPage() {
  return (
    <Screen title={text.screens.pick}>
      <ScreenSkeleton />
    </Screen>
  );
}
