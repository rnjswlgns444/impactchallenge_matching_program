import { cn } from "@/lib/utils";

// 화면 하나의 본문 틀. 제목(h1)과 내용을 세로로 쌓는다.

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
        "flex flex-1 flex-col gap-[0.6rem] px-[0.8rem] pt-[0.9rem] pb-[2.4rem] min-[601px]:px-0",
        className
      )}
    >
      {title ? (
        <h1 className="text-[clamp(1.24rem,4.5vw,1.6rem)] leading-[1.4] font-bold">
          {title}
        </h1>
      ) : null}
      {children}
    </main>
  );
}
