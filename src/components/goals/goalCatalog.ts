import type { AppLanguage } from "../../i18n/LanguageContext";
import type { GoalType } from "../../types/Goal";

export type GoalTypeOption = {
  value: GoalType;
  label: string;
  shortLabel: string;
  description: string;
  image: string;
  color: string;
  imagePosition?: "center" | "top" | "bottom";
  imageScale?: number;
  overlayClass?: string;
  translations: {
    en: { label: string; shortLabel: string; description: string };
    de: { label: string; shortLabel: string; description: string };
  };
};

function option(
  value: GoalType,
  pl: { label: string; short: string; description: string },
  en: { label: string; short: string; description: string },
  de: { label: string; short: string; description: string },
  image: string,
  color: string,
  visual: Partial<Pick<GoalTypeOption, "imagePosition" | "imageScale" | "overlayClass">> = {},
): GoalTypeOption {
  return {
    value,
    label: pl.label,
    shortLabel: pl.short,
    description: pl.description,
    image,
    color,
    imagePosition: visual.imagePosition ?? "center",
    imageScale: visual.imageScale ?? 1.03,
    overlayClass: visual.overlayClass ?? "from-[#06101f]/95 via-[#06101f]/25 to-black/5",
    translations: {
      en: { label: en.label, shortLabel: en.short, description: en.description },
      de: { label: de.label, shortLabel: de.short, description: de.description },
    },
  };
}

