import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bone,
  BookOpen,
  Brain,
  Dna,
  Droplets,
  Flame,
  FlaskConical,
  Heart,
  Layers,
  Leaf,
  Microscope,
  Scan,
  Target,
  Trophy,
  Wind,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  heart: Heart,
  bone: Bone,
  atom: Dna,
  dna: Dna,
  leaf: Leaf,
  layers: Layers,
  microscope: Microscope,
  scan: Scan,
  activity: Activity,
  flask: FlaskConical,
  brain: Brain,
  lungs: Wind,
  droplets: Droplets,
  progress: Target,
  concepts: BookOpen,
  streak: Flame,
  accuracy: Trophy,
};

export function resolveIcon(slug: string): LucideIcon {
  return icons[slug] ?? Heart;
}
