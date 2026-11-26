"use client";

import { useEffect } from "react";

import { ErrorScreen } from "@/components/layout/error-screen";

// 이 버전의 error.tsx는 { error: unknown, retry }를 받는다.
export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorScreen onRetry={() => retry()} />;
}
