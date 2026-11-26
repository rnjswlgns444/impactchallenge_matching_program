import type { Metadata } from "next";

import { ScreenSkeleton } from "@/components/common/screen-skeleton";
import { Screen } from "@/components/layout/screen";
import { text } from "@/content/text";

export const metadata: Metadata = { title: text.screens.browse };

// 아직 내용을 넣지 않은 화면이다. 틀만 있다.
export default function BrowsePage() {
  return (
    <Screen title={text.screens.browse}>
      <ScreenSkeleton />
    </Screen>
  );
}
