import { text } from "@/content/text";

// 맨 위 노란 띠. 앱 이름 자리(brand)에 무엇을 둘지는 화면 묶음이 정한다.
// - 시작·설문: 아무것도 넘기지 않는다(글자뿐인 ANTI)
// - 그 밖: 누르면 처음으로 가는 부품을 넘긴다
// 이 파일은 답 저장소를 보지 않는다.

export function AppHeader({ brand }: { brand?: React.ReactNode }) {
  return (
    <header className="flex min-h-[2.88rem] flex-col justify-center bg-cta px-[0.8rem] py-[0.1rem] min-[601px]:rounded-lg">
      <div className="text-[1.16rem] leading-tight font-extrabold tracking-[0.06em] text-ink">
        {brand ?? text.appName}
      </div>
      <p className="text-xs leading-snug font-semibold whitespace-nowrap text-ink">
        {text.appSub}
      </p>
    </header>
  );
}
