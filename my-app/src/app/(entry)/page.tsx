import { FinePrint } from "@/components/common/fine-print";
import { LinkButton } from "@/components/common/link-button";
import { HomeArt } from "@/components/features/start/home-art";
import { Screen } from "@/components/layout/screen";
import { text } from "@/content/text";

// 시작 화면: 그림 → 큰 제목과 한 줄 소개 → 알약 세 개 → 시작 단추 → 둘러보기 단추 → 맨 아래 작은 글씨의 유의사항.
// 유의사항은 실제로 하는 일과 같아야 한다(답은 기기 안에만 둔다. AI로는 직접 적은 글을 보낼 때만 간다).
export default function StartPage() {
  return (
    <Screen className="gap-[1rem]">
      <HomeArt />
      <div className="flex flex-col items-center gap-[0.5rem] text-center">
        <h1 className="text-[clamp(1.7rem,8.4vw,2.2rem)] leading-[1.2] font-extrabold tracking-[-0.045em] text-balance">
          {text.startHeading}
        </h1>
        <p className="max-w-[17rem] text-[0.95rem] leading-[1.5] text-pretty text-muted-foreground">
          {text.startIntro}
        </p>
        <ul className="mt-[0.2rem] flex flex-wrap justify-center gap-[0.35rem]">
          {text.startPills.map((pill) => (
            <li
              key={pill}
              className="rounded-full border border-[#C9E3D9] bg-[#EAF7F2] px-[0.7rem] py-[0.15rem] text-[0.75rem] leading-[1.5] font-bold text-teal"
            >
              {pill}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-[0.5rem]">
        <LinkButton href="/survey" variant="cta">
          {text.startButton}
        </LinkButton>
        <LinkButton href="/browse" variant="outline" className="text-teal hover:text-teal">
          {text.startBrowse}
        </LinkButton>
      </div>
      <FinePrint title={text.startNotesTitle} items={[text.startPrivacy, text.startAiNote, text.startRefresh, text.disclaimer]} />
    </Screen>
  );
}
