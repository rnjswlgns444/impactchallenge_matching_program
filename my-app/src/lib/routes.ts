// 화면 주소를 만든다. 주소를 글자로 여러 곳에 적지 않게 한곳에 모은다.
//
// 기관 세부와 다른 곳 목록은 두 길로 온다.
// - 설문 결과에서: /place/JOB01, /places
// - 둘러보기의 유형 소개에서: /place/JOB01?type=T05, /places?type=T05 (type = 보고 있던 유형)
// 다른 곳 목록에서 기관을 열었으면 from=places를 붙인다(돌아가기 단추가 목록으로 간다).

function withQuery(path: string, query: Record<string, string | null | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const tail = params.toString();
  return tail ? `${path}?${tail}` : path;
}

// browseType: 둘러보기에서 보고 있는 유형 id. 설문 결과에서 왔으면 null
export function placeHref(programId: string, browseType: string | null, fromList = false): string {
  return withQuery(`/place/${programId}`, { type: browseType, from: fromList ? "places" : null });
}

// 기관의 '집에서 먼저 체험하기' 화면. 꼬리는 기관 화면과 같다(돌아갈 때 그대로 넘긴다)
export function tasteHref(programId: string, browseType: string | null, fromList = false): string {
  return withQuery(`/place/${programId}/taste`, { type: browseType, from: fromList ? "places" : null });
}

export function placesHref(browseType: string | null): string {
  return withQuery("/places", { type: browseType });
}

// 유형 하나를 보는 화면: 설문 결과 또는 유형 소개
export function typeHomeHref(browseType: string | null): string {
  return browseType ? `/type/${browseType}` : "/result";
}

export function surveyEditHref(questionId: string): string {
  return withQuery("/survey", { edit: questionId });
}
