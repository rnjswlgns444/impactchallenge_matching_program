import { LinkButton } from "@/components/common/link-button";
import { Screen } from "@/components/layout/screen";
import { text } from "@/content/text";

// 시작 화면. 지금은 틀만 있다(캐릭터 그림과 유의사항은 화면 작업 때 넣는다).
export default function StartPage() {
  return (
    <Screen title={text.startHeading}>
      <p>{text.startIntro}</p>
      <LinkButton href="/survey" variant="cta">
        {text.startButton}
      </LinkButton>
      <LinkButton href="/browse" variant="outline">
        {text.startBrowse}
      </LinkButton>
    </Screen>
  );
}
