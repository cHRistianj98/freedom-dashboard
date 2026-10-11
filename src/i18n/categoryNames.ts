import type { AppLanguage } from "./LanguageContext";

const categoryBySlug: Record<string, { pl: string; en: string; de: string }> = {
  groceries: { pl: "Artykuły spożywcze", en: "Groceries", de: "Lebensmittel" },
  hairdresser: { pl: "Fryzjer", en: "Hairdresser", de: "Friseur" },
  "eating-out": { pl: "Jedzenie na mieście", en: "Eating out", de: "Essen gehen" },
  care: { pl: "Pielęgnacja", en: "Personal care", de: "Körperpflege" },
  transport: { pl: "Transport", en: "Transport", de: "Transport" },
  home: { pl: "Dom i wyposażenie", en: "Home & furnishings", de: "Haushalt & Einrichtung" },
  pharmacy: { pl: "Apteka", en: "Pharmacy", de: "Apotheke" },
  dentist: { pl: "Dentysta", en: "Dentist", de: "Zahnarzt" },
  massage: { pl: "Masaż", en: "Massage", de: "Massage" },
  supplements: { pl: "Suplementy", en: "Supplements", de: "Nahrungsergänzung" },
  therapy: { pl: "Terapeuta", en: "Therapy", de: "Therapie" },
  internet: { pl: "Internet", en: "Internet", de: "Internet" },
  loan: { pl: "Kredyt", en: "Loan", de: "Kredit" },
  fines: { pl: "Mandaty", en: "Fines", de: "Bußgelder" },
  electricity: { pl: "Prąd", en: "Electricity", de: "Strom" },
  subscriptions: { pl: "Subskrypcje", en: "Subscriptions", de: "Abonnements" },
  phone: { pl: "Telefon", en: "Phone", de: "Telefon" },
  "housing-fees": { pl: "Wspólnota / czynsz", en: "Housing fees / rent", de: "Nebenkosten / Miete" },
  taxes: { pl: "Podatki", en: "Taxes", de: "Steuern" },
  development: { pl: "Rozwój", en: "Development", de: "Entwicklung" },
  zus: { pl: "ZUS", en: "Social insurance", de: "Sozialversicherung" },
  education: { pl: "Edukacja", en: "Education", de: "Bildung" },
  toastmasters: { pl: "Toastmasters", en: "Toastmasters", de: "Toastmasters" },
  gym: { pl: "Siłownia", en: "Gym", de: "Fitnessstudio" },
  dance: { pl: "Tańce", en: "Dance", de: "Tanzen" },
  investments: { pl: "Inwestycje", en: "Investments", de: "Investitionen" },
  "investment-fees": { pl: "Prowizje i opłaty", en: "Investment fees", de: "Investmentgebühren" },
  "currency-spread": { pl: "Spread walutowy", en: "Currency spread", de: "Währungsspread" },
  gaming: { pl: "Gaming", en: "Gaming", de: "Gaming" },
  chess: { pl: "Szachy", en: "Chess", de: "Schach" },
  "hair-transplant": { pl: "Przeszczep włosów", en: "Hair transplant", de: "Haartransplantation" },
  equipment: { pl: "Sprzęt", en: "Equipment", de: "Ausrüstung" },
  clothes: { pl: "Ubrania", en: "Clothing", de: "Kleidung" },
  health: { pl: "Zdrowie", en: "Health", de: "Gesundheit" },
  donations: { pl: "Donejty", en: "Donations", de: "Spenden" },
  cat: { pl: "Kot", en: "Cat", de: "Katze" },
  gifts: { pl: "Prezenty", en: "Gifts", de: "Geschenke" },
  wedding: { pl: "Ślub", en: "Wedding", de: "Hochzeit" },
  trips: { pl: "Wycieczki", en: "Trips", de: "Reisen" },
  car: { pl: "Samochód", en: "Car", de: "Auto" },
  sport: { pl: "Sport", en: "Sport", de: "Sport" },
  notary: { pl: "Notariusz", en: "Notary", de: "Notar" },
  other: { pl: "Inne", en: "Other", de: "Sonstige" },
  salary: { pl: "Wypłata", en: "Salary", de: "Gehalt" },
  gift: { pl: "Prezent", en: "Gift", de: "Geschenk" },
  interest: { pl: "Procent / odsetki", en: "Interest", de: "Zinsen" },
  "tax-refund": { pl: "Zwrot z podatku", en: "Tax refund", de: "Steuererstattung" },
  family: { pl: "Rodzina", en: "Family", de: "Familie" },
  sale: { pl: "Sprzedaż", en: "Sale", de: "Verkauf" },
};

const byAnyName = new Map<string, { pl: string; en: string; de: string }>();
for (const entry of Object.values(categoryBySlug)) {
  byAnyName.set(entry.pl.toLocaleLowerCase("pl-PL"), entry);
  byAnyName.set(entry.en.toLocaleLowerCase("en-US"), entry);
  byAnyName.set(entry.de.toLocaleLowerCase("de-DE"), entry);
}

const legacyNameAliases: Record<string, { pl: string; en: string; de: string }> = {
  "odsetki": { pl: "Odsetki", en: "Interest", de: "Zinsen" },
  "koszt stały": { pl: "Koszt stały", en: "Fixed cost", de: "Fixkosten" },
  "przychód": { pl: "Przychód", en: "Income", de: "Einnahme" },
  "wydatek": { pl: "Wydatek", en: "Expense", de: "Ausgabe" },
};
for (const [key, entry] of Object.entries(legacyNameAliases)) {
  byAnyName.set(key, entry);
  byAnyName.set(entry.en.toLocaleLowerCase("en-US"), entry);
  byAnyName.set(entry.de.toLocaleLowerCase("de-DE"), entry);
}

export function localizedCategoryName(
  name: string | undefined,
  language: AppLanguage,
  slug?: string
) {
  if (slug && categoryBySlug[slug]) return categoryBySlug[slug][language];
  if (!name) return language === "pl" ? "Kategoria" : language === "de" ? "Kategorie" : "Category";
  const locale = language === "pl" ? "pl-PL" : language === "de" ? "de-DE" : "en-US";
  const match = byAnyName.get(name.toLocaleLowerCase(locale));
  return match ? match[language] : name;
}

export function localizedCategoryGroup(group: string, language: AppLanguage) {
  const labels: Record<string, { pl: string; en: string; de: string }> = {
    FIXED: { pl: "Stałe", en: "Fixed", de: "Fixkosten" },
    LIVING: { pl: "Życie", en: "Living", de: "Leben" },
    HEALTH: { pl: "Zdrowie", en: "Health", de: "Gesundheit" },
    GROWTH: { pl: "Rozwój", en: "Growth", de: "Wachstum" },
    LIFESTYLE: { pl: "Lifestyle", en: "Lifestyle", de: "Lifestyle" },
    WEALTH: { pl: "Majątek", en: "Wealth", de: "Vermögen" },
    GOALS: { pl: "Cele", en: "Goals", de: "Ziele" },
    INCOME: { pl: "Dochody", en: "Income", de: "Einnahmen" },
    OTHER: { pl: "Inne", en: "Other", de: "Sonstige" },
  };
  return labels[group]?.[language] ?? group;
}
