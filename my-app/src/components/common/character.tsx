import Image from "next/image";

import { cn } from "@/lib/utils";

// 유형 캐릭터 그림. 파일은 public/characters/t01-female.webp 꼴이다(유형 12개 × 성별 2, 800×800).
// 원본은 app/ui/assets/type-characters/이다. 그림을 바꾸면 두 곳을 함께 바꾼다.

export type CharacterGender = "female" | "male";

// 성별 답(P_GENDER의 선택지 id)을 그림의 성별로 바꾼다. 답이 없으면 null(그림 없이 그린다)
export function characterGender(answer: unknown): CharacterGender | null {
  return answer === "female" || answer === "male" ? answer : null;
}

// 그림 파일의 주소. 결과 사진을 그릴 때도 쓴다
export function characterSrc(typeId: string, gender: CharacterGender): string {
  return `/characters/${typeId.toLowerCase()}-${gender}.webp`;
}

export function Character({
  typeId,
  gender,
  alt = "",
  sizes,
  eager = false,
  className,
}: {
  typeId: string;
  gender: CharacterGender;
  alt?: string; // 꾸밈 그림이면 비워 둔다
  sizes: string; // 화면에 보이는 폭. 예) "200px", "30vw"
  eager?: boolean; // 화면 맨 위에 있어 바로 보여야 하는 그림
  className?: string;
}) {
  return (
    <Image
      src={characterSrc(typeId, gender)}
      alt={alt}
      width={800}
      height={800}
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      className={cn("h-auto", className)}
    />
  );
}
