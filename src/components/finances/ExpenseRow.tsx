import { CalendarDays, Pencil, Repeat2, Trash2 } from "lucide-react";
import type { Expense } from "../../types/Cashflow";
import { localize, useLanguage } from "../../i18n/LanguageContext";
import { useCurrency } from "../../i18n/CurrencyContext";

export function ExpenseRow({ expense, onEdit, onDelete }: { expense: Expense; onEdit: () => void; onDelete: () => void }) {
  const { language, locale } = useLanguage();
  const { formatMoney } = useCurrency();
  const ui = (pl: string, en: string, de?: string) => localize(language, pl, en, de);
  return <div className="group flex items-center justify-between border-b border-slate-800/60 px-5 py-4 transition last:border-b-0 hover:bg-slate-800/40">
    <div><div className="flex items-center gap-2"><span className="font-medium">{expense.name}</span>{expense.recurring && <Repeat2 size={14} className="text-slate-500" />}</div>
      <div className="mt-1 flex items-center gap-2 text-xs text-slate-600"><CalendarDays size={13}/><span>{expense.date ? formatDate(expense.date, locale) : ui("Brak daty", "No date", "Kein Datum")}</span><span>•</span><span>{expense.recurring ? ui("Powtarzalny", "Recurring", "Wiederkehrend") : ui("Jednorazowy", "One-off", "Einmalig")}</span></div></div>
    <div className="flex items-center gap-5"><span className="font-semibold">{formatMoney(expense.amount, { maximumFractionDigits: 2 })}</span><div className="flex items-center gap-1"><button type="button" onClick={onEdit} title={ui("Edytuj", "Edit", "Bearbeiten")} className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-blue-500/10 hover:text-blue-400"><Pencil size={17}/></button><button type="button" onClick={onDelete} title={ui("Usuń", "Delete", "Löschen")} className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"><Trash2 size={17}/></button></div></div>
  </div>;
}
function formatDate(date: string, locale: string) { const [year, month, day] = date.split("-"); return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(Number(year), Number(month)-1, Number(day), 12)); }
