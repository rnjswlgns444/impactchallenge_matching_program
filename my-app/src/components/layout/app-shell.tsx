// 모든 화면의 바깥 틀. 가운데 한 줄(최대 672px)에 머리띠와 본문을 둔다.
// 좁은 화면(600px 이하)에서는 머리띠가 양 끝까지 닿는다.

export function AppShell({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[33.6rem] flex-1 flex-col min-[601px]:px-[0.8rem] min-[601px]:pt-[0.8rem]">
      {header}
      {children}
    </div>
  );
}
