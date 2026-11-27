"use client";

import { createContext, useContext, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Apple, BookMarked, BookOpen, BriefcaseBusiness, CalendarDays, Camera, Check, ClipboardList,
  Clock3, Coffee, CookingPot, Drum, FileText, Flower2, FolderOpen, Footprints, Hand,
  HeartHandshake, Leaf, MapPin, MessageCircle, Monitor, Music2, NotebookPen, Package,
  Pencil, Receipt, Salad, Search, ShoppingBag, Soup, Sprout, Store, Tag, Utensils, Waves,
  type LucideIcon,
} from "lucide-react";

import { simUi } from "@/content/text";
import type { Simulation, SimAnswer, SimStep } from "@/core/simulation";
import styles from "./simulation-stage.module.css";

type Station = {
  tile: number;
  shape: "folio" | "terminal" | "shelf" | "tray" | "field" | "market" | "music";
  tools: readonly LucideIcon[];
  point: readonly [number, number];
};

const stations: Record<string, Station> = {
  JOB01: { tile: 0, shape: "folio", tools: [BriefcaseBusiness, ClipboardList, FolderOpen], point: [56, 62] },
  JOB02: { tile: 0, shape: "folio", tools: [NotebookPen, Search, FileText], point: [27, 61] },
  JOB03: { tile: 1, shape: "market", tools: [Receipt, Tag, Coffee], point: [57, 52] },
  JOB07: { tile: 0, shape: "folio", tools: [CalendarDays, Clock3, Pencil], point: [55, 62] },
  JOB08: { tile: 3, shape: "tray", tools: [Package, Leaf, ClipboardList], point: [29, 59] },
  JOB11: { tile: 1, shape: "terminal", tools: [Store, Search, ClipboardList], point: [61, 55] },
  L06_PIUM_DIRECTORY: { tile: 2, shape: "shelf", tools: [Coffee, Camera, Pencil], point: [15, 73] },
  L15: { tile: 2, shape: "shelf", tools: [BookOpen, Pencil, MessageCircle], point: [35, 68] },
  L16: { tile: 2, shape: "music", tools: [Drum, Music2, Hand], point: [42, 44] },
  C_BOOK: { tile: 2, shape: "shelf", tools: [BookMarked, BookOpen, NotebookPen], point: [86, 66] },
  C_ECO: { tile: 4, shape: "field", tools: [Footprints, Waves, Leaf], point: [60, 66] },
  L08_MIND_COUNSELING: { tile: 5, shape: "folio", tools: [FileText, MessageCircle, NotebookPen], point: [52, 64] },
  L08_FAMILY_COUNSELING: { tile: 5, shape: "folio", tools: [HeartHandshake, MessageCircle, ClipboardList], point: [50, 65] },
  H10: { tile: 3, shape: "tray", tools: [Clock3, BookOpen, Utensils], point: [34, 58] },
  H13: { tile: 3, shape: "tray", tools: [Soup, CookingPot, Salad], point: [24, 61] },
  H20_INFO: { tile: 3, shape: "tray", tools: [Utensils, Package, ClipboardList], point: [24, 61] },
  H22: { tile: 4, shape: "field", tools: [Sprout, Flower2, Leaf], point: [23, 60] },
  H23: { tile: 3, shape: "market", tools: [Tag, Receipt, ShoppingBag], point: [47, 61] },
  H24: { tile: 5, shape: "folio", tools: [Clock3, Footprints, MessageCircle], point: [57, 65] },
  H25: { tile: 0, shape: "terminal", tools: [Search, MapPin, Monitor], point: [54, 63] },
};

const Port = createContext<HTMLDivElement | null>(null);
const HandPort = createContext<HTMLDivElement | null>(null);
const Setting = createContext<Station>(stations.JOB01);
const guides = ["t01-female", "t02-male", "t05-female", "t09-male", "t07-female", "t04-male"] as const;

/** 선택 부품을 장면 안으로 옮긴다. 같은 단추를 복사하거나 입력 이벤트를 전달하지 않는다. */
export function SceneTargets({ children }: { children: ReactNode }) {
  const container = useContext(Port);
  return container ? createPortal(children, container) : <>{children}</>;
}

