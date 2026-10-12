import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, ArrowRight, ArrowUpRight, CalendarClock, CheckCircle2, ChevronRight,
  CircleAlert, CircleHelp, Coins, Landmark, LockKeyhole, RefreshCw,
  ShieldCheck, Sparkles, Target, TrendingUp, Wallet,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { goalAllocationApi } from "../../api/goalAllocationApi";
import { liabilityAllocationApi } from "../../api/liabilityAllocationApi";
import { useLanguage } from "../../i18n/LanguageContext";
import { formatDisplayMoney, formatDisplayMoneyCompact } from "../../utils/displayMoney";
import type { MoneyFlowOverview } from "../../types/GoalAllocation";
import type { LiabilityAllocationOverview } from "../../types/LiabilityAllocation";
import type { Asset } from "../../types/Asset";
import type { Goal } from "../../types/Goal";
import type { Liability } from "../../types/Liability";
import type { MonthlyBudget } from "../../types/Cashflow";
import type { RecurringTransaction } from "../../types/RecurringTransaction";
import { calculateFinancialCommandCenter } from "../../features/intelligence/financialCommandCenter";

type Props = {
  portfolio: Asset[];
  goals: Goal[];
  liabilities: Liability[];
  monthlyBudget: MonthlyBudget;
  recurringTransactions: RecurringTransaction[];
};

type Alert = { id: string; tone: "warn" | "good" | "info"; title: string; detail: string; to: string; action: string };

