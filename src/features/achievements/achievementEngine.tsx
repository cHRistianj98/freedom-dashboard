import {
  Award,
  Crown,
  Flame,
  Gem,
  Medal,
  PiggyBank,
  Rocket,
  ShieldCheck,
  Target,
  Trophy,
  WalletCards,
  Zap,
} from "lucide-react";

import type { ReactNode } from "react";
import type { MonthlyBudget } from "../../types/Cashflow";
import type { Asset } from "../../types/Asset";
import type { Goal } from "../../types/Goal";
import type { Liability } from "../../types/Liability";
import type { AppLanguage } from "../../i18n/LanguageContext";

export type AchievementCategory =
  | "wealth"
  | "cashflow"
  | "investing"
  | "goals"
  | "debt";

export type AchievementRarity =
  | "common"
  | "rare"
  | "epic"
  | "legendary";

export type Achievement = {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xp: number;
  unlocked: boolean;
  progress: number;
  current: number;
  target: number;
  unit: "money" | "percent" | "count";
  icon: ReactNode;
};

export type AchievementEngineInput = {
  netWorth: number;
  portfolio: Asset[];
  goals: Goal[];
  liabilities: Liability[];
  monthlyBudget: MonthlyBudget;
};

export function getAchievements({
  netWorth,
  portfolio,
  goals,
  liabilities,
  monthlyBudget,
}: AchievementEngineInput): Achievement[] {
  const currentMonth = getCurrentMonth();

  const currentIncome = monthlyBudget.incomes
    .filter((income) => income.date?.startsWith(currentMonth))
    .reduce((sum, income) => sum + income.amount, 0);

  const currentExpenses = monthlyBudget.expenses
    .filter((expense) => expense.date?.startsWith(currentMonth))
    .reduce((sum, expense) => sum + expense.amount, 0);

  const currentSurplus = currentIncome - currentExpenses;

  const savingsRate =
    currentIncome > 0
      ? (currentSurplus / currentIncome) * 100
      : 0;

  const investedAssets = portfolio.reduce(
    (sum, asset) => sum + asset.value,
    0
  );

  return buildAchievements({
    netWorth,
    savingsRate,
    currentSurplus,
    investedAssets,
    positiveMonths: calculatePositiveMonths(monthlyBudget),
    completedGoals: calculateCompletedGoals(goals),
    paidLiabilities: calculatePaidLiabilities(liabilities),
  });
}

export function calculateTotalAchievementXp(
  achievements: Achievement[]
) {
  return achievements
    .filter((achievement) => achievement.unlocked)
    .reduce((sum, achievement) => sum + achievement.xp, 0);
}

export function calculatePlayerLevel(totalXp: number) {
  const levels = [
    { level: 1, name: "Rookie", xp: 0 },
    { level: 2, name: "Planner", xp: 250 },
    { level: 3, name: "Saver", xp: 600 },
    { level: 4, name: "Builder", xp: 1_000 },
    { level: 5, name: "Investor", xp: 1_600 },
    { level: 6, name: "Strategist", xp: 2_500 },
    { level: 7, name: "Capitalist", xp: 4_000 },
    { level: 8, name: "Mogul", xp: 6_500 },
    { level: 9, name: "Tycoon", xp: 10_000 },
    { level: 10, name: "FREE", xp: 15_000 },
  ];

  let current = levels[0];

  for (const level of levels) {
    if (totalXp >= level.xp) current = level;
  }

  const currentIndex = levels.findIndex(
    (level) => level.level === current.level
  );

  const next = levels[currentIndex + 1];

  if (!next) {
    return {
      level: current.level,
      name: current.name,
      currentXp: totalXp,
      requiredXp: totalXp,
      remainingXp: 0,
      progress: 100,
    };
  }

  const xpInsideLevel = totalXp - current.xp;
  const levelSize = next.xp - current.xp;

  return {
    level: current.level,
    name: current.name,
    currentXp: xpInsideLevel,
    requiredXp: levelSize,
    remainingXp: next.xp - totalXp,
    progress: (xpInsideLevel / levelSize) * 100,
  };
}

