// 유의사항: 화면 맨 아래의 작은 회색 글(10px, 11/25에 정한 크기). 상자·굵은 글씨·색 바탕 없이 한 줄씩 보여 준다.

export function FinePrint({ title, items }: { title?: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-[1.4rem] text-[0.5rem] leading-[1.6] text-muted-foreground">
      {title ? <p>{title}</p> : null}
      <ul>
        {items.map((item) => (
          <li key={item} className="pl-[0.8em] -indent-[0.8em]">
            · {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
