import Link from "next/link";
import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 단추처럼 보이는 링크. Base UI의 Button은 링크로 쓰지 않으므로 이 부품을 쓴다.
// - "/"로 시작하면 앱 안의 화면으로 간다
// - "tel:"은 전화를 건다
// - 그 밖(https://…)은 새 창으로 연다

type Props = {
  href: string;
  className?: string;
  children: React.ReactNode;
} & VariantProps<typeof buttonVariants>;

export function LinkButton({
  href,
  variant = "outline",
  size = "touch",
  className,
  children,
}: Props) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("tel:")) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {children}
    </a>
  );
}
