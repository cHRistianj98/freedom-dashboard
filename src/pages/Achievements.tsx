import {
  Check,
  Crown,
  LockKeyhole,
  Sparkles,
  Target,
  TestTube2,
  Trophy,
} from "lucide-react";

import type { MonthlyBudget } from "../types/Cashflow";
import type { Asset } from "../types/Asset";
import type { Goal } from "../types/Goal";
import type { Liability } from "../types/Liability";
import {
  calculatePlayerLevel,
  calculateTotalAchievementXp,
  getAchievements,
  localizeAchievement,
  type Achievement,
  type AchievementRarity,
} from "../features/achievements/achievementEngine";
import {
  getAchievementCardVisual,
  getFreedomMilestoneVisual,
  getRarityGlowClass,
} from "../features/achievements/achievementVisuals";
import { localize, useLanguage, translateLevelName, type AppLanguage } from "../i18n/LanguageContext";
import { useCurrency } from "../i18n/CurrencyContext";

type AchievementsProps = {
  netWorth: number;
  portfolio: Asset[];
  goals: Goal[];
  liabilities: Liability[];
  monthlyBudget: MonthlyBudget;
};

const rarityClasses: Record<AchievementRarity, {
  border: string;
  background: string;
  text: string;
  badge: string;
}> = {
  common: { border: "border-slate-700", background: "bg-slate-900/50", text: "text-slate-300", badge: "bg-slate-700/50 text-slate-300" },
  rare: { border: "border-blue-500/30", background: "bg-blue-500/5", text: "text-blue-400", badge: "bg-blue-500/10 text-blue-400" },
  epic: { border: "border-violet-500/30", background: "bg-violet-500/5", text: "text-violet-400", badge: "bg-violet-500/10 text-violet-400" },
  legendary: { border: "border-amber-500/30", background: "bg-amber-500/5", text: "text-amber-400", badge: "bg-amber-500/10 text-amber-400" },
};

const rarityLabels: Record<AchievementRarity, Record<AppLanguage, string>> = {
  common: { pl: "ZWYKŁE", en: "COMMON", de: "GEWÖHNLICH", es: "COMÚN" },
  rare: { pl: "RZADKIE", en: "RARE", de: "SELTEN", es: "RARO" },
  epic: { pl: "EPICKIE", en: "EPIC", de: "EPISCH", es: "ÉPICO" },
  legendary: { pl: "LEGENDARNE", en: "LEGENDARY", de: "LEGENDÄR", es: "LEGENDARIO" },
};

