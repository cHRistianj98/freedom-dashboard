import { useEffect, useId, useRef, useState, type ReactNode, type FormEvent } from "react";
import { X, Wallet, Shield, Sprout, Clock3, House, Gem, Target, ArrowRight, ArrowRightLeft, ArrowUpRight, ArrowDownLeft, ChevronDown, Coins, LockKeyhole, Plus, CircleCheck, LoaderCircle, Image as ImageIcon, ReceiptText, CircleDollarSign } from "lucide-react";
import type { Asset, AssetCategory, CashCurrency } from "../../types/Asset";
import { getAssetCategory, getAssetIconKey } from "../../types/Asset";
import type { PortfolioTransferInput, PurchaseTargetInput } from "../../api/portfolioApi";
import { marketPriceApi, type FxQuote } from "../../api/marketPriceApi";
import { AssetIcon } from "./assetIcons";
import type { PortfolioImagePosition, PortfolioInput, PortfolioWallet } from "../../types/Portfolio";
import type { FundedGoal } from "./portfolioView";
import { money, portfolioColors } from "./portfolioView";
import { defaultPortfolioImage, portfolioImagePresets, suggestedPortfolioImage } from "./portfolioImages";

export const walletIcons = { wallet: Wallet, shield: Shield, sprout: Sprout, clock: Clock3, house: House, gem: Gem, target: Target };
export function WalletIcon({ name, size = 23 }: { name: string; size?: number }) {
  const Icon = walletIcons[name as keyof typeof walletIcons] ?? Wallet;
  return <Icon size={size} />;
}
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Nie udało się zapisać zmian. Spróbuj ponownie.";

export function PortfolioDialog({ title, subtitle, children, onClose, busy = false, wide = false, icon, className = "" }: {
  title: string; subtitle?: string; children: ReactNode; onClose: () => void; busy?: boolean; wide?: boolean; icon?: ReactNode; className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  return <dialog ref={dialog} className={`investment-dialog ${wide ? "wide" : ""} ${className}`} aria-labelledby={id}
    onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}
    onClick={event => { if (event.target === event.currentTarget && !busy) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); } }}>
    <header><div className="investment-dialog-heading">{icon && <span className="investment-dialog-icon">{icon}</span>}<div><h2 id={id}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div><button type="button" className="investment-icon-button" aria-label="Zamknij" disabled={busy} onClick={onClose}><X size={20}/></button></header>
    {children}
  </dialog>;
}

