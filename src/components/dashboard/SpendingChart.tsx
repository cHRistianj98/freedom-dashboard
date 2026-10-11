import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { MonthlyBudget } from "../../types/Cashflow";
import { calculateAvailableCash, sumByCategory, sumIncomes } from "../../utils/cashflow";
import { localize, useLanguage } from "../../i18n/LanguageContext";
import { useCurrency } from "../../i18n/CurrencyContext";

export function SpendingChart({ budget }: { budget: MonthlyBudget }) {
  const { language } = useLanguage();
  const { formatMoney } = useCurrency();
  const ui = (pl:string,en:string,de?:string)=>localize(language,pl,en,de);
  const { incomes, expenses } = budget;
  const income = sumIncomes(incomes);
  const available = Math.max(calculateAvailableCash(income, expenses), 0);
  const data = [
    { name: ui("Koszty stałe","Fixed costs","Fixkosten"), value: sumByCategory(expenses,"fixed"), color:"#ef4444" },
    { name: ui("Życie","Living","Lebenshaltung"), value: sumByCategory(expenses,"living"), color:"#f59e0b" },
    { name: ui("Inwestycje","Investments","Investitionen"), value: sumByCategory(expenses,"investment"), color:"#3b82f6" },
    { name: ui("Cele","Goals","Ziele"), value: sumByCategory(expenses,"goal"), color:"#8b5cf6" },
    { name: ui("Wolne","Free","Frei"), value: available, color:"#10b981" },
  ];
  return <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
    <div><h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">{ui("Gdzie poszła wypłata?","Where did the income go?","Wohin ist das Einkommen geflossen?")}</h2><p className="mt-1 text-xs text-slate-500">{ui("Podział miesięcznego dochodu","Monthly income allocation","Aufteilung des Monatseinkommens")}</p></div>
    <div className="mt-5 grid grid-cols-1 items-center gap-4 xl:grid-cols-[260px_1fr]">
      <div className="relative h-[260px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={75} outerRadius={100} paddingAngle={3} stroke="none">{data.map(item=><Cell key={item.name} fill={item.color}/>)}</Pie><Tooltip formatter={(value)=>formatMoney(Number(value),{maximumFractionDigits:0})} contentStyle={{backgroundColor:"#0f172a",border:"1px solid #334155",borderRadius:"12px",color:"#ffffff"}}/></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-bold">{formatMoney(income,{maximumFractionDigits:0})}</span><span className="text-xs text-slate-500">{ui("miesięcznie","monthly","monatlich")}</span></div></div>
      <div className="space-y-4">{data.map(item=>{const percentage=income>0?(item.value/income)*100:0; return <div key={item.name} className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="h-3 w-3 rounded-full" style={{backgroundColor:item.color}}/><span className="text-sm text-slate-400">{item.name}</span></div><div><span className="font-semibold">{formatMoney(item.value,{maximumFractionDigits:0})}</span><span className="ml-3 text-xs text-slate-500">{percentage.toFixed(1)}%</span></div></div>;})}</div>
    </div>
  </div>;
}
