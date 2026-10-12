import { Check, Languages, RefreshCw, Settings2, WalletCards } from "lucide-react";
import { useLanguage, type AppLanguage, localize } from "../i18n/LanguageContext";
import { useCurrency, type DisplayCurrency } from "../i18n/CurrencyContext";
import { FlagIcon, type FlagCode } from "../components/settings/FlagIcon";

export function Settings() {
  const { language, setLanguage, t, locale } = useLanguage();
  const {
    displayCurrency,
    setDisplayCurrency,
    currentRatePln,
    rateUpdatedAt,
    loadingRate,
    refreshRate,
  } = useCurrency();
  const ui = (pl: string, en: string, de?: string, es?: string) => localize(language, pl, en, de, es);

  return (
    <main className="min-h-screen bg-[#050b16] p-8">
      <section className="mx-auto max-w-5xl">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
            <Settings2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">{t("settings")}</h1>
            <p className="mt-1 text-sm text-slate-500">{t("languageDescription")}</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-800 bg-[#0b1322] p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
              <Languages size={19} />
            </div>
            <div>
              <h2 className="font-black text-white">{t("language")}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">{t("savedLocally")}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <LanguageCard value="pl" selected={language === "pl"} title="Polski" description={t("polishDescription")} flag="PL" onSelect={setLanguage} />
            <LanguageCard value="en" selected={language === "en"} title="English" description={t("englishDescription")} flag="GB" onSelect={setLanguage} />
            <LanguageCard value="de" selected={language === "de"} title="Deutsch" description={t("germanDescription")} flag="DE" onSelect={setLanguage} />
            <LanguageCard value="es" selected={language === "es"} title="Español" description={t("spanishDescription")} flag="ES" onSelect={setLanguage} />
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-slate-800 bg-[#0b1322] p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                <WalletCards size={19} />
              </div>
              <div>
                <h2 className="font-black text-white">{ui("Waluta widoku", "Display currency", "Anzeigewährung", "Moneda de visualización")}</h2>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  {ui(
                    "Zmienia sposób wyświetlania wartości w aplikacji. Dane księgowe i wartości zapisane w bazie nadal pozostają w PLN.",
                    "Changes how values are displayed across the app. Accounting data and stored values remain in PLN.",
                    "Ändert die Anzeige der Werte in der App. Buchungsdaten und gespeicherte Werte bleiben weiterhin in PLN.",
                    "Cambia cómo se muestran los valores en la aplicación. Los datos contables y los valores guardados permanecen en PLN."
                  )}
                </p>
              </div>
            </div>
            {displayCurrency !== "PLN" && (
              <button
                type="button"
                onClick={() => void refreshRate()}
                disabled={loadingRate}
                className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 disabled:cursor-wait disabled:opacity-60"
              >
                <RefreshCw size={14} className={loadingRate ? "animate-spin" : ""} />
                {ui("Odśwież kurs", "Refresh rate", "Kurs aktualisieren", "Actualizar tipo")}
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <CurrencyCard
              value="PLN"
              selected={displayCurrency === "PLN"}
              flag="PL"
              title="PLN"
              description={ui("Złoty polski — waluta bazowa Freedom", "Polish złoty — Freedom base currency", "Polnischer Złoty — Basiswährung von Freedom", "Złoty polaco — moneda base de Freedom")}
              onSelect={setDisplayCurrency}
            />
            <CurrencyCard
              value="USD"
              selected={displayCurrency === "USD"}
              flag="US"
              title="USD"
              description={currencyDescription("USD", displayCurrency, currentRatePln, locale, ui)}
              onSelect={setDisplayCurrency}
            />
            <CurrencyCard
              value="EUR"
              selected={displayCurrency === "EUR"}
              flag="EU"
              title="EUR"
              description={currencyDescription("EUR", displayCurrency, currentRatePln, locale, ui)}
              onSelect={setDisplayCurrency}
            />
            <CurrencyCard
              value="CHF"
              selected={displayCurrency === "CHF"}
              flag="CH"
              title="CHF"
              description={currencyDescription("CHF", displayCurrency, currentRatePln, locale, ui)}
              onSelect={setDisplayCurrency}
            />
          </div>

          {displayCurrency !== "PLN" && rateUpdatedAt && (
            <p className="mt-3 text-[11px] text-slate-600">
              {ui("Kurs zaktualizowany", "Rate updated", "Kurs aktualisiert", "Tipo actualizado")}: {new Date(rateUpdatedAt).toLocaleString(locale)}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

function currencyDescription(
  currency: Exclude<DisplayCurrency, "PLN">,
  selectedCurrency: DisplayCurrency,
  currentRatePln: number | null,
  locale: string,
  ui: (pl: string, en: string, de?: string, es?: string) => string,
) {
  if (selectedCurrency === currency && currentRatePln) {
    const rate = currentRatePln.toLocaleString(locale, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
    return `1 ${currency} = ${rate} PLN`;
  }

  const names = {
    USD: ui("Dolar amerykański", "US dollar", "US-Dollar", "Dólar estadounidense"),
    EUR: ui("Euro", "Euro", "Euro", "Euro"),
    CHF: ui("Frank szwajcarski", "Swiss franc", "Schweizer Franken", "Franco suizo"),
  } as const;

  return `${names[currency]} · ${ui("kurs pobierany automatycznie", "rate loaded automatically", "Kurs wird automatisch geladen", "tipo cargado automáticamente")}`;
}

function LanguageCard({
  value,
  selected,
  title,
  description,
  flag,
  onSelect,
}: {
  value: AppLanguage;
  selected: boolean;
  title: string;
  description: string;
  flag: FlagCode;
  onSelect: (value: AppLanguage) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`group flex cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
        selected
          ? "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_0_1px_rgba(34,211,238,.12)]"
          : "border-slate-800 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-900/70"
      }`}
    >
      <span className="grid h-12 w-14 shrink-0 place-items-center rounded-2xl border border-white/10 bg-slate-950/55 shadow-inner shadow-black/30"><FlagIcon code={flag} className="h-7 w-10" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-black text-white">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
      </span>
      <CheckBubble selected={selected} />
    </button>
  );
}

function CurrencyCard({
  value,
  selected,
  title,
  description,
  flag,
  onSelect,
}: {
  value: DisplayCurrency;
  selected: boolean;
  title: string;
  description: string;
  flag: FlagCode;
  onSelect: (value: DisplayCurrency) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`group flex cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
        selected
          ? "border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(52,211,153,.12)]"
          : "border-slate-800 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-900/70"
      }`}
    >
      <span className="grid h-12 w-14 shrink-0 place-items-center rounded-2xl border border-white/10 bg-slate-950/55"><FlagIcon code={flag} className="h-7 w-10" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-black text-white">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
      </span>
      <CheckBubble selected={selected} tone="emerald" />
    </button>
  );
}

function CheckBubble({ selected, tone = "cyan" }: { selected: boolean; tone?: "cyan" | "emerald" }) {
  const selectedClass = tone === "emerald"
    ? "border-emerald-400 bg-emerald-400 text-slate-950"
    : "border-cyan-400 bg-cyan-400 text-slate-950";
  return (
    <span className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${selected ? selectedClass : "border-slate-700 text-transparent group-hover:border-slate-500"}`}>
      <Check size={15} strokeWidth={3} />
    </span>
  );
}
