import type { Achievement, AchievementCategory, AchievementRarity } from "./achievementEngine";

export type FreedomMilestoneVisual = {
  image: string;
  overlayClass: string;
  accentClass: string;
  panelClass: string;
  objectPosition?: string;
  imageScale?: number;
};

export type AchievementCardVisual = {
  image: string;
  overlayClass: string;
  accentClass: string;
  objectPosition?: string;
  imageScale?: number;
};

const milestoneVisuals: Record<number, FreedomMilestoneVisual> = {
  1: {
    image: "/achievements/v3/starter.webp",
    overlayClass: "from-[#06111f]/95 via-[#06111f]/35 to-transparent",
    accentClass: "text-emerald-300",
    panelClass: "border-emerald-400/25 bg-emerald-500/10",
    objectPosition: "center",
    imageScale: 1.05,
  },
  2: {
    image: "/achievements/v3/builder.webp",
    overlayClass: "from-[#081323]/95 via-[#081323]/35 to-transparent",
    accentClass: "text-emerald-300",
    panelClass: "border-emerald-400/25 bg-emerald-500/10",
    objectPosition: "center",
    imageScale: 1.05,
  },
  3: {
    image: "/achievements/v3/investor.webp",
    overlayClass: "from-[#071221]/95 via-[#071221]/32 to-transparent",
    accentClass: "text-blue-300",
    panelClass: "border-blue-400/25 bg-blue-500/10",
    objectPosition: "center",
    imageScale: 1.04,
  },
  4: {
    image: "/achievements/v3/accelerator.webp",
    overlayClass: "from-[#06111f]/95 via-[#06111f]/28 to-transparent",
    accentClass: "text-fuchsia-300",
    panelClass: "border-fuchsia-400/25 bg-fuchsia-500/10",
    objectPosition: "center",
    imageScale: 1.04,
  },
  5: {
    image: "/achievements/v3/millionaire.webp",
    overlayClass: "from-[#08111f]/95 via-[#08111f]/30 to-transparent",
    accentClass: "text-amber-300",
    panelClass: "border-amber-400/25 bg-amber-500/10",
    objectPosition: "center",
    imageScale: 1.04,
  },
  6: {
    image: "/achievements/v3/independent.webp",
    overlayClass: "from-[#08111f]/95 via-[#08111f]/32 to-transparent",
    accentClass: "text-cyan-300",
    panelClass: "border-cyan-400/25 bg-cyan-500/10",
    objectPosition: "center",
    imageScale: 1.04,
  },
  7: {
    image: "/achievements/v3/free.webp",
    overlayClass: "from-[#071120]/95 via-[#071120]/30 to-transparent",
    accentClass: "text-sky-300",
    panelClass: "border-sky-400/25 bg-sky-500/10",
    objectPosition: "center",
    imageScale: 1.04,
  },
};

const defaultAchievementVisual: AchievementCardVisual = {
  image: "/achievements/v3/investor.webp",
  overlayClass: "from-[#08111f]/95 via-[#08111f]/40 to-transparent",
  accentClass: "text-blue-300",
  objectPosition: "center",
  imageScale: 1.04,
};

const visualsByCategory: Record<AchievementCategory, AchievementCardVisual> = {
  wealth: defaultAchievementVisual,
  cashflow: {
    image: "/achievements/v3/capital-flow.webp",
    overlayClass: "from-[#07111f]/95 via-[#07111f]/35 to-transparent",
    accentClass: "text-emerald-300",
    objectPosition: "center",
    imageScale: 1.04,
  },
  investing: {
    image: "/achievements/v3/investor.webp",
    overlayClass: "from-[#07111f]/95 via-[#07111f]/35 to-transparent",
    accentClass: "text-blue-300",
    objectPosition: "center",
    imageScale: 1.04,
  },
  goals: {
    image: "/goals/v2/other.webp",
    overlayClass: "from-[#07111f]/95 via-[#07111f]/35 to-transparent",
    accentClass: "text-violet-300",
    objectPosition: "center",
    imageScale: 1.05,
  },
  debt: {
    image: "/goals/v2/debt-payoff.webp",
    overlayClass: "from-[#08111f]/95 via-[#08111f]/40 to-transparent",
    accentClass: "text-amber-300",
    objectPosition: "center",
    imageScale: 1.05,
  },
};

const visualsByAchievementId: Record<string, AchievementCardVisual> = {
  "wealth-10k": milestoneVisuals[1],
  "wealth-30k": milestoneVisuals[2],
  "wealth-100k": milestoneVisuals[3],
  "wealth-250k": milestoneVisuals[4],
  "wealth-500k": milestoneVisuals[5],
  "wealth-1m": milestoneVisuals[6],
  "wealth-3m": milestoneVisuals[7],
  "savings-50": {
    image: "/achievements/v3/safety-shield.webp",
    overlayClass: "from-[#07111f]/95 via-[#07111f]/40 to-transparent",
    accentClass: "text-cyan-300",
    objectPosition: "center",
    imageScale: 1.03,
  },
  "surplus-10k": visualsByCategory.cashflow,
  "surplus-20k": {
    image: "/achievements/v3/bay-villa.webp",
    overlayClass: "from-[#07111f]/95 via-[#07111f]/35 to-transparent",
    accentClass: "text-emerald-300",
    objectPosition: "center",
    imageScale: 1.04,
  },
  "positive-3": {
    image: "/achievements/v3/accelerator.webp",
    overlayClass: "from-[#07111f]/95 via-[#07111f]/35 to-transparent",
    accentClass: "text-sky-300",
    objectPosition: "center",
    imageScale: 1.04,
  },
  "invested-100k": {
    image: "/achievements/v3/investor.webp",
    overlayClass: "from-[#07111f]/95 via-[#07111f]/35 to-transparent",
    accentClass: "text-blue-300",
    objectPosition: "center",
    imageScale: 1.04,
  },
  "invested-250k": {
    image: "/achievements/v3/millionaire.webp",
    overlayClass: "from-[#08111f]/95 via-[#08111f]/35 to-transparent",
    accentClass: "text-amber-300",
    objectPosition: "center",
    imageScale: 1.04,
  },
  "goal-1": {
    image: "/goals/v2/retirement.webp",
    overlayClass: "from-[#07111f]/95 via-[#07111f]/35 to-transparent",
    accentClass: "text-violet-300",
    objectPosition: "center",
    imageScale: 1.05,
  },
  "debt-1": {
    image: "/goals/v2/debt-payoff.webp",
    overlayClass: "from-[#08111f]/95 via-[#08111f]/40 to-transparent",
    accentClass: "text-amber-300",
    objectPosition: "center",
    imageScale: 1.05,
  },
};

export function getFreedomMilestoneVisual(level: number): FreedomMilestoneVisual {
  return milestoneVisuals[level] ?? milestoneVisuals[1];
}

export function getAchievementCardVisual(
  achievement: Pick<Achievement, "id" | "category" | "rarity">,
): AchievementCardVisual {
  return visualsByAchievementId[achievement.id] ?? visualsByCategory[achievement.category] ?? defaultAchievementVisual;
}

export function getRarityGlowClass(rarity: AchievementRarity) {
  switch (rarity) {
    case "common":
      return "shadow-slate-950/10";
    case "rare":
      return "shadow-blue-950/20";
    case "epic":
      return "shadow-violet-950/20";
    case "legendary":
      return "shadow-amber-950/25";
  }
}
