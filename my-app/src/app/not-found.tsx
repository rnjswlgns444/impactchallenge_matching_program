import { LinkButton } from "@/components/common/link-button";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { Screen } from "@/components/layout/screen";
import { text } from "@/content/text";

export default function NotFound() {
  return (
    <AppShell header={<AppHeader />}>
      <Screen title={text.notFoundTitle}>
        <p>{text.notFoundBody}</p>
        <LinkButton href="/" variant="cta">
          {text.goStart}
        </LinkButton>
      </Screen>
    </AppShell>
  );
}
