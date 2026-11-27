import { text } from "@/content/text";

// 맨 위 노란 띠. 앱 이름과 작은 풀이를 한 줄에 둔다.
// 앱 이름 자리(brand)에 무엇을 둘지는 화면 묶음이 정한다.
// - 앱 화면: 누르면 처음으로 가는 부품(HomeLink)을 넘긴다
// - 없는 주소·부품 모아 보기: 아무것도 넘기지 않는다(글자뿐인 ANTI)
// 이 파일은 답 저장소를 보지 않는다.

export function AppHeader({ brand }: { brand?: React.ReactNode }) {
  return (
    <header className="flex min-h-[2.6rem] items-baseline gap-[0.5rem] bg-cta px-[1rem] py-[0.5rem] min-[601px]:rounded-xl">
      <div className="text-[1.2rem] leading-tight font-extrabold tracking-[0.04em] text-ink">
        {brand ?? text.appName}
      </div>
      <p className="text-[0.7rem] leading-snug font-semibold whitespace-nowrap text-ink/80">
        {text.appSub}
      </p>
    </header>
  );
}
