import { useEffect, useMemo, useRef, useState } from "react";
import { Zap } from "lucide-react";
import type { MonthlyBudget } from "../../types/Cashflow";
import type { Asset } from "../../types/Asset";
import type { Goal } from "../../types/Goal";
import type { Liability } from "../../types/Liability";
import {
  getAchievements,
  localizeAchievement,
  type Achievement,
} from "./achievementEngine";
import { AchievementUnlockPopup } from "./AchievementUnlockPopup";
import { localize, useLanguage } from "../../i18n/LanguageContext";
import { useCurrency } from "../../i18n/CurrencyContext";

type Props = {
  netWorth: number;
  portfolio: Asset[];
  goals: Goal[];
  liabilities: Liability[];
  monthlyBudget: MonthlyBudget;
};

const STORAGE_KEY = "freedom-seen-achievements-v1";

export function AchievementUnlockManager(props: Props) {
  const { language } = useLanguage();
  const { formatMoney } = useCurrency();
  const ui = (pl: string, en: string, de?: string) => localize(language, pl, en, de);
  const achievements = useMemo(
    () => getAchievements(props).map((item) => localizeAchievement(item, language, (value) => formatMoney(value, { maximumFractionDigits: 0 }))),
    [
      props.netWorth,
      props.portfolio,
      props.goals,
      props.liabilities,
      props.monthlyBudget,
      language,
      formatMoney,
    ]
  );

  const [queue, setQueue] = useState<Achievement[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    const unlocked = achievements.filter(
      (achievement) => achievement.unlocked
    );

    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      // Pierwsze uruchomienie feature'a:
      // zapisujemy obecne unlocki bez spamowania popupami.
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(unlocked.map((achievement) => achievement.id))
      );
      initialized.current = true;
      return;
    }

    let seen: string[] = [];

    try {
      seen = JSON.parse(stored);
    } catch {
      seen = [];
    }

    const newUnlocks = unlocked.filter(
      (achievement) => !seen.includes(achievement.id)
    );

    if (newUnlocks.length > 0) {
      const updatedSeen = [
        ...new Set([
          ...seen,
          ...newUnlocks.map((achievement) => achievement.id),
        ]),
      ];

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedSeen)
      );

      setQueue((current) => {
        const queuedIds = new Set(
          current.map((achievement) => achievement.id)
        );

        return [
          ...current,
          ...newUnlocks.filter(
            (achievement) => !queuedIds.has(achievement.id)
          ),
        ];
      });
    }

    initialized.current = true;
  }, [achievements]);

  useEffect(() => {
    function handleTest() {
      const testAchievement: Achievement = {
        id: `dev-test-${Date.now()}`,
        name: ui("Potężny miesiąc", "Monster Month", "Monster-Monat"),
        description: ui(
          "DEV TEST — tak będzie wyglądało prawdziwe odblokowanie osiągnięcia.",
          "DEV TEST — this is how a real achievement unlock will look.",
          "DEV TEST — so wird die echte Freischaltung eines Erfolgs aussehen."
        ),
        category: "cashflow",
        rarity: "epic",
        xp: 350,
        unlocked: true,
        progress: 100,
        current: 20_000,
        target: 20_000,
        unit: "money",
        icon: <Zap size={22} />,
      };

      setQueue((current) => [...current, testAchievement]);
    }

    window.addEventListener(
      "freedom:test-achievement",
      handleTest
    );

    return () => {
      window.removeEventListener(
        "freedom:test-achievement",
        handleTest
      );
    };
  }, [language]);

  const currentAchievement = queue[0];

  if (!currentAchievement) return null;

  return (
    <AchievementUnlockPopup
      achievement={currentAchievement}
      onClose={() =>
        setQueue((current) => current.slice(1))
      }
    />
  );
}