export function PortfolioForm({ wallet, onClose, onSave }: {
  wallet?: PortfolioWallet; onClose: () => void; onSave: (input: PortfolioInput) => Promise<void>;
}) {
  const [name, setName] = useState(wallet?.name ?? "");
  const [color, setColor] = useState(wallet?.color ?? portfolioColors[0]);
  const [iconKey, setIconKey] = useState(wallet?.iconKey ?? "shield");
  const [target, setTarget] = useState(wallet?.targetAmount?.toString() ?? "");
  const [contribution, setContribution] = useState(String(wallet?.monthlyContribution ?? 0));
  const [imageUrl, setImageUrl] = useState(wallet?.imageUrl ?? defaultPortfolioImage);
  const [imagePosition, setImagePosition] = useState<PortfolioImagePosition>(wallet?.imagePosition ?? "center");
  const [imageTouched, setImageTouched] = useState(Boolean(wallet?.imageUrl));
  const [previewError, setPreviewError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function changeName(value: string) {
    setName(value);
    if (!wallet && !imageTouched) {
      setImageUrl(suggestedPortfolioImage(value));
      setPreviewError(false);
    }
  }

  function chooseImage(url: string) {
    setImageUrl(url);
    setImageTouched(true);
    setPreviewError(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      await onSave({
        name: name.trim(),
        color,
        iconKey,
        targetAmount: target ? Number(target) : null,
        monthlyContribution: Number(contribution || 0),
        imageUrl: imageUrl.trim() || null,
        imagePosition,
      });
      onClose();
    } catch (cause) { setError(errorMessage(cause)); } finally { setSaving(false); }
  }

  return <PortfolioDialog title={wallet ? "Edytuj portfel" : "Dodaj portfel"} subtitle="Nadaj swoim pieniądzom kierunek." onClose={onClose} busy={saving} wide>
    <form onSubmit={submit} className="investment-form">
      <label>Nazwa portfela<input autoFocus required maxLength={120} value={name} onChange={event => changeName(event.target.value)} placeholder="np. Długoterminowy" /></label>

      <fieldset className="portfolio-image-fieldset">
        <legend>Grafika portfela</legend>
        <div className="portfolio-image-editor">
          <div className="portfolio-image-preview">
            {imageUrl && !previewError ? (
              <img
                key={imageUrl}
                src={imageUrl}
                alt="Podgląd grafiki portfela"
                style={{ objectPosition: imagePosition }}
                onError={() => setPreviewError(true)}
              />
            ) : (
              <div className="portfolio-image-empty"><ImageIcon size={28}/><span>Brak podglądu</span></div>
            )}
            <div className="portfolio-image-preview-shade"/>
            <strong>{name.trim() || "Twój portfel"}</strong>
          </div>

          <div className="portfolio-image-controls">
            <div className="portfolio-image-presets">
              {portfolioImagePresets.map(preset => (
                <button
                  type="button"
                  key={preset.key}
                  className={imageUrl === preset.url ? "selected" : ""}
                  aria-pressed={imageUrl === preset.url}
                  onClick={() => chooseImage(preset.url)}
                  title={preset.label}
                >
                  <img src={preset.url} alt="" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>

            <label>
              Własny adres grafiki
              <input
                value={imageUrl}
                onChange={event => { setImageUrl(event.target.value); setImageTouched(true); setPreviewError(false); }}
                placeholder="/portfolios/long-term.webp lub https://..."
              />
            </label>

            <div>
              <span className="portfolio-image-position-label">Pozycja kadru</span>
              <div className="portfolio-image-position-options">
                {(["top", "center", "bottom"] as PortfolioImagePosition[]).map(position => (
                  <button
                    key={position}
                    type="button"
                    className={imagePosition === position ? "selected" : ""}
                    onClick={() => setImagePosition(position)}
                  >
                    {position === "top" ? "Góra" : position === "bottom" ? "Dół" : "Środek"}
                  </button>
                ))}
                <button type="button" className="remove" onClick={() => { setImageUrl(""); setImageTouched(true); setPreviewError(false); }}>
                  Bez grafiki
                </button>
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      <div className="investment-form-columns">
        <label>Docelowa wartość (zł)<input type="number" min=".01" step=".01" value={target} onChange={event => setTarget(event.target.value)} placeholder="Opcjonalnie" /></label>
        <label>Miesięczna wpłata (zł)<input type="number" min="0" step=".01" value={contribution} onChange={event => setContribution(event.target.value)} /></label>
      </div>
      <p className="investment-note">Wpłata jest planem. Jej ustawienie nie przenosi pieniędzy automatycznie.</p>
      <fieldset><legend>Ikona portfela</legend><div className="investment-icon-options">{Object.entries(walletIcons).filter(([key]) => key !== "target").map(([key, Icon]) =>
        <button type="button" key={key} aria-label={{ wallet: "Portfel", shield: "Tarcza", sprout: "Roślina", clock: "Zegar", house: "Dom", gem: "Diament" }[key]} aria-pressed={iconKey === key} onClick={() => setIconKey(key)} className={iconKey === key ? "selected" : ""}><Icon size={22}/></button>)}</div></fieldset>
      <fieldset><legend>Kolor portfela</legend><div className="investment-color-options">{portfolioColors.map(item =>
        <button type="button" key={item} aria-label={`Kolor ${item}`} aria-pressed={color === item} onClick={() => setColor(item)} style={{ background: item }} className={color === item ? "selected" : ""} />)}</div></fieldset>
      {error && <p role="alert" className="investment-error">{error}</p>}
      <footer><button type="button" className="investment-button secondary" disabled={saving} onClick={onClose}>Anuluj</button><button className="investment-button" disabled={saving || !name.trim()}>{saving ? "Zapisywanie…" : wallet ? "Zapisz zmiany" : "Utwórz portfel"}</button></footer>
    </form>
  </PortfolioDialog>;
}
type TransferSelectValue = string | number;

type TransferSelectOption<T extends TransferSelectValue> = {
  value: T;
  label: string;
  meta?: string;
  icon?: ReactNode;
  color?: string;
  disabled?: boolean;
};

function TransferSelect<T extends TransferSelectValue>({
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "Wybierz…",
}: {
  value?: T;
  options: TransferSelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find(option => option.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`transfer-app-select ${open ? "open" : ""}`}>
      <button
        type="button"
        className="transfer-app-select-trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(current => !current)}
      >
        <span className="transfer-app-select-leading" style={{ color: selected?.color }}>
          {selected?.icon ?? <Coins size={18}/>} 
        </span>
        <span className="transfer-app-select-copy">
          <strong>{selected?.label ?? placeholder}</strong>
          {selected?.meta && <small>{selected.meta}</small>}
        </span>
        <ChevronDown size={16} className="transfer-app-select-chevron"/>
      </button>

      {open && !disabled && (
        <div className="transfer-app-select-menu" role="listbox">
          {options.length ? options.map(option => (
            <button
              key={String(option.value)}
              type="button"
              role="option"
              aria-selected={option.value === value}
              disabled={option.disabled}
              className={option.value === value ? "selected" : ""}
              onClick={() => {
                if (option.disabled) return;
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span className="transfer-app-select-option-icon" style={{ color: option.color }}>
                {option.icon ?? <Coins size={17}/>} 
              </span>
              <span className="transfer-app-select-option-copy">
                <strong>{option.label}</strong>
                {option.meta && <small>{option.meta}</small>}
              </span>
              {option.value === value && <CircleCheck size={16} className="transfer-app-select-check"/>}
            </button>
          )) : (
            <div className="transfer-app-select-empty">Brak dostępnych opcji.</div>
          )}
        </div>
      )}
    </div>
  );
}

function isPlnCashTransferSource(asset: Asset) {
  return getAssetCategory(asset) === "cash" && !asset.fxPriced;
}

function isDirectCashTarget(asset: Asset) {
  return getAssetCategory(asset) === "cash" && !asset.fxPriced;
}

function isSupportedPurchaseTarget(asset: Asset) {
  return unitPurchaseMeta(asset) !== null;
}

function canTransferToExistingAsset(source: Asset | undefined, target: Asset) {
  if (!source || source.id === target.id || !isPlnCashTransferSource(source)) return false;
  return isDirectCashTarget(target) || isSupportedPurchaseTarget(target);
}

function transferTargetMeta(asset: Asset) {
  if (isDirectCashTarget(asset)) return "Konto / gotówka PLN · zwykły transfer";
  const category = getAssetCategory(asset);
  if (category === "crypto") return "Krypto · zakup jednostek";
  if (category === "stocks") return "Akcje / ETF · zakup jednostek";
  if (category === "cash" && asset.fxPriced) return `${asset.cashCurrency ?? "FX"} · wymiana waluty`;
  return "Nieobsługiwany typ transferu";
}

export function TransferForm({ assets, wallets, allocated, sourceId, onClose, onTransfer }: {
  assets: Asset[]; wallets: PortfolioWallet[]; allocated: Map<number, number>; sourceId?: number;
  onClose: () => void; onTransfer: (input: PortfolioTransferInput) => Promise<void>;
}) {
  const realWallets = wallets.filter(wallet => wallet.type !== "GOALS");
  const availableFor = (asset: Asset) => Math.max(0, asset.value - (allocated.get(asset.id) ?? 0));
  const eligibleSources = assets.filter(asset => isPlnCashTransferSource(asset) && availableFor(asset) > 0);
  const sourceWallets = realWallets.filter(wallet => eligibleSources.some(asset => asset.portfolioId === wallet.id));
  const initialSource = assets.find(asset => asset.id === sourceId && isPlnCashTransferSource(asset) && availableFor(asset) > 0)
    ?? eligibleSources[0];
  const initialTargetWallet = realWallets.find(wallet => assets.some(asset =>
    asset.portfolioId === wallet.id && canTransferToExistingAsset(initialSource, asset)
  )) ?? realWallets[0];

  const [sourceWalletId, setSourceWalletId] = useState(initialSource?.portfolioId ?? sourceWallets[0]?.id ?? 0);
  const [targetWalletId, setTargetWalletId] = useState(initialTargetWallet?.id ?? 0);
  const [sourceAssetId, setSourceAssetId] = useState(initialSource?.id ?? 0);
  const [targetAssetId, setTargetAssetId] = useState(0);
  const [targetMode, setTargetMode] = useState<"existing" | "new">("existing");
  const [amount, setAmount] = useState("");
  const [acquiredQuantity, setAcquiredQuantity] = useState("");
  const [fee, setFee] = useState("");
  const [newCategory, setNewCategory] = useState<Extract<AssetCategory, "crypto" | "stocks" | "cash">>("crypto");
  const [newName, setNewName] = useState("Bitcoin");
  const [cryptoCoinId, setCryptoCoinId] = useState("bitcoin");
  const [cryptoSymbol, setCryptoSymbol] = useState("BTC");
  const [stockSymbol, setStockSymbol] = useState("");
  const [stockCurrency, setStockCurrency] = useState<CashCurrency>("USD");
  const [cashCurrency, setCashCurrency] = useState<Exclude<CashCurrency, "PLN">>("USD");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fxQuote, setFxQuote] = useState<FxQuote | null>(null);
  const [fxQuoteLoading, setFxQuoteLoading] = useState(false);
  const [fxQuoteError, setFxQuoteError] = useState("");

  const sourceWallet = sourceWallets.find(wallet => wallet.id === sourceWalletId) ?? sourceWallets[0];
  const sourceAssets = eligibleSources.filter(asset => asset.portfolioId === sourceWallet?.id);
  const source = sourceAssets.find(asset => asset.id === sourceAssetId) ?? sourceAssets[0];
  const existingTargetWallets = realWallets.filter(wallet => assets.some(asset =>
    asset.portfolioId === wallet.id && canTransferToExistingAsset(source, asset)
  ));
  const selectableTargetWallets = targetMode === "new" ? realWallets : existingTargetWallets;
  const targetWallet = selectableTargetWallets.find(wallet => wallet.id === targetWalletId) ?? selectableTargetWallets[0];
  const targetAssets = targetMode === "existing" && targetWallet
    ? assets.filter(asset => asset.portfolioId === targetWallet.id && canTransferToExistingAsset(source, asset))
    : [];
  const target = targetAssets.find(asset => asset.id === targetAssetId) ?? targetAssets[0];
  const targetUnit = targetMode === "existing" && target ? unitPurchaseMeta(target) : null;
  const isPurchase = targetMode === "new" || targetUnit !== null;
  const purchaseSourceAllowed = !!source && isSpendablePurchaseSource(source);
  const available = source ? availableFor(source) : 0;
  const reserved = source ? allocated.get(source.id) ?? 0 : 0;
  const numericAmount = Number(amount);
  const numericQuantity = Number(acquiredQuantity);
  const numericFee = fee.trim() === "" ? 0 : Number(fee);
  const totalDebit = numericAmount + numericFee;
  const newTargetValid = targetMode !== "new" || (
    !!targetWallet
    && newName.trim().length > 0
    && (newCategory !== "crypto" || (cryptoCoinId.trim().length > 0 && cryptoSymbol.trim().length > 0))
    && (newCategory !== "stocks" || stockSymbol.trim().length > 0)
    && newName.trim().length > 0
  );
  const targetValid = targetMode === "new" ? newTargetValid : !!target;
  const moneyValid = Number.isFinite(numericAmount) && numericAmount > 0
    && Math.abs(numericAmount * 100 - Math.round(numericAmount * 100)) < .000001;
  const feeValid = Number.isFinite(numericFee) && numericFee >= 0
    && Math.abs(numericFee * 100 - Math.round(numericFee * 100)) < .000001;
  const quantityValid = !isPurchase || (Number.isFinite(numericQuantity) && numericQuantity > 0);
  const sourceValid = !!source && (!isPurchase || purchaseSourceAllowed) && (numericFee === 0 || purchaseSourceAllowed);
  const valid = !!sourceWallet && !!targetWallet && targetValid && sourceValid
    && moneyValid && feeValid && quantityValid && totalDebit <= available;

  const currentQuantity = targetUnit?.quantity ?? 0;
  const resultingQuantity = currentQuantity + (isPurchase && Number.isFinite(numericQuantity) ? numericQuantity : 0);
  const impliedUnitPrice = isPurchase && numericQuantity > 0 && numericAmount > 0 ? numericAmount / numericQuantity : null;
  const targetName = targetMode === "new" ? newName.trim() : target?.name ?? "aktywo";
  const quantityLabel = targetMode === "new"
    ? newCategory === "crypto" ? `Otrzymane monety (${cryptoSymbol.trim().toUpperCase() || "krypto"})`
      : newCategory === "stocks" ? "Otrzymane akcje / jednostki"
        : `Otrzymana waluta (${cashCurrency})`
    : targetUnit?.label ?? "Otrzymane jednostki";
  const fxCurrency = targetMode === "new"
    ? (newCategory === "cash" ? cashCurrency : null)
    : (target && getAssetCategory(target) === "cash" && target.fxPriced && target.cashCurrency && target.cashCurrency !== "PLN" ? target.cashCurrency : null);
  const isFxPurchase = isPurchase && fxCurrency != null;
  const marketFxRate = isFxPurchase ? fxQuote?.ratePln ?? null : null;
  const bankFxRate = isFxPurchase && numericQuantity > 0 && numericAmount > 0 ? numericAmount / numericQuantity : null;
  const fxMarketValue = marketFxRate != null && numericQuantity > 0 ? marketFxRate * numericQuantity : null;
  const fxSpreadLoss = fxMarketValue != null && numericAmount > fxMarketValue ? numericAmount - fxMarketValue : 0;
  const fxSpreadPercent = marketFxRate != null && bankFxRate != null && marketFxRate > 0
    ? Math.max(0, (bankFxRate / marketFxRate - 1) * 100)
    : 0;
  const fxQuoteTimestampLabel = fxQuote?.quotedAt
    ? new Date(fxQuote.quotedAt).toLocaleString("pl-PL", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      })
    : fxQuote?.effectiveDate ?? null;

  const sourceWalletOptions: TransferSelectOption<number>[] = sourceWallets.map(wallet => ({
    value: wallet.id,
    label: wallet.name,
    meta: wallet.type === "MAIN" ? "Portfel systemowy" : `${eligibleSources.filter(asset => asset.portfolioId === wallet.id).length} źr. gotówki PLN`,
    color: wallet.color,
    icon: <WalletIcon name={wallet.iconKey ?? "wallet"} size={19}/>,
  }));
  const sourceAssetOptions: TransferSelectOption<number>[] = sourceAssets.map(asset => ({
    value: asset.id,
    label: asset.name,
    meta: `${money(availableFor(asset))} dostępne`,
    color: asset.color,
    icon: <AssetIcon iconKey={getAssetIconKey(asset)} size={18}/>,
  }));
  const targetWalletOptions: TransferSelectOption<number>[] = selectableTargetWallets.map(wallet => ({
    value: wallet.id,
    label: wallet.name,
    meta: targetMode === "new"
      ? "Możesz utworzyć tu nową pozycję"
      : `${assets.filter(asset => asset.portfolioId === wallet.id && canTransferToExistingAsset(source, asset)).length} obsługiwane cele`,
    color: wallet.color,
    icon: <WalletIcon name={wallet.iconKey ?? "wallet"} size={19}/>,
  }));
  const targetAssetOptions: TransferSelectOption<number>[] = targetAssets.map(asset => ({
    value: asset.id,
    label: asset.name,
    meta: transferTargetMeta(asset),
    color: asset.color,
    icon: <AssetIcon iconKey={getAssetIconKey(asset)} size={18}/>,
  }));

  useEffect(() => {
    let cancelled = false;
    let intervalId: number | null = null;

    if (!fxCurrency) {
      setFxQuote(null);
      setFxQuoteError("");
      setFxQuoteLoading(false);
      return () => { cancelled = true; };
    }

    const load = async (silent = false) => {
      if (!silent) setFxQuoteLoading(true);
      setFxQuoteError("");
      try {
        const quote = await marketPriceApi.getFxQuote(fxCurrency);
        if (!cancelled) setFxQuote(quote);
      } catch (cause) {
        if (!cancelled) {
          if (!silent) setFxQuote(null);
          setFxQuoteError(errorMessage(cause));
        }
      } finally {
        if (!cancelled && !silent) setFxQuoteLoading(false);
      }
    };

    void load(false);
    intervalId = window.setInterval(() => { void load(true); }, 30_000);

    return () => {
      cancelled = true;
      if (intervalId != null) window.clearInterval(intervalId);
    };
  }, [fxCurrency]);

  function chooseSourceWallet(id: number) {
    setSourceWalletId(id);
    const candidates = eligibleSources.filter(asset => asset.portfolioId === id);
    setSourceAssetId(candidates[0]?.id ?? 0);
    setTargetAssetId(0);
    setAcquiredQuantity("");
    setFee("");
    setError("");
  }

  function chooseSourceAsset(id: number) {
    setSourceAssetId(id);
    setTargetAssetId(0);
    setAcquiredQuantity("");
    setFee("");
    setError("");
  }

  function chooseTargetMode(mode: "existing" | "new") {
    setTargetMode(mode);
    setTargetAssetId(0);
    setAcquiredQuantity("");
    setError("");
    if (mode === "existing") {
      const firstWallet = realWallets.find(wallet => assets.some(asset =>
        asset.portfolioId === wallet.id && canTransferToExistingAsset(source, asset)
      ));
      if (firstWallet) setTargetWalletId(firstWallet.id);
    } else if (!realWallets.some(wallet => wallet.id === targetWalletId) && realWallets[0]) {
      setTargetWalletId(realWallets[0].id);
    }
  }

  function chooseNewCategory(category: Extract<AssetCategory, "crypto" | "stocks" | "cash">) {
    setNewCategory(category);
    setAcquiredQuantity("");
    if (category === "crypto" && (!newName.trim() || newName === `Gotówka ${cashCurrency}`)) setNewName("Bitcoin");
    if (category === "cash") setNewName(`Gotówka ${cashCurrency}`);
    if (category === "stocks" && (newName === "Bitcoin" || newName.startsWith("Gotówka "))) setNewName("");
  }

  function buildNewTarget(): PurchaseTargetInput | null {
    if (targetMode !== "new") return null;
    if (newCategory === "crypto") return {
      name: newName.trim(), category: "crypto", color: "#f59e0b", iconKey: "bitcoin",
      cryptoCoinId: cryptoCoinId.trim().toLowerCase(), cryptoSymbol: cryptoSymbol.trim().toUpperCase(),
    };
    if (newCategory === "stocks") return {
      name: newName.trim(), category: "stocks", color: "#3b82f6", iconKey: "chart",
      stockSymbol: stockSymbol.trim().toUpperCase(), stockCurrency,
    };
    return {
      name: newName.trim() || `Gotówka ${cashCurrency}`, category: "cash", color: "#10b981", iconKey: "landmark",
      cashCurrency,
    };
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid || saving || !source) return;
    setSaving(true); setError("");
    try {
      if (isFxPurchase && fxCurrency) {
        // Refresh immediately before booking. Backend independently fetches a fresh
        // benchmark too and persists the exact quote used for the spread calculation.
        const freshQuote = await marketPriceApi.getFxQuote(fxCurrency, true);
        setFxQuote(freshQuote);
      }
      await onTransfer({
        sourceAssetId: source.id,
        targetAssetId: targetMode === "existing" ? target?.id ?? null : null,
        targetPortfolioId: targetMode === "new" ? targetWallet?.id ?? null : null,
        newTarget: buildNewTarget(),
        amount: numericAmount,
        acquiredQuantity: isPurchase ? numericQuantity : null,
        fee: numericFee,
      });
      onClose();
    } catch (cause) { setError(errorMessage(cause)); } finally { setSaving(false); }
  }

  return <PortfolioDialog
    title={isPurchase ? "Zakup / wymiana aktywa" : "Transfer środków"}
    subtitle={isPurchase
      ? "Freedom pokazuje tylko operacje, które da się poprawnie zaksięgować: z gotówki PLN do waluty obcej, krypto lub akcji / ETF."
      : "Bezpieczny transfer między kontami / gotówką PLN — bez sztucznego przenoszenia mieszkań, obligacji czy innych aktywów."}
    icon={<ArrowRightLeft size={24}/>} className="transfer-dialog" onClose={onClose} busy={saving}
  >
    <form onSubmit={submit} className="investment-form transfer-form">
      <div className="transfer-logic-banner">
        <CircleCheck size={17}/>
        <div>
          <strong>Freedom filtruje niemożliwe transfery</strong>
          <span>Źródłem może być konto / gotówka PLN. Celem może być inne konto PLN albo pozycja kupowana za gotówkę: waluta obca, krypto lub akcje / ETF.</span>
        </div>
      </div>

      <div className="transfer-route">
        <section className="transfer-side source">
          <div className="transfer-side-heading"><span><ArrowUpRight size={17}/>Skąd płacisz</span><span className="transfer-step">01</span></div>

          <label>Portfel źródłowy
            <TransferSelect
              value={sourceWallet?.id}
              options={sourceWalletOptions}
              disabled={saving || sourceWalletOptions.length === 0}
              placeholder="Brak portfela z wolną gotówką PLN"
              onChange={chooseSourceWallet}
            />
          </label>

          <label>Źródło pieniędzy
            <TransferSelect
              value={source?.id}
              options={sourceAssetOptions}
              disabled={saving || sourceAssetOptions.length === 0}
              placeholder="Brak dostępnej gotówki PLN"
              onChange={chooseSourceAsset}
            />
          </label>

          <div className="transfer-balance"><span><Wallet size={14}/>Dostępne</span><strong>{money(available)}</strong></div>
          <p className="transfer-reserved"><LockKeyhole size={12}/>{money(reserved)} zarezerwowane na cele lub zobowiązania</p>
          <p className="transfer-route-rule">Źródła typu nieruchomość, obligacje, pojazd, metale czy już kupione krypto nie są tutaj traktowane jak „gotówka do wydania”.</p>
        </section>

        <span className="transfer-route-arrow" aria-hidden="true"><ArrowRight size={20}/></span>

        <section className="transfer-side destination">
          <div className="transfer-side-heading"><span><ArrowDownLeft size={17}/>{isPurchase ? "Co kupujesz" : "Dokąd trafiają środki"}</span><span className="transfer-step">02</span></div>

          <label>Portfel docelowy
            <TransferSelect
              value={targetWallet?.id}
              options={targetWalletOptions}
              disabled={saving || targetWalletOptions.length === 0}
              placeholder={targetMode === "existing" ? "Brak portfela z obsługiwanym celem" : "Wybierz portfel"}
              onChange={id => { setTargetWalletId(id); setTargetAssetId(0); setAcquiredQuantity(""); setError(""); }}
            />
          </label>

          <div className="transfer-target-mode" role="group" aria-label="Sposób wyboru pozycji docelowej">
            <button type="button" className={targetMode === "existing" ? "selected" : ""} onClick={() => chooseTargetMode("existing")}>Istniejąca pozycja</button>
            <button type="button" className={targetMode === "new" ? "selected" : ""} onClick={() => chooseTargetMode("new")}>+ Nowa pozycja</button>
          </div>

          {targetMode === "existing" ? <>
            <label>Konto / aktywo docelowe
              <TransferSelect
                value={target?.id}
                options={targetAssetOptions}
                disabled={saving || targetAssetOptions.length === 0}
                placeholder="Brak logicznego celu w tym portfelu"
                onChange={id => { setTargetAssetId(id); setAcquiredQuantity(""); setError(""); }}
              />
            </label>

            {target ? <>
              <div className="transfer-operation-kind">
                <span>{targetUnit ? "ZAKUP" : "TRANSFER"}</span>
                <strong>{transferTargetMeta(target)}</strong>
              </div>
              <div className="transfer-balance"><span><Coins size={14}/>{targetUnit ? "Aktualna ilość" : "Aktualna wartość konta"}</span><strong>{targetUnit ? `${formatUnits(targetUnit.quantity)} ${targetUnit.symbol}` : money(target.value)}</strong></div>
              <p className="transfer-reserved"><Plus size={12}/>{targetUnit ? "Zakup zwiększy liczbę jednostek, a wycenę policzy rynek" : "Kwota zostanie przesunięta między kontami PLN"}</p>
            </> : <div className="transfer-empty-target">
              <p>W tym portfelu nie ma pozycji, do której Freedom może logicznie wykonać tę operację.</p>
              <button type="button" className="investment-button secondary" onClick={() => chooseTargetMode("new")}><Plus size={14}/>Utwórz nową pozycję</button>
            </div>}
          </> : <NewPurchaseTargetFields
            category={newCategory} onCategory={chooseNewCategory}
            name={newName} onName={setNewName}
            cryptoCoinId={cryptoCoinId} onCryptoCoinId={setCryptoCoinId}
            cryptoSymbol={cryptoSymbol} onCryptoSymbol={setCryptoSymbol}
            stockSymbol={stockSymbol} onStockSymbol={setStockSymbol}
            stockCurrency={stockCurrency} onStockCurrency={setStockCurrency}
            cashCurrency={cashCurrency} onCashCurrency={value => { setCashCurrency(value); if (!newName.trim() || newName.startsWith("Gotówka ")) setNewName(`Gotówka ${value}`); }}
            disabled={saving}
          />}
        </section>
      </div>

      <div className="transfer-amount-block">
        <label htmlFor="transfer-amount"><Coins size={16}/>{isPurchase ? "Kwota zapłacona za aktywo" : "Kwota transferu"}</label>
        <div className="transfer-amount-input"><input id="transfer-amount" required type="number" min=".01" max={Math.max(0, available - numericFee)} step=".01" placeholder="0,00" value={amount} disabled={saving} onChange={event => setAmount(event.target.value)} autoFocus/><span>PLN</span><button type="button" disabled={saving || available <= numericFee} onClick={() => setAmount(Math.max(0, available - numericFee).toFixed(2))}>Całość</button></div>
        {totalDebit > available && <p className="transfer-amount-error" role="status">Zakup + prowizja wymagają {money(totalDebit)}. Dostępne: {money(available)}.</p>}
      </div>

      {isPurchase && <div className="transfer-quantity-block">
        <div className="transfer-quantity-heading"><div><strong>{quantityLabel}</strong><small>Wpisz dokładnie tyle jednostek, ile faktycznie zaksięgowała giełda / broker / kantor.</small></div><span>ILOŚĆ</span></div>
        <input type="number" min="0.000000000001" step="any" placeholder="np. 0,005234" value={acquiredQuantity} disabled={saving} onChange={event => setAcquiredQuantity(event.target.value)} />
        {targetMode === "existing" && targetUnit && numericQuantity > 0 && <div className="transfer-quantity-preview"><span>Po zakupie</span><strong>{formatUnits(resultingQuantity)} {targetUnit.symbol}</strong></div>}
        {impliedUnitPrice !== null && Number.isFinite(impliedUnitPrice) && <p className="transfer-implied-price">Efektywna cena z wpisanych danych: <strong>{money(impliedUnitPrice)} / jednostkę</strong> (bez fee).</p>}
      </div>}

      {isFxPurchase && <div className="transfer-fx-benchmark">
        <div className="transfer-fx-benchmark-heading">
          <div><strong>Kurs kantoru vs bieżący rynek</strong><small>Freedom porównuje Twój efektywny kurs z możliwie świeżym notowaniem {fxCurrency}/PLN. Kurs odświeża się automatycznie co 30 s i ponownie przy zatwierdzeniu.</small></div>
          <span className={`transfer-fx-live ${fxQuote?.fallback ? "fallback" : fxQuote ? "intraday" : ""}`}>{fxQuoteLoading ? "POBIERAM…" : fxQuote ? (fxQuote.fallback ? "NBP FALLBACK" : "INTRADAY") : "BRAK KURSU"}</span>
        </div>
        {fxQuote && marketFxRate != null && <div className="transfer-fx-grid">
          <div><span>Kurs rynkowy</span><strong>1 {fxCurrency} = {marketFxRate.toLocaleString("pl-PL", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} zł</strong><small>{fxQuoteTimestampLabel ?? "—"} · {fxQuote.provider ?? "rynek"}</small></div>
          <div><span>Twój kurs kantoru</span><strong>{bankFxRate != null ? `1 ${fxCurrency} = ${bankFxRate.toLocaleString("pl-PL", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} zł` : "—"}</strong><small>zapłacone PLN ÷ otrzymane {fxCurrency}</small></div>
          <div><span>Wartość po kursie rynku</span><strong>{fxMarketValue != null ? money(fxMarketValue) : "—"}</strong><small>{numericQuantity > 0 ? `${formatUnits(numericQuantity)} ${fxCurrency}` : "Wpisz otrzymaną walutę"}</small></div>
          <div className={fxSpreadLoss > 0 ? "loss" : "ok"}><span>Ukryty koszt kursowy</span><strong>{fxMarketValue != null ? money(Math.max(0, fxSpreadLoss)) : "—"}</strong><small>{fxMarketValue != null ? `${fxSpreadPercent.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% ponad benchmarkiem rynkowym` : "Policzymy automatycznie"}</small></div>
        </div>}
        {fxQuoteError && <p className="transfer-fx-error">Nie udało się pobrać bieżącego kursu odniesienia FX: {fxQuoteError}</p>}
        {fxQuote && <div className="transfer-fx-source-line">
          <span>Źródło kursu odniesienia: {fxQuote.source}</span>
          <span>{fxQuote.fallback ? "Kurs dzienny — fallback" : "Publiczne notowanie intraday może być opóźnione"}</span>
        </div>}
        {fxSpreadLoss > 0 && <div className="transfer-fx-expense-note"><ReceiptText size={16}/><p><strong>{money(fxSpreadLoss)} zostanie automatycznie zapisane jako wydatek.</strong><br/>Inwestycje → Spread walutowy · źródło: {source?.name ?? "konto źródłowe"}.</p></div>}
      </div>}

      {purchaseSourceAllowed && <div className="transfer-fee-block">
        <div className="transfer-fee-heading">
          <span className="transfer-fee-icon"><ReceiptText size={17}/></span>
          <div><strong>Prowizja / fee <em>opcjonalnie</em></strong><small>Jawna opłata operatora — niezależna od spreadu walutowego</small></div>
        </div>
        <div className="transfer-fee-input"><input type="number" min="0" step=".01" placeholder="0,00" value={fee} disabled={saving} onChange={event => setFee(event.target.value)}/><span>PLN</span></div>
        <p>Jeśli wpiszesz prowizję, Freedom utworzy wydatek <strong>Inwestycje → Prowizje i opłaty</strong> z opisem „Prowizja inwestycyjna · {targetName || "aktywo"}”.</p>
      </div>}

      {valid && <div className="transfer-preview" aria-live="polite">
        <div><span>W źródle po operacji</span><strong>{money(available - totalDebit)} <small>dostępne</small></strong></div>
        <ArrowRight size={17}/>
        <div><span>{isPurchase ? "Pozycja po zakupie" : "W aktywie docelowym"}</span><strong>{isPurchase ? `${formatUnits(resultingQuantity)} ${targetMode === "existing" ? targetUnit?.symbol ?? "j." : newCategory === "crypto" ? cryptoSymbol.toUpperCase() : newCategory === "cash" ? cashCurrency : "j."}` : money((target?.value ?? 0) + numericAmount)}</strong></div>
      </div>}

      <div className={`transfer-info ${numericFee > 0 || fxSpreadLoss > 0 ? "with-fee" : ""}`}><CircleCheck size={18}/><p>
        <strong>{isPurchase
          ? (numericFee > 0 || fxSpreadLoss > 0
              ? `Pewny koszt operacji: ${money(numericFee + fxSpreadLoss)}${fxSpreadLoss > 0 ? ` (${money(fxSpreadLoss)} spread + ${money(numericFee)} fee)` : " prowizji"}`
              : "Zakup nie jest wydatkiem konsumpcyjnym")
          : (numericFee > 0 ? `Majątek spadnie tylko o ${money(numericFee)} prowizji` : "Majątek pozostaje bez zmian")}</strong>
        <span>{isFxPurchase
          ? "Zapłacone PLN znikną ze źródła, otrzymana waluta zwiększy quantity pozycji, a różnica względem kursu rynkowego z chwili transakcji zostanie zaksięgowana jako koszt spreadu. Dodatkowa prowizja pozostaje osobnym kosztem."
          : isPurchase
            ? "Kwota zakupu zostanie odjęta ze źródła, liczba jednostek zostanie dodana do pozycji, a jej wartość PLN będzie wynikać z aktualnego kursu rynkowego. Wzrost wyceny nie tworzy przychodu w Finanse."
            : "Przenosisz kapitał między aktywami. Transfer nie jest przychodem ani wydatkiem."}</span>
      </p></div>

      {error && <p role="alert" className="investment-error">{error}</p>}
      <footer><button type="button" className="investment-button secondary" onClick={onClose} disabled={saving}>Anuluj</button><button className="investment-button" disabled={!valid || saving}>{saving ? <LoaderCircle size={16} className="animate-spin"/> : <ArrowRightLeft size={16}/>} {saving ? "Księgowanie…" : isPurchase ? "Kup aktywo" : "Przenieś środki"}</button></footer>
    </form>
  </PortfolioDialog>;
}

function NewPurchaseTargetFields({ category, onCategory, name, onName, cryptoCoinId, onCryptoCoinId, cryptoSymbol, onCryptoSymbol, stockSymbol, onStockSymbol, stockCurrency, onStockCurrency, cashCurrency, onCashCurrency, disabled }: {
  category: Extract<AssetCategory, "crypto" | "stocks" | "cash">;
  onCategory: (value: Extract<AssetCategory, "crypto" | "stocks" | "cash">) => void;
  name: string; onName: (value: string) => void;
  cryptoCoinId: string; onCryptoCoinId: (value: string) => void;
  cryptoSymbol: string; onCryptoSymbol: (value: string) => void;
  stockSymbol: string; onStockSymbol: (value: string) => void;
  stockCurrency: CashCurrency; onStockCurrency: (value: CashCurrency) => void;
  cashCurrency: Exclude<CashCurrency, "PLN">; onCashCurrency: (value: Exclude<CashCurrency, "PLN">) => void;
  disabled: boolean;
}) {
  return <div className="transfer-new-target">
    <div className="transfer-target-type">
      <button type="button" className={category === "crypto" ? "selected" : ""} onClick={() => onCategory("crypto")}>Krypto</button>
      <button type="button" className={category === "stocks" ? "selected" : ""} onClick={() => onCategory("stocks")}>Akcje / ETF</button>
      <button type="button" className={category === "cash" ? "selected" : ""} onClick={() => onCategory("cash")}>Waluta obca</button>
    </div>
    <label>Nazwa pozycji<input value={name} disabled={disabled} onChange={event => onName(event.target.value)} placeholder={category === "crypto" ? "Bitcoin" : category === "stocks" ? "Coca Cola" : `Gotówka ${cashCurrency}`} /></label>
    {category === "crypto" && <div className="investment-form-columns">
      <label>CoinGecko ID<input value={cryptoCoinId} disabled={disabled} onChange={event => onCryptoCoinId(event.target.value)} placeholder="bitcoin" /></label>
      <label>Symbol<input value={cryptoSymbol} disabled={disabled} onChange={event => onCryptoSymbol(event.target.value)} placeholder="BTC" /></label>
    </div>}
    {category === "stocks" && <div className="investment-form-columns">
      <label>Ticker Yahoo<input value={stockSymbol} disabled={disabled} onChange={event => onStockSymbol(event.target.value)} placeholder="MCD, DNP.WA, IWDA.L" /></label>
      <label>Waluta notowania
        <TransferSelect
          value={stockCurrency}
          disabled={disabled}
          options={(["PLN", "USD", "EUR", "GBP", "CHF"] as CashCurrency[]).map(currency => ({
            value: currency,
            label: currency,
            meta: currency === "PLN" ? "Notowanie w złotych" : "Waluta notowania instrumentu",
            icon: <CircleDollarSign size={17}/>,
          }))}
          onChange={onStockCurrency}
        />
      </label>
    </div>}
    {category === "cash" && <label>Waluta
      <TransferSelect
        value={cashCurrency}
        disabled={disabled}
        options={(["USD", "EUR", "CHF", "GBP", "CZK"] as Exclude<CashCurrency, "PLN">[]).map(currency => ({
          value: currency,
          label: currency,
          meta: "Waluta obca",
          icon: <CircleDollarSign size={17}/>,
        }))}
        onChange={onCashCurrency}
      />
    </label>}
    <p className="investment-note">Pozycja zostanie utworzona z ilością z tej transakcji. Nie powstanie sztuczny „kapitał początkowy”.</p>
  </div>;
}

function isSpendablePurchaseSource(asset: Asset) {
  return getAssetCategory(asset) === "cash" && !asset.fxPriced;
}

function unitPurchaseMeta(asset: Asset): { quantity: number; symbol: string; label: string } | null {
  if (getAssetCategory(asset) === "crypto" && asset.cryptoCoinId && asset.cryptoQuantity != null) {
    return { quantity: asset.cryptoQuantity, symbol: asset.cryptoSymbol || "krypto", label: `Otrzymane monety (${asset.cryptoSymbol || "krypto"})` };
  }
  if (getAssetCategory(asset) === "stocks" && asset.stockPriced && asset.stockQuantity != null) {
    return { quantity: asset.stockQuantity, symbol: "szt.", label: "Otrzymane akcje / jednostki" };
  }
  if (getAssetCategory(asset) === "cash" && asset.fxPriced && asset.cashCurrency && asset.cashCurrency !== "PLN" && asset.cashQuantity != null) {
    return { quantity: asset.cashQuantity, symbol: asset.cashCurrency, label: `Otrzymana waluta (${asset.cashCurrency})` };
  }
  return null;
}

function formatUnits(value: number) {
  return new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 12 }).format(value);
}

export function GoalCapitalDialog({ goal, release, onClose, onRelease }: {
  goal: FundedGoal; release: boolean; onClose: () => void; onRelease: (assetId: number, amount: number) => Promise<void>;
}) {
  const releasable = goal.allocations.filter(row => row.assetId != null);
  const [assetId, setAssetId] = useState(releasable[0]?.assetId ?? 0);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const maximum = releasable.find(row => row.assetId === assetId)?.amount ?? 0;
  async function submit(event: FormEvent) {
    event.preventDefault(); if (Number(amount) <= 0 || Number(amount) > maximum) return;
    setSaving(true); setError("");
    try { await onRelease(assetId, Number(amount)); onClose(); }
    catch (cause) { setError(errorMessage(cause)); } finally { setSaving(false); }
  }
  return <PortfolioDialog title={release ? `Zwolnij środki · ${goal.name}` : goal.name} subtitle={`Przypisany kapitał: ${money(goal.amount)}`} onClose={onClose} busy={saving}>
    <form className="investment-form" onSubmit={submit}>
      <div className="goal-capital-details">{goal.allocations.map((row, index) => <div key={`${row.assetId}-${index}`}><span>{row.assetName}{row.assetId == null ? " · bez powiązania z aktywem" : ""}</span><strong>{money(row.amount)}</strong></div>)}</div>
      {release && <>
        <label>Źródło rezerwacji<select value={assetId} onChange={event => setAssetId(Number(event.target.value))}>{releasable.map(row => <option key={row.assetId} value={row.assetId!}>{row.assetName}</option>)}</select></label>
        <label>Kwota do zwolnienia (zł)<input required type="number" min=".01" step=".01" max={maximum} value={amount} onChange={event => setAmount(event.target.value)} autoFocus /></label>
        <p className="investment-note">Możesz zwolnić {money(maximum)}. Środki będą ponownie dostępne w portfelu źródłowym. Wartość majątku się nie zmieni.</p>
      </>}
      {error && <p className="investment-error" role="alert">{error}</p>}
      <footer><button type="button" className="investment-button secondary" onClick={onClose} disabled={saving}>{release ? "Anuluj" : "Zamknij"}</button>{release && <button className="investment-button" disabled={saving || Number(amount) <= 0 || Number(amount) > maximum}>{saving ? "Zwalnianie…" : "Zwolnij środki"}</button>}</footer>
    </form>
  </PortfolioDialog>;
}