function buildAchievements({
  netWorth,
  savingsRate,
  currentSurplus,
  investedAssets,
  positiveMonths,
  completedGoals,
  paidLiabilities,
}: {
  netWorth: number;
  savingsRate: number;
  currentSurplus: number;
  investedAssets: number;
  positiveMonths: number;
  completedGoals: number;
  paidLiabilities: number;
}): Achievement[] {
  return [
    createAchievement({
      id: "wealth-10k",
      name: "First Capital",
      description: "Zbuduj pierwsze 10 000 zł majątku netto.",
      category: "wealth",
      rarity: "common",
      xp: 50,
      current: netWorth,
      target: 10_000,
      unit: "money",
      icon: <PiggyBank size={22} />,
    }),
    createAchievement({
      id: "wealth-30k",
      name: "Safety Shield",
      description: "Przekrocz 30 000 zł majątku netto.",
      category: "wealth",
      rarity: "common",
      xp: 75,
      current: netWorth,
      target: 30_000,
      unit: "money",
      icon: <ShieldCheck size={22} />,
    }),
    createAchievement({
      id: "wealth-100k",
      name: "100K Club",
      description: "Przekrocz 100 000 zł majątku netto.",
      category: "wealth",
      rarity: "rare",
      xp: 250,
      current: netWorth,
      target: 100_000,
      unit: "money",
      icon: <Gem size={22} />,
    }),
    createAchievement({
      id: "wealth-250k",
      name: "Builder",
      description: "Zbuduj ćwierć miliona złotych majątku.",
      category: "wealth",
      rarity: "rare",
      xp: 400,
      current: netWorth,
      target: 250_000,
      unit: "money",
      icon: <Award size={22} />,
    }),
    createAchievement({
      id: "wealth-500k",
      name: "Accelerator",
      description: "Przekrocz 500 000 zł majątku netto.",
      category: "wealth",
      rarity: "epic",
      xp: 650,
      current: netWorth,
      target: 500_000,
      unit: "money",
      icon: <Rocket size={22} />,
    }),
    createAchievement({
      id: "wealth-1m",
      name: "Millionaire",
      description: "Osiągnij 1 000 000 zł majątku netto.",
      category: "wealth",
      rarity: "legendary",
      xp: 1_000,
      current: netWorth,
      target: 1_000_000,
      unit: "money",
      icon: <Crown size={24} />,
    }),
    createAchievement({
      id: "wealth-3m",
      name: "FREE",
      description: "Osiągnij 3 000 000 zł i główny cel FREEDOM.",
      category: "wealth",
      rarity: "legendary",
      xp: 3_000,
      current: netWorth,
      target: 3_000_000,
      unit: "money",
      icon: <Trophy size={24} />,
    }),
    createAchievement({
      id: "savings-50",
      name: "Savings Machine",
      description:
        "Osiągnij minimum 50% savings rate w bieżącym miesiącu.",
      category: "cashflow",
      rarity: "rare",
      xp: 150,
      current: savingsRate,
      target: 50,
      unit: "percent",
      icon: <PiggyBank size={22} />,
    }),
    createAchievement({
      id: "surplus-10k",
      name: "Cashflow Machine",
      description:
        "Wypracuj co najmniej 10 000 zł miesięcznej nadwyżki.",
      category: "cashflow",
      rarity: "rare",
      xp: 200,
      current: currentSurplus,
      target: 10_000,
      unit: "money",
      icon: <Flame size={22} />,
    }),
    createAchievement({
      id: "surplus-20k",
      name: "Monster Month",
      description: "Wypracuj 20 000 zł nadwyżki w jednym miesiącu.",
      category: "cashflow",
      rarity: "epic",
      xp: 350,
      current: currentSurplus,
      target: 20_000,
      unit: "money",
      icon: <Zap size={22} />,
    }),
    createAchievement({
      id: "positive-3",
      name: "Consistency",
      description: "Zakończ 3 miesiące z dodatnimi przepływami pieniężnymi.",
      category: "cashflow",
      rarity: "rare",
      xp: 200,
      current: positiveMonths,
      target: 3,
      unit: "count",
      icon: <Flame size={22} />,
    }),
    createAchievement({
      id: "invested-100k",
      name: "Investor",
      description:
        "Zbuduj portfel aktywów o wartości 100 000 zł.",
      category: "investing",
      rarity: "rare",
      xp: 250,
      current: investedAssets,
      target: 100_000,
      unit: "money",
      icon: <WalletCards size={22} />,
    }),
    createAchievement({
      id: "invested-250k",
      name: "Compound Engine",
      description:
        "Zbuduj portfel aktywów o wartości 250 000 zł.",
      category: "investing",
      rarity: "epic",
      xp: 500,
      current: investedAssets,
      target: 250_000,
      unit: "money",
      icon: <Gem size={22} />,
    }),
    createAchievement({
      id: "goal-1",
      name: "Goal Crusher",
      description: "Ukończ pierwszy cel finansowy.",
      category: "goals",
      rarity: "rare",
      xp: 200,
      current: completedGoals,
      target: 1,
      unit: "count",
      icon: <Target size={22} />,
    }),
    createAchievement({
      id: "debt-1",
      name: "Pogromca długu",
      description: "Spłać pierwsze zobowiązanie.",
      category: "debt",
      rarity: "epic",
      xp: 300,
      current: paidLiabilities,
      target: 1,
      unit: "count",
      icon: <Medal size={22} />,
    }),
  ];
}