export const GOAL_TYPE_OPTIONS: GoalTypeOption[] = [
  option("EMERGENCY_FUND", { label: "Poduszka finansowa", short: "Poduszka", description: "Rezerwa bezpieczeństwa i płynności." }, { label: "Emergency fund", short: "Emergency", description: "Safety and liquidity reserve." }, { label: "Notgroschen", short: "Notgroschen", description: "Reserve für Sicherheit und Liquidität." }, "/goals/v2/emergency-fund.webp", "#22d3ee", { imagePosition: "center", imageScale: 1.08 }),
  option("HOME", { label: "Dom / mieszkanie", short: "Dom", description: "Zakup własnej nieruchomości lub wkład własny." }, { label: "Home / apartment", short: "Home", description: "Buy your own property or build a down payment." }, { label: "Haus / Wohnung", short: "Eigenheim", description: "Eigenheim kaufen oder Eigenkapital aufbauen." }, "/goals/v2/home.webp", "#3b82f6", { imageScale: 1.08 }),
  option("CAR", { label: "Samochód", short: "Samochód", description: "Zakup lub zmiana samochodu." }, { label: "Car", short: "Car", description: "Buy or replace a car." }, { label: "Auto", short: "Auto", description: "Ein Auto kaufen oder wechseln." }, "/goals/v2/car.webp", "#8b5cf6", { imagePosition: "center", imageScale: 1.07 }),
  option("TRAVEL", { label: "Podróż", short: "Podróż", description: "Większa podróż, wyjazd lub wyprawa." }, { label: "Travel", short: "Travel", description: "A larger trip, journey or expedition." }, { label: "Reise", short: "Reise", description: "Eine größere Reise oder Expedition." }, "/goals/v2/travel.webp", "#38bdf8", { imagePosition: "center", imageScale: 1.08 }),
  option("VACATION", { label: "Wakacje", short: "Wakacje", description: "Urlop i wypoczynek bez finansowania z przyszłego cashflow." }, { label: "Vacation", short: "Vacation", description: "Time off without financing it from future cashflow." }, { label: "Urlaub", short: "Urlaub", description: "Erholung ohne Finanzierung aus zukünftigem Cashflow." }, "/goals/v2/vacation.webp", "#14b8a6", { imageScale: 1.08 }),
  option("EDUCATION", { label: "Edukacja", short: "Edukacja", description: "Studia, kursy, certyfikaty i rozwój kompetencji." }, { label: "Education", short: "Education", description: "Studies, courses, certifications and skills development." }, { label: "Bildung", short: "Bildung", description: "Studium, Kurse, Zertifikate und Kompetenzaufbau." }, "/goals/v2/education.webp", "#f59e0b", { imageScale: 1.05 }),
  option("HEALTH", { label: "Zdrowie", short: "Zdrowie", description: "Leczenie, badania lub większy wydatek zdrowotny." }, { label: "Health", short: "Health", description: "Treatment, tests or a major health expense." }, { label: "Gesundheit", short: "Gesundheit", description: "Behandlung, Untersuchungen oder größere Gesundheitsausgaben." }, "/goals/v2/health.webp", "#ef4444", { imageScale: 1.05 }),
  option("DENTAL", { label: "Leczenie zębów", short: "Zęby", description: "Stomatologia, implanty, ortodoncja i odbudowa." }, { label: "Dental care", short: "Dental", description: "Dentistry, implants, orthodontics and reconstruction." }, { label: "Zahnbehandlung", short: "Zähne", description: "Zahnmedizin, Implantate, Kieferorthopädie und Wiederaufbau." }, "/goals/v2/dental.webp", "#0ea5e9", { imageScale: 1.09, overlayClass: "from-[#041525]/95 via-[#041525]/18 to-cyan-950/10" }),
  option("WEDDING", { label: "Ślub / wesele", short: "Ślub", description: "Budżet ceremonii, wesela lub podróży poślubnej." }, { label: "Wedding", short: "Wedding", description: "Budget for the ceremony, reception or honeymoon." }, { label: "Hochzeit", short: "Hochzeit", description: "Budget für Zeremonie, Feier oder Flitterwochen." }, "/goals/v2/wedding.webp", "#ec4899", { imageScale: 1.07 }),
  option("CHILD", { label: "Dziecko / rodzina", short: "Rodzina", description: "Wyprawka, opieka, edukacja lub rodzinny kapitał." }, { label: "Child / family", short: "Family", description: "Baby essentials, care, education or family capital." }, { label: "Kind / Familie", short: "Familie", description: "Erstausstattung, Betreuung, Bildung oder Familienkapital." }, "/goals/v2/child.webp", "#f472b6", { imageScale: 1.08 }),
  option("RENOVATION", { label: "Remont", short: "Remont", description: "Remont, wyposażenie lub modernizacja domu." }, { label: "Renovation", short: "Renovation", description: "Renovation, furnishings or home upgrades." }, { label: "Renovierung", short: "Renovierung", description: "Renovierung, Einrichtung oder Modernisierung des Zuhauses." }, "/goals/v2/renovation.webp", "#f97316", { imageScale: 1.05 }),
  option("ELECTRONICS", { label: "Sprzęt / elektronika", short: "Sprzęt", description: "Komputer, telefon, RTV lub większy zakup technologiczny." }, { label: "Electronics", short: "Electronics", description: "Computer, phone, AV equipment or another major tech purchase." }, { label: "Elektronik", short: "Elektronik", description: "Computer, Telefon, Unterhaltungselektronik oder größere Technikanschaffung." }, "/goals/v2/electronics.webp", "#6366f1", { imageScale: 1.07 }),
  option("BUSINESS", { label: "Własny biznes", short: "Biznes", description: "Kapitał na firmę, produkt lub rozwój działalności." }, { label: "Own business", short: "Business", description: "Capital for a company, product or business growth." }, { label: "Eigenes Unternehmen", short: "Business", description: "Kapital für Unternehmen, Produkt oder Wachstum." }, "/goals/v2/business.webp", "#2563eb", { imageScale: 1.06 }),
  option("INVESTMENT", { label: "Kapitał inwestycyjny", short: "Inwestycje", description: "Budowa kapitału przeznaczonego do inwestowania." }, { label: "Investment capital", short: "Investing", description: "Build capital dedicated to investing." }, { label: "Investitionskapital", short: "Investieren", description: "Kapital gezielt für Investitionen aufbauen." }, "/goals/v2/investment.webp", "#10b981", { imageScale: 1.05 }),
  option("DEBT_PAYOFF", { label: "Spłata długu", short: "Spłata długu", description: "Kapitał na wcześniejszą spłatę zobowiązania." }, { label: "Debt payoff", short: "Debt payoff", description: "Capital for early repayment of a liability." }, { label: "Schuldentilgung", short: "Tilgung", description: "Kapital für die vorzeitige Tilgung einer Verbindlichkeit." }, "/goals/v2/debt-payoff.webp", "#f59e0b", { imageScale: 1.05 }),
  option("RETIREMENT", { label: "Emerytura / wolność", short: "Emerytura", description: "Długoterminowy kapitał na niezależność finansową." }, { label: "Retirement / freedom", short: "Retirement", description: "Long-term capital for financial independence." }, { label: "Rente / Freiheit", short: "Rente", description: "Langfristiges Kapital für finanzielle Unabhängigkeit." }, "/goals/v2/retirement.webp", "#06b6d4", { imageScale: 1.06 }),
  option("HOBBY", { label: "Hobby / pasja", short: "Hobby", description: "Sprzęt lub projekt związany z pasją." }, { label: "Hobby / passion", short: "Hobby", description: "Equipment or a project related to your passion." }, { label: "Hobby / Leidenschaft", short: "Hobby", description: "Ausrüstung oder Projekt rund um deine Leidenschaft." }, "/goals/v2/hobby.webp", "#a855f7", { imageScale: 1.08 }),
  option("SECOND_PROPERTY", { label: "Druga nieruchomość", short: "Nieruchomość", description: "Zakup działki, lokalu lub kolejnej nieruchomości." }, { label: "Second property", short: "Property", description: "Buy land, a unit or another property." }, { label: "Zweite Immobilie", short: "Immobilie", description: "Grundstück, Wohnung oder weitere Immobilie kaufen." }, "/goals/v2/second-property.webp", "#0ea5e9", { imageScale: 1.08 }),
  option("LUXURY_PURCHASE", { label: "Duży / luksusowy zakup", short: "Duży zakup", description: "Zegarek, sprzęt premium lub inna nagroda za wynik." }, { label: "Large / luxury purchase", short: "Luxury", description: "Watch, premium equipment or another reward for your results." }, { label: "Großer / luxuriöser Kauf", short: "Luxus", description: "Uhr, Premium-Ausstattung oder andere Belohnung für Erfolge." }, "/goals/v2/luxury.webp", "#d946ef", { imageScale: 1.08 }),
  option("OTHER", { label: "Inny cel", short: "Inny", description: "Dowolny własny cel finansowy." }, { label: "Other goal", short: "Other", description: "Any custom financial goal." }, { label: "Anderes Ziel", short: "Anderes", description: "Beliebiges eigenes Finanzziel." }, "/goals/v2/other.webp", "#64748b", { imageScale: 1.08 }),
];


