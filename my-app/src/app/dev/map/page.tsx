import { notFound } from "next/navigation";
import type { Metadata } from "next";

import type { OptionItem } from "@/components/features/type-view/map-options";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { Screen } from "@/components/layout/screen";
import { NEAR_KM, nearStop, routeStops } from "@/core/geo";
import { SHOWN_PLACES, noVisit, placeName } from "@/core/places";
import { appData, getType } from "@/data";
import { placeHref } from "@/lib/routes";

import { MapCompare, type MapCase } from "./map-compare";

export const metadata: Metadata = { title: "기관 지도 방안 비교", robots: { index: false } };

// 개발용 화면. 기관 지도를 작은 핀으로 그리는 네 가지 방안을 실제 기관 자료로 견준다(11/27).
// 실제 배포 주소에서는 없는 주소로 처리한다. 방안을 고르면 이 화면은 지운다.
// 후보 거르기를 거치지 않은 견본이다(유형에 붙은 안내 중인 기관을 정보표 순서대로 세 곳).

function caseOf(title: string, typeId: string, dongName: string | null, starFirst = false): MapCase {
  const type = getType(typeId)!;
  const dong = appData.dongs.find((one) => one.name === dongName) ?? null;
  const programs = appData.programs.filter(
    (row) => row["매칭가능"] === "Y" && row["종류"] !== "목록" && row["유형태그"].split("|").includes(typeId)
  );
  const { stops } = routeStops(programs, appData.venues, dong, SHOWN_PLACES);
  const near = nearStop(stops, NEAR_KM);
  const items = stops.map((stop, index): OptionItem => {
    const program = stop.program;
    const remote = !stop.venue && noVisit(program["장소"] || program["진행방식"]);
    return {
      key: program.id,
      href: placeHref(program.id, typeId),
      number: stop.number ?? index + 1,
      word: program["핀그림"],
      name: placeName(program),
      work: program["프로그램명"],
      note: [program["핀그림"], remote ? "전화·온라인으로" : ""].filter(Boolean).join(" · "),
      star: starFirst && index === 0,
      near: stop === near,
      point: stop.venue ? { lat: stop.venue.lat, lon: stop.venue.lon } : null,
    };
  });
  return { title, heading: `${type.name}에 맞는 기관`, homeName: dong?.name ?? null, items };
}

export default function DevMapPage() {
  if (process.env.VERCEL_ENV === "production") notFound();

  const cases = [
    caseOf("별·가까운 곳", "T05", "고잔동", true),
    caseOf("한데 몰린 3곳", "T01", null),
    caseOf("건강(보건소)", "T12", "초지동"),
    caseOf("지도 1곳 + 전화", "T09", "대부동"),
  ];
  return (
    <AppShell header={<AppHeader />}>
      <Screen title="기관 지도 방안 비교">
        <MapCompare cases={cases} />
      </Screen>
    </AppShell>
  );
}