function createAchievement(
  data: Omit<Achievement, "unlocked" | "progress">
): Achievement {
  const safeCurrent = Math.max(data.current, 0);

  return {
    ...data,
    current: safeCurrent,
    unlocked: safeCurrent >= data.target,
    progress:
      data.target > 0
        ? Math.min((safeCurrent / data.target) * 100, 100)
        : 0,
  };
}

function calculatePositiveMonths(budget: MonthlyBudget) {
  const months = new Set<string>();

  budget.incomes.forEach((income) => {
    if (income.date) months.add(income.date.slice(0, 7));
  });

  budget.expenses.forEach((expense) => {
    if (expense.date) months.add(expense.date.slice(0, 7));
  });

  let positive = 0;

  months.forEach((month) => {
    const income = budget.incomes
      .filter((item) => item.date?.startsWith(month))
      .reduce((sum, item) => sum + item.amount, 0);

    const expenses = budget.expenses
      .filter((item) => item.date?.startsWith(month))
      .reduce((sum, item) => sum + item.amount, 0);

    if (income > expenses) positive++;
  });

  return positive;
}

function calculateCompletedGoals(goals: Goal[]) {
  return goals.filter((goal) => {
    const item = goal as unknown as Record<string, unknown>;

    const current = getNumericProperty(item, [
      "currentAmount",
      "current",
      "savedAmount",
    ]);

    const target = getNumericProperty(item, [
      "targetAmount",
      "target",
      "amount",
    ]);

    return (
      current !== null &&
      target !== null &&
      target > 0 &&
      current >= target
    );
  }).length;
}

function calculatePaidLiabilities(liabilities: Liability[]) {
  return liabilities.filter(
    (liability) => liability.remainingAmount <= 0
  ).length;
}

function getNumericProperty(
  object: Record<string, unknown>,
  keys: string[]
) {
  for (const key of keys) {
    const value = object[key];
    if (typeof value === "number") return value;
  }

  return null;
}

function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
}