const spanishGoalTranslations: Record<GoalType, { label: string; shortLabel: string; description: string }> = {
  EMERGENCY_FUND: { label: "Fondo de emergencia", shortLabel: "Emergencia", description: "Reserva de seguridad y liquidez." },
  HOME: { label: "Casa / piso", shortLabel: "Vivienda", description: "Compra de vivienda propia o ahorro para la entrada." },
  CAR: { label: "Coche", shortLabel: "Coche", description: "Compra o cambio de coche." },
  TRAVEL: { label: "Viaje", shortLabel: "Viaje", description: "Un viaje, escapada o expedición importante." },
  VACATION: { label: "Vacaciones", shortLabel: "Vacaciones", description: "Descanso sin financiarlo con el flujo de caja futuro." },
  EDUCATION: { label: "Educación", shortLabel: "Educación", description: "Estudios, cursos, certificaciones y desarrollo de habilidades." },
  HEALTH: { label: "Salud", shortLabel: "Salud", description: "Tratamiento, pruebas o un gasto sanitario importante." },
  DENTAL: { label: "Tratamiento dental", shortLabel: "Dental", description: "Odontología, implantes, ortodoncia y reconstrucción." },
  WEDDING: { label: "Boda", shortLabel: "Boda", description: "Presupuesto para ceremonia, celebración o luna de miel." },
  CHILD: { label: "Hijo / familia", shortLabel: "Familia", description: "Preparativos, cuidados, educación o capital familiar." },
  RENOVATION: { label: "Reforma", shortLabel: "Reforma", description: "Reforma, mobiliario o mejora de la vivienda." },
  ELECTRONICS: { label: "Electrónica", shortLabel: "Electrónica", description: "Ordenador, teléfono, equipo audiovisual u otra compra tecnológica importante." },
  BUSINESS: { label: "Negocio propio", shortLabel: "Negocio", description: "Capital para empresa, producto o crecimiento del negocio." },
  INVESTMENT: { label: "Capital de inversión", shortLabel: "Inversión", description: "Construye capital dedicado a invertir." },
  DEBT_PAYOFF: { label: "Pago de deuda", shortLabel: "Deuda", description: "Capital para amortizar anticipadamente una obligación." },
  RETIREMENT: { label: "Jubilación / libertad", shortLabel: "Jubilación", description: "Capital a largo plazo para la independencia financiera." },
  HOBBY: { label: "Afición / pasión", shortLabel: "Afición", description: "Equipo o proyecto relacionado con tu pasión." },
  SECOND_PROPERTY: { label: "Segunda propiedad", shortLabel: "Propiedad", description: "Compra de terreno, vivienda u otra propiedad." },
  LUXURY_PURCHASE: { label: "Compra grande / lujo", shortLabel: "Lujo", description: "Reloj, equipo premium u otra recompensa por tus resultados." },
  OTHER: { label: "Otro objetivo", shortLabel: "Otro", description: "Cualquier objetivo financiero personalizado." },
};

