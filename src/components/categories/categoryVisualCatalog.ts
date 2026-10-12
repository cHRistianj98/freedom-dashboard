import type { AppLanguage } from "../../i18n/LanguageContext";

export type CategoryArtworkOption = {
  key: string;
  file: string;
  label: Record<AppLanguage, string>;
};

export const CATEGORY_ARTWORKS: CategoryArtworkOption[] = [
  { key: "groceries", file: "groceries.webp", label: { pl: "Zakupy", en: "Groceries", de: "Einkäufe" } },
  { key: "eating-out", file: "eating-out.webp", label: { pl: "Restauracja", en: "Eating out", de: "Restaurant" } },
  { key: "transport", file: "transport.webp", label: { pl: "Transport", en: "Transport", de: "Transport" } },
  { key: "car", file: "car.webp", label: { pl: "Samochód", en: "Car", de: "Auto" } },
  { key: "home", file: "home.webp", label: { pl: "Dom", en: "Home", de: "Zuhause" } },
  { key: "housing-fees", file: "housing-fees.webp", label: { pl: "Mieszkanie", en: "Housing", de: "Wohnen" } },
  { key: "electricity", file: "electricity.webp", label: { pl: "Energia", en: "Energy", de: "Energie" } },
  { key: "internet", file: "internet.webp", label: { pl: "Internet", en: "Internet", de: "Internet" } },
  { key: "phone", file: "phone.webp", label: { pl: "Telefon", en: "Phone", de: "Telefon" } },
  { key: "subscriptions", file: "subscriptions.webp", label: { pl: "Subskrypcje", en: "Subscriptions", de: "Abos" } },
  { key: "taxes", file: "taxes.webp", label: { pl: "Podatki", en: "Taxes", de: "Steuern" } },
  { key: "zus", file: "zus.webp", label: { pl: "Składki", en: "Contributions", de: "Beiträge" } },
  { key: "loan", file: "loan.webp", label: { pl: "Kredyt", en: "Loan", de: "Kredit" } },
  { key: "dentist", file: "dentist.webp", label: { pl: "Dentysta", en: "Dentist", de: "Zahnarzt" } },
  { key: "health", file: "health.webp", label: { pl: "Zdrowie", en: "Health", de: "Gesundheit" } },
  { key: "pharmacy", file: "pharmacy.webp", label: { pl: "Apteka", en: "Pharmacy", de: "Apotheke" } },
  { key: "supplements", file: "supplements.webp", label: { pl: "Suplementy", en: "Supplements", de: "Supplemente" } },
  { key: "gym", file: "gym.webp", label: { pl: "Siłownia", en: "Gym", de: "Fitnessstudio" } },
  { key: "sport", file: "sport.webp", label: { pl: "Sport", en: "Sport", de: "Sport" } },
  { key: "hairdresser", file: "hairdresser.webp", label: { pl: "Fryzjer", en: "Hairdresser", de: "Friseur" } },
  { key: "care", file: "care.webp", label: { pl: "Pielęgnacja", en: "Care", de: "Pflege" } },
  { key: "clothes", file: "clothes.webp", label: { pl: "Ubrania", en: "Clothes", de: "Kleidung" } },
  { key: "education", file: "education.webp", label: { pl: "Edukacja", en: "Education", de: "Bildung" } },
  { key: "development", file: "development.webp", label: { pl: "Rozwój", en: "Development", de: "Entwicklung" } },
  { key: "gaming", file: "gaming.webp", label: { pl: "Gaming", en: "Gaming", de: "Gaming" } },
  { key: "chess", file: "chess.webp", label: { pl: "Szachy", en: "Chess", de: "Schach" } },
  { key: "dance", file: "dance.webp", label: { pl: "Taniec", en: "Dance", de: "Tanz" } },
  { key: "trips", file: "trips.webp", label: { pl: "Podróże", en: "Trips", de: "Reisen" } },
  { key: "gifts", file: "gifts.webp", label: { pl: "Prezenty", en: "Gifts", de: "Geschenke" } },
  { key: "wedding", file: "wedding.webp", label: { pl: "Ślub", en: "Wedding", de: "Hochzeit" } },
  { key: "family", file: "family.webp", label: { pl: "Rodzina", en: "Family", de: "Familie" } },
  { key: "cat", file: "cat.webp", label: { pl: "Zwierzęta", en: "Pets", de: "Haustiere" } },
  { key: "investments", file: "investments.webp", label: { pl: "Inwestycje", en: "Investments", de: "Investitionen" } },
  { key: "fx-spread", file: "fx-spread.webp", label: { pl: "Waluty", en: "FX", de: "Devisen" } },
  { key: "equipment", file: "equipment.webp", label: { pl: "Sprzęt", en: "Equipment", de: "Ausrüstung" } },
  { key: "notary", file: "notary.webp", label: { pl: "Dokumenty", en: "Documents", de: "Dokumente" } },
  { key: "donations", file: "donations.webp", label: { pl: "Darowizny", en: "Donations", de: "Spenden" } },
  { key: "salary", file: "salary.webp", label: { pl: "Wynagrodzenie", en: "Salary", de: "Gehalt" } },
  { key: "income", file: "income.webp", label: { pl: "Przychód", en: "Income", de: "Einnahmen" } },
  { key: "interest", file: "interest.webp", label: { pl: "Odsetki", en: "Interest", de: "Zinsen" } },
  { key: "sale", file: "sale.webp", label: { pl: "Sprzedaż", en: "Sale", de: "Verkauf" } },
  { key: "gift-income", file: "gift-income.webp", label: { pl: "Prezent", en: "Gift", de: "Geschenk" } },
  { key: "tax-refund", file: "tax-refund.webp", label: { pl: "Zwrot podatku", en: "Tax refund", de: "Steuererstattung" } },
  { key: "other", file: "other.webp", label: { pl: "Inne", en: "Other", de: "Sonstiges" } },
];

export const CATEGORY_ICON_KEYS = [
  "Wallet", "Banknote", "CreditCard", "CircleDollarSign", "Coins", "Landmark",
  "House", "Building2", "Car", "Bus", "Train", "Plane", "Bike",
  "ShoppingBasket", "ShoppingCart", "Utensils", "Coffee", "Gift", "Heart",
  "Stethoscope", "Pill", "Dumbbell", "Activity", "Sparkles", "Scissors",
  "Shirt", "BookOpen", "GraduationCap", "BriefcaseBusiness", "Laptop", "Gamepad2",
  "Music", "Drama", "Cat", "Dog", "Baby", "Users", "Handshake",
  "Target", "PiggyBank", "ChartNoAxesCombined", "TrendingUp", "Percent", "ReceiptText",
  "Wrench", "Hammer", "Zap", "Wifi", "Smartphone", "ShieldCheck", "CircleHelp",
] as const;

export const CATEGORY_COLOR_PRESETS = [
  "#22d3ee", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
  "#f43f5e", "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#64748b",
] as const;

export function categoryArtworkSrc(imageKey?: string | null) {
  const option = CATEGORY_ARTWORKS.find((item) => item.key === imageKey);
  return option ? `/categories/${option.file}` : null;
}
