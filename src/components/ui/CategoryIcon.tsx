import {
  Apple,
  Cable,
  Gamepad,
  Gamepad2,
  Headphones,
  LayoutGrid,
  Monitor,
  ScanLine,
  Shield,
  Shirt,
  Smartphone,
  Sparkles,
  Tablet,
  type LucideIcon,
} from "lucide-react";

/** Ícones disponíveis para categorias (campo `icon` no cadastro) */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  apple: Apple,
  tablet: Tablet,
  "gamepad-2": Gamepad2,
  gamepad: Gamepad,
  monitor: Monitor,
  cable: Cable,
  headphones: Headphones,
  shield: Shield,
  scan: ScanLine,
  shirt: Shirt,
  sparkles: Sparkles,
  grid: LayoutGrid,
};

export function CategoryIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && CATEGORY_ICONS[name]) || LayoutGrid;
  return <Icon className={className} strokeWidth={1.6} />;
}
