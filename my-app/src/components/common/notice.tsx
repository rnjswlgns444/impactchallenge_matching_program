import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// 늘 보이는 안내 상자. kind: warn(주의, 기본) / fail(실패) / info(정보)
// 열 때마다 읽어 주지 않게 role="note"로 둔다. 방금 생긴 일을 알릴 때만 live를 켠다.

const KINDS = {
  warn: "border-0 border-l-[0.2rem] border-l-clay bg-[#FBEEDE]",
  fail: "border-0 border-l-[0.2rem] border-l-destructive bg-[#F9E8E2]",
  info: "border-[#B8D0C2] bg-aqua",
};

export function Notice({
  kind = "warn",
  live = false,
  className,
  children,
}: {
  kind?: keyof typeof KINDS;
  live?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Alert
      role={live ? "status" : "note"}
      className={cn("px-[0.8rem] py-[0.68rem]", KINDS[kind], className)}
    >
      <AlertDescription className="text-[0.95rem] leading-[1.6] text-pretty text-foreground">
        {children}
      </AlertDescription>
    </Alert>
  );
}
