import { ArrowDownRight, ArrowRight, ArrowUpRight, CircleDollarSign, Home, PiggyBank, Plus, ShoppingBasket, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ExpenseCategory, MonthlyBudget } from "../../types/Cashflow";
import { DashboardSectionLink } from "./DashboardSectionLink";
import { localize, useLanguage } from "../../i18n/LanguageContext";
import { useCurrency } from "../../i18n/CurrencyContext";
import { getCashflowSectionArtwork, getDashboardMetricArtwork, type DashboardMetricKind } from "../../features/dashboard/dashboardVisuals";

type Props = { budget: MonthlyBudget; onAddExpenseClick: () => void };

const categoryMeta: Record<ExpenseCategory, { icon: typeof Home; bar: string; iconClass: string }> = {
  fixed: { icon: Home, bar: "bg-red-500", iconClass: "bg-red-500/10 text-red-400" },
  living: { icon: ShoppingBasket, bar: "bg-amber-400", iconClass: "bg-amber-500/10 text-amber-400" },
  investment: { icon: TrendingUp, bar: "bg-blue-500", iconClass: "bg-blue-500/10 text-blue-400" },
  goal: { icon: Target, bar: "bg-violet-500", iconClass: "bg-violet-500/10 text-violet-400" },
};

export function CashflowSection({ budget, onAddExpenseClick }: Props) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { formatMoney } = useCurrency();
  const money = (value: number) => formatMoney(value, { maximumFractionDigits: 0 });
  const ui = (pl: string, en: string, de?: string) => localize(language, pl, en, de);
  const categoryLabel = (key: ExpenseCategory) => ({
    fixed: ui("Stałe", "Fixed", "Fixkosten"),
    living: ui("Życie", "Living", "Lebenshaltung"),
    investment: ui("Inwestycje", "Investments", "Investitionen"),
    goal: ui("Cele", "Goals", "Ziele"),
  }[key]);
  const income = budget.incomes.reduce((sum, item) => sum + item.amount, 0);
  const expenses = budget.expenses.reduce((sum, item) => sum + item.amount, 0);
  const surplus = income - expenses;
  const savingsRate = income > 0 ? (surplus / income) * 100 : 0;
  const totals = budget.expenses.reduce<Record<ExpenseCategory, number>>((acc, item) => { acc[item.category] += item.amount; return acc; }, { fixed: 0, living: 0, investment: 0, goal: 0 });
  const categories = (Object.entries(totals) as [ExpenseCategory, number][]).sort((a, b) => b[1] - a[1]);
  const biggest = categories[0];
  const recent = [...budget.expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const sectionArtwork = getCashflowSectionArtwork();

  return (
    <section className="relative mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1322] p-6">
      <div className="pointer-events-none absolute inset-0">
        <img src={sectionArtwork.image} alt="" className="absolute inset-y-0 right-0 h-full w-2/3 object-cover opacity-20" style={{ objectPosition: sectionArtwork.objectPosition ?? "center", transform: `scale(${sectionArtwork.imageScale ?? 1.04})` }} />
        <div className={`absolute inset-0 bg-gradient-to-r ${sectionArtwork.overlayClass}`} />
      </div>
      <div className="relative">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">{ui("Miesięczny cashflow", "Monthly Cashflow", "Monatlicher Cashflow")}</p><h2 className="mt-2 text-lg font-black text-white">{ui("Wydatki pod kontrolą", "Spending under control", "Ausgaben unter Kontrolle")}</h2><p className="mt-1 text-xs text-slate-500">{ui("Szybki obraz miesiąca bez starego wielkiego donuta.", "A quick monthly snapshot without the old giant donut chart.", "Schneller Monatsüberblick ohne das alte große Donut-Diagramm.")}</p></div>
        <div className="flex gap-2"><button onClick={onAddExpenseClick} className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white hover:bg-blue-500"><Plus size={15} /> {ui("Dodaj wydatek", "Add expense", "Ausgabe hinzufügen")}</button><button onClick={() => navigate("/finances")} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800">{ui("Finanse", "Finances", "Finanzen")} <ArrowRight size={14} /></button></div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <FlowMetric label={ui("Wpływy", "Income", "Einnahmen")} value={money(income)} icon={<ArrowUpRight size={18} />} tone="emerald" artworkKind="income" />
        <FlowMetric label={ui("Wydatki", "Expenses", "Ausgaben")} value={money(expenses)} icon={<ArrowDownRight size={18} />} tone="red" artworkKind="expenses" />
        <FlowMetric label={ui("Wolne środki", "Free cash", "Freie Mittel")} value={money(surplus)} icon={<CircleDollarSign size={18} />} tone={surplus >= 0 ? "blue" : "red"} artworkKind="surplus" />
        <FlowMetric label={ui("Stopa oszczędności", "Savings rate", "Sparquote")} value={`${savingsRate.toFixed(1)}%`} icon={<PiggyBank size={18} />} tone="violet" artworkKind="savings" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5">
          <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-slate-400">{ui("Top kategorie", "Top categories", "Top-Kategorien")}</p><p className="mt-1 text-[11px] text-slate-600">{ui("Gdzie realnie uciekają pieniądze", "Where your money actually goes", "Wohin dein Geld tatsächlich fließt")}</p></div>{biggest && <span className="rounded-lg bg-amber-500/10 px-2 py-1 text-[10px] font-black text-amber-400">TOP: {categoryLabel(biggest[0])}</span>}</div>
          <div className="mt-5 space-y-4">{categories.map(([key, value]) => { const meta = categoryMeta[key]; const Icon = meta.icon; const pct = expenses > 0 ? (value / expenses) * 100 : 0; return <div key={key}><div className="mb-2 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.iconClass}`}><Icon size={15} /></span><div><p className="text-xs font-bold text-slate-200">{categoryLabel(key)}</p><p className="text-[10px] text-slate-600">{pct.toFixed(1)}% {ui("wydatków", "of expenses", "der Ausgaben")}</p></div></div><p className="text-xs font-black text-white">{money(value)}</p></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-800"><div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${pct}%` }} /></div></div>; })}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-slate-400">{localize(language, "Ostatnie wydatki", "Recent expenses", "Letzte Ausgaben")}</p><p className="mt-1 text-[11px] text-slate-600">{localize(language, "Najświeższe transakcje miesiąca", "Latest transactions this month", "Neueste Transaktionen dieses Monats")}</p></div><DashboardSectionLink onClick={() => navigate("/finances")}>{t("all")}</DashboardSectionLink></div>
          <div className="mt-4 divide-y divide-slate-800/80">{recent.length ? recent.map((item) => { const meta = categoryMeta[item.category]; const Icon = meta.icon; return <div key={item.id} className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.iconClass}`}><Icon size={16} /></span><div className="min-w-0"><p className="truncate text-xs font-bold text-slate-200">{item.name}</p><p className="mt-0.5 text-[10px] text-slate-600">{categoryLabel(item.category)} • {item.date}</p></div></div><p className="shrink-0 text-xs font-black text-white">-{money(item.amount)}</p></div>; }) : <div className="py-10 text-center text-xs text-slate-600">{ui("Brak wydatków w tym miesiącu.", "No expenses this month.", "Keine Ausgaben in diesem Monat.")}</div>}</div>
        </div>
      </div>
      </div>
    </section>
  );
}

function FlowMetric({ label, value, icon, tone, artworkKind }: { label: string; value: string; icon: React.ReactNode; tone: "emerald" | "red" | "blue" | "violet"; artworkKind: DashboardMetricKind }) {
  const cls = { emerald: "bg-emerald-500/10 text-emerald-400", red: "bg-red-500/10 text-red-400", blue: "bg-blue-500/10 text-blue-400", violet: "bg-violet-500/10 text-violet-400" }[tone];
  const artwork = getDashboardMetricArtwork(artworkKind);
  return <div className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40 p-4 transition hover:border-slate-700"><div className="pointer-events-none absolute inset-0"><img src={artwork.image} alt="" className="absolute inset-y-0 right-0 h-full w-2/3 object-cover opacity-25 transition duration-500 group-hover:scale-[1.04]" style={{ objectPosition: artwork.objectPosition ?? "center", transform: `scale(${artwork.imageScale ?? 1.04})` }} /><div className={`absolute inset-0 bg-gradient-to-r ${artwork.overlayClass}`} /></div><div className="relative"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${cls}`}>{icon}</div><p className="mt-3 text-[10px] font-black uppercase tracking-wider text-slate-600">{label}</p><p className="mt-1 text-lg font-black text-white">{value}</p></div></div>;
}