export const GOAL_TYPE_BY_VALUE = new Map(GOAL_TYPE_OPTIONS.map((item) => [item.value, item]));

export function getGoalTypeOption(type?: GoalType | null): GoalTypeOption {
  return GOAL_TYPE_BY_VALUE.get(type ?? "OTHER") ?? GOAL_TYPE_BY_VALUE.get("OTHER")!;
}

export function getLocalizedGoalTypeOption(type: GoalType | null | undefined, language: AppLanguage) {
  return localizeGoalTypeOption(getGoalTypeOption(type), language);
}

export function localizeGoalTypeOption(item: GoalTypeOption, language: AppLanguage) {
  if (language === "pl") return { ...item };
  const translated = language === "es" ? spanishGoalTranslations[item.value] : item.translations[language];
  return {
    ...item,
    label: translated.label,
    shortLabel: translated.shortLabel,
    description: translated.description,
  };
}

export function getGoalTypeLabel(type?: GoalType | null, language: AppLanguage = "pl") {
  return getLocalizedGoalTypeOption(type, language).shortLabel;
}

export function getGoalTypeImage(type?: GoalType | null) {
  return getGoalTypeOption(type).image;
}

export function getGoalVisual(type?: GoalType | null) {
  const option = getGoalTypeOption(type);
  return {
    image: option.image,
    imagePosition: option.imagePosition ?? "center",
    imageScale: option.imageScale ?? 1.03,
    overlayClass: option.overlayClass ?? "from-[#06101f]/95 via-[#06101f]/25 to-black/5",
    color: option.color,
  };
}

export async function readGoalImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Wybierz plik graficzny.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Zdjęcie może mieć maksymalnie 8 MB.");

  const rawUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Nie udało się odczytać zdjęcia."));
    reader.onerror = () => reject(new Error("Nie udało się odczytać zdjęcia."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Nie udało się wczytać zdjęcia."));
    img.src = rawUrl;
  });

  const maxWidth = 1600;
  const maxHeight = 1000;
  const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return rawUrl;
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/webp", 0.9);
}
