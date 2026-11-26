import { BriefcaseBusinessIcon, CoffeeIcon, StoreIcon, type LucideIcon } from "lucide-react";

// 자료(questions.yaml)의 선택지 그림 이름을 lucide 그림으로 바꾼다.
// 자료에는 Streamlit의 이름(":material/work:")이 적혀 있다. 모르는 이름이면 그림 없이 그린다.

const ICONS: Record<string, LucideIcon> = {
  ":material/work:": BriefcaseBusinessIcon,
  ":material/storefront:": StoreIcon,
  ":material/local_cafe:": CoffeeIcon,
};

export function optionIcon(name: string | undefined): React.ReactNode {
  const Icon = name ? ICONS[name] : undefined;
  return Icon ? <Icon /> : undefined;
}
