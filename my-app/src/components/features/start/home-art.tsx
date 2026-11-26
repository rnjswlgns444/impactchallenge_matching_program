import { Character, type CharacterGender } from "@/components/common/character";

// 시작 화면의 그림 상자. 유형 캐릭터 세 명을 나란히 세운다(팀 포스터와 같은 세 명).
// 꾸밈 그림이라 설명 글(alt)을 비운다. 이름표는 붙이지 않는다(11/24 결정).
// 노란 바탕·바닥·해는 globals.css의 .home-art가 그린다. 셋이 아니면 그 CSS의 칸 수도 함께 고친다.

const HOME_CHARACTERS: [string, CharacterGender][] = [
  ["T01", "male"],
  ["T05", "female"],
  ["T12", "female"],
];

export function HomeArt() {
  return (
    <div className="home-art" aria-hidden="true">
      {HOME_CHARACTERS.map(([typeId, gender]) => (
        <Character key={typeId} typeId={typeId} gender={gender} sizes="(max-width: 672px) 31vw, 210px" eager />
      ))}
    </div>
  );
}
