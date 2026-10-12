import type { AppLanguage } from "../i18n/LanguageContext";
import type { DisplayCurrency, ForeignDisplayCurrency } from "../i18n/CurrencyContext";

const CURRENCY_STORAGE_KEY = "freedom.displayCurrency";

function rateKey(currency: ForeignDisplayCurrency) {
  return `freedom.fx.${currency.toLowerCase()}PlnRate`;
}

export function getStoredDisplayCurrency(): DisplayCurrency {
  const value = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
  return value === "USD" || value === "EUR" || value === "CHF" ? value : "PLN";
}

export function getStoredCurrencyPlnRate(currency: ForeignDisplayCurrency): number | null {
  const value = Number(window.localStorage.getItem(rateKey(currency)));
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function getStoredUsdPlnRate(): number | null {
  return getStoredCurrencyPlnRate("USD");
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
  const rate = getStoredCurrencyPlnRate(currency);
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
  const rate = selected === "PLN" ? null : getStoredCurrencyPlnRate(selected);
  const effectiveCurrency: DisplayCurrency = selected === "PLN" || rate ? selected : "PLN";
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
