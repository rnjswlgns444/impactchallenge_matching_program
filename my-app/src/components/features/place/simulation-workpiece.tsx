import type { SimAnswer, Simulation } from "@/core/simulation";

type WorkpieceProps = {
  simulation: Simulation;
  answers: readonly SimAnswer[];
  page: number;
};

const ink = "var(--color-ink)";
const teal = "var(--color-teal)";
const clay = "var(--color-clay)";
const sun = "var(--poster-sun, var(--color-cta))";
const cream = "var(--poster-cloud, var(--color-off))";
const pink = "color-mix(in srgb, var(--color-clay) 40%, white)";
const reveal = "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200";

function picked({ simulation, answers }: WorkpieceProps, index: number): string[] {
  const step = simulation.steps[index];
  if (step?.mode !== "pick" && step?.mode !== "pack") return [];
  return (answers[index]?.values ?? []).map(id => step.options[id]?.label).filter(Boolean);
}

const gardenSlots = [
  [91, 57], [153, 29], [192, 65], [44, 43], [232, 31],
  [168, 54], [123, 40], [66, 72], [209, 43], [114, 74],
];

function Garden(props: WorkpieceProps) {
  const round = props.answers[0]?.values[0] === 1;
  const [yellow, rose, leaves] = props.page > 0 ? props.answers[1]?.values ?? [] : [];
  const [name] = picked(props, 2);
  const flowers = [
    ...Array.from({ length: yellow ?? 0 }, (_, n) => ({ slot: n, hue: "yellow", color: sun })),
    ...Array.from({ length: rose ?? 0 }, (_, n) => ({ slot: n + 5, hue: "pink", color: pink })),
  ];
  return <div className="grid w-full min-w-0 place-items-center">
    <svg viewBox="0 0 280 146" className="w-full max-w-[17rem]" fill="none">
      <ellipse cx="140" cy="132" rx={round ? 72 : 112} ry="7" fill="var(--color-edge)" />
      <g stroke={ink} strokeWidth="2.4" strokeLinejoin="round">
        <path d={round ? "M76 94 Q140 81 204 94 Q196 133 140 136 Q83 131 76 94Z" : "M28 96 L245 96 L233 126 Q132 141 42 126Z"} fill={clay} />
        <ellipse cx={round ? 140 : 136} cy="95" rx={round ? 65 : 110} ry={round ? 14 : 11} fill={cream} />
      </g>
      {flowers.map(({slot, hue, color}) => {
        const [sx, y] = gardenSlots[slot];
        const x = round ? 140 + (sx - 140) * 0.66 : sx;
        return <g key={slot} data-piece-flower={hue} className={reveal}>
          <path d={`M${x} ${y+3} Q${x+5} ${(95+y)/2} ${x+2} 95`} stroke={teal} strokeWidth="2.6" fill="none" />
          <g transform={`translate(${x} ${y})`} stroke={ink} strokeWidth="1.25">
            {[0,72,144,216,288].map(angle => <ellipse key={angle} cx="0" cy="-7" rx="5.4" ry="7.6" transform={`rotate(${angle})`} fill={color} />)}
            <circle r="4.5" fill={clay} />
          </g>
        </g>;
      })}
      {Array.from({length: leaves ?? 0}, (_, index) => {
        const x = (round ? 105 : 61) + index * (round ? 17 : 37);
        return <g key={index} data-piece-leaf="" transform={`translate(${x} 96) scale(${index % 2 ? -1 : 1} 1)`}>
          <path d="M0 0 Q-2 -17 17 -23 Q17 -8 0 0Z" fill={teal} stroke={ink} strokeWidth="1.3" />
          <path d="M2 -3 L12 -16" stroke="var(--color-aqua)" strokeWidth="1.2" />
        </g>;
      })}
    </svg>
    {name && <p className="max-w-full break-words rounded-md border-2 border-clay bg-card px-[0.65rem] text-center text-[1rem] font-bold text-clay">{name}</p>}
  </div>;
}

