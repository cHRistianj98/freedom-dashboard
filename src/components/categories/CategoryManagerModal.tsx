import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  ImageIcon,
  LoaderCircle,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import type { Category, CategoryGroup, CategoryInput, CategoryType } from "../../types/Category";
import { categoryApi } from "../../api/categoryApi";
import { localize, useLanguage } from "../../i18n/LanguageContext";
import { localizedCategoryGroup, localizedCategoryName } from "../../i18n/categoryNames";
import { CategoryIcon } from "./CategoryIcon";
import { CategoryMiniImage } from "./CategoryMiniImage";
import {
  CATEGORY_ARTWORKS,
  CATEGORY_COLOR_PRESETS,
  CATEGORY_ICON_KEYS,
} from "./categoryVisualCatalog";

const EXPENSE_GROUPS: CategoryGroup[] = [
  "FIXED",
  "LIVING",
  "HEALTH",
  "GROWTH",
  "LIFESTYLE",
  "WEALTH",
  "GOALS",
  "OTHER",
];

const INCOME_GROUPS: CategoryGroup[] = ["INCOME", "OTHER"];

const DEFAULT_INPUT: CategoryInput = {
  type: "EXPENSE",
  group: "LIVING",
  name: "",
  iconKey: "CircleHelp",
  imageKey: "other",
  color: "#22d3ee",
  active: true,
  sortOrder: 1000,
};

