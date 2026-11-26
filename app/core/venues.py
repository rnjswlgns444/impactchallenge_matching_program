"""기관의 위치(좌표). 길찾기 단추와 지도가 쓴다. 자료는 app/anti_map/venues.json이다(팀원이 만든 파일, 11/26에 가져옴).

파일 모양: {프로그램 id: [{name, address, lat, lon, addressSource, geoSource, note}, ...]}
  - 찾아가는 곳이 없는 프로그램(전화·온라인)은 빈 목록이다. 한 프로그램에 곳이 여럿일 수 있다(체육시설 등).
  - 좌표의 출처(geoSource)는 대부분 민간 주소 사이트다. 길을 안내하는 데만 쓰고, 주소 글은 정보표의 '장소'를 쓴다.
  - note는 화면에 쓰지 않는다(다른 기관의 메모가 잘못 복사된 곳이 있다).
"""
from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import quote

VENUE_FILE = Path(__file__).resolve().parents[1] / "anti_map" / "venues.json"
ROUTE_URL = "https://map.kakao.com/link/to/{name},{lat},{lon}"     # 카카오맵에서 그 곳까지의 길찾기를 연다


def load(path: Path | None = None) -> dict[str, list[dict]]:
    """{프로그램 id: 좌표가 있는 곳의 목록}. 파일이 없거나 읽지 못하면 빈 사전이다(길찾기 단추만 안 나온다)."""
    try:
        raw = json.loads((path or VENUE_FILE).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}
    if not isinstance(raw, dict):
        return {}
    found: dict[str, list[dict]] = {}
    for program_id, places in raw.items():
        good = [place for place in places if isinstance(place, dict) and place.get("name")
                and isinstance(place.get("lat"), (int, float)) and isinstance(place.get("lon"), (int, float))]
        if good:
            found[program_id] = good
    return found


def route_url(venue: dict) -> str:
    """그 곳까지의 카카오맵 길찾기 주소."""
    return ROUTE_URL.format(name=quote(str(venue["name"]), safe=""), lat=venue["lat"], lon=venue["lon"])