function KimchiStation({ simulation, answers, page }: WorkpieceProps) {
  const step = simulation.steps[1];
  if (step.mode !== "quantity") return null;
  const values = page < 1 ? [0, 0] : answers[1].values;
  return <div className="grid grid-cols-2 gap-[0.35rem]">
    {step.items.map((item, basket) => <div key={item.label} className="grid min-w-0 justify-items-center gap-[0.15rem]">
      <svg viewBox="0 0 140 96" className="w-full max-w-[8rem]" fill="none" stroke={ink} strokeWidth="2" strokeLinejoin="round">
        <ellipse cx="70" cy="86" rx="61" ry="5" fill="var(--color-edge)" stroke="none" />
        <path d="M9 56 L22 38 H119 L132 55 L125 83 H15Z" fill={cream} />
        <path d="M10 57 L22 38 H119 L131 57Z" fill="var(--color-line)" />
        {Array.from({length: values[basket]}, (_, n) => {
          const x=21+(n%3)*31+(n>2 ? 4 : 0), y=n<3 ? 43 : 29;
          return <g key={n} data-piece-tub={basket} transform={`translate(${x} ${y})`}>
            <path d="M1 4H26L24 21H4Z" fill={pink} />
            <path d="M3 10Q11 6 15 12T25 11L24 18H5Z" fill={clay} stroke="none" />
            <rect x="0" y="0" width="28" height="6" rx="2.5" fill={teal} />
            <path d="M7 8V15" opacity=".75" stroke="white" />
          </g>;
        })}
        <path d="M9 61H132L125 83H15Z" fill={cream} />
        <path d="M12 62H128M18 75H123M35 64L37 79M55 64L56 79M79 64L78 79M102 64L101 79" stroke={clay} strokeWidth="1.5" />
      </svg>
      <p className="text-center text-[1rem] font-bold leading-snug text-ink">{item.label}<span className="block text-teal">{values[basket]}{item.unit}</span></p>
    </div>)}
  </div>;
}

function PoemMug(props: WorkpieceProps) {
  const focus = props.answers[0].values[0];
  const [first] = picked(props, 0), [second] = picked(props, 1), [title] = picked(props, 2);
  return <div className="grid min-w-0 justify-items-center text-center">
    <svg data-piece-mug="" viewBox="0 0 210 106" className="w-full max-w-[10rem]" fill="none" stroke={ink} strokeWidth="2.6" strokeLinejoin="round">
      <ellipse cx="98" cy="93" rx="70" ry="8" fill={cream} />
      <path d="M128 29 Q172 17 165 53 Q160 69 135 70 L135 60 Q157 55 155 42 Q153 35 135 39Z" fill={focus === 0 ? sun : "white"} />
      <path d="M44 24 Q84 15 135 24 L129 67 Q125 85 106 88 H74 Q56 87 50 69Z" fill="white" />
      <path d="M51 55 Q75 62 90 56 T132 54 L130 63 Q111 58 93 65 T54 64Z" fill="var(--color-aqua)" stroke="none" />
      <path d="M66 85 Q92 91 117 84 L112 92 Q91 96 71 91Z" fill={focus === 1 ? sun : "var(--color-aqua)"} />
      <ellipse cx="89" cy="25" rx="45" ry="9" fill={focus === 2 ? sun : cream} />
      <ellipse cx="89" cy="25" rx="34" ry="4" fill={clay} stroke="none" />
    </svg>
    <div className="min-w-0 max-w-full border-b border-t border-dashed border-line px-[0.3rem] py-[0.35rem]">
      {title && <p className="mb-[0.25rem] text-[1.1rem] font-bold text-teal">{title}</p>}
      {first && <p className="text-[1rem] leading-snug">{first}</p>}
      {second && <p className="text-[1rem] leading-snug">{second}</p>}
    </div>
  </div>;
}

