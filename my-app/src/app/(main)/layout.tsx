import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { text } from "@/content/text";

// 설문 뒤 화면들의 틀. 머리띠의 ANTI를 누르면 처음 화면으로 간다.
export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell
      header={
        <AppHeader
          brand={
            <Link href="/" aria-label={text.toStart}>
              {text.appName}
            </Link>
          }
        />
      }
    >
      {children}
    </AppShell>
  );
}