const translations = {
  pl: {
    kicker: "FREEDOM / FINANCIAL COMMAND CENTER",
    title: "Centrum decyzji finansowych",
    subtitle: "Ile środków możesz rozdysponować, co trzeba zabezpieczyć i co wymaga Twojej uwagi.",
    safety: "Rezerwa bezpieczeństwa", days: "Horyzont", months: "mies.",
    liquid: "Gotówka łącznie", liquidNote: "Rachunki i gotówka, bez inwestycji",
    available: "Wolna gotówka", availableNote: "Po odjęciu rezerwacji celów i zobowiązań",
    payments: "Płatności do zabezpieczenia", paymentsNote: "Reguły, raty i szacowane zwykłe wydatki",
    invest: "Potencjalnie do rozdysponowania", investNote: "Bez przyszłych wpływów, po zabezpieczeniu bufora",
    missing: "Za mało danych", fetchError: "Nie można zweryfikować rezerwacji", reload: "Ponów",
    breakdown: "Skąd ta kwota?", allocations: "Zablokowane w celach i zobowiązaniach",
    scheduled: "Plan płatności / raty", flexible: "Szacowane pozostałe wydatki",
    buffer: "Brakująca rezerwa bezpieczeństwa", emergency: "W poduszce już zarezerwowano",
    noEstimate: "Brak danych do oszacowania", cashProjection: "Prognoza wolnej gotówki", projectionNote: "Po rezerwacjach · szacunek na podstawie reguł i historii",
    forecastEnd: "Saldo za", daysSuffix: "dni", lowBalance: "Najniższe prognozowane saldo",
    upcoming: "Nadchodzące płatności", noPayments: "Nie ma zaplanowanych płatności w tym okresie.",
    recommendations: "Priorytety i ostrzeżenia", recommendationHint: "Wskazówki wynikają wyłącznie z zapisanych danych.",
    noRulesTitle: "Dodaj powtarzalne opłaty", noRulesDetail: "Bez reguł stałych wydatków nie da się wiarygodnie wyznaczyć wolnego kapitału.",
    noHistoryTitle: "Uzupełnij historię wydatków", noHistoryDetail: "Potrzebny jest co najmniej jeden z ostatnich trzech zakończonych miesięcy z transakcjami.",
    allocationsErrorTitle: "Brak potwierdzenia rezerwacji", allocationsErrorDetail: "Nie udało się pobrać powiązań celów i zobowiązań. Dla bezpieczeństwa wyliczenie kapitału jest zablokowane.",
    alertLowTitle: "Uwaga na płynność", alertLowDetail: "Z prognozy wynika, że wolne środki mogą spaść poniżej zera. Sprawdź terminy opłat.",
    alertEmergencyTitle: "Uzupełnij poduszkę finansową", alertEmergencyDetail: "Aktualne środki oznaczone jako poduszka nie pokrywają wybranego bufora.",
    alertSafeTitle: "Jest nadwyżka do zaplanowania", alertSafeDetail: "To orientacyjna kwota po zabezpieczeniu rezerwacji, kosztów i bufora. Nie jest rekomendacją inwestycyjną.",
    alertOkTitle: "Zachowaj obecny bufor", alertOkDetail: "Nie widać dodatkowej kwoty do rozdysponowania bez naruszania przyjętej rezerwy.",
    debtTitle: "Sprawdź harmonogram rat", debtDetail: "Raty mają miesięczne kwoty, ale bez dat płatności; nie można umieścić ich na osi czasu.",
    toFinances: "Otwórz finanse", toGoals: "Zobacz cele", toPortfolios: "Zobacz portfele", toLiabilities: "Zobacz zobowiązania",
    rulesCount: "reguł wydatków", historyInfo: "mies. historii", caution: "Prognoza, nie gwarancja. Nie obejmuje nieujętych zobowiązań, nowych zakupów ani niepewnych wpływów. Raty bez jednoznacznej reguły wydatku są rezerwowane dodatkowo (możliwe zawyżenie kosztów); zaksięgowanych operacji nie liczymy drugi raz.",
    introHint: "Aby zobaczyć kwotę do rozdysponowania, potrzebne są reguły wydatków, historia i aktualne rezerwacje.",
    noDataGraph: "Wykres bez kompletnych danych ma charakter wyłącznie orientacyjny.",
  },
  en: {
    kicker: "FREEDOM / FINANCIAL COMMAND CENTER", title: "Financial decision center",
    subtitle: "See what you can allocate, what needs protection and what deserves attention.",
    safety: "Safety reserve", days: "Horizon", months: "months",
    liquid: "Total cash", liquidNote: "Bank accounts and cash, excluding investments",
    available: "Unallocated cash", availableNote: "After goal and debt reservations",
    payments: "Expenses to cover", paymentsNote: "Recurring bills, debt payments and estimated living costs",
    invest: "Potentially allocatable", investNote: "No future income assumed; safety buffer protected",
    missing: "Insufficient data", fetchError: "Unable to verify reservations", reload: "Retry",
    breakdown: "How was it calculated?", allocations: "Reserved for goals and liabilities",
    scheduled: "Scheduled bills / installments", flexible: "Estimated other spending",
    buffer: "Missing safety buffer", emergency: "Already reserved in emergency goals",
    noEstimate: "Not enough information", cashProjection: "Unallocated cash forecast", projectionNote: "After reservations · estimates based on rules and history",
    forecastEnd: "Balance in", daysSuffix: "days", lowBalance: "Lowest projected balance",
    upcoming: "Upcoming payments", noPayments: "No scheduled payments in this period.",
    recommendations: "Priorities and alerts", recommendationHint: "Insights come only from recorded data.",
    noRulesTitle: "Add recurring expenses", noRulesDetail: "Without fixed expense rules, the freely allocatable amount cannot be estimated reliably.",
    noHistoryTitle: "Add spending history", noHistoryDetail: "At least one of the last three completed months needs recorded transactions.",
    allocationsErrorTitle: "Reservations not verified", allocationsErrorDetail: "Goal and liability allocations could not be loaded. The allocation estimate is disabled for safety.",
    alertLowTitle: "Cash-flow risk", alertLowDetail: "Unallocated cash may fall below zero. Review your upcoming payments.",
    alertEmergencyTitle: "Top up the emergency fund", alertEmergencyDetail: "Cash earmarked for emergencies does not yet cover your selected buffer.",
    alertSafeTitle: "Potential surplus available", alertSafeDetail: "An estimate after reserves, bills and safety buffer. Not investment advice.",
    alertOkTitle: "Keep your safety margin", alertOkDetail: "No additional funds appear available without reducing your safety buffer.",
    debtTitle: "Review debt payment dates", debtDetail: "Monthly installments lack due dates, so they cannot be placed on the timeline.",
    toFinances: "Open finances", toGoals: "View goals", toPortfolios: "View portfolios", toLiabilities: "View liabilities",
    rulesCount: "expense rules", historyInfo: "months of history",
    caution: "Projection, not a guarantee. Excludes unrecorded bills, new purchases and uncertain income. Debt payments without an exact matching expense rule are reserved separately (which may overestimate costs); booked transactions are not counted twice.",
    introHint: "Expense rules, history and confirmed reservations are required for an allocatable amount.",
    noDataGraph: "Forecast with incomplete data is illustrative only.",
  },
  de: {
    kicker: "FREEDOM / FINANCIAL COMMAND CENTER", title: "Finanz-Entscheidungszentrale",
    subtitle: "Erkenne, welcher Betrag frei ist, was reserviert werden muss und wo Risiken bestehen.",
    safety: "Sicherheitsreserve", days: "Zeitraum", months: "Monate",
    liquid: "Gesamtes Bargeld", liquidNote: "Konten und Bargeld, ohne Anlagen",
    available: "Freie Liquidität", availableNote: "Nach Ziel- und Schuldreservierungen",
    payments: "Geplante Ausgaben", paymentsNote: "Regelmäßige Kosten, Raten und geschätzter Lebensunterhalt",
    invest: "Potenziell verfügbar", investNote: "Ohne künftige Einnahmen, mit Sicherheitsreserve",
    missing: "Zu wenig Daten", fetchError: "Reservierungen nicht geprüft", reload: "Erneut laden",
    breakdown: "Wie wird gerechnet?", allocations: "Für Ziele und Schulden reserviert",
    scheduled: "Rechnungen / Raten", flexible: "Geschätzte weitere Ausgaben",
    buffer: "Fehlende Sicherheitsreserve", emergency: "In Notfallzielen bereits reserviert",
    noEstimate: "Keine verlässliche Schätzung", cashProjection: "Prognose freier Mittel", projectionNote: "Nach Reservierungen · basierend auf Regeln und Historie",
    forecastEnd: "Saldo in", daysSuffix: "Tagen", lowBalance: "Niedrigster erwarteter Saldo",
    upcoming: "Anstehende Zahlungen", noPayments: "In diesem Zeitraum sind keine Zahlungen geplant.",
    recommendations: "Prioritäten und Hinweise", recommendationHint: "Die Hinweise nutzen nur erfasste Daten.",
    noRulesTitle: "Regelmäßige Ausgaben eintragen", noRulesDetail: "Ohne feste Ausgabenregeln ist eine zuverlässige Schätzung nicht möglich.",
    noHistoryTitle: "Ausgabenhistorie ergänzen", noHistoryDetail: "Mindestens einer der letzten drei abgeschlossenen Monate muss Buchungen enthalten.",
    allocationsErrorTitle: "Reservierungen nicht bestätigt", allocationsErrorDetail: "Ziel- und Schuldzuordnungen konnten nicht geladen werden. Die Berechnung bleibt gesperrt.",
    alertLowTitle: "Liquiditätsrisiko", alertLowDetail: "Freie Mittel könnten unter null fallen. Prüfe fällige Zahlungen.",
    alertEmergencyTitle: "Notreserve auffüllen", alertEmergencyDetail: "Reservierte Notfallmittel decken die ausgewählte Reserve noch nicht.",
    alertSafeTitle: "Möglicher Überschuss", alertSafeDetail: "Schätzung nach Kosten und Reserven. Keine Anlageberatung.",
    alertOkTitle: "Reserve beibehalten", alertOkDetail: "Ohne Verringerung der Sicherheitsreserve gibt es keinen zusätzlichen Spielraum.",
    debtTitle: "Ratentermine prüfen", debtDetail: "Monatsraten haben keine Fälligkeit und erscheinen deshalb nicht im Zeitplan.",
    toFinances: "Finanzen öffnen", toGoals: "Ziele ansehen", toPortfolios: "Portfolios ansehen", toLiabilities: "Schulden ansehen",
    rulesCount: "Ausgabenregeln", historyInfo: "Monate Historie",
    caution: "Prognose ohne Gewähr. Nicht erfasste Kosten, neue Käufe und unsichere Einnahmen fehlen. Raten ohne passende Ausgabenregel werden zusätzlich reserviert (mögliche Überschätzung); verbuchte Vorgänge nicht doppelt gezählt.",
    introHint: "Für die Berechnung werden Ausgabenregeln, Historie und geprüfte Reservierungen benötigt.",
    noDataGraph: "Die Prognose mit unvollständigen Daten ist nur illustrativ.",
  },
  es: {
    kicker: "FREEDOM / FINANCIAL COMMAND CENTER", title: "Centro de decisiones financieras",
    subtitle: "Descubre cuánto puedes asignar, qué debes reservar y qué riesgos requieren atención.",
    safety: "Fondo de seguridad", days: "Horizonte", months: "meses",
    liquid: "Efectivo total", liquidNote: "Cuentas y efectivo, sin inversiones",
    available: "Efectivo libre", availableNote: "Después de reservas para metas y deudas",
    payments: "Gastos por cubrir", paymentsNote: "Facturas, cuotas y gastos estimados",
    invest: "Potencialmente disponible", investNote: "Sin ingresos futuros, con fondo de seguridad",
    missing: "Datos insuficientes", fetchError: "No se pueden verificar las reservas", reload: "Reintentar",
    breakdown: "¿Cómo se calcula?", allocations: "Reservado para metas y deudas",
    scheduled: "Facturas / cuotas", flexible: "Otros gastos estimados",
    buffer: "Reserva de seguridad pendiente", emergency: "Ya reservado para emergencias",
    noEstimate: "No hay datos suficientes", cashProjection: "Previsión de efectivo libre", projectionNote: "Después de las reservas · cálculo con reglas e historial",
    forecastEnd: "Saldo en", daysSuffix: "días", lowBalance: "Saldo mínimo previsto",
    upcoming: "Próximos pagos", noPayments: "No hay pagos programados en este período.",
    recommendations: "Prioridades y alertas", recommendationHint: "Las sugerencias utilizan solo los datos registrados.",
    noRulesTitle: "Añade gastos recurrentes", noRulesDetail: "Sin reglas de gastos fijos no se puede estimar con fiabilidad el dinero disponible.",
    noHistoryTitle: "Completa el historial de gastos", noHistoryDetail: "Se necesitan movimientos en al menos uno de los últimos tres meses cerrados.",
    allocationsErrorTitle: "Reservas no verificadas", allocationsErrorDetail: "No se pudieron cargar las asignaciones de metas y deudas. El cálculo está desactivado por seguridad.",
    alertLowTitle: "Riesgo de liquidez", alertLowDetail: "El efectivo libre puede caer por debajo de cero. Revisa los vencimientos.",
    alertEmergencyTitle: "Completa el fondo de emergencia", alertEmergencyDetail: "Los fondos reservados no cubren todavía el colchón seleccionado.",
    alertSafeTitle: "Hay un posible excedente", alertSafeDetail: "Estimación tras gastos y reservas; no es asesoramiento de inversión.",
    alertOkTitle: "Mantén tu colchón", alertOkDetail: "No parece haber excedente sin reducir el fondo de seguridad.",
    debtTitle: "Revisa las fechas de las cuotas", debtDetail: "Las cuotas mensuales no tienen fecha de vencimiento y no aparecen en el calendario.",
    toFinances: "Abrir finanzas", toGoals: "Ver metas", toPortfolios: "Ver carteras", toLiabilities: "Ver deudas",
    rulesCount: "reglas de gastos", historyInfo: "meses de historial",
    caution: "Es una previsión, no una garantía. No incluye gastos no registrados, compras nuevas ni ingresos inciertos. Las cuotas sin una regla de gasto coincidente se reservan aparte (posible sobreestimación); las operaciones ya registradas no se duplican.",
    introHint: "Se necesitan reglas de gastos, historial y reservas verificadas para calcular el importe disponible.",
    noDataGraph: "La previsión con datos incompletos es solo orientativa.",
  },
} as const;