export function Achievements(props: AchievementsProps) {
  const { language, locale } = useLanguage();
  const { formatMoney, formatCompactMoney } = useCurrency();
  const ui = (pl: string, en: string, de?: string, es?: string) => localize(language, pl, en, de, es);

  const achievements = getAchievements(props).map((item) => localizeAchievement(item, language, (value) => formatMoney(value, { maximumFractionDigits: 0 })));
  const unlocked = achievements.filter((item) => item.unlocked);
  const locked = achievements.filter((item) => !item.unlocked);
  const totalXp = calculateTotalAchievementXp(achievements);
  const playerLevel = calculatePlayerLevel(totalXp);
  const completion = achievements.length > 0 ? (unlocked.length / achievements.length) * 100 : 0;
  const nextAchievement = [...locked].sort((a, b) => b.progress - a.progress)[0];

  function testPopup() {
    window.dispatchEvent(new CustomEvent("freedom:test-achievement"));
  }

  return (
    <main className="min-h-screen bg-[#050b16] p-8 text-white">
      <section className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-amber-400" />
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-400">{ui("Osiągnięcia", "Achievements", "Erfolge")}</p>
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight">{ui("Twoja finansowa gra", "Your financial game", "Dein Finanzspiel")}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {ui(
              "Buduj majątek, utrzymuj dodatnie przepływy pieniężne i odblokowuj kolejne osiągnięcia.",
              "Build wealth, maintain positive cashflow and unlock new achievements.",
              "Baue Vermögen auf, halte deinen Cashflow positiv und schalte neue Erfolge frei."
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={testPopup} className="flex cursor-pointer items-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-violet-300 transition hover:bg-violet-500/20">
            <TestTube2 size={17} /> {ui("DEV: test popupu", "DEV: test popup", "DEV: Popup testen")}
          </button>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">{ui("Pokój trofeów", "Trophy room", "Trophäenraum")}</p>
            <p className="mt-1 text-2xl font-black">{unlocked.length} / {achievements.length}</p>
          </div>
        </div>
      </section>

      <section className="mt-7 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/15 via-[#0b1322] to-[#0b1322] p-7 xl:col-span-2">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/15 text-blue-400 shadow-lg shadow-blue-500/10"><Crown size={38} /></div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">{ui("Poziom gracza", "Player level", "Spielerlevel")}</p>
                  <h2 className="mt-1 text-3xl font-black">{ui("POZIOM", "LEVEL", "LEVEL")} {playerLevel.level}</h2>
                  <p className="mt-1 text-sm text-slate-500">{translateLevelName(playerLevel.name, language)}</p>
                </div>
              </div>
              <div className="md:text-right">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{ui("XP łącznie", "Total XP", "XP gesamt")}</p>
                <p className="mt-1 text-3xl font-black text-blue-400">{totalXp.toLocaleString(locale)} XP</p>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{ui("POZIOM", "LEVEL", "LEVEL")} {playerLevel.level}</span>
                <span className="font-bold text-blue-400">{playerLevel.currentXp.toLocaleString(locale)} / {playerLevel.requiredXp.toLocaleString(locale)} XP</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700" style={{ width: `${playerLevel.progress}%` }} /></div>
              <div className="mt-3 flex justify-between text-xs text-slate-600">
                <span>{playerLevel.progress.toFixed(0)}% {ui("poziomu", "of level", "des Levels")}</span>
                <span>{playerLevel.remainingXp.toLocaleString(locale)} XP {ui("do następnego", "to next level", "bis zum nächsten Level")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0b1322] p-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{ui("Kolekcja", "Collection", "Sammlung")}</p>
          <p className="mt-3 text-4xl font-black">{completion.toFixed(0)}%</p>
          <p className="mt-1 text-sm text-slate-500">{ui("ukończonej kolekcji", "of the collection completed", "der Sammlung abgeschlossen")}</p>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-amber-500" style={{ width: `${completion}%` }} /></div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <SmallMetric label={ui("Odblokowane", "Unlocked", "Freigeschaltet")} value={`${unlocked.length}`} accent />
            <SmallMetric label={ui("Pozostało", "Remaining", "Verbleibend")} value={`${locked.length}`} />
          </div>
        </div>
      </section>

      {nextAchievement && (
        <section className="mt-5 rounded-2xl border border-blue-500/20 bg-[#0b1322] p-6">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400"><Target size={25} /></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">{ui("Następne odblokowanie", "Next unlock", "Nächste Freischaltung")}</p>
                <h2 className="mt-1 text-xl font-black">{nextAchievement.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{nextAchievement.description}</p>
              </div>
            </div>
            <div className="w-full max-w-xl">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">{formatAchievementValue(nextAchievement.current, nextAchievement.unit, formatMoney, locale)}</span>
                <span className="font-bold text-blue-400">{formatAchievementValue(nextAchievement.target, nextAchievement.unit, formatMoney, locale)}</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${nextAchievement.progress}%` }} /></div>
              <p className="mt-2 text-right text-xs font-bold text-amber-400">+{nextAchievement.xp} XP</p>
            </div>
          </div>
        </section>
      )}

      <section className="mt-5 rounded-2xl border border-slate-800 bg-[#0b1322] p-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">{ui("Kamienie milowe majątku", "Wealth milestones", "Vermögensmeilensteine")}</p>
        <h2 className="mt-2 text-xl font-black">{ui("Droga do wolności", "Road to freedom", "Weg zur Freiheit")}</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
          {achievements.filter((item) => item.category === "wealth").map((achievement, index) => (
            <WealthMilestone key={achievement.id} achievement={achievement} artworkIndex={index} formatCompactMoney={formatCompactMoney} language={language} />
          ))}
        </div>
      </section>

      <section className="mt-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{ui("Kolekcja trofeów", "Trophy collection", "Trophäensammlung")}</p>
        <h2 className="mt-2 text-2xl font-black">{ui("Osiągnięcia", "Achievements", "Erfolge")}</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} language={language} locale={locale} formatMoney={formatMoney} />
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-[#0b1322] to-violet-500/5 p-7">
        <div className="flex items-center gap-3">
          <Sparkles size={22} className="text-amber-400" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">{ui("Ultra rzadkie", "Ultra rare", "Ultra selten")}</p>
            <h2 className="mt-1 text-xl font-black">{ui("Legendarne osiągnięcia", "Legendary achievements", "Legendäre Erfolge")}</h2>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {achievements.filter((item) => item.rarity === "legendary").map((achievement) => (
            <LegendaryCard key={achievement.id} achievement={achievement} language={language} />
          ))}
        </div>
      </section>
    </main>
  );
}

function AchievementCard({ achievement, language, locale, formatMoney }: { achievement: Achievement; language: AppLanguage; locale: string; formatMoney: (value: number, options?: any) => string }) {
  const style = rarityClasses[achievement.rarity];
  const ui = (pl: string, en: string, de?: string, es?: string) => localize(language, pl, en, de, es);
  const visual = getAchievementCardVisual(achievement);

  return (
    <div className={`group relative overflow-hidden rounded-2xl border transition duration-300 hover:-translate-y-1 hover:shadow-xl ${getRarityGlowClass(achievement.rarity)} ${achievement.unlocked ? `${style.border} ${style.background}` : "border-slate-800 bg-[#0b1322]"}`}>
      <div className="relative h-28 overflow-hidden border-b border-white/5">
        <img
          src={visual.image}
          alt=""
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.05] ${achievement.unlocked ? "opacity-100" : "opacity-45 grayscale-[25%]"}`}
          style={{ objectPosition: visual.objectPosition ?? "center", transform: `scale(${visual.imageScale ?? 1.04})` }}
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${achievement.unlocked ? visual.overlayClass : "from-[#050b16]/95 via-[#050b16]/70 to-[#050b16]/35"}`} />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur-md ${achievement.unlocked ? "border-white/10 bg-black/30 text-white" : "border-slate-700/50 bg-black/35 text-slate-500"}`}>
            {achievement.unlocked ? achievement.icon : <LockKeyhole size={20} />}
          </div>

          <div className="text-right">
            <span className={`rounded-md px-2 py-1 text-[10px] font-black tracking-wider backdrop-blur-md ${achievement.unlocked ? style.badge : "bg-black/35 text-slate-500"}`}>
              {rarityLabels[achievement.rarity][language]}
            </span>
            <p className="mt-2 text-xs font-bold text-amber-400">+{achievement.xp} XP</p>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className={`text-lg font-black ${achievement.unlocked ? "text-white" : "text-slate-300"}`}>{achievement.name}</h3>
        </div>
      </div>

      <div className={`p-5 ${achievement.unlocked ? "" : "opacity-75"}`}>
        <p className="min-h-10 text-sm leading-5 text-slate-500">{achievement.description}</p>
        <div className="mt-5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">{formatAchievementValue(achievement.current, achievement.unit, formatMoney, locale)}</span>
            <span className={achievement.unlocked ? style.text : "text-slate-600"}>{achievement.unlocked ? ui("ODBLOKOWANE", "UNLOCKED", "FREIGESCHALTET") : formatAchievementValue(achievement.target, achievement.unit, formatMoney, locale)}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800"><div className={`h-full rounded-full ${achievement.unlocked ? getProgressColor(achievement.rarity) : "bg-slate-700"}`} style={{ width: `${achievement.progress}%` }} /></div>
        </div>
      </div>

      {achievement.unlocked && <div className="absolute right-4 top-[5.55rem] flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 shadow-lg shadow-emerald-950/30"><Check size={15} /></div>}
    </div>
  );
}

function WealthMilestone({ achievement, artworkIndex, formatCompactMoney, language }: { achievement: Achievement; artworkIndex: number; formatCompactMoney: (value: number) => string; language: AppLanguage }) {
  const visual = getFreedomMilestoneVisual(artworkIndex + 1);
  const ui = (pl: string, en: string, de?: string, es?: string) => localize(language, pl, en, de, es);

  return (
    <div className={`group relative min-h-[188px] overflow-hidden rounded-2xl border transition duration-300 hover:-translate-y-1 hover:shadow-xl ${achievement.unlocked ? "border-blue-400/35 shadow-blue-950/20" : "border-slate-800 shadow-black/10"}`}>
      <div className="relative h-full min-h-[188px] overflow-hidden">
        <img
          src={visual.image}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.05] ${achievement.unlocked ? "opacity-100" : "opacity-45 grayscale-[35%]"}`}
          style={{ objectPosition: visual.objectPosition ?? "center", transform: `scale(${visual.imageScale ?? 1.04})` }}
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${achievement.unlocked ? visual.overlayClass : "from-[#050b16]/95 via-[#050b16]/75 to-[#050b16]/40"}`} />

        <div className="relative flex min-h-[188px] flex-col justify-between p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] backdrop-blur-md ${achievement.unlocked ? "border-white/10 bg-black/30 text-white" : "border-slate-700/60 bg-black/35 text-slate-400"}`}>
              {ui("Poziom", "Level", "Level")} {artworkIndex + 1}
            </div>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md ${achievement.unlocked ? "border-blue-400/40 bg-blue-500/20 text-blue-300" : "border-slate-600/50 bg-black/35 text-slate-400"}`}>
              {achievement.unlocked ? <Check size={16} /> : <LockKeyhole size={14} />}
            </div>
          </div>

          <div className={`rounded-2xl border px-3 py-3 backdrop-blur-md ${achievement.unlocked ? visual.panelClass : "border-slate-700/50 bg-black/35"}`}>
            <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${achievement.unlocked ? visual.accentClass : "text-slate-500"}`}>{achievement.name}</p>
            <p className="mt-1 text-lg font-black text-white">{formatCompactMoney(achievement.target)}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-900/70">
              <div className={`h-full rounded-full ${achievement.unlocked ? "bg-blue-400" : "bg-slate-600"}`} style={{ width: `${Math.max(achievement.progress, achievement.unlocked ? 100 : 0)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendaryCard({ achievement, language }: { achievement: Achievement; language: AppLanguage }) {
  const ui = (pl: string, en: string, de?: string, es?: string) => localize(language, pl, en, de, es);
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 text-center ${achievement.unlocked ? "border-amber-500/40 bg-amber-500/10" : "border-slate-800 bg-[#08111f]"}`}>
      <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${achievement.unlocked ? "bg-amber-500/15 text-amber-400" : "bg-slate-800 text-slate-600"}`}>{achievement.unlocked ? achievement.icon : <LockKeyhole size={26} />}</div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-amber-500">{ui("Legendarne", "Legendary", "Legendär")}</p>
      <h3 className="mt-2 text-xl font-black">{achievement.name}</h3>
      <p className="mt-2 text-sm text-slate-500">{achievement.description}</p>
      <p className="mt-5 font-black text-amber-400">+{achievement.xp} XP</p>
    </div>
  );
}

function SmallMetric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="rounded-xl bg-slate-900/70 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-600">{label}</p><p className={`mt-1 text-lg font-black ${accent ? "text-emerald-400" : "text-white"}`}>{value}</p></div>;
}

function getProgressColor(rarity: AchievementRarity) {
  switch (rarity) {
    case "common": return "bg-slate-400";
    case "rare": return "bg-blue-500";
    case "epic": return "bg-violet-500";
    case "legendary": return "bg-amber-500";
  }
}

function formatAchievementValue(value: number, unit: Achievement["unit"], formatMoney: (value: number, options?: any) => string, locale: string) {
  if (unit === "money") return formatMoney(value, { maximumFractionDigits: 0 });
  if (unit === "percent") return `${value.toFixed(1)}%`;
  return Math.round(value).toLocaleString(locale);
}