export function SceneHand({ children }: { children: ReactNode }) {
  const container = useContext(HandPort);
  return container ? createPortal(children, container) : <>{children}</>;
}

function itemIcon(label: string): LucideIcon | undefined {
  if (/간식|과일/.test(label)) return Apple;
  if (/채소|채식|배추/.test(label)) return Salad;
  if (/국물|^국$|밥/.test(label)) return Soup;
  if (/두부|조리|식사/.test(label)) return CookingPot;
  if (/박자|악보|연주/.test(label)) return Music2;
  if (/장구|북소리/.test(label)) return Drum;
  if (/서가|책방|책장|독서/.test(label)) return BookOpen;
  if (/손잡이|찻잔|온기/.test(label)) return Coffee;
  if (/꽃|모종/.test(label)) return Flower2;
  if (/풀잎|잎사귀|새싹/.test(label)) return Sprout;
  if (/발자국|흔적/.test(label)) return Footprints;
  if (/수면|물결/.test(label)) return Waves;
  if (/가격|메뉴|식품 표시/.test(label)) return Tag;
  if (/서류|이력서/.test(label)) return FileText;
  return undefined;
}

export function SceneObject({ label, index = 0, selected = false }: { label: string; index?: number; selected?: boolean }) {
  const station = useContext(Setting);
  const Icon = itemIcon(label) ?? station.tools[index % station.tools.length];
  return <span aria-hidden="true" className={styles.object} data-paint={index % 3}>
    <Icon focusable="false" />
    {selected && <span className={styles.tick}><Check focusable="false" /></span>}
  </span>;
}

type StageProps = { simulation: Simulation; step?: SimStep; answer?: SimAnswer; children: ReactNode };

export function SimulationStage({ simulation, step, answer, children }: StageProps) {
  const station = stations[simulation.id] ?? stations.JOB01;
  const [bench, setBench] = useState<HTMLDivElement | null>(null);
  const [hand, setHand] = useState<HTMLDivElement | null>(null);
  const content = useRef<HTMLDivElement>(null);
  const Icon = station.tools[0];
  const sceneStyle = {
    "--scene-x": `${(station.tile % 3) * 50}%`,
    "--scene-y": `${Math.floor(station.tile / 3) * 100}%`,
    "--point-x": `${station.point[0]}%`,
    "--point-y": `${station.point[1]}%`,
  } as CSSProperties;
  const selected = answer?.values.length ?? 0;
  function start() {
    content.current?.querySelector<HTMLButtonElement>("[data-sim-start]")?.click();
  }
  return <Setting.Provider value={station}>
    <div className={styles.stage} style={sceneStyle} data-sim-scene={simulation.id} data-shape={station.shape} data-mode={step?.mode ?? "intro"}>
      <div className={styles.scenery}>
        <div className={styles.window}>
          <div className={styles.art} aria-hidden={step ? true : undefined}>
            {!step && <button className={styles.marker} type="button" onClick={start} aria-label={simUi.start} data-scene-start>
              <Icon aria-hidden="true" /><span>{simUi.start}</span>
            </button>}
          </div>
          {!step && <Image alt="" aria-hidden="true" unoptimized width={104} height={104}
            src={`/characters/${guides[station.tile]}.webp`} className={styles.guide}
            data-side={station.point[0] < 50 ? "right" : "left"} />}
          {step && step.mode !== "sort" && <div className={styles.slip} key={step.caption}>
            <Icon aria-hidden="true" />
            <span><small>{simUi.kind[simulation.kind]}</small><strong>{step.caption}</strong></span>
            {selected > 0 && step.mode !== "quantity" && <Check aria-hidden="true" />}
          </div>}
        </div>
        {step?.mode === "sort" && <div ref={setHand} className={styles.hand} data-scene-hand />}
        {step && <div className={styles.tabletop}>
          <div className={styles.targets} ref={setBench} data-scene-targets />
        </div>}
      </div>
      <div ref={content} className={styles.notes}>
        <Port.Provider value={bench}><HandPort.Provider value={hand}>{children}</HandPort.Provider></Port.Provider>
      </div>
    </div>
  </Setting.Provider>;
}
