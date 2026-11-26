import { Skeleton } from "@/components/ui/skeleton";
import { text } from "@/content/text";

// 화면 내용을 기다리는 동안 보여 주는 뼈대 그림.

export function ScreenSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-[0.6rem]">
      <span className="sr-only">{text.loading}</span>
      <Skeleton className="h-[1.6rem] w-3/4" />
      <Skeleton className="h-[6rem] w-full rounded-xl" />
      <Skeleton className="h-[3.1rem] w-full rounded-lg" />
      <Skeleton className="h-[3.1rem] w-full rounded-lg" />
    </div>
  );
}
