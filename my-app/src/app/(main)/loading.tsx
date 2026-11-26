import { ScreenSkeleton } from "@/components/common/screen-skeleton";
import { Screen } from "@/components/layout/screen";

export default function Loading() {
  return (
    <Screen>
      <ScreenSkeleton />
    </Screen>
  );
}