const achievementCopy: Record<string, Record<AppLanguage, { name: string; description: string }>> = {
  "wealth-10k": {
    pl: { name: "Pierwszy kapitał", description: "Zbuduj pierwsze 10 000 PLN majątku netto." },
    en: { name: "First Capital", description: "Build your first PLN 10,000 of net worth." },
    de: { name: "Erstes Kapital", description: "Baue deine ersten 10.000 PLN Nettovermögen auf." },
  },
  "wealth-30k": {
    pl: { name: "Tarcza bezpieczeństwa", description: "Przekrocz 30 000 PLN majątku netto." },
    en: { name: "Safety Shield", description: "Exceed PLN 30,000 of net worth." },
    de: { name: "Sicherheitsschild", description: "Überschreite 30.000 PLN Nettovermögen." },
  },
  "wealth-100k": {
    pl: { name: "Klub 100K", description: "Przekrocz 100 000 PLN majątku netto." },
    en: { name: "100K Club", description: "Exceed PLN 100,000 of net worth." },
    de: { name: "100K-Club", description: "Überschreite 100.000 PLN Nettovermögen." },
  },
  "wealth-250k": {
    pl: { name: "Budowniczy", description: "Zbuduj 250 000 PLN majątku netto." },
    en: { name: "Builder", description: "Build PLN 250,000 of net worth." },
    de: { name: "Aufbauer", description: "Baue 250.000 PLN Nettovermögen auf." },
  },
  "wealth-500k": {
    pl: { name: "Akcelerator", description: "Przekrocz 500 000 PLN majątku netto." },
    en: { name: "Accelerator", description: "Exceed PLN 500,000 of net worth." },
    de: { name: "Beschleuniger", description: "Überschreite 500.000 PLN Nettovermögen." },
  },
  "wealth-1m": {
    pl: { name: "Milioner", description: "Osiągnij 1 000 000 PLN majątku netto." },
    en: { name: "Millionaire", description: "Reach PLN 1,000,000 of net worth." },
    de: { name: "Millionär", description: "Erreiche 1.000.000 PLN Nettovermögen." },
  },
  "wealth-3m": {
    pl: { name: "WOLNOŚĆ", description: "Osiągnij 3 000 000 PLN i główny cel Freedom." },
    en: { name: "FREE", description: "Reach PLN 3,000,000 and the main Freedom target." },
    de: { name: "FREIHEIT", description: "Erreiche 3.000.000 PLN und das zentrale Freedom-Ziel." },
  },
  "savings-50": {
    pl: { name: "Maszyna oszczędności", description: "Osiągnij minimum 50% stopy oszczędności w bieżącym miesiącu." },
    en: { name: "Savings Machine", description: "Reach at least a 50% savings rate in the current month." },
    de: { name: "Sparmaschine", description: "Erreiche im aktuellen Monat mindestens 50 % Sparquote." },
  },
  "surplus-10k": {
    pl: { name: "Maszyna cashflow", description: "Wypracuj co najmniej 10 000 PLN miesięcznej nadwyżki." },
    en: { name: "Cashflow Machine", description: "Generate at least PLN 10,000 of monthly surplus." },
    de: { name: "Cashflow-Maschine", description: "Erziele mindestens 10.000 PLN monatlichen Überschuss." },
  },
  "surplus-20k": {
    pl: { name: "Potężny miesiąc", description: "Wypracuj 20 000 PLN nadwyżki w jednym miesiącu." },
    en: { name: "Monster Month", description: "Generate PLN 20,000 of surplus in a single month." },
    de: { name: "Monster-Monat", description: "Erziele 20.000 PLN Überschuss in einem Monat." },
  },
  "positive-3": {
    pl: { name: "Konsekwencja", description: "Zakończ 3 miesiące z dodatnimi przepływami pieniężnymi." },
    en: { name: "Consistency", description: "Finish 3 months with positive cashflow." },
    de: { name: "Konstanz", description: "Schließe 3 Monate mit positivem Cashflow ab." },
  },
  "invested-100k": {
    pl: { name: "Inwestor", description: "Zbuduj portfel aktywów o wartości 100 000 PLN." },
    en: { name: "Investor", description: "Build an asset portfolio worth PLN 100,000." },
    de: { name: "Investor", description: "Baue ein Anlageportfolio im Wert von 100.000 PLN auf." },
  },
  "invested-250k": {
    pl: { name: "Silnik procentu składanego", description: "Zbuduj portfel aktywów o wartości 250 000 PLN." },
    en: { name: "Compound Engine", description: "Build an asset portfolio worth PLN 250,000." },
    de: { name: "Zinseszins-Motor", description: "Baue ein Anlageportfolio im Wert von 250.000 PLN auf." },
  },
  "goal-1": {
    pl: { name: "Zdobywca celów", description: "Ukończ pierwszy cel finansowy." },
    en: { name: "Goal Crusher", description: "Complete your first financial goal." },
    de: { name: "Zielknacker", description: "Schließe dein erstes finanzielles Ziel ab." },
  },
  "debt-1": {
    pl: { name: "Pogromca długu", description: "Spłać pierwsze zobowiązanie." },
    en: { name: "Debt Slayer", description: "Pay off your first liability." },
    de: { name: "Schuldenbezwinger", description: "Tilge deine erste Verbindlichkeit vollständig." },
  },
};

