import type { AppLanguage } from "../i18n/LanguageContext";
import type { DisplayCurrency } from "../i18n/CurrencyContext";

const CURRENCY_STORAGE_KEY = "freedom.displayCurrency";
const USD_RATE_KEY = "freedom.fx.usdPlnRate";

export function getStoredDisplayCurrency(): DisplayCurrency {
  return window.localStorage.getItem(CURRENCY_STORAGE_KEY) === "USD" ? "USD" : "PLN";
}

export function getStoredUsdPlnRate(): number | null {
  const value = Number(window.localStorage.getItem(USD_RATE_KEY));
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function localeForLanguage(language?: AppLanguage) {
  const selected = language ?? readStoredLanguage();
  return selected === "de" ? "de-DE" : selected === "en" ? "en-US" : "pl-PL";
}

export function readStoredLanguage(): AppLanguage {
  const value = window.localStorage.getItem("freedom.language");
  return value === "en" || value === "de" ? value : "pl";
}

export function convertPlnForDisplay(plnAmount: number, currency = getStoredDisplayCurrency()) {
  if (currency === "PLN") return plnAmount;
  const rate = getStoredUsdPlnRate();
  return rate ? plnAmount / rate : plnAmount;
}

export function formatDisplayMoney(
  plnAmount: number,
  options: {
    language?: AppLanguage;
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
    compact?: boolean;
    signDisplay?: "auto" | "always" | "exceptZero" | "negative" | "never";
  } = {},
) {
  const selected = getStoredDisplayCurrency();
  const rate = getStoredUsdPlnRate();
  const effectiveCurrency: DisplayCurrency = selected === "USD" && rate ? "USD" : "PLN";
  const converted = convertPlnForDisplay(Number(plnAmount) || 0, effectiveCurrency);
  return new Intl.NumberFormat(localeForLanguage(options.language), {
    style: "currency",
    currency: effectiveCurrency,
    currencyDisplay: "narrowSymbol",
    notation: options.compact ? "compact" : "standard",
    compactDisplay: "short",
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
    minimumFractionDigits: options.minimumFractionDigits,
    signDisplay: options.signDisplay,
  }).format(converted);
}

export function formatDisplayMoneyCompact(plnAmount: number, language?: AppLanguage) {
  return formatDisplayMoney(plnAmount, { language, compact: true, maximumFractionDigits: 1 });
}
