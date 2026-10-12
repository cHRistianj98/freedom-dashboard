import type { Asset } from "../../types/Asset";
import type { Goal } from "../../types/Goal";
import type { Liability } from "../../types/Liability";
import type { MonthlyBudget } from "../../types/Cashflow";
import type { RecurringTransaction } from "../../types/RecurringTransaction";
import type { MoneyFlowOverview } from "../../types/GoalAllocation";
import type { LiabilityAllocationOverview } from "../../types/LiabilityAllocation";
import { createDateForMonth, isRuleBookedInMonth } from "../../utils/recurringTransactions";

export type CommandCenterInput = {
  portfolio: Asset[];
  goals: Goal[];
  liabilities: Liability[];
  monthlyBudget: MonthlyBudget;
  recurringTransactions: RecurringTransaction[];
  goalAllocations: MoneyFlowOverview | null;
  liabilityAllocations: LiabilityAllocationOverview | null;
  horizonDays: 30 | 60 | 90;
  bufferMonths: 3 | 6 | 9;
  today?: Date;
};

export type ScheduledCashflow = {
  date: string;
  name: string;
  amount: number;
  type: "income" | "expense";
};

export type CommandCenterPoint = { date: string; balance: number };

export type CommandCenterResult = {
  liquidCash: number;
  reservedCash: number;
  availableCash: number;
  emergencyCashReserved: number;
  historicalMonths: number;
  essentialMonthly: number | null;
  flexibleMonthly: number | null;
  bufferTarget: number | null;
  bufferGap: number | null;
  billReserve: number;
  scheduledExpenses: number;
  scheduledIncome: number;
  estimatedFlexibleSpending: number | null;
  monthlyDebtPayments: number;
  safeToAllocate: number | null;
  minProjectedBalance: number | null;
  projectedEndBalance: number | null;
  upcomingPayments: ScheduledCashflow[];
  forecast: CommandCenterPoint[];
  hasActiveExpenseRules: boolean;
  hasReservationData: boolean;
  sufficientData: boolean;
};

const finiteSigned = (value: unknown) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const finitePositive = (value: unknown) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
};

function localDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function addDays(day: Date, count: number) {
  const result = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12);
  result.setDate(result.getDate() + count);
  return result;
}

function monthlyHistory(budget: MonthlyBudget, nowMonth: string) {
  // Only the previous three CALENDAR months are allowed: an old abandoned
  // history must not silently become a current spending estimate.
  const monthIds = [3, 2, 1].map((offset) => {
    const now = new Date(`${nowMonth}-15T12:00:00`);
    now.setMonth(now.getMonth() - offset);
    return localDate(now).slice(0, 7);
  });
  const completed = monthIds.filter((month) =>
    budget.expenses.some((row) => row.date?.startsWith(month) && (row.category === "fixed" || row.category === "living"))
  );
  if (!completed.length) return { months: 0, essential: null, flexible: null };

  let essential = 0;
  let flexible = 0;
  for (const month of completed) {
    for (const item of budget.expenses) {
      if (!item.date?.startsWith(month)) continue;
      // Savings/investments are not a living-expense baseline. Goal spending
      // is typically one-off and is not extrapolated into future months.
      if (item.category !== "fixed" && item.category !== "living") continue;
      const amount = finitePositive(item.amount);
      essential += amount;
      // Future occurrences of rules are forecast separately below.
      if (!item.recurringRuleId && !item.recurring) flexible += amount;
    }
  }
  return {
    months: completed.length,
    essential: essential / completed.length,
    flexible: flexible / completed.length,
  };
}

function scheduledRules(
  rules: RecurringTransaction[],
  budget: MonthlyBudget,
  start: Date,
  days: number,
): ScheduledCashflow[] {
  const beginning = localDate(start);
  const end = localDate(addDays(start, days));
  const months = new Set<string>();
  for (let offset = 0; offset <= days; offset++) {
    months.add(localDate(addDays(start, offset)).slice(0, 7));
  }
  const result: ScheduledCashflow[] = [];
  for (const rule of rules) {
    if (!rule.active || finitePositive(rule.amount) <= 0) continue;
    for (const month of months) {
      const day = createDateForMonth(month, Math.max(1, Math.min(31, rule.dayOfMonth)));
      if (day < beginning || day > end || day < rule.startDate.slice(0, 10)) continue;
      // Already-booked transactions have ALREADY changed real cash balances,
      // including any transaction intentionally dated in the future.
      if (isRuleBookedInMonth(rule, month, budget.incomes, budget.expenses)) continue;
      result.push({ date: day, name: rule.name, amount: finitePositive(rule.amount), type: rule.type });
    }
  }
  return result.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}

