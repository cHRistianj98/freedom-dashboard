import type { AppLanguage } from "./LanguageContext";

const categoryBySlug: Record<string, { pl: string; en: string; de: string; es: string }> = {
  groceries: { pl: "Artykuły spożywcze", en: "Groceries", de: "Lebensmittel" , es: "Comestibles" },
  hairdresser: { pl: "Fryzjer", en: "Hairdresser", de: "Friseur" , es: "Peluquería" },
  "eating-out": { pl: "Jedzenie na mieście", en: "Eating out", de: "Essen gehen" , es: "Comer fuera" },
  care: { pl: "Pielęgnacja", en: "Personal care", de: "Körperpflege" , es: "Cuidado personal" },
  transport: { pl: "Transport", en: "Transport", de: "Transport" , es: "Transporte" },
  home: { pl: "Dom i wyposażenie", en: "Home & furnishings", de: "Haushalt & Einrichtung" , es: "Hogar y mobiliario" },
  pharmacy: { pl: "Apteka", en: "Pharmacy", de: "Apotheke" , es: "Farmacia" },
  dentist: { pl: "Dentysta", en: "Dentist", de: "Zahnarzt" , es: "Dentista" },
  massage: { pl: "Masaż", en: "Massage", de: "Massage" , es: "Masaje" },
  supplements: { pl: "Suplementy", en: "Supplements", de: "Nahrungsergänzung" , es: "Suplementos" },
  therapy: { pl: "Terapeuta", en: "Therapy", de: "Therapie" , es: "Terapia" },
  internet: { pl: "Internet", en: "Internet", de: "Internet" , es: "Internet" },
  loan: { pl: "Kredyt", en: "Loan", de: "Kredit" , es: "Préstamo" },
  fines: { pl: "Mandaty", en: "Fines", de: "Bußgelder" , es: "Multas" },
  electricity: { pl: "Prąd", en: "Electricity", de: "Strom" , es: "Electricidad" },
  subscriptions: { pl: "Subskrypcje", en: "Subscriptions", de: "Abonnements" , es: "Suscripciones" },
  phone: { pl: "Telefon", en: "Phone", de: "Telefon" , es: "Teléfono" },
  "housing-fees": { pl: "Wspólnota / czynsz", en: "Housing fees / rent", de: "Nebenkosten / Miete" , es: "Gastos de vivienda / alquiler" },
  taxes: { pl: "Podatki", en: "Taxes", de: "Steuern" , es: "Impuestos" },
  development: { pl: "Rozwój", en: "Development", de: "Entwicklung" , es: "Desarrollo" },
  zus: { pl: "ZUS", en: "Social insurance", de: "Sozialversicherung" , es: "Seguridad social" },
  education: { pl: "Edukacja", en: "Education", de: "Bildung" , es: "Educación" },
  toastmasters: { pl: "Toastmasters", en: "Toastmasters", de: "Toastmasters" , es: "Toastmasters" },
  gym: { pl: "Siłownia", en: "Gym", de: "Fitnessstudio" , es: "Gimnasio" },
  dance: { pl: "Tańce", en: "Dance", de: "Tanzen" , es: "Baile" },
  investments: { pl: "Inwestycje", en: "Investments", de: "Investitionen" , es: "Inversiones" },
  "investment-fees": { pl: "Prowizje i opłaty", en: "Investment fees", de: "Investmentgebühren" , es: "Comisiones de inversión" },
  "currency-spread": { pl: "Spread walutowy", en: "Currency spread", de: "Währungsspread" , es: "Diferencial de divisas" },
  gaming: { pl: "Gaming", en: "Gaming", de: "Gaming" , es: "Videojuegos" },
  chess: { pl: "Szachy", en: "Chess", de: "Schach" , es: "Ajedrez" },
  "hair-transplant": { pl: "Przeszczep włosów", en: "Hair transplant", de: "Haartransplantation" , es: "Trasplante capilar" },
  equipment: { pl: "Sprzęt", en: "Equipment", de: "Ausrüstung" , es: "Equipamiento" },
  clothes: { pl: "Ubrania", en: "Clothing", de: "Kleidung" , es: "Ropa" },
  health: { pl: "Zdrowie", en: "Health", de: "Gesundheit" , es: "Salud" },
  donations: { pl: "Donejty", en: "Donations", de: "Spenden" , es: "Donaciones" },
  cat: { pl: "Kot", en: "Cat", de: "Katze" , es: "Gato" },
  gifts: { pl: "Prezenty", en: "Gifts", de: "Geschenke" , es: "Regalos" },
  wedding: { pl: "Ślub", en: "Wedding", de: "Hochzeit" , es: "Boda" },
  trips: { pl: "Wycieczki", en: "Trips", de: "Reisen" , es: "Viajes" },
  car: { pl: "Samochód", en: "Car", de: "Auto" , es: "Coche" },
  sport: { pl: "Sport", en: "Sport", de: "Sport" , es: "Deporte" },
  notary: { pl: "Notariusz", en: "Notary", de: "Notar" , es: "Notario" },
  other: { pl: "Inne", en: "Other", de: "Sonstige" , es: "Otros" },
  salary: { pl: "Wypłata", en: "Salary", de: "Gehalt" , es: "Salario" },
  gift: { pl: "Prezent", en: "Gift", de: "Geschenk" , es: "Regalo" },
  interest: { pl: "Procent / odsetki", en: "Interest", de: "Zinsen" , es: "Intereses" },
  "tax-refund": { pl: "Zwrot z podatku", en: "Tax refund", de: "Steuererstattung" , es: "Devolución de impuestos" },
  family: { pl: "Rodzina", en: "Family", de: "Familie" , es: "Familia" },
  sale: { pl: "Sprzedaż", en: "Sale", de: "Verkauf" , es: "Venta" },
};

