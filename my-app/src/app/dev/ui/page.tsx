import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PhoneIcon } from "lucide-react";

import { LinkButton } from "@/components/common/link-button";
import { ScreenSkeleton } from "@/components/common/screen-skeleton";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { Screen } from "@/components/layout/screen";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = { title: "부품 모아 보기", robots: { index: false } };

// 개발용 화면. 넣은 부품이 우리 크기·색으로 보이는지 한곳에서 본다.
// 실제 배포 주소에서는 없는 주소로 처리한다(미리 보기 주소에서는 열린다).
// 이 화면의 글은 견본이라 content/text.ts에 두지 않는다.

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-[0.6rem] border-t pt-[0.8rem]">
      <h2 className="text-base font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function DevUiPage() {
  if (process.env.VERCEL_ENV === "production") notFound();

  return (
    <AppShell header={<AppHeader />}>
      <Screen title="부품 모아 보기">
        <p>본문 글씨는 20px, 줄 간격은 1.62예요. 한글은 낱말 단위로 줄을 바꿔요.</p>
        <p className="text-sm text-muted-foreground">작은 글은 18px이고 흐린 색이에요.</p>

        <Group title="단추">
          <Button variant="cta" size="touch">
            노란 주 단추
          </Button>
          <Button variant="outline" size="touch">
            흰 바탕 보조 단추
          </Button>
          <Button variant="outline" size="touch">
            글이 길어서 두 줄로 넘어가는 단추는 높이가 늘어나고 글이 잘리지 않아요
          </Button>
          <Button variant="cta" size="touch" disabled>
            꺼진 단추
          </Button>
          <Button variant="link" size="touch" className="w-auto self-start">
            ← 글 단추
          </Button>
        </Group>

        <Group title="단추 모양 링크">
          <LinkButton href="/" variant="cta">
            앱 안의 화면으로
          </LinkButton>
          <LinkButton href="tel:031-000-0000">
            <PhoneIcon aria-hidden /> 전화 문의
          </LinkButton>
          <LinkButton href="https://www.ansan.go.kr">새 창으로 여는 링크</LinkButton>
        </Group>

        <Group title="카드와 딱지">
          <Card>
            <CardHeader>
              <Badge>나의 유형</Badge>
              <CardTitle>카드 제목</CardTitle>
            </CardHeader>
            <CardContent>카드 안의 글도 본문 크기예요. 모서리는 18px이에요.</CardContent>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Badge>기본</Badge>
            <Badge variant="secondary">물빛</Badge>
            <Badge variant="outline">테두리</Badge>
          </div>
        </Group>

        <Group title="안내 상자">
          <Alert role="note">
            <AlertTitle>안내</AlertTitle>
            <AlertDescription>늘 보이는 안내는 role을 note로 넘겨요.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>실패</AlertTitle>
            <AlertDescription>잠시 뒤에 다시 눌러 주세요.</AlertDescription>
          </Alert>
        </Group>

        <Group title="기다림">
          <p className="flex items-center gap-2">
            <Spinner className="size-5" /> 찾는 중이에요
          </p>
          <ScreenSkeleton />
        </Group>
      </Screen>
    </AppShell>
  );
}