export function calculateFinancialCommandCenter(input: CommandCenterInput): CommandCenterResult {
  const today = input.today ?? new Date();
  const baseDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  const currentMonth = localDate(baseDate).slice(0, 7);
  const history = monthlyHistory(input.monthlyBudget, currentMonth);
  const cashAssets = input.portfolio.filter((asset) => asset.category === "cash" || asset.systemCash === true);
  const cashAssetIds = new Set(cashAssets.map((asset) => asset.id));
  const liquidCash = cashAssets.reduce((sum, asset) => sum + finiteSigned(asset.value), 0);
  const hasReservationData = input.goalAllocations !== null && input.liabilityAllocations !== null
    && input.goalAllocations.allocations.every((row) => finitePositive(row.amount) === 0 || row.assetId != null)
    && input.liabilityAllocations.allocations.every((row) => finitePositive(row.amount) === 0 || row.assetId != null);
  const emergencyGoalIds = new Set(input.goals.filter((goal) => goal.type === "EMERGENCY_FUND" && goal.status !== "COMPLETED").map((goal) => goal.id));
  const byAsset = new Map<number, { goal: number; liability: number; emergency: number }>();
  const obtain = (id: number) => {
    let item = byAsset.get(id);
    if (!item) {
      item = { goal: 0, liability: 0, emergency: 0 };
      byAsset.set(id, item);
    }
    return item;
  };
  if (input.goalAllocations) {
    for (const row of input.goalAllocations.allocations) {
      if (row.assetId == null || !cashAssetIds.has(row.assetId)) continue;
      const item = obtain(row.assetId);
      item.goal += finitePositive(row.amount);
      if (emergencyGoalIds.has(row.goalId)) item.emergency += finitePositive(row.amount);
    }
  }
  if (input.liabilityAllocations) {
    for (const row of input.liabilityAllocations.allocations) {
      if (row.assetId == null || !cashAssetIds.has(row.assetId)) continue;
      obtain(row.assetId).liability += finitePositive(row.amount);
    }
  }
  let reservedCash = 0;
  let emergencyCashReserved = 0;
  for (const cash of cashAssets) {
    const record = byAsset.get(cash.id);
    if (!record) continue;
    const value = finitePositive(cash.value);
    const total = record.goal + record.liability;
    reservedCash += Math.min(value, total);
    emergencyCashReserved += Math.min(record.emergency, value, Math.min(value, total));
  }
  const availableCash = Math.max(0, liquidCash - reservedCash);
  const events = scheduledRules(input.recurringTransactions, input.monthlyBudget, baseDate, input.horizonDays);
  const scheduledExpenses = events.filter((event) => event.type === "expense").reduce((sum, event) => sum + event.amount, 0);
  const scheduledIncome = events.filter((event) => event.type === "income").reduce((sum, event) => sum + event.amount, 0);
  const unpaidLiabilities = input.liabilities.filter((debt) => finitePositive(debt.remainingAmount) > 0);
  const monthlyDebtPayments = unpaidLiabilities.reduce((sum, debt) => sum + finitePositive(debt.monthlyPayment), 0);
  const normalizeName = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("pl-PL");
  // Only an exact name AND amount match identifies a debt installment already
  // represented by a recurring expense. In all ambiguous cases, over-reserve
  // rather than risk declaring money safe to invest when it is needed for debt.
  const unmatchedDebtPayments = unpaidLiabilities.reduce((sum, debt) => {
    const coveredByRule = input.recurringTransactions.some((rule) =>
      rule.active && rule.type === "expense" &&
      normalizeName(rule.name) === normalizeName(debt.name) &&
      Math.abs(finitePositive(rule.amount) - finitePositive(debt.monthlyPayment)) < 0.01
    );
    return sum + (coveredByRule ? 0 : finitePositive(debt.monthlyPayment));
  }, 0);
  const estimatedFlexibleSpending = history.flexible === null ? null : history.flexible * input.horizonDays / 30;
  const undatedDebtReserve = unmatchedDebtPayments * input.horizonDays / 30;
  const billReserve = scheduledExpenses + undatedDebtReserve;
  const bufferTarget = history.essential === null ? null : history.essential * input.bufferMonths;
  const bufferGap = bufferTarget === null ? null : Math.max(0, bufferTarget - emergencyCashReserved);
  const hasActiveExpenseRules = input.recurringTransactions.some((rule) => rule.active && rule.type === "expense");
  const sufficientData = hasReservationData && history.months > 0 && hasActiveExpenseRules;
  // Future expected salary is NOT counted as cash safe to invest today.
  const safeToAllocate = sufficientData && estimatedFlexibleSpending !== null && bufferGap !== null
    ? Math.max(0, availableCash - billReserve - estimatedFlexibleSpending - bufferGap)
    : null;

  const forecast: CommandCenterPoint[] = [{ date: localDate(baseDate), balance: availableCash }];
  let balance = availableCash;
  let minProjectedBalance = balance;
  const eventByDay = new Map<string, number>();
  for (const event of events) {
    eventByDay.set(event.date, (eventByDay.get(event.date) ?? 0) + (event.type === "income" ? event.amount : -event.amount));
  }
  for (let day = 1; day <= input.horizonDays; day++) {
    const date = localDate(addDays(baseDate, day));
    balance += (eventByDay.get(date) ?? 0) + (day === 1 ? (eventByDay.get(localDate(baseDate)) ?? 0) : 0) - (history.flexible ?? 0) / 30 - undatedDebtReserve / input.horizonDays;
    minProjectedBalance = Math.min(minProjectedBalance, balance);
    forecast.push({ date, balance: Math.round(balance * 100) / 100 });
  }
  return {
    liquidCash, reservedCash, availableCash, emergencyCashReserved,
    historicalMonths: history.months, essentialMonthly: history.essential,
    flexibleMonthly: history.flexible, bufferTarget, bufferGap,
    billReserve, scheduledExpenses, scheduledIncome, estimatedFlexibleSpending,
    monthlyDebtPayments, safeToAllocate,
    minProjectedBalance: history.months > 0 ? minProjectedBalance : null,
    projectedEndBalance: history.months > 0 ? balance : null,
    upcomingPayments: events.filter((event) => event.type === "expense").slice(0, 5),
    forecast, hasActiveExpenseRules, hasReservationData, sufficientData,
  };
}