export function localizeAchievement(
  achievement: Achievement,
  language: AppLanguage,
  moneyFormatter?: (value: number) => string,
): Achievement {
  const copy = achievementCopy[achievement.id]?.[language];
  if (!copy) return achievement;
  if (!moneyFormatter || achievement.unit !== "money") {
    return { ...achievement, name: copy.name, description: copy.description };
  }

  const amount = moneyFormatter(achievement.target);
  const descriptions: Partial<Record<string, Record<AppLanguage, string>>> = {
    "wealth-10k": { pl: `Zbuduj pierwsze ${amount} majątku netto.`, en: `Build your first ${amount} of net worth.`, de: `Baue deine ersten ${amount} Nettovermögen auf.` },
    "wealth-30k": { pl: `Przekrocz ${amount} majątku netto.`, en: `Exceed ${amount} of net worth.`, de: `Überschreite ${amount} Nettovermögen.` },
    "wealth-100k": { pl: `Przekrocz ${amount} majątku netto.`, en: `Exceed ${amount} of net worth.`, de: `Überschreite ${amount} Nettovermögen.` },
    "wealth-250k": { pl: `Zbuduj ${amount} majątku netto.`, en: `Build ${amount} of net worth.`, de: `Baue ${amount} Nettovermögen auf.` },
    "wealth-500k": { pl: `Przekrocz ${amount} majątku netto.`, en: `Exceed ${amount} of net worth.`, de: `Überschreite ${amount} Nettovermögen.` },
    "wealth-1m": { pl: `Osiągnij ${amount} majątku netto.`, en: `Reach ${amount} of net worth.`, de: `Erreiche ${amount} Nettovermögen.` },
    "wealth-3m": { pl: `Osiągnij ${amount} i główny cel Freedom.`, en: `Reach ${amount} and the main Freedom target.`, de: `Erreiche ${amount} und das zentrale Freedom-Ziel.` },
    "surplus-10k": { pl: `Wypracuj co najmniej ${amount} miesięcznej nadwyżki.`, en: `Generate at least ${amount} of monthly surplus.`, de: `Erziele mindestens ${amount} monatlichen Überschuss.` },
    "surplus-20k": { pl: `Wypracuj ${amount} nadwyżki w jednym miesiącu.`, en: `Generate ${amount} of surplus in a single month.`, de: `Erziele ${amount} Überschuss in einem Monat.` },
    "invested-100k": { pl: `Zbuduj portfel aktywów o wartości ${amount}.`, en: `Build an asset portfolio worth ${amount}.`, de: `Baue ein Anlageportfolio im Wert von ${amount} auf.` },
    "invested-250k": { pl: `Zbuduj portfel aktywów o wartości ${amount}.`, en: `Build an asset portfolio worth ${amount}.`, de: `Baue ein Anlageportfolio im Wert von ${amount} auf.` },
  };
  return { ...achievement, name: copy.name, description: descriptions[achievement.id]?.[language] ?? copy.description };
}
