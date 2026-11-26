import { HomeLink } from "@/components/features/session/home-link";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";

// 설문 뒤 화면들의 틀. 머리띠의 ANTI를 누르면 처음 화면으로 간다(답이 있으면 되묻는다).
export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell header={<AppHeader brand={<HomeLink />} />}>{children}</AppShell>
  );
}
