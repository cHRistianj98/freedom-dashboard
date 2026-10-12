import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { Category, CategoryType } from "../../types/Category";
import { CategoryMiniImage } from "./CategoryMiniImage";
import { localize, useLanguage } from "../../i18n/LanguageContext";
import { localizedCategoryGroup, localizedCategoryName } from "../../i18n/categoryNames";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();
}

export function CategoryPicker({
  categories,
  type,
  value,
  onChange,
}: {
  categories: Category[];
  type: CategoryType;
  value?: number;
  onChange: (categoryId: number) => void;
}) {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const ui = (pl: string, en: string, de?: string) => localize(language, pl, en, de);

  useEffect(() => {
    setQuery("");
  }, [type]);

  const visible = useMemo(
    () =>
      categories
        .filter((category) => category.type === type && category.active)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [categories, type],
  );

  const filtered = useMemo(() => {
    const needle = normalizeSearch(query);
    if (!needle) return visible;

    return visible.filter((category) => {
      const displayName = localizedCategoryName(category.name, language, category.slug);
      const groupName = localizedCategoryGroup(category.group, language);
      const haystack = normalizeSearch(
        [displayName, category.name, category.slug, groupName, category.group]
          .filter(Boolean)
          .join(" "),
      );

      return haystack.includes(needle);
    });
  }, [language, query, visible]);

  const groups = useMemo(
    () => [...new Set(filtered.map((category) => category.group))],
    [filtered],
  );

  return (
    <div>
      <div className="relative mb-3">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={ui("Szukaj kategorii…", "Search categories…", "Kategorien suchen…")}
          aria-label={ui("Szukaj kategorii", "Search categories", "Kategorien suchen")}
          className="w-full rounded-xl border border-slate-800 bg-slate-950/70 py-2.5 pl-9 pr-10 text-xs font-medium text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50 focus:bg-slate-950 focus:ring-2 focus:ring-cyan-500/10"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={ui("Wyczyść wyszukiwanie", "Clear search", "Suche löschen")}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="max-h-[310px] space-y-5 overflow-y-auto pr-1">
        {groups.map((group) => {
          const groupCategories = filtered.filter((category) => category.group === group);
          if (groupCategories.length === 0) return null;

          return (
            <section key={group}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {localizedCategoryGroup(group, language)}
                </div>
                {query && (
                  <span className="text-[10px] font-bold text-slate-700">
                    {groupCategories.length}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {groupCategories.map((category) => {
                  const selected = category.id === value;
                  const displayName = localizedCategoryName(category.name, language, category.slug);

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => onChange(category.id)}
                      className={`cursor-pointer rounded-2xl border p-3 text-center transition ${
                        selected
                          ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]"
                          : "border-slate-800 bg-slate-950/50 hover:border-slate-600 hover:bg-slate-900"
                      }`}
                    >
                      <CategoryMiniImage
                        name={displayName}
                        iconKey={category.iconKey}
                        color={category.color}
                        imageKey={category.imageKey}
                        size="lg"
                        className="mx-auto"
                      />

                      <div
                        className="mt-2 truncate text-xs font-bold text-slate-200"
                        title={displayName}
                      >
                        {displayName}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/35 px-4 py-8 text-center">
            <Search size={20} className="mx-auto text-slate-700" />
            <p className="mt-3 text-sm font-semibold text-slate-400">
              {ui("Brak pasujących kategorii", "No matching categories", "Keine passenden Kategorien")}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              {ui(
                "Zmień frazę lub wyczyść wyszukiwanie.",
                "Try a different phrase or clear the search.",
                "Ändere den Suchbegriff oder lösche die Suche.",
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
