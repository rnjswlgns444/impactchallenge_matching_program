import { HomeLink } from "@/components/features/session/home-link";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";

// 시작·설문 화면의 틀. 머리띠의 ANTI는 다른 화면처럼 누르면 처음 화면으로 간다(설문 중이면 먼저 되묻는다).
export default function EntryLayout({ children }: LayoutProps<"/">) {
  return <AppShell header={<AppHeader brand={<HomeLink />} />}>{children}</AppShell>;
}
