import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";

// 시작·설문 화면의 틀. 머리띠의 ANTI는 글자뿐이다(설문 중에 실수로 나가지 않게).
export default function EntryLayout({ children }: LayoutProps<"/">) {
  return <AppShell header={<AppHeader />}>{children}</AppShell>;
}