const byAnyName = new Map<string, { pl: string; en: string; de: string; es: string }>();
for (const entry of Object.values(categoryBySlug)) {
  byAnyName.set(entry.pl.toLocaleLowerCase("pl-PL"), entry);
  byAnyName.set(entry.en.toLocaleLowerCase("en-US"), entry);
  byAnyName.set(entry.de.toLocaleLowerCase("de-DE"), entry);
  byAnyName.set(entry.es.toLocaleLowerCase("es-ES"), entry);
}

const legacyNameAliases: Record<string, { pl: string; en: string; de: string; es: string }> = {
  "odsetki": { pl: "Odsetki", en: "Interest", de: "Zinsen", es: "Intereses" },
  "koszt stały": { pl: "Koszt stały", en: "Fixed cost", de: "Fixkosten", es: "Coste fijo" },
  "przychód": { pl: "Przychód", en: "Income", de: "Einnahme", es: "Ingreso" },
  "wydatek": { pl: "Wydatek", en: "Expense", de: "Ausgabe", es: "Gasto" },
};
for (const [key, entry] of Object.entries(legacyNameAliases)) {
  byAnyName.set(key, entry);
  byAnyName.set(entry.en.toLocaleLowerCase("en-US"), entry);
  byAnyName.set(entry.de.toLocaleLowerCase("de-DE"), entry);
  byAnyName.set(entry.es.toLocaleLowerCase("es-ES"), entry);
}

export function localizedCategoryName(
  name: string | undefined,
  language: AppLanguage,
  slug?: string
) {
  if (slug && categoryBySlug[slug]) return categoryBySlug[slug][language];
  if (!name) return language === "pl" ? "Kategoria" : language === "de" ? "Kategorie" : language === "es" ? "Categoría" : "Category";
  const locale = language === "pl" ? "pl-PL" : language === "de" ? "de-DE" : language === "es" ? "es-ES" : "en-US";
  const match = byAnyName.get(name.toLocaleLowerCase(locale));
  return match ? match[language] : name;
}

export function localizedCategoryGroup(group: string, language: AppLanguage) {
  const labels: Record<string, { pl: string; en: string; de: string; es: string }> = {
    FIXED: { pl: "Stałe", en: "Fixed", de: "Fixkosten", es: "Fijos" },
    LIVING: { pl: "Życie", en: "Living", de: "Leben", es: "Vida" },
    HEALTH: { pl: "Zdrowie", en: "Health", de: "Gesundheit", es: "Salud" },
    GROWTH: { pl: "Rozwój", en: "Growth", de: "Wachstum", es: "Desarrollo" },
    LIFESTYLE: { pl: "Lifestyle", en: "Lifestyle", de: "Lifestyle", es: "Estilo de vida" },
    WEALTH: { pl: "Majątek", en: "Wealth", de: "Vermögen", es: "Patrimonio" },
    GOALS: { pl: "Cele", en: "Goals", de: "Ziele", es: "Objetivos" },
    INCOME: { pl: "Dochody", en: "Income", de: "Einnahmen", es: "Ingresos" },
    OTHER: { pl: "Inne", en: "Other", de: "Sonstige", es: "Otros" },
  };
  return labels[group]?.[language] ?? group;
}
