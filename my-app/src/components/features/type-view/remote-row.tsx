import { BuildingCard, type Building } from "./building";

// 지도에 세울 자리(좌표)가 없는 추천 기관을 지도 아래에 건물로 나란히 보여 준다.
// 대부분 전화·온라인으로 만나는 곳이다. heading이 없으면 제목 없이 건물만 놓는다(지도가 없을 때).
export function RemoteRow({ buildings, heading }: { buildings: Building[]; heading?: string }) {
  if (buildings.length === 0) return null;
  return (
    <div className="flex flex-col gap-[0.4rem]">
      {heading ? <h3 className="text-[0.85rem] leading-[1.5] font-bold text-foreground">{heading}</h3> : null}
      <div className="grid grid-cols-2 justify-items-center gap-x-[0.9rem] gap-y-[0.7rem] px-[0.4rem] pt-[0.2rem]">
        {buildings.map((building) => (
          <BuildingCard key={building.key} building={building} />
        ))}
      </div>
    </div>
  );
}
