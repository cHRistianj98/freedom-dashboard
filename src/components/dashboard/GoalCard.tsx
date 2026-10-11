import { CheckCircle2, Target } from "lucide-react";
import type { Goal } from "../../types/Goal";
import { calculateGoalProgress, calculateGoalRemaining, calculateMonthsToGoal } from "../../utils/goals";
import { localize, useLanguage } from "../../i18n/LanguageContext";
import { useCurrency } from "../../i18n/CurrencyContext";

export function GoalCard({ goal }: { goal: Goal }) {
  const { language } = useLanguage();
  const { formatMoney } = useCurrency();
  const ui = (pl: string, en: string, de?: string) => localize(language, pl, en, de);
  const progress = calculateGoalProgress(goal);
  const remaining = calculateGoalRemaining(goal);
  const monthsRemaining = calculateMonthsToGoal(goal);
  const completed = goal.status === "COMPLETED";
  const funded = !completed && remaining === 0;

  return (
    <div className={`group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition ${completed ? "opacity-60 grayscale" : "hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900 hover:shadow-xl"}`}>
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${goal.color}20`, color: goal.color }}><Target size={22} /></div>
        {completed && <CheckCircle2 size={22} className="text-emerald-400" />}
      </div>
      <h3 className="mt-5 text-lg font-semibold">{goal.name}</h3>
      <div className="mt-3">
        <span className="text-xl font-bold">{formatMoney(goal.currentAmount, { maximumFractionDigits: 0 })}</span>
        <span className="text-sm text-slate-500"> / {formatMoney(goal.targetAmount, { maximumFractionDigits: 0 })}</span>
      </div>
      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: goal.color }} /></div>
        <div className="mt-2 flex justify-between gap-3 text-xs text-slate-500">
          <span>{progress.toFixed(0)}%</span>
          <span className="text-right">{ui("Pozostało", "Remaining", "Verbleibend")}: {formatMoney(remaining, { maximumFractionDigits: 0 })}</span>
        </div>
      </div>
      <div className="mt-5 border-t border-slate-800 pt-4 text-sm">
        {completed ? <span className="font-medium text-slate-400">✓ {ui("Cel zrealizowany", "Goal completed", "Ziel erreicht")}</span>
          : funded ? <span className="font-medium text-emerald-400">✓ {ui("Cel w pełni sfinansowany", "Goal fully funded", "Ziel vollständig finanziert")}</span>
          : monthsRemaining !== null ? <div className="flex items-center justify-between"><span className="text-slate-500">{ui("Przy obecnym tempie", "At the current pace", "Beim aktuellen Tempo")}</span><span className="font-medium text-slate-300">~{monthsRemaining} {language === "pl" ? "mies." : language === "de" ? (monthsRemaining === 1 ? "Monat" : "Monate") : monthsRemaining === 1 ? "month" : "months"}</span></div>
          : <span className="text-slate-500">{ui("Brak miesięcznej wpłaty", "No monthly contribution", "Kein monatlicher Beitrag")}</span>}
      </div>
    </div>
  );
}
