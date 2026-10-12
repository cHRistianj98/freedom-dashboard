import type { AppLanguage } from "../../i18n/LanguageContext";

export type CategoryArtworkOption = {
  key: string;
  file: string;
  label: Record<AppLanguage, string>;
};

export const CATEGORY_ARTWORKS: CategoryArtworkOption[] = [
  { key: "groceries", file: "groceries.webp", label: { pl: "Zakupy", en: "Groceries", de: "Einkäufe", es: "Compras" } },
  { key: "eating-out", file: "eating-out.webp", label: { pl: "Restauracja", en: "Eating out", de: "Restaurant", es: "Restaurante" } },
  { key: "transport", file: "transport.webp", label: { pl: "Transport", en: "Transport", de: "Transport", es: "Transporte" } },
  { key: "car", file: "car.webp", label: { pl: "Samochód", en: "Car", de: "Auto", es: "Coche" } },
  { key: "home", file: "home.webp", label: { pl: "Dom", en: "Home", de: "Zuhause", es: "Hogar" } },
  { key: "housing-fees", file: "housing-fees.webp", label: { pl: "Mieszkanie", en: "Housing", de: "Wohnen", es: "Vivienda" } },
  { key: "electricity", file: "electricity.webp", label: { pl: "Energia", en: "Energy", de: "Energie", es: "Energía" } },
  { key: "internet", file: "internet.webp", label: { pl: "Internet", en: "Internet", de: "Internet", es: "Internet" } },
  { key: "phone", file: "phone.webp", label: { pl: "Telefon", en: "Phone", de: "Telefon", es: "Teléfono" } },
  { key: "subscriptions", file: "subscriptions.webp", label: { pl: "Subskrypcje", en: "Subscriptions", de: "Abos", es: "Suscripciones" } },
  { key: "taxes", file: "taxes.webp", label: { pl: "Podatki", en: "Taxes", de: "Steuern", es: "Impuestos" } },
  { key: "zus", file: "zus.webp", label: { pl: "Składki", en: "Contributions", de: "Beiträge", es: "Cotizaciones" } },
  { key: "loan", file: "loan.webp", label: { pl: "Kredyt", en: "Loan", de: "Kredit", es: "Préstamo" } },
  { key: "dentist", file: "dentist.webp", label: { pl: "Dentysta", en: "Dentist", de: "Zahnarzt", es: "Dentista" } },
  { key: "health", file: "health.webp", label: { pl: "Zdrowie", en: "Health", de: "Gesundheit", es: "Salud" } },
  { key: "pharmacy", file: "pharmacy.webp", label: { pl: "Apteka", en: "Pharmacy", de: "Apotheke", es: "Farmacia" } },
  { key: "supplements", file: "supplements.webp", label: { pl: "Suplementy", en: "Supplements", de: "Supplemente", es: "Suplementos" } },
  { key: "gym", file: "gym.webp", label: { pl: "Siłownia", en: "Gym", de: "Fitnessstudio", es: "Gimnasio" } },
  { key: "sport", file: "sport.webp", label: { pl: "Sport", en: "Sport", de: "Sport", es: "Deporte" } },
  { key: "hairdresser", file: "hairdresser.webp", label: { pl: "Fryzjer", en: "Hairdresser", de: "Friseur", es: "Peluquería" } },
  { key: "care", file: "care.webp", label: { pl: "Pielęgnacja", en: "Care", de: "Pflege", es: "Cuidado" } },
  { key: "clothes", file: "clothes.webp", label: { pl: "Ubrania", en: "Clothes", de: "Kleidung", es: "Ropa" } },
  { key: "education", file: "education.webp", label: { pl: "Edukacja", en: "Education", de: "Bildung", es: "Educación" } },
  { key: "development", file: "development.webp", label: { pl: "Rozwój", en: "Development", de: "Entwicklung", es: "Desarrollo" } },
  { key: "gaming", file: "gaming.webp", label: { pl: "Gaming", en: "Gaming", de: "Gaming", es: "Videojuegos" } },
  { key: "chess", file: "chess.webp", label: { pl: "Szachy", en: "Chess", de: "Schach", es: "Ajedrez" } },
  { key: "dance", file: "dance.webp", label: { pl: "Taniec", en: "Dance", de: "Tanz", es: "Baile" } },
  { key: "trips", file: "trips.webp", label: { pl: "Podróże", en: "Trips", de: "Reisen", es: "Viajes" } },
  { key: "gifts", file: "gifts.webp", label: { pl: "Prezenty", en: "Gifts", de: "Geschenke", es: "Regalos" } },
  { key: "wedding", file: "wedding.webp", label: { pl: "Ślub", en: "Wedding", de: "Hochzeit", es: "Boda" } },
  { key: "family", file: "family.webp", label: { pl: "Rodzina", en: "Family", de: "Familie", es: "Familia" } },
  { key: "cat", file: "cat.webp", label: { pl: "Zwierzęta", en: "Pets", de: "Haustiere", es: "Mascotas" } },
  { key: "investments", file: "investments.webp", label: { pl: "Inwestycje", en: "Investments", de: "Investitionen", es: "Inversiones" } },
  { key: "fx-spread", file: "fx-spread.webp", label: { pl: "Waluty", en: "FX", de: "Devisen", es: "Divisas" } },
  { key: "equipment", file: "equipment.webp", label: { pl: "Sprzęt", en: "Equipment", de: "Ausrüstung", es: "Equipamiento" } },
  { key: "notary", file: "notary.webp", label: { pl: "Dokumenty", en: "Documents", de: "Dokumente", es: "Documentos" } },
  { key: "donations", file: "donations.webp", label: { pl: "Darowizny", en: "Donations", de: "Spenden", es: "Donaciones" } },
  { key: "salary", file: "salary.webp", label: { pl: "Wynagrodzenie", en: "Salary", de: "Gehalt", es: "Salario" } },
  { key: "income", file: "income.webp", label: { pl: "Przychód", en: "Income", de: "Einnahmen", es: "Ingresos" } },
  { key: "interest", file: "interest.webp", label: { pl: "Odsetki", en: "Interest", de: "Zinsen", es: "Intereses" } },
  { key: "sale", file: "sale.webp", label: { pl: "Sprzedaż", en: "Sale", de: "Verkauf", es: "Venta" } },
  { key: "gift-income", file: "gift-income.webp", label: { pl: "Prezent", en: "Gift", de: "Geschenk", es: "Regalo" } },
  { key: "tax-refund", file: "tax-refund.webp", label: { pl: "Zwrot podatku", en: "Tax refund", de: "Steuererstattung", es: "Devolución fiscal" } },
  { key: "other", file: "other.webp", label: { pl: "Inne", en: "Other", de: "Sonstiges", es: "Otros" } },
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