export function FinancialCommandCenter({ portfolio, goals, liabilities, monthlyBudget, recurringTransactions }: Props) {
  const { language, locale } = useLanguage();
  const copy = translations[language];
  const [horizonDays, setHorizonDays] = useState<30 | 60 | 90>(30);
  const [bufferMonths, setBufferMonths] = useState<3 | 6 | 9>(6);
  const [reloadKey, setReloadKey] = useState(0);
  const [allocationState, setAllocationState] = useState<{
    status: "loading" | "ready" | "error";
    goals: MoneyFlowOverview | null;
    liabilities: LiabilityAllocationOverview | null;
  }>({ status: "loading", goals: null, liabilities: null });

  useEffect(() => {
    let cancelled = false;
    setAllocationState({ status: "loading", goals: null, liabilities: null });
    Promise.all([goalAllocationApi.getOverview(), liabilityAllocationApi.getOverview()])
      .then(([goalOverview, liabilityOverview]) => {
        if (!cancelled) setAllocationState({ status: "ready", goals: goalOverview, liabilities: liabilityOverview });
      })
      .catch((error: unknown) => {
        console.error("Financial Command Center: nie udało się pobrać rezerwacji:", error);
        if (!cancelled) setAllocationState({ status: "error", goals: null, liabilities: null });
      });
    return () => { cancelled = true; };
  }, [portfolio, goals, liabilities, reloadKey]);

  const result = useMemo(() => calculateFinancialCommandCenter({
    portfolio, goals, liabilities, monthlyBudget, recurringTransactions,
    goalAllocations: allocationState.status === "ready" ? allocationState.goals : null,
    liabilityAllocations: allocationState.status === "ready" ? allocationState.liabilities : null,
    horizonDays, bufferMonths,
  }), [portfolio, goals, liabilities, monthlyBudget, recurringTransactions, allocationState, horizonDays, bufferMonths]);

  const money = (amount: number) => formatDisplayMoney(amount, { language, maximumFractionDigits: 0 });
  const shortMoney = (amount: number) => formatDisplayMoneyCompact(amount, language);
  const date = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString(locale, { day: "numeric", month: "short" });
  const forecastReady = result.sufficientData;
  const paymentsEstimate = result.billReserve + (result.estimatedFlexibleSpending ?? 0);
  const alerts: Alert[] = [];
  if (allocationState.status === "error") alerts.push({ id: "reservations", tone: "warn", title: copy.allocationsErrorTitle, detail: copy.allocationsErrorDetail, to: "/investments", action: copy.toPortfolios });
  if (!result.hasActiveExpenseRules) alerts.push({ id: "rules", tone: "warn", title: copy.noRulesTitle, detail: copy.noRulesDetail, to: "/finances", action: copy.toFinances });
  if (!result.historicalMonths) alerts.push({ id: "history", tone: "warn", title: copy.noHistoryTitle, detail: copy.noHistoryDetail, to: "/finances", action: copy.toFinances });
  if (forecastReady && result.minProjectedBalance !== null && result.minProjectedBalance < 0) alerts.push({ id: "liquidity", tone: "warn", title: copy.alertLowTitle, detail: copy.alertLowDetail, to: "/finances", action: copy.toFinances });
  if (result.bufferGap !== null && result.bufferGap > 0) alerts.push({ id: "emergency", tone: "warn", title: copy.alertEmergencyTitle, detail: copy.alertEmergencyDetail, to: "/goals", action: copy.toGoals });
  if (result.monthlyDebtPayments > 0) alerts.push({ id: "debt", tone: "info", title: copy.debtTitle, detail: copy.debtDetail, to: "/liabilities", action: copy.toLiabilities });
  if (result.sufficientData) alerts.push(result.safeToAllocate !== null && result.safeToAllocate > 0
    ? { id: "surplus", tone: "good", title: copy.alertSafeTitle, detail: copy.alertSafeDetail, to: "/investments", action: copy.toPortfolios }
    : { id: "buffer", tone: "info", title: copy.alertOkTitle, detail: copy.alertOkDetail, to: "/goals", action: copy.toGoals });

  return (
    <section className="mt-6 overflow-hidden rounded-[28px] border border-cyan-500/20 bg-[#081321] shadow-[0_24px_80px_rgba(2,6,23,.35)]">
      <div className="relative overflow-hidden border-b border-white/[0.07] bg-gradient-to-r from-cyan-500/[0.11] via-blue-500/[0.06] to-violet-500/[0.08] px-5 py-6 sm:px-7">
        <div className="pointer-events-none absolute -right-24 -top-32 h-64 w-64 rounded-full bg-cyan-400/10 blur-[75px]" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"><Activity size={23}/></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.23em] text-cyan-300/80">{copy.kicker}</p>
              <h2 className="mt-1.5 text-xl font-black tracking-tight text-white sm:text-2xl">{copy.title}</h2>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-400 sm:text-sm">{copy.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-1.5">
              <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">{copy.days}</div>
              <div className="flex gap-1">{([30, 60, 90] as const).map((value) => <button key={value} type="button" onClick={() => setHorizonDays(value)} aria-pressed={horizonDays === value} className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${horizonDays === value ? "bg-cyan-500/20 text-cyan-200" : "text-slate-500 hover:text-white"}`}>{value}D</button>)}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-1.5">
              <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">{copy.safety}</div>
              <div className="flex gap-1">{([3, 6, 9] as const).map((value) => <button key={value} type="button" onClick={() => setBufferMonths(value)} aria-pressed={bufferMonths === value} className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${bufferMonths === value ? "bg-violet-500/25 text-violet-200" : "text-slate-500 hover:text-white"}`}>{value}M</button>)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          <InsightCard title={copy.liquid} subtitle={copy.liquidNote} value={money(result.liquidCash)} icon={Wallet} tone="blue" />
          <InsightCard title={copy.available} subtitle={copy.availableNote} value={result.hasReservationData ? money(result.availableCash) : "—"} icon={LockKeyhole} tone="violet" />
          <InsightCard title={copy.payments} subtitle={copy.paymentsNote} value={result.historicalMonths > 0 ? money(paymentsEstimate) : "—"} icon={CalendarClock} tone="amber" />
          <InsightCard title={copy.invest} subtitle={copy.investNote} value={result.safeToAllocate !== null ? money(result.safeToAllocate) : "—"} icon={Coins} tone="emerald" featured />
        </div>
        {!result.sufficientData && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3 text-xs leading-5 text-amber-200/90">
            <CircleHelp size={15} className="shrink-0"/>
            {allocationState.status === "loading" ? copy.noEstimate : allocationState.status === "error" ? copy.fetchError : copy.introHint}
            {allocationState.status === "error" && <button type="button" onClick={() => setReloadKey((count) => count + 1)} className="ml-auto flex items-center gap-1 font-bold underline underline-offset-2"><RefreshCw size={13}/>{copy.reload}</button>}
          </div>
        )}
        <div className="mt-4 grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,1fr)]">
          <div className="min-w-0 space-y-4">
            <div className="rounded-2xl border border-slate-800/80 bg-[#0b1929] p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-white"><TrendingUp size={17} className="text-cyan-400"/>{copy.cashProjection}</div>
                  <p className="mt-1 text-[11px] text-slate-500">{copy.projectionNote}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">{copy.forecastEnd} {horizonDays} {copy.daysSuffix}</p>
                  <p className={`mt-1 text-lg font-black tabular-nums ${result.projectedEndBalance === null ? "text-slate-500" : result.projectedEndBalance < 0 ? "text-rose-300" : "text-cyan-200"}`}>{forecastReady && result.projectedEndBalance !== null ? money(result.projectedEndBalance) : "—"}</p>
                </div>
              </div>
              <div className="mt-5 h-52 w-full min-w-0 sm:h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.forecast} margin={{ top: 8, right: 7, bottom: 0, left: 0 }}>
                    <defs><linearGradient id="commandCenterBalance" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity={0.23}/><stop offset="100%" stopColor="#22d3ee" stopOpacity={0.015}/></linearGradient></defs>
                    <CartesianGrid stroke="#253349" strokeDasharray="4 5" vertical={false}/>
                    <XAxis dataKey="date" tickFormatter={date} tickLine={false} axisLine={false} stroke="#64748b" fontSize={10} minTickGap={40}/>
                    <YAxis width={66} tickLine={false} axisLine={false} stroke="#64748b" fontSize={10} tickFormatter={shortMoney}/>
                    <ReferenceLine y={0} stroke="#fb7185" strokeOpacity={0.5} strokeDasharray="4 5"/>
                    <Tooltip contentStyle={{ backgroundColor: "#0e2034", borderColor: "#334155", color: "#e2e8f0", borderRadius: 12, fontSize: 12 }} labelFormatter={(label) => date(String(label))} formatter={(value) => [money(Number(value ?? 0)), copy.available]} />
                    <Area type="monotone" dataKey="balance" stroke="#22d3ee" strokeWidth={2.5} fill="url(#commandCenterBalance)" dot={false} activeDot={{ r: 4, stroke: "#081321", strokeWidth: 2 }} isAnimationActive={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap justify-between gap-2 border-t border-slate-800/70 pt-3 text-[11px]">
                <span className="text-slate-500">{copy.lowBalance}: <strong className={result.minProjectedBalance !== null && result.minProjectedBalance < 0 ? "text-rose-300" : "text-slate-300"}>{forecastReady && result.minProjectedBalance !== null ? money(result.minProjectedBalance) : "—"}</strong></span>
                <span className="text-slate-500">{result.historicalMonths} {copy.historyInfo} · {recurringTransactions.filter((item) => item.active && item.type === "expense").length} {copy.rulesCount}</span>
              </div>
              {!forecastReady && <p className="mt-2 text-[11px] text-amber-300/75">{copy.noDataGraph}</p>}
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-[#0b1929] p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white"><CalendarClock size={17} className="text-blue-400"/>{copy.upcoming}</div>
              {result.upcomingPayments.length === 0 ? <p className="text-xs text-slate-500">{copy.noPayments}</p> : <div className="divide-y divide-slate-800/70">{result.upcomingPayments.map((event, index) => <div key={`${event.date}-${event.name}-${index}`} className="flex items-center justify-between gap-3 py-2.5 text-xs"><div className="flex items-center gap-3"><span className="w-14 shrink-0 font-semibold text-cyan-300">{date(event.date)}</span><span className="text-slate-300">{event.name}</span></div><span className="shrink-0 font-bold tabular-nums text-amber-200">{money(event.amount)}</span></div>)}</div>}
              <Link to="/finances" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 transition hover:text-cyan-300">{copy.toFinances} <ChevronRight size={13}/></Link>
            </div>
          </div>
          <div className="min-w-0 space-y-4">
            <div className="rounded-2xl border border-slate-800/80 bg-[#0b1929] p-4 sm:p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-white"><ShieldCheck size={17} className="text-violet-300"/>{copy.breakdown}</div>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">{copy.investNote}</p>
              <div className="mt-4 space-y-3">
                <BreakdownRow label={copy.liquid} value={money(result.liquidCash)} positive />
                <BreakdownRow label={copy.allocations} value={result.hasReservationData ? money(result.reservedCash) : "—"} />
                <BreakdownRow label={copy.scheduled} value={money(result.billReserve)} />
                <BreakdownRow label={copy.flexible} value={result.estimatedFlexibleSpending === null ? "—" : money(result.estimatedFlexibleSpending)} />
                <BreakdownRow label={copy.buffer} value={result.bufferGap === null || !result.hasReservationData ? "—" : money(result.bufferGap)} />
                <div className="border-t border-slate-700/80 pt-3"><BreakdownRow label={copy.invest} value={result.safeToAllocate === null ? "—" : money(result.safeToAllocate)} positive emphasized /></div>
              </div>
              {result.emergencyCashReserved > 0 && <div className="mt-3 flex gap-2 rounded-lg bg-violet-500/[0.07] px-3 py-2 text-[11px] text-violet-300"><CheckCircle2 size={14} className="shrink-0"/>{copy.emergency}: {money(result.emergencyCashReserved)}</div>}
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-[#0b1929] p-4 sm:p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-white"><Sparkles size={17} className="text-amber-300"/>{copy.recommendations}</div>
              <p className="mt-1 text-[11px] text-slate-500">{copy.recommendationHint}</p>
              <div className="mt-4 space-y-2.5">
                {alerts.slice(0, 4).map((alert) => <div key={alert.id} className={`rounded-xl border p-3 ${alert.tone === "warn" ? "border-amber-500/15 bg-amber-500/[0.06]" : alert.tone === "good" ? "border-emerald-500/15 bg-emerald-500/[0.06]" : "border-blue-500/15 bg-blue-500/[0.05]"}`}>
                  <div className="flex items-start gap-2"><span className={`mt-0.5 ${alert.tone === "warn" ? "text-amber-300" : alert.tone === "good" ? "text-emerald-300" : "text-blue-300"}`}>{alert.tone === "warn" ? <CircleAlert size={15}/> : alert.tone === "good" ? <ArrowUpRight size={15}/> : <Landmark size={15}/>}</span><div className="min-w-0 flex-1"><p className="text-xs font-bold text-slate-200">{alert.title}</p><p className="mt-1 text-[11px] leading-5 text-slate-400">{alert.detail}</p><Link to={alert.to} className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-200">{alert.action}<ArrowRight size={12}/></Link></div></div>
                </div>)}
              </div>
              <div className="mt-3 flex flex-wrap gap-2"><Link to="/goals" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 px-3 py-2 text-xs text-slate-300 hover:border-violet-400/40"><Target size={13}/>{copy.toGoals}</Link><Link to="/investments" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 px-3 py-2 text-xs text-slate-300 hover:border-cyan-400/40"><Wallet size={13}/>{copy.toPortfolios}</Link></div>
            </div>
          </div>
        </div>
        <p className="mt-4 flex items-start gap-2 text-[10px] leading-5 text-slate-500"><CircleHelp size={13} className="mt-0.5 shrink-0"/>{copy.caution}</p>
      </div>
    </section>
  );
}

type InsightCardProps = {
  title: string;
  subtitle: string;
  value: string;
  icon: typeof Wallet;
  tone: "blue" | "violet" | "amber" | "emerald";
  featured?: boolean;
};
function InsightCard({ title, subtitle, value, icon: Icon, tone, featured }: InsightCardProps) {
  const tones = { blue: "text-blue-300 bg-blue-500/10", violet: "text-violet-300 bg-violet-500/10", amber: "text-amber-300 bg-amber-500/10", emerald: "text-emerald-300 bg-emerald-500/10" };
  return <div className={`min-w-0 rounded-2xl border p-4 sm:p-5 ${featured ? "border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.11] to-[#0c1b2a]" : "border-slate-800/80 bg-[#0b1929]"}`}>
    <div className="flex items-center gap-2"><span className={`rounded-lg p-2 ${tones[tone]}`}><Icon size={16}/></span><span className="text-xs font-semibold text-slate-300">{title}</span></div>
    <div className={`mt-3 break-words text-2xl font-black tracking-tight tabular-nums lg:text-[26px] ${featured ? "text-emerald-300" : "text-white"}`}>{value}</div>
    <p className="mt-1.5 text-[11px] leading-5 text-slate-500">{subtitle}</p>
  </div>;
}
function BreakdownRow({ label, value, positive, emphasized }: { label: string; value: string; positive?: boolean; emphasized?: boolean }) {
  return <div className="flex items-start justify-between gap-3 text-xs"><span className={emphasized ? "font-bold text-slate-100" : "text-slate-400"}>{label}</span><span className={`shrink-0 font-bold tabular-nums ${emphasized ? "text-emerald-300" : positive ? "text-cyan-200" : "text-slate-200"}`}>{positive || value === "—" ? "" : "− "}{value}</span></div>;
}
