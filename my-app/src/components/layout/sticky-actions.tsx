// 화면 아래에 붙어 따라오는 단추 자리. 설문의 '다음' 단추에 쓴다.
// 화면 높이가 아주 낮으면(540px 이하) 붙이지 않는다(내용을 가리지 않게).
// 둘레의 바탕색 띠는 뒤의 내용과 단추를 떼어 놓는다.

export function StickyActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-[0.48rem] z-10 flex flex-col gap-[0.45rem] rounded-lg shadow-[0_0_0_4px_var(--background)] [@media(max-height:540px)]:static">
      {children}
    </div>
  );
}