function MenuBoard(props: WorkpieceProps) {
  const simulation = props.simulation;
  const sorting = simulation.steps[0];
  if (sorting.mode !== "sort") return null;
  const sorted = sorting.items.slice(0, props.answers[0].values.length);
  const [headline] = picked(props, 1);
  const badges = picked(props, 2);
  return <div data-piece-menu="" className="mx-auto w-full min-w-0 max-w-[19rem] overflow-hidden rounded-md border-[0.2rem] border-clay bg-ink text-center text-white shadow-card">
    <div className="flex h-[0.65rem]" aria-hidden="true">{Array.from({length: 9}, (_, i) => <span key={i} className={`flex-1 rounded-b-sm ${i % 2 ? "bg-card" : "bg-cta"}`} />)}</div>
    <div className="grid place-items-center gap-[0.3rem] p-[0.45rem]">
      <svg viewBox="0 0 110 55" className="h-[2.5rem]" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 25H97Q93 43 66 49H45Q25 45 14 25Z" fill={teal} />
        <ellipse cx="55" cy="25" rx="42" ry="9" fill={cream} />
        <path d="M30 22Q38 15 45 22M57 25Q66 17 74 23M43 27L51 29M81 21L90 14" stroke={clay} />
      </svg>
      <p className="max-w-full break-words text-[1rem] font-bold leading-snug">{headline ?? simulation.artifact}</p>
      {props.page === 0 && sorted.length > 0 && <p className="text-[1rem] leading-snug text-aqua">{sorted.map(i => i.label).join(" · ")}</p>}
      {badges.length > 0 && <div className="flex flex-wrap justify-center gap-[0.25rem]">{badges.map(label => <span key={label} className="rounded-sm bg-cta px-[0.3rem] text-[1rem] font-bold text-ink">{label}</span>)}</div>}
    </div>
  </div>;
}

function BookShelf(props: WorkpieceProps) {
  const titles = picked(props, 0), [name] = picked(props, 1), [note] = picked(props, 2);
  return <div className="mx-auto w-full max-w-[18rem]">
    <div className="flex min-h-[4.4rem] flex-col-reverse items-start gap-[0.12rem] border-b-[0.4rem] border-clay px-[0.4rem]">
      {titles.map((book, i) => <div key={book} data-piece-book="" className={`max-w-full rounded-sm border-l-[0.35rem] border-l-cta py-[0.18rem] pr-[0.65rem] pl-[0.5rem] text-[1rem] font-bold leading-snug text-white shadow-card ${i % 2 ? "ml-[0.1rem] bg-clay" : "bg-teal"}`}>{book}</div>)}
    </div>
    {name && <p className="mx-auto w-fit max-w-full rounded-b-md border border-line bg-card px-[0.45rem] text-center text-[1rem] font-bold text-ink">{name}</p>}
    {note && <p className="mt-[0.4rem] break-words text-center text-[1rem] text-teal">{note}</p>}
  </div>;
}

export function SimulationWorkpiece(props: WorkpieceProps) {
  if (props.page < 0) return null;
  let work;
  switch (props.simulation.id) {
    case "H22": work = <Garden {...props} />; break;
    case "JOB08": work = <KimchiStation {...props} />; break;
    case "L06_PIUM_DIRECTORY": work = <PoemMug {...props} />; break;
    case "JOB03": work = <MenuBoard {...props} />; break;
    case "C_BOOK": work = <BookShelf {...props} />; break;
    default: return null;
  }
  // 조작 단추와 완성표가 같은 정보를 읽어 주므로 이 부분은 그림으로만 보여 준다.
  return <div aria-hidden="true" data-sim-workpiece={props.simulation.id}
    className="w-full min-w-0 overflow-hidden rounded-xl border border-edge bg-background p-[0.45rem]">
    {work}
  </div>;
}
