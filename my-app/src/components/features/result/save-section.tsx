"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { characterSrc, type CharacterGender } from "@/components/common/character";
import { Notice } from "@/components/common/notice";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { fill, text } from "@/content/text";
import { now } from "@/core/clock";
import type { TypeInfo } from "@/data/types";
import { drawCard } from "@/lib/card-canvas";
import { cn } from "@/lib/utils";

// '내 결과 저장하기': 누르면 그 자리에 결과 사진을 그려 보여 주고, 저장·보내기 단추를 둔다.
// 사진은 기기 안에서 그린다. 서버로 보내지 않고 어디에도 남기지 않는다(접거나 화면을 떠나면 버린다).
// 사진에 넘기는 것은 글자와 그림 주소뿐이다. 답(answers)이나 프로그램 행을 통째로 넘기지 않는다.
// 사는 동으로 붙인 딱지와 AI 별은 사진에 넣지 않는다.

const FILE_NAME = "anti-result.png";

type Picture = { url: string; file: File };

export function SaveSection({
  type,
  gender,
  heading,
  places,
}: {
  type: TypeInfo;
  gender: CharacterGender | null; // 캐릭터 그림을 고르는 데만 쓴다
  heading: string; // 사진 속 기관 구역의 소제목
  places: { name: string; sub: string }[]; // 화면에 놓인 기관의 이름과 하는 일(앞의 3곳)
}) {
  const [open, setOpen] = useState(false);
  const [picture, setPicture] = useState<Picture | null>(null);
  const [failed, setFailed] = useState(false); // 사진을 그리지 못했다
  const [sendFailed, setSendFailed] = useState(false); // 보내기 창을 띄우지 못했다
  const latest = useRef<Picture | null>(null);
  const turn = useRef(0); // 늦게 끝난 그리기가 화면을 덮지 않게 한다

  const discard = () => {
    turn.current += 1;
    if (latest.current) URL.revokeObjectURL(latest.current.url);
    latest.current = null;
    setOpen(false);
    setPicture(null);
    setFailed(false);
    setSendFailed(false);
  };

  // 화면을 오가도 상태가 남으므로, 이 화면이 숨겨질 때 사진을 버리고 접어 둔다.
  useLayoutEffect(() => discard, []);

  const draw = async () => {
    const mine = (turn.current += 1);
    setOpen(true);
    setFailed(false);
    try {
      const [, month, day] = now().day.split("-");
      const blob = await drawCard(
        {
          appName: text.appName,
          appSub: text.appSub,
          typeName: type.name,
          statement: type.statement,
          feature: type.feature,
          area: type.area,
          hasArt: gender !== null,
          heading,
          places,
          footer: fill(text.cardFooter, { date: `${Number(month)}월 ${Number(day)}일` }),
        },
        gender ? characterSrc(type.id, gender) : null
      );
      if (mine !== turn.current) return;
      const next = {
        url: URL.createObjectURL(blob),
        file: new File([blob], FILE_NAME, { type: "image/png" }),
      };
      latest.current = next;
      setPicture(next);
    } catch {
      if (mine === turn.current) setFailed(true);
    }
  };

  const send = async () => {
    if (!picture) return;
    const data = { files: [picture.file] };
    if (!navigator.canShare?.(data)) {
      setSendFailed(true);
      return;
    }
    try {
      setSendFailed(false);
      await navigator.share(data);
    } catch (error) {
      // 본인이 창을 닫은 것은 실패가 아니다
      if (!(error instanceof DOMException && error.name === "AbortError")) setSendFailed(true);
    }
  };

  return (
    <section className="flex flex-col gap-[0.6rem]">
      <Button variant="cta" size="touch" aria-expanded={open} onClick={open ? discard : draw}>
        {text.saveHeading}
      </Button>
      {open && failed ? <Notice kind="fail" live>{text.errorBody}</Notice> : null}
      {open && !failed && !picture ? (
        <p role="status" className="flex items-center justify-center gap-[0.4rem] py-[1rem] text-muted-foreground">
          <Spinner />
          {text.loading}
        </p>
      ) : null}
      {open && picture ? (
        <>
          <Notice kind="info">{text.saveHelp}</Notice>
          {/* 기기 안에서 만든 사진이라 next/image를 쓰지 않는다. 길게 눌러 저장할 수 있다 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={picture.url}
            alt={text.saveImageAlt}
            width={1080}
            height={1350}
            className="h-auto w-full rounded-xl border border-edge shadow-card"
          />
          <a href={picture.url} download={FILE_NAME} className={cn(buttonVariants({ variant: "outline", size: "touch" }), "font-bold")}>
            {text.saveButton}
          </a>
          <Button variant="outline" size="touch" onClick={send}>
            {text.saveSendButton}
          </Button>
          {sendFailed ? <Notice live>{text.saveSendFailed}</Notice> : null}
        </>
      ) : null}
    </section>
  );
}
