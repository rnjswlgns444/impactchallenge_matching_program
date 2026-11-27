import { cn } from "@/lib/utils";

// 화면 하나의 본문 틀. 제목(h1)과 내용을 세로로 쌓는다.
// 화면이 뜰 때 짧게 떠오른다(globals.css의 .rise).

export function Screen({
  title,
  className,
  children,
}: {
  title?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <main
      className={cn(
        "rise flex flex-1 flex-col gap-[0.7rem] px-[1rem] pt-[1rem] pb-[2.4rem] min-[601px]:px-0",
        className
      )}
    >
      {title ? (
        <h1 className="text-[clamp(1.3rem,5vw,1.6rem)] leading-[1.35] font-extrabold tracking-[-0.02em]">
          {title}
        </h1>
      ) : null}
      {children}
    </main>
  );
}