export function CategoryManagerModal({
  open,
  onClose,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const { language } = useLanguage();
  const ui = (pl: string, en: string, de?: string) => localize(language, pl, en, de);

  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [editing, setEditing] = useState<Category | null>(null);
  const [draft, setDraft] = useState<CategoryInput>({ ...DEFAULT_INPUT });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [groupOpen, setGroupOpen] = useState(false);
  const [categoryToRemove, setCategoryToRemove] = useState<Category | null>(null);

  useEffect(() => {
    if (!open) return;
    void reload();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (editing?.type !== type) {
      startNew(type);
    }
  }, [type]);

  const visible = useMemo(
    () => categories
      .filter((category) => category.type === type)
      .sort((a, b) => Number(b.active) - Number(a.active) || a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [categories, type]
  );

  async function reload() {
    setLoading(true);
    setError("");
    try {
      setCategories(await categoryApi.getAll());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : ui("Nie udało się pobrać kategorii.", "Could not load categories.", "Kategorien konnten nicht geladen werden."));
    } finally {
      setLoading(false);
    }
  }

  function startNew(nextType: CategoryType = type) {
    setEditing(null);
    setDraft({
      ...DEFAULT_INPUT,
      type: nextType,
      group: nextType === "INCOME" ? "INCOME" : "LIVING",
      color: nextType === "INCOME" ? "#10b981" : "#22d3ee",
      iconKey: nextType === "INCOME" ? "Banknote" : "ShoppingBasket",
      imageKey: nextType === "INCOME" ? "income" : "groceries",
    });
    setError("");
    setGroupOpen(false);
  }

  function startEdit(category: Category) {
    setEditing(category);
    setDraft({
      type: category.type,
      group: category.group,
      name: category.name,
      iconKey: category.iconKey,
      imageKey: category.imageKey,
      color: category.color,
      active: category.active,
      sortOrder: category.sortOrder,
    });
    setError("");
    setGroupOpen(false);
  }

  async function save() {
    if (!draft.name.trim()) {
      setError(ui("Podaj nazwę kategorii.", "Enter a category name.", "Gib einen Kategorienamen ein."));
      return;
    }

    setSaving(true);
    setError("");
    try {
      const input: CategoryInput = {
        ...draft,
        name: draft.name.trim(),
        type,
        group: type === "INCOME" && draft.group !== "OTHER" ? "INCOME" : draft.group,
        active: true,
      };

      if (editing) await categoryApi.update(editing.id, input);
      else await categoryApi.create(input);

      await reload();
      onChanged?.();
      startNew(type);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : ui("Nie udało się zapisać kategorii.", "Could not save the category.", "Kategorie konnte nicht gespeichert werden."));
    } finally {
      setSaving(false);
    }
  }

  function remove(category: Category) {
    setCategoryToRemove(category);
  }

  async function confirmRemove() {
    if (!categoryToRemove) return;

    const category = categoryToRemove;
    setSaving(true);
    setError("");
    try {
      await categoryApi.remove(category.id);
      setCategoryToRemove(null);
      await reload();
      onChanged?.();
      if (editing?.id === category.id) startNew(type);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : ui("Nie udało się usunąć kategorii.", "Could not remove the category.", "Kategorie konnte nicht entfernt werden."));
    } finally {
      setSaving(false);
    }
  }

  async function restore(category: Category) {
    setSaving(true);
    try {
      await categoryApi.update(category.id, {
        type: category.type,
        group: category.group,
        name: category.name,
        iconKey: category.iconKey,
        imageKey: category.imageKey,
        color: category.color,
        active: true,
        sortOrder: category.sortOrder,
      });
      await reload();
      onChanged?.();
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const groups = type === "INCOME" ? INCOME_GROUPS : EXPENSE_GROUPS;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[26px] border border-slate-800 bg-[#0b1322] shadow-2xl shadow-black/50">
        <header className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">{ui("Kategorie finansowe", "Finance categories", "Finanzkategorien")}</p>
            <h2 className="mt-1 text-2xl font-black">{ui("Dopasuj kategorie do siebie", "Make categories your own", "Kategorien anpassen")}</h2>
            <p className="mt-1 text-sm text-slate-500">{ui("Dodawaj własne kategorie, wybieraj grafikę, ikonę i kolor. Usunięcie nie kasuje historii transakcji.", "Add your own categories and choose artwork, icon and color. Removing a category never deletes transaction history.", "Erstelle eigene Kategorien und wähle Bild, Symbol und Farbe. Entfernen löscht niemals den Transaktionsverlauf.")}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 transition hover:bg-slate-800 hover:text-white"><X size={18} /></button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[.9fr_1.1fr]">
          <aside className="min-h-0 border-b border-slate-800 lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-800 p-4">
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-950/60 p-1.5">
                {(["EXPENSE", "INCOME"] as CategoryType[]).map((item) => (
                  <button key={item} type="button" onClick={() => setType(item)} className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-black transition ${type === item ? "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/25" : "text-slate-500 hover:bg-slate-900 hover:text-slate-200"}`}>
                    {item === "EXPENSE" ? ui("Wydatki", "Expenses", "Ausgaben") : ui("Przychody", "Income", "Einnahmen")}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => startNew(type)} className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-sm font-black text-cyan-300 transition hover:bg-cyan-500/15"><Plus size={16} /> {ui("Nowa kategoria", "New category", "Neue Kategorie")}</button>
            </div>

            <div className="max-h-[62vh] overflow-y-auto p-3">
              {loading ? (
                <div className="flex items-center justify-center py-14 text-slate-500"><LoaderCircle className="mr-2 animate-spin" size={18} /> {ui("Ładowanie…", "Loading…", "Laden…")}</div>
              ) : (
                <div className="space-y-2">
                  {visible.map((category) => {
                    const name = localizedCategoryName(category.name, language, category.slug);
                    return (
                      <div key={category.id} className={`group flex items-center gap-3 rounded-2xl border p-3 transition ${editing?.id === category.id ? "border-cyan-400/35 bg-cyan-500/5" : "border-slate-800 bg-slate-950/35 hover:border-slate-700"} ${category.active ? "" : "opacity-55"}`}>
                        <CategoryMiniImage name={name} iconKey={category.iconKey} imageKey={category.imageKey} color={category.color} size="md" />
                        <button type="button" onClick={() => startEdit(category)} className="min-w-0 flex-1 cursor-pointer text-left">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-black text-slate-100">{name}</p>
                            {category.systemDefault && <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-500">{ui("system", "system", "System")}</span>}
                            {!category.active && <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-rose-400">{ui("ukryta", "hidden", "ausgeblendet")}</span>}
                          </div>
                          <p className="mt-1 text-[11px] text-slate-600">{localizedCategoryGroup(category.group, language)}</p>
                        </button>
                        <div className="flex items-center gap-1">
                          {category.active ? (
                            <button type="button" onClick={() => void remove(category)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition hover:bg-rose-500/10 hover:text-rose-400" title={ui("Usuń / ukryj", "Remove / hide", "Entfernen / ausblenden")}><Trash2 size={15} /></button>
                          ) : (
                            <button type="button" onClick={() => void restore(category)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition hover:bg-emerald-500/10 hover:text-emerald-400" title={ui("Przywróć", "Restore", "Wiederherstellen")}><RotateCcw size={15} /></button>
                          )}
                          <button type="button" onClick={() => startEdit(category)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition hover:bg-cyan-500/10 hover:text-cyan-300"><ChevronRight size={16} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          <section className="min-h-0 overflow-y-auto p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-600">{editing ? ui("Edycja kategorii", "Edit category", "Kategorie bearbeiten") : ui("Nowa kategoria", "New category", "Neue Kategorie")}</p>
                <h3 className="mt-1 text-xl font-black">{draft.name || ui("Nadaj jej charakter", "Give it a personality", "Gib ihr einen Charakter")}</h3>
              </div>
              {editing && <button type="button" onClick={() => startNew(type)} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800"><Plus size={14} /> {ui("Nowa", "New", "Neu")}</button>}
            </div>

            {error && <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-300">{ui("Nazwa", "Name", "Name")}</span>
                <input value={draft.name} onChange={(e) => setDraft((current) => ({ ...current, name: e.target.value }))} placeholder={ui("np. Kawa na mieście", "e.g. Coffee out", "z. B. Kaffee unterwegs")} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/15" />
              </label>

              <div className="relative block">
                <span className="mb-2 block text-sm font-semibold text-slate-300">{ui("Grupa", "Group", "Gruppe")}</span>
                <button
                  type="button"
                  onClick={() => setGroupOpen((current) => !current)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-2xl border bg-slate-950/70 px-4 py-3 text-left text-slate-100 outline-none transition ${groupOpen ? "border-cyan-400 ring-2 ring-cyan-500/15" : "border-slate-700 hover:border-slate-600"}`}
                >
                  <span className="font-medium">{localizedCategoryGroup(draft.group, language)}</span>
                  <ChevronDown size={17} className={`text-slate-500 transition-transform ${groupOpen ? "rotate-180 text-cyan-300" : ""}`} />
                </button>

                {groupOpen && (
                  <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-slate-700/90 bg-[#0a1220] p-1.5 shadow-2xl shadow-black/60 backdrop-blur-xl">
                    {groups.map((group) => {
                      const selected = draft.group === group;
                      return (
                        <button
                          key={group}
                          type="button"
                          onClick={() => {
                            setDraft((current) => ({ ...current, group }));
                            setGroupOpen(false);
                          }}
                          className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm transition ${selected ? "bg-cyan-500/12 text-cyan-200" : "text-slate-300 hover:bg-slate-800/80 hover:text-white"}`}
                        >
                          <span>{localizedCategoryGroup(group, language)}</span>
                          {selected && <Check size={15} className="text-cyan-300" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-sm font-black text-slate-200">{ui("Grafika", "Artwork", "Bild")}</p><p className="mt-1 text-xs text-slate-600">{ui("Wybierz tło, które będzie rozpoznawalne na pierwszy rzut oka.", "Choose an image that is recognizable at a glance.", "Wähle ein Bild, das auf den ersten Blick erkennbar ist.")}</p></div>
                <ImageIcon size={18} className="text-slate-600" />
              </div>
              <div className="mt-3 grid max-h-56 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 md:grid-cols-5">
                {CATEGORY_ARTWORKS.map((artwork) => {
                  const selected = draft.imageKey === artwork.key;
                  return (
                    <button key={artwork.key} type="button" onClick={() => setDraft((current) => ({ ...current, imageKey: artwork.key }))} className={`group relative h-20 cursor-pointer overflow-hidden rounded-xl border transition ${selected ? "border-cyan-400 ring-2 ring-cyan-500/20" : "border-slate-800 hover:border-slate-600"}`}>
                      <img src={`/categories/${artwork.file}`} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                      <span className="absolute inset-x-2 bottom-1.5 truncate text-left text-[10px] font-black text-white">{artwork.label[language]}</span>
                      {selected && <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-cyan-400 text-slate-950"><Check size={12} /></span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-black text-slate-200">{ui("Ikona", "Icon", "Symbol")}</p>
              <div className="mt-3 grid max-h-40 grid-cols-8 gap-2 overflow-y-auto pr-1 sm:grid-cols-10">
                {CATEGORY_ICON_KEYS.map((iconKey) => {
                  const selected = draft.iconKey === iconKey;
                  return <button key={iconKey} type="button" onClick={() => setDraft((current) => ({ ...current, iconKey }))} title={iconKey} className={`grid aspect-square cursor-pointer place-items-center rounded-xl border transition ${selected ? "border-cyan-400 bg-cyan-500/10 text-cyan-300 ring-2 ring-cyan-500/15" : "border-slate-800 bg-slate-950/50 text-slate-500 hover:border-slate-600 hover:text-slate-200"}`}><CategoryIcon iconKey={iconKey} className="h-5 w-5" /></button>;
                })}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-black text-slate-200">{ui("Kolor akcentu", "Accent color", "Akzentfarbe")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CATEGORY_COLOR_PRESETS.map((color) => <button key={color} type="button" onClick={() => setDraft((current) => ({ ...current, color }))} className={`h-9 w-9 cursor-pointer rounded-full border-2 transition ${draft.color === color ? "scale-110 border-white" : "border-slate-800 hover:scale-105"}`} style={{ backgroundColor: color }} aria-label={color} />)}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/45 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600">{ui("Podgląd", "Preview", "Vorschau")}</p>
              <div className="mt-3 flex items-center gap-4">
                <CategoryMiniImage name={draft.name || ui("Nowa kategoria", "New category", "Neue Kategorie")} iconKey={draft.iconKey} imageKey={draft.imageKey} color={draft.color} size="lg" />
                <div><p className="font-black text-white">{draft.name || ui("Nowa kategoria", "New category", "Neue Kategorie")}</p><p className="mt-1 text-xs text-slate-500">{localizedCategoryGroup(draft.group, language)}</p></div>
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3 border-t border-slate-800 pt-5">
              <button type="button" onClick={onClose} className="cursor-pointer rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-400 transition hover:bg-slate-800">{ui("Zamknij", "Close", "Schließen")}</button>
              <button type="button" disabled={saving} onClick={() => void save()} className="flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60">{saving ? <LoaderCircle size={16} className="animate-spin" /> : editing ? <Pencil size={16} /> : <Plus size={16} />} {editing ? ui("Zapisz zmiany", "Save changes", "Änderungen speichern") : ui("Dodaj kategorię", "Add category", "Kategorie hinzufügen")}</button>
            </div>
          </section>
        </div>
      </div>

      {categoryToRemove && (
        <div className="absolute inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-rose-500/20 bg-[#0b1322] shadow-2xl shadow-black/60">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
                  <AlertTriangle size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-400">
                    {categoryToRemove.systemDefault
                      ? ui("Ukrywanie kategorii", "Hide category", "Kategorie ausblenden")
                      : ui("Usuwanie kategorii", "Remove category", "Kategorie entfernen")}
                  </p>
                  <h3 className="mt-1 text-xl font-black text-white">
                    {localizedCategoryName(categoryToRemove.name, language, categoryToRemove.slug)}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {categoryToRemove.systemDefault
                      ? ui(
                          "Kategoria systemowa zostanie ukryta z wyboru, ale historia transakcji pozostanie bez zmian. Możesz ją później przywrócić.",
                          "The system category will be hidden from selection, but transaction history will stay unchanged. You can restore it later.",
                          "Die Systemkategorie wird aus der Auswahl ausgeblendet, der Transaktionsverlauf bleibt jedoch unverändert. Du kannst sie später wiederherstellen."
                        )
                      : ui(
                          "Kategoria zniknie z wyboru w nowych transakcjach. Istniejące transakcje zachowają tę kategorię i całą historię.",
                          "The category will disappear from new transaction choices. Existing transactions will keep the category and full history.",
                          "Die Kategorie verschwindet aus der Auswahl für neue Transaktionen. Bestehende Transaktionen behalten die Kategorie und den vollständigen Verlauf."
                        )}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setCategoryToRemove(null)}
                  className="cursor-pointer rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ui("Anuluj", "Cancel", "Abbrechen")}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void confirmRemove()}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/15 px-4 py-2.5 text-sm font-black text-rose-300 transition hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  {categoryToRemove.systemDefault
                    ? ui("Ukryj kategorię", "Hide category", "Kategorie ausblenden")
                    : ui("Usuń kategorię", "Remove category", "Kategorie entfernen")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
