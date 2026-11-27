"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ScreenSkeleton } from "./screen-skeleton";

// 이 화면을 보여 줄 수 없을 때 다른 화면으로 보낸다(설문을 덜 했는데 결과 주소로 온 경우 등).
// 브라우저 기록에 남기지 않는다(뒤로 가기를 눌러도 이 주소로 돌아오지 않는다).

export function Redirect({ to, isCurrent }: { to: string; isCurrent?: () => boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!isCurrent || isCurrent()) router.replace(to);
  }, [router, to, isCurrent]);
  return <ScreenSkeleton />;
}
