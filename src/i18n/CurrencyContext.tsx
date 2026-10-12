import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { marketPriceApi } from "../api/marketPriceApi";
import { authApi } from "../api/authApi";
import { useLanguage } from "./LanguageContext";

export type DisplayCurrency = "PLN" | "USD" | "EUR" | "CHF";
export type ForeignDisplayCurrency = Exclude<DisplayCurrency, "PLN">;

const STORAGE_KEY = "freedom.displayCurrency";
const RATE_MAX_AGE_MS = 6 * 60 * 60 * 1000;

function rateKey(currency: ForeignDisplayCurrency) {
  return `freedom.fx.${currency.toLowerCase()}PlnRate`;
}

function rateTimestampKey(currency: ForeignDisplayCurrency) {
  return `${rateKey(currency)}.updatedAt`;
}

function readStoredRate(currency: ForeignDisplayCurrency) {
  const raw = Number(window.localStorage.getItem(rateKey(currency)));
  return Number.isFinite(raw) && raw > 0 ? raw : null;
}

function readStoredRateTimestamp(currency: ForeignDisplayCurrency) {
  const raw = Number(window.localStorage.getItem(rateTimestampKey(currency)));
  return Number.isFinite(raw) && raw > 0 ? raw : 0;
}

function isDisplayCurrency(value: string | null): value is DisplayCurrency {
  return value === "PLN" || value === "USD" || value === "EUR" || value === "CHF";
}

function currencySymbol(currency: DisplayCurrency) {
  switch (currency) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "CHF":
      return "CHF";
    default:
      return "zł";
  }
}

type MoneyFormatOptions = {
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  compact?: boolean;
  signDisplay?: "auto" | "always" | "exceptZero" | "negative" | "never";
};

type CurrencyContextValue = {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (currency: DisplayCurrency) => void;
  ratesPln: Record<ForeignDisplayCurrency, number | null>;
  rateUpdatedAtByCurrency: Record<ForeignDisplayCurrency, number | null>;
  currentRatePln: number | null;
  rateUpdatedAt: number | null;
  loadingRate: boolean;
  refreshRate: (currency?: ForeignDisplayCurrency) => Promise<void>;
  convertFromPln: (plnAmount: number) => number;
  formatMoney: (plnAmount: number, options?: MoneyFormatOptions) => string;
  formatCompactMoney: (plnAmount: number) => string;
  displayCurrencySymbol: string;
  baseCurrency: "PLN";
  // Backwards-compatible alias used by older UI pieces.
  usdPlnRate: number | null;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { locale } = useLanguage();
  const [displayCurrency, setDisplayCurrencyState] = useState<DisplayCurrency>(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isDisplayCurrency(stored) ? stored : "PLN";
  });
  const [ratesPln, setRatesPln] = useState<Record<ForeignDisplayCurrency, number | null>>(() => ({
    USD: readStoredRate("USD"),
    EUR: readStoredRate("EUR"),
    CHF: readStoredRate("CHF"),
  }));
  const [rateUpdatedAtByCurrency, setRateUpdatedAtByCurrency] = useState<Record<ForeignDisplayCurrency, number | null>>(() => ({
    USD: readStoredRateTimestamp("USD") || null,
    EUR: readStoredRateTimestamp("EUR") || null,
    CHF: readStoredRateTimestamp("CHF") || null,
  }));
  const [loadingRate, setLoadingRate] = useState(false);

  const setDisplayCurrency = (currency: DisplayCurrency) => {
    window.localStorage.setItem(STORAGE_KEY, currency);
    setDisplayCurrencyState(currency);
  };

  async function refreshRate(currency?: ForeignDisplayCurrency) {
    if (!authApi.getToken()) return;
    const target = currency ?? (displayCurrency === "PLN" ? null : displayCurrency);
    if (!target) return;

    setLoadingRate(true);
    try {
      const quote = await marketPriceApi.getFxQuote(target, true);
      const nextRate = Number(quote.ratePln);
      if (Number.isFinite(nextRate) && nextRate > 0) {
        const now = Date.now();
        setRatesPln((current) => ({ ...current, [target]: nextRate }));
        setRateUpdatedAtByCurrency((current) => ({ ...current, [target]: now }));
        window.localStorage.setItem(rateKey(target), String(nextRate));
        window.localStorage.setItem(rateTimestampKey(target), String(now));
      }
    } catch (error) {
      console.warn(`Nie udało się odświeżyć kursu ${target}/PLN dla waluty widoku:`, error);
    } finally {
      setLoadingRate(false);
    }
  }

  useEffect(() => {
    if (displayCurrency === "PLN" || !authApi.getToken()) return;
    const currentRate = ratesPln[displayCurrency];
    const currentTimestamp = rateUpdatedAtByCurrency[displayCurrency] ?? 0;
    if (!currentRate || Date.now() - currentTimestamp > RATE_MAX_AGE_MS) {
      void refreshRate(displayCurrency);
    }
  }, [displayCurrency]);

  const value = useMemo<CurrencyContextValue>(() => {
    const currentRatePln = displayCurrency === "PLN" ? null : ratesPln[displayCurrency];
    const rateUpdatedAt = displayCurrency === "PLN" ? null : rateUpdatedAtByCurrency[displayCurrency];

    const convertFromPln = (plnAmount: number) => {
      if (displayCurrency === "PLN") return plnAmount;
      if (!currentRatePln || currentRatePln <= 0) return plnAmount;
      return plnAmount / currentRatePln;
    };

    const formatMoney = (plnAmount: number, options: MoneyFormatOptions = {}) => {
      const hasRate = displayCurrency === "PLN" || Boolean(currentRatePln && currentRatePln > 0);
      const effectiveCurrency: DisplayCurrency = hasRate ? displayCurrency : "PLN";
      const converted = effectiveCurrency === "PLN"
        ? Number(plnAmount) || 0
        : convertFromPln(Number(plnAmount) || 0);

      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: effectiveCurrency,
        currencyDisplay: "narrowSymbol",
        notation: options.compact ? "compact" : "standard",
        compactDisplay: "short",
        maximumFractionDigits: options.maximumFractionDigits ?? 2,
        minimumFractionDigits: options.minimumFractionDigits,
        signDisplay: options.signDisplay,
      }).format(converted);
    };

    const formatCompactMoney = (plnAmount: number) =>
      formatMoney(plnAmount, { compact: true, maximumFractionDigits: 1 });

    return {
      displayCurrency,
      setDisplayCurrency,
      ratesPln,
      rateUpdatedAtByCurrency,
      currentRatePln,
      rateUpdatedAt,
      loadingRate,
      refreshRate,
      convertFromPln,
      formatMoney,
      formatCompactMoney,
      displayCurrencySymbol: currencySymbol(displayCurrency),
      baseCurrency: "PLN",
      usdPlnRate: ratesPln.USD,
    };
  }, [displayCurrency, locale, rateUpdatedAtByCurrency, ratesPln, loadingRate]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used inside CurrencyProvider");
  return context;
}
