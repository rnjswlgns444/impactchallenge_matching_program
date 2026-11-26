import { FinePrint } from "@/components/common/fine-print";
import { LinkButton } from "@/components/common/link-button";
import { HomeArt } from "@/components/features/start/home-art";
import { Screen } from "@/components/layout/screen";
import { text } from "@/content/text";

// 시작 화면: 그림 → 제목과 한 줄 소개 → 시작 단추 → 둘러보기 단추 → 맨 아래 작은 글씨의 유의사항.
// 유의사항은 실제로 하는 일과 같아야 한다(답은 기기 안에만 둔다. AI로 보내는 것은 아직 없다).
export default function StartPage() {
  return (
    <Screen className="gap-[0.68rem]">
      <HomeArt />
      <div>
        <h1 className="text-[clamp(1.52rem,7.7vw,1.96rem)] leading-[1.17] font-extrabold tracking-[-0.055em] text-balance">
          {text.startHeading}
        </h1>
        <p className="mt-[0.34rem] text-sm leading-[1.48]">{text.startIntro}</p>
      </div>
      <div className="flex flex-col gap-[0.4rem]">
        <LinkButton href="/survey" variant="cta">
          {text.startButton}
        </LinkButton>
        <LinkButton href="/browse" variant="outline" className="border-teal text-teal hover:text-teal">
          {text.startBrowse}
        </LinkButton>
      </div>
      <FinePrint title={text.startNotesTitle} items={[text.startPrivacy, text.startRefresh, text.disclaimer]} />
    </Screen>
  );
}
