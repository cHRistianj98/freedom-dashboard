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

export type DisplayCurrency = "PLN" | "USD";

const STORAGE_KEY = "freedom.displayCurrency";
const USD_RATE_KEY = "freedom.fx.usdPlnRate";
const USD_RATE_TS_KEY = "freedom.fx.usdPlnRate.updatedAt";
const RATE_MAX_AGE_MS = 6 * 60 * 60 * 1000;

function readStoredRate() {
  const raw = Number(window.localStorage.getItem(USD_RATE_KEY));
  return Number.isFinite(raw) && raw > 0 ? raw : null;
}

function readStoredRateTimestamp() {
  const raw = Number(window.localStorage.getItem(USD_RATE_TS_KEY));
  return Number.isFinite(raw) && raw > 0 ? raw : 0;
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
  usdPlnRate: number | null;
  rateUpdatedAt: number | null;
  loadingRate: boolean;
  refreshRate: () => Promise<void>;
  convertFromPln: (plnAmount: number) => number;
  formatMoney: (plnAmount: number, options?: MoneyFormatOptions) => string;
  formatCompactMoney: (plnAmount: number) => string;
  displayCurrencySymbol: string;
  baseCurrency: "PLN";
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { locale } = useLanguage();
  const [displayCurrency, setDisplayCurrencyState] = useState<DisplayCurrency>(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "USD" ? "USD" : "PLN";
  });
  const [usdPlnRate, setUsdPlnRate] = useState<number | null>(() => readStoredRate());
  const [rateUpdatedAt, setRateUpdatedAt] = useState<number | null>(() => {
    const value = readStoredRateTimestamp();
    return value > 0 ? value : null;
  });
  const [loadingRate, setLoadingRate] = useState(false);

  const setDisplayCurrency = (currency: DisplayCurrency) => {
    window.localStorage.setItem(STORAGE_KEY, currency);
    setDisplayCurrencyState(currency);
  };

  async function refreshRate() {
    if (!authApi.getToken()) return;
    setLoadingRate(true);
    try {
      const quote = await marketPriceApi.getFxQuote("USD", true);
      const nextRate = Number(quote.ratePln);
      if (Number.isFinite(nextRate) && nextRate > 0) {
        const now = Date.now();
        setUsdPlnRate(nextRate);
        setRateUpdatedAt(now);
        window.localStorage.setItem(USD_RATE_KEY, String(nextRate));
        window.localStorage.setItem(USD_RATE_TS_KEY, String(now));
      }
    } catch (error) {
      console.warn("Nie udało się odświeżyć kursu USD/PLN dla waluty widoku:", error);
    } finally {
      setLoadingRate(false);
    }
  }

  useEffect(() => {
    if (displayCurrency !== "USD" || !authApi.getToken()) return;
    const currentTimestamp = rateUpdatedAt ?? 0;
    if (!usdPlnRate || Date.now() - currentTimestamp > RATE_MAX_AGE_MS) {
      void refreshRate();
    }
  }, [displayCurrency]);

  const value = useMemo<CurrencyContextValue>(() => {
    const convertFromPln = (plnAmount: number) => {
      if (displayCurrency === "PLN") return plnAmount;
      if (!usdPlnRate || usdPlnRate <= 0) return plnAmount;
      return plnAmount / usdPlnRate;
    };

    const formatMoney = (plnAmount: number, options: MoneyFormatOptions = {}) => {
      const converted = convertFromPln(Number(plnAmount) || 0);
      const currency = displayCurrency === "USD" && usdPlnRate ? "USD" : "PLN";
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
        notation: options.compact ? "compact" : "standard",
        compactDisplay: "short",
        maximumFractionDigits: options.maximumFractionDigits ?? (currency === "USD" ? 2 : 2),
        minimumFractionDigits: options.minimumFractionDigits,
        signDisplay: options.signDisplay,
      }).format(converted);
    };

    const formatCompactMoney = (plnAmount: number) =>
      formatMoney(plnAmount, { compact: true, maximumFractionDigits: 1 });

    return {
      displayCurrency,
      setDisplayCurrency,
      usdPlnRate,
      rateUpdatedAt,
      loadingRate,
      refreshRate,
      convertFromPln,
      formatMoney,
      formatCompactMoney,
      displayCurrencySymbol: displayCurrency === "USD" ? "$" : "zł",
      baseCurrency: "PLN",
    };
  }, [displayCurrency, locale, rateUpdatedAt, usdPlnRate, loadingRate]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used inside CurrencyProvider");
  return context;
}
