import { BookOpen, Church, Cpu, Gamepad2, Mic, Music, Palette, PenLine, Sparkles } from "lucide-react";
const map = { "book-open": BookOpen, church: Church, cpu: Cpu, gamepad: Gamepad2, mic: Mic, music: Music, palette: Palette, "pen-line": PenLine, sparkles: Sparkles };
export function CategoryIcon({ name, size = 20 }: { name: string; size?: number }) {
  const I = map[name as keyof typeof map] ?? Sparkles;
  return <I size={size} aria-hidden />;
}
