import { useState, useEffect, useRef } from "react";

const API_BASE = "http://localhost:5000/api/assets";

// ─── Theme (shared with Home / Auth / Sidebar) ────────────────────────────────
const C = {
  bg:         "#07080d",
  text:       "#ffffff",
  body:       "rgba(255,255,255,0.82)",
  muted:      "rgba(255,255,255,0.62)",
  faint:      "rgba(255,255,255,0.40)",
  border:     "rgba(255,255,255,0.12)",
  borderSoft: "rgba(255,255,255,0.07)",
  surface:    "rgba(255,255,255,0.035)",
  accent:     "#34d399",
  accentDark: "#0d9488",
  negative:   "#f87171",
  amber:      "#fbbf24",
};

const formatCurrency = (val) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val || 0);

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const toInputDate = (d) => {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
};

const today = () => new Date().toISOString().split("T")[0];

const gainColor = (gain) => (gain > 0 ? C.accent : gain < 0 ? C.negative : C.muted);
const gainPrefix = (gain) => (gain > 0 ? "+" : "");

const EMPTY_FORM = {
  asset_name: "",
  institution: "",
  invested_value: "",
  invested_date: "",
  notes: "",
};

// ─── Inline Current Value Editor ─────────────────────────────────────────────

function CurrentValueCell({ asset, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const startEdit = () => {
    setInputVal(asset.current_value ?? asset.invested_value);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 30);
  };

  const cancel = () => setEditing(false);

  const save = async () => {
    const parsed = parseFloat(inputVal);
    if (isNaN(parsed) || parsed < 0) return cancel();
    if (parsed === asset.current_value) return cancel();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/${asset._id}/current-value`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_value: parsed }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      onUpdated(updated);
    } catch {
      // silently revert
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") cancel();
  };

  const currentVal = asset.current_value ?? asset.invested_value;
  const gain = currentVal - asset.invested_value;
  const gainPct = asset.invested_value ? (gain / asset.invested_value) * 100 : 0;

  return (
    <div style={styles.metaItem}>
      <span style={styles.metaLabel}>CURRENT VALUE</span>

      {editing ? (
        <div style={styles.inlineEditRow}>
          <span style={styles.currencyPrefix}>$</span>
          <input
            ref={inputRef}
            style={styles.inlineInput}
            type="number"
            min="0"
            step="0.01"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={save}
            disabled={saving}
          />
        </div>
      ) : (
        <div style={styles.currentValueRow}>
          <span
            style={{ ...styles.metaValue, color: C.text, cursor: "pointer" }}
            onClick={startEdit}
            title="Click to update current value"
          >
            {formatCurrency(currentVal)}
          </span>
          <button style={styles.editValueBtn} onClick={startEdit} title="Edit current value" aria-label="Edit current value">✎</button>
        </div>
      )}

      <span style={{ ...styles.gainBadge, color: gainColor(gain) }}>
        {gainPrefix(gain)}{formatCurrency(gain)} ({gainPrefix(gainPct)}{gainPct.toFixed(1)}%)
      </span>
    </div>
  );
}

// ─── Buy Modal ────────────────────────────────────────────────────────────────

function BuyModal({ asset, onClose, onUpdated }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const newInvested = parseFloat(amount) > 0
    ? asset.invested_value + parseFloat(amount)
    : null;
  const newCurrent = parseFloat(amount) > 0
    ? asset.current_value + parseFloat(amount)
    : null;

  const handleBuy = async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError("Enter a valid buy amount.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${asset._id}/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsed, date }),
      });
      if (!res.ok) throw new Error("Buy failed.");
      const updated = await res.json();
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...styles.modal, maxWidth: 460 }}>
        <div style={styles.modalHeader}>
          <div>
            <div style={{ ...styles.modalTag, color: C.accent }}>BUY MORE</div>
            <h2 style={styles.modalTitle}>{asset.asset_name}</h2>
          </div>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div style={styles.modalBody}>
          {error && <div style={styles.errorBanner}>{error}</div>}

          <div style={styles.snapshotRow}>
            <div style={styles.snapshotItem}>
              <span style={styles.snapshotLabel}>CURRENT INVESTED</span>
              <span style={styles.snapshotValue}>{formatCurrency(asset.invested_value)}</span>
            </div>
            <div style={styles.snapshotArrow}>→</div>
            <div style={{ ...styles.snapshotItem, opacity: newInvested ? 1 : 0.4 }}>
              <span style={{ ...styles.snapshotLabel, color: C.accent }}>AFTER BUY</span>
              <span style={{ ...styles.snapshotValue, color: C.accent }}>
                {newInvested ? formatCurrency(newInvested) : "—"}
              </span>
            </div>
          </div>

          <div style={styles.fieldGrid}>
            <div style={styles.fieldFull}>
              <label style={styles.label}>Buy Amount ($) <span style={styles.req}>*</span></label>
              <input
                style={styles.input}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div style={styles.fieldFull}>
              <label style={styles.label}>Transaction Date</label>
              <input
                style={styles.input}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {newCurrent && (
            <div style={styles.previewNote}>
              New current value will be <strong style={{ color: C.accent }}>{formatCurrency(newCurrent)}</strong>
            </div>
          )}
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
          <button style={styles.buyConfirmBtn} onClick={handleBuy} disabled={loading}>
            {loading ? "Processing…" : "↑ Confirm Buy"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sell Modal ───────────────────────────────────────────────────────────────

function SellModal({ asset, onClose, onUpdated }) {
  const [proceeds, setProceeds] = useState("");
  const [date, setDate] = useState(today());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parsedProceeds = parseFloat(proceeds);
  const isValid = parsedProceeds > 0 && parsedProceeds <= asset.current_value;
  const sellRatio = isValid ? parsedProceeds / asset.current_value : 0;
  const costBasisReduction = isValid ? asset.invested_value * sellRatio : 0;
  const newCurrent = isValid ? asset.current_value - parsedProceeds : null;
  const newInvested = isValid ? asset.invested_value - costBasisReduction : null;
  const realizedGain = isValid ? parsedProceeds - costBasisReduction : null;

  const handleSell = async () => {
    if (!isValid) {
      setError(
        parsedProceeds > asset.current_value
          ? `Proceeds exceed current value of ${formatCurrency(asset.current_value)}.`
          : "Enter a valid proceeds amount."
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${asset._id}/sell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proceeds: parsedProceeds, date }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Sell failed.");
      }
      const updated = await res.json();
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFullSell = parsedProceeds === asset.current_value;

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...styles.modal, maxWidth: 480 }}>
        <div style={styles.modalHeader}>
          <div>
            <div style={{ ...styles.modalTag, color: C.negative }}>SELL / EXIT</div>
            <h2 style={styles.modalTitle}>{asset.asset_name}</h2>
          </div>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div style={styles.modalBody}>
          {error && <div style={styles.errorBanner}>{error}</div>}

          <div style={styles.snapshotRow}>
            <div style={styles.snapshotItem}>
              <span style={styles.snapshotLabel}>CURRENT VALUE</span>
              <span style={styles.snapshotValue}>{formatCurrency(asset.current_value)}</span>
            </div>
            <div style={styles.snapshotArrow}>→</div>
            <div style={{ ...styles.snapshotItem, opacity: newCurrent !== null ? 1 : 0.4 }}>
              <span style={{ ...styles.snapshotLabel, color: C.negative }}>AFTER SELL</span>
              <span style={{ ...styles.snapshotValue, color: C.negative }}>
                {newCurrent !== null ? formatCurrency(newCurrent) : "—"}
              </span>
            </div>
          </div>

          <div style={styles.fieldGrid}>
            <div style={styles.fieldFull}>
              <label style={styles.label}>
                Proceeds / Sale Amount ($) <span style={styles.req}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  style={styles.input}
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={proceeds}
                  onChange={(e) => setProceeds(e.target.value)}
                  autoFocus
                />
                <button
                  style={styles.maxBtn}
                  onClick={() => setProceeds(asset.current_value.toString())}
                  title="Sell all"
                >
                  MAX
                </button>
              </div>
            </div>
            <div style={styles.fieldFull}>
              <label style={styles.label}>Transaction Date</label>
              <input
                style={styles.input}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {isValid && (
            <div style={styles.sellBreakdown}>
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownLabel}>Cost basis removed</span>
                <span style={styles.breakdownValue}>−{formatCurrency(costBasisReduction)}</span>
              </div>
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownLabel}>Realized gain / loss</span>
                <span style={{ ...styles.breakdownValue, color: gainColor(realizedGain) }}>
                  {gainPrefix(realizedGain)}{formatCurrency(realizedGain)}
                </span>
              </div>
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownLabel}>Remaining invested</span>
                <span style={styles.breakdownValue}>{formatCurrency(newInvested)}</span>
              </div>
              {isFullSell && (
                <div style={styles.fullSellNote}>
                  ⚠ This is a full exit — asset will remain for historical records.
                </div>
              )}
            </div>
          )}
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
          <button style={styles.sellConfirmBtn} onClick={handleSell} disabled={loading || !isValid}>
            {loading ? "Processing…" : isFullSell ? "↓ Confirm Full Exit" : "↓ Confirm Sell"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Asset Modal (Add + Edit) ─────────────────────────────────────────────────

function AssetModal({ onClose, onSaved, editAsset = null }) {
  const isEdit = !!editAsset;

  const [form, setForm] = useState(
    isEdit
      ? {
          asset_name: editAsset.asset_name || "",
          institution: editAsset.institution || "",
          invested_value: editAsset.invested_value ?? "",
          invested_date: toInputDate(editAsset.invested_date),
          notes: editAsset.notes || "",
        }
      : EMPTY_FORM
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.asset_name.trim() || !form.institution.trim() || !form.invested_value) {
      setError("Asset name, institution, and invested value are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = isEdit ? `${API_BASE}/${editAsset._id}` : API_BASE;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, invested_value: parseFloat(form.invested_value) }),
      });
      if (!res.ok) throw new Error(`Failed to ${isEdit ? "update" : "save"} asset.`);
      const saved = await res.json();
      onSaved(saved, isEdit);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div>
            <div style={styles.modalTag}>{isEdit ? "EDIT ASSET" : "NEW ASSET"}</div>
            <h2 style={styles.modalTitle}>{isEdit ? "Edit Investment" : "Add Investment"}</h2>
          </div>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div style={styles.modalBody}>
          {error && <div style={styles.errorBanner}>{error}</div>}
          {isEdit && (
            <div style={styles.infoBanner}>
              Use the Buy / Sell buttons on the row to add or exit positions.
              This modal is for correcting asset details only.
            </div>
          )}

          <div style={styles.fieldGrid}>
            <div style={styles.fieldFull}>
              <label style={styles.label}>Asset Name <span style={styles.req}>*</span></label>
              <input
                style={styles.input}
                name="asset_name"
                placeholder="e.g. Apple Inc., Bitcoin, S&P 500 ETF"
                value={form.asset_name}
                onChange={handleChange}
              />
            </div>
            <div style={styles.fieldHalf}>
              <label style={styles.label}>Institution <span style={styles.req}>*</span></label>
              <input
                style={styles.input}
                name="institution"
                placeholder="e.g. Fidelity, Coinbase"
                value={form.institution}
                onChange={handleChange}
              />
            </div>
            <div style={styles.fieldHalf}>
              <label style={styles.label}>
                Invested Value ($) <span style={styles.req}>*</span>
                <span style={styles.labelHint}> — original amount</span>
              </label>
              <input
                style={styles.input}
                name="invested_value"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.invested_value}
                onChange={handleChange}
              />
            </div>
            <div style={styles.fieldHalf}>
              <label style={styles.label}>Invested Date</label>
              <input
                style={styles.input}
                name="invested_date"
                type="date"
                value={form.invested_date}
                onChange={handleChange}
              />
            </div>
            <div style={styles.fieldFull}>
              <label style={styles.label}>Notes</label>
              <textarea
                style={{ ...styles.input, ...styles.textarea }}
                name="notes"
                placeholder="Any additional context or strategy notes..."
                value={form.notes}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
          <button style={styles.saveBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving…" : isEdit ? "✓ Update Asset" : "＋ Save Asset"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteModal({ asset, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${asset._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete asset.");
      onDeleted(asset._id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...styles.modal, maxWidth: 420 }}>
        <div style={styles.modalHeader}>
          <div>
            <div style={{ ...styles.modalTag, color: C.negative }}>CONFIRM DELETE</div>
            <h2 style={styles.modalTitle}>Remove Asset</h2>
          </div>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div style={{ ...styles.modalBody, paddingBottom: 8 }}>
          {error && <div style={styles.errorBanner}>{error}</div>}
          <p style={{ fontSize: 14.5, color: C.body, lineHeight: 1.7 }}>
            Are you sure you want to remove{" "}
            <span style={{ color: C.text, fontWeight: 600 }}>{asset.asset_name}</span>{" "}
            from your portfolio? This action cannot be undone.
          </p>
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
          <button style={styles.deleteConfirmBtn} onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting…" : "Delete Asset"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Asset Row ────────────────────────────────────────────────────────────────

function AssetRow({ asset, onEdit, onDelete, onBuy, onSell, onCurrentValueUpdated }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.row,
        borderColor: hovered ? "rgba(52,211,153,0.35)" : C.border,
        background: hovered ? "rgba(255,255,255,0.055)" : C.surface,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left: avatar + name */}
      <div style={styles.rowLeft}>
        <div style={styles.assetAvatar}>
          {asset.asset_name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <div style={styles.assetName}>{asset.asset_name}</div>
          <div style={styles.assetInstitution}>{asset.institution}</div>
        </div>
      </div>

      {/* Meta */}
      <div style={styles.rowMeta}>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>INVESTED</span>
          <span style={styles.metaValue}>{formatCurrency(asset.invested_value)}</span>
          <span style={{ fontSize: 11.5, color: C.faint }}>{formatDate(asset.invested_date)}</span>
        </div>
        <div style={styles.metaDivider} />
        <CurrentValueCell asset={asset} onUpdated={onCurrentValueUpdated} />
      </div>

      {/* Actions */}
      <div style={{ ...styles.rowActions, opacity: hovered ? 1 : 0 }}>
        <button style={styles.buyBtn} onClick={() => onBuy(asset)} title="Buy more">
          ↑ Buy
        </button>
        <button style={styles.sellBtn} onClick={() => onSell(asset)} title="Sell / exit">
          ↓ Sell
        </button>
        <div style={styles.actionDivider} />
        <button style={styles.editBtn} onClick={() => onEdit(asset)} title="Edit details" aria-label="Edit details">✎</button>
        <button style={styles.deleteBtn} onClick={() => onDelete(asset)} title="Delete" aria-label="Delete">✕</button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AssetManager() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [deleteAsset, setDeleteAsset] = useState(null);
  const [buyAsset, setBuyAsset] = useState(null);
  const [sellAsset, setSellAsset] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error("Could not load assets.");
        const data = await res.json();
        setAssets(data);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateAssetInList = (updatedAsset) =>
    setAssets((prev) => prev.map((a) => (a._id === updatedAsset._id ? updatedAsset : a)));

  const handleSaved = (savedAsset, isEdit) => {
    if (isEdit) {
      updateAssetInList(savedAsset);
    } else {
      setAssets((prev) => [savedAsset, ...prev]);
    }
  };

  const handleDeleted = (deletedId) =>
    setAssets((prev) => prev.filter((a) => a._id !== deletedId));

  const totalInvested = assets.reduce((s, a) => s + (parseFloat(a.invested_value) || 0), 0);
  const totalCurrent = assets.reduce((s, a) => s + (parseFloat(a.current_value ?? a.invested_value) || 0), 0);
  const totalGain = totalCurrent - totalInvested;

  return (
    <div style={styles.page}>
      <div style={styles.glow} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.pageHeader}>
          <div>
            <p style={styles.pageEyebrow}>PORTFOLIO</p>
            <h1 style={styles.pageTitle}>Assets</h1>
          </div>
          <div style={styles.headerRight}>
            {assets.length > 0 && (
              <div style={styles.statsRow}>
                <div style={styles.statBadge}>
                  <span style={styles.statLabel}>INVESTED</span>
                  <span style={styles.statValue}>{formatCurrency(totalInvested)}</span>
                </div>
                <div style={styles.statArrow}>→</div>
                <div style={{
                  ...styles.statBadge,
                  borderColor: `${gainColor(totalGain)}55`,
                  background: `${gainColor(totalGain)}14`,
                }}>
                  <span style={{ ...styles.statLabel, color: gainColor(totalGain) }}>CURRENT</span>
                  <span style={{ ...styles.statValue, color: C.text }}>
                    {formatCurrency(totalCurrent)}
                  </span>
                  <span style={{ fontSize: 11.5, color: gainColor(totalGain), marginTop: 2 }}>
                    {gainPrefix(totalGain)}{formatCurrency(totalGain)}
                  </span>
                </div>
              </div>
            )}
            <button style={styles.addBtn} onClick={() => setShowAddModal(true)}>
              ＋ Add Asset
            </button>
          </div>
        </div>

        <div style={styles.divider} />

        {loading ? (
          <div style={styles.centerState}>
            <p style={styles.stateText}>Loading assets…</p>
          </div>
        ) : fetchError ? (
          <div style={styles.centerState}>
            <p style={{ color: C.negative, fontSize: 14 }}>{fetchError}</p>
          </div>
        ) : assets.length === 0 ? (
          <div style={styles.centerState}>
            <div style={styles.emptyIcon}>◈</div>
            <p style={styles.stateTitle}>No assets yet</p>
            <p style={styles.stateText}>Track your investments by adding your first asset.</p>
            <button style={{ ...styles.addBtn, marginTop: 16 }} onClick={() => setShowAddModal(true)}>
              ＋ Add Your First Asset
            </button>
          </div>
        ) : (
          <>
            <div style={styles.listMeta}>
              <span style={styles.listCount}>
                {assets.length} ASSET{assets.length !== 1 ? "S" : ""}
              </span>
              <span style={styles.listHint}>Hover a row for actions · Click value to update</span>
            </div>
            <div style={styles.list}>
              {assets.map((asset, i) => (
                <AssetRow
                  key={asset._id ?? i}
                  asset={asset}
                  onEdit={setEditAsset}
                  onDelete={setDeleteAsset}
                  onBuy={setBuyAsset}
                  onSell={setSellAsset}
                  onCurrentValueUpdated={updateAssetInList}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {showAddModal && (
        <AssetModal onClose={() => setShowAddModal(false)} onSaved={handleSaved} />
      )}
      {editAsset && (
        <AssetModal editAsset={editAsset} onClose={() => setEditAsset(null)} onSaved={handleSaved} />
      )}
      {deleteAsset && (
        <DeleteModal asset={deleteAsset} onClose={() => setDeleteAsset(null)} onDeleted={handleDeleted} />
      )}
      {buyAsset && (
        <BuyModal asset={buyAsset} onClose={() => setBuyAsset(null)} onUpdated={updateAssetInList} />
      )}
      {sellAsset && (
        <SellModal asset={sellAsset} onClose={() => setSellAsset(null)} onUpdated={updateAssetInList} />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.85); cursor: pointer; }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.35); }
        input:focus, textarea:focus {
          border-color: rgba(52,211,153,0.6) !important;
          background: rgba(52,211,153,0.06) !important;
          box-shadow: 0 0 0 3px rgba(52,211,153,0.12);
          outline: none;
        }
        button { font-family: inherit; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'DM Sans', sans-serif",
    color: C.text,
    position: "relative",
  },
  glow: {
    position: "fixed", top: -120, right: -80, width: 560, height: 420,
    borderRadius: "50%", pointerEvents: "none", zIndex: 0,
    background: "radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 65%)",
  },
  container: {
    position: "relative", zIndex: 1,
    maxWidth: 980, margin: "0 auto",
    padding: "56px 24px 80px",
    animation: "fadeUp 0.5s ease both",
  },
  pageHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 28,
  },
  pageEyebrow: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11, letterSpacing: "0.2em", color: C.accent, marginBottom: 8,
  },
  pageTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 52, fontWeight: 400, color: C.text,
    lineHeight: 1, letterSpacing: "-1px",
  },
  headerRight: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" },
  statsRow: { display: "flex", alignItems: "center", gap: 8 },
  statBadge: {
    display: "flex", flexDirection: "column", alignItems: "flex-end",
    padding: "10px 14px",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 10, minWidth: 128,
  },
  statLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 10, letterSpacing: "0.14em", color: C.muted, marginBottom: 4,
  },
  statValue: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 18, fontWeight: 500, color: C.text, letterSpacing: "-0.5px",
  },
  statArrow: { fontSize: 16, color: C.faint },
  addBtn: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "12px 22px",
    background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
    color: "#041009", border: "none", borderRadius: 10,
    fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
    cursor: "pointer", letterSpacing: "0.02em",
    boxShadow: "0 0 30px rgba(52,211,153,0.22)",
  },
  divider: {
    height: 1,
    background: `linear-gradient(90deg, transparent, ${C.border} 30%, ${C.border} 70%, transparent)`,
    marginBottom: 24,
  },
  listMeta: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },
  listCount: { fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.12em", color: C.muted },
  listHint: { fontSize: 12, color: C.faint },
  list: { display: "flex", flexDirection: "column", gap: 10 },

  row: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", flexWrap: "wrap", gap: 16,
    padding: "18px 22px",
    background: C.surface,
    border: `1px solid ${C.border}`, borderRadius: 14,
    animation: "fadeUp 0.4s ease both",
    transition: "border-color 0.2s, background 0.2s",
  },
  rowLeft: { display: "flex", alignItems: "center", gap: 14, minWidth: 180 },
  assetAvatar: {
    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
    background: "rgba(52,211,153,0.12)",
    border: "1px solid rgba(52,211,153,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, fontFamily: "'DM Serif Display', serif", color: C.accent,
  },
  assetName: { fontSize: 15.5, fontWeight: 500, color: C.text, marginBottom: 3 },
  assetInstitution: { fontSize: 12.5, color: C.muted, letterSpacing: "0.02em" },
  rowMeta: { display: "flex", gap: 0, flexWrap: "wrap", flex: 1, alignItems: "center" },
  metaDivider: {
    width: 1, height: 36, background: C.border, margin: "0 24px", flexShrink: 0,
  },
  metaItem: { display: "flex", flexDirection: "column", gap: 3, minWidth: 130 },
  metaLabel: { fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: C.muted },
  metaValue: { fontFamily: "'DM Mono', monospace", fontSize: 15, color: C.text, fontWeight: 500 },
  currentValueRow: { display: "flex", alignItems: "center", gap: 6 },
  editValueBtn: {
    background: "none", border: "none", color: C.muted,
    fontSize: 13, cursor: "pointer", padding: "0 2px",
  },
  inlineEditRow: {
    display: "flex", alignItems: "center", gap: 4,
    background: "rgba(52,211,153,0.08)",
    border: "1px solid rgba(52,211,153,0.45)",
    borderRadius: 7, padding: "3px 8px",
  },
  currencyPrefix: { fontSize: 13, color: C.accent },
  inlineInput: {
    background: "none", border: "none", outline: "none",
    color: C.text, fontSize: 14, fontFamily: "'DM Mono', monospace",
    fontWeight: 500, width: 90,
  },
  gainBadge: { fontFamily: "'DM Mono', monospace", fontSize: 11.5, letterSpacing: "0.02em", fontWeight: 500, marginTop: 1 },

  rowActions: {
    display: "flex", alignItems: "center", gap: 6,
    transition: "opacity 0.15s ease",
  },
  buyBtn: {
    padding: "7px 13px", borderRadius: 8,
    background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.35)",
    color: C.accent, fontSize: 12.5, fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600, cursor: "pointer", letterSpacing: "0.02em",
  },
  sellBtn: {
    padding: "7px 13px", borderRadius: 8,
    background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.32)",
    color: C.negative, fontSize: 12.5, fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600, cursor: "pointer", letterSpacing: "0.02em",
  },
  actionDivider: {
    width: 1, height: 20, background: C.border, margin: "0 2px", flexShrink: 0,
  },
  editBtn: {
    width: 30, height: 30, borderRadius: 8,
    background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`,
    color: C.body, fontSize: 14, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  deleteBtn: {
    width: 30, height: 30, borderRadius: 8,
    background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
    color: C.negative, fontSize: 12, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },

  centerState: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", paddingTop: 80, gap: 10, textAlign: "center",
  },
  emptyIcon: { fontSize: 48, color: "rgba(52,211,153,0.35)", lineHeight: 1, marginBottom: 8 },
  stateTitle: { fontSize: 22, fontFamily: "'DM Serif Display', serif", color: C.text },
  stateText: { fontSize: 14, color: C.body, maxWidth: 300, lineHeight: 1.6 },

  // ── Shared modal base ──
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(3,5,9,0.82)",
    backdropFilter: "blur(8px)", zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
  },
  modal: {
    width: "100%", maxWidth: 540,
    background: "linear-gradient(160deg, #0a121a 0%, #060b11 100%)",
    border: `1px solid ${C.border}`, borderRadius: 20,
    boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(52,211,153,0.06)",
    animation: "scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "26px 26px 18px", borderBottom: `1px solid ${C.borderSoft}`,
  },
  modalTag: { fontFamily: "'DM Mono', monospace", fontSize: 10.5, letterSpacing: "0.2em", color: C.accent, marginBottom: 6 },
  modalTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 27, fontWeight: 400, color: C.text,
  },
  closeBtn: {
    background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
    borderRadius: 8, color: C.body, width: 30, height: 30,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", fontSize: 12,
  },
  modalBody: { padding: "22px 26px" },
  errorBanner: {
    padding: "10px 14px",
    background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.35)",
    borderRadius: 8, color: "#fecaca", fontSize: 13, marginBottom: 16,
  },
  infoBanner: {
    padding: "10px 14px",
    background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.28)",
    borderRadius: 8, color: C.body, fontSize: 12.5, marginBottom: 16, lineHeight: 1.55,
  },
  fieldGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  fieldFull: { gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 6 },
  fieldHalf: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.08em", color: C.body },
  labelHint: { fontSize: 10, color: C.faint, letterSpacing: "0" },
  req: { color: C.accent },
  input: {
    width: "100%", padding: "11px 13px",
    background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
    borderRadius: 10, color: C.text, fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
  },
  textarea: { resize: "vertical", minHeight: 78, lineHeight: 1.6 },
  modalFooter: {
    display: "flex", justifyContent: "flex-end", gap: 10,
    padding: "16px 26px 22px", borderTop: `1px solid ${C.borderSoft}`,
  },
  cancelBtn: {
    padding: "10px 18px", background: "transparent",
    border: "1px solid rgba(255,255,255,0.22)", borderRadius: 10,
    color: C.text, fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: "pointer",
  },
  saveBtn: {
    padding: "10px 22px",
    background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
    border: "none", borderRadius: 10, color: "#041009",
    fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
    cursor: "pointer", boxShadow: "0 0 24px rgba(52,211,153,0.22)",
  },
  buyConfirmBtn: {
    padding: "10px 22px",
    background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
    border: "none", borderRadius: 10, color: "#041009",
    fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
    cursor: "pointer", boxShadow: "0 0 24px rgba(52,211,153,0.22)",
  },
  sellConfirmBtn: {
    padding: "10px 22px",
    background: "linear-gradient(135deg, #dc2626, #ef4444)",
    border: "none", borderRadius: 10, color: "#fff",
    fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
    cursor: "pointer", boxShadow: "0 0 24px rgba(239,68,68,0.25)",
  },
  deleteConfirmBtn: {
    padding: "10px 22px",
    background: "linear-gradient(135deg, #b91c1c, #dc2626)",
    border: "none", borderRadius: 10, color: "#fff",
    fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
    cursor: "pointer", boxShadow: "0 0 24px rgba(220,38,38,0.22)",
  },

  // ── Buy/Sell specific ──
  snapshotRow: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "14px 16px",
    background: C.surface,
    border: `1px solid ${C.border}`, borderRadius: 10,
    marginBottom: 18,
  },
  snapshotItem: { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  snapshotLabel: { fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: C.muted },
  snapshotValue: { fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 500, color: C.text, letterSpacing: "-0.3px" },
  snapshotArrow: { fontSize: 18, color: C.faint, flexShrink: 0 },
  previewNote: {
    marginTop: 12, fontSize: 13, color: C.body, lineHeight: 1.5,
  },
  maxBtn: {
    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
    background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)",
    borderRadius: 5, color: C.negative, fontSize: 10, fontFamily: "'DM Mono', monospace",
    padding: "3px 7px", cursor: "pointer", letterSpacing: "0.08em",
  },
  sellBreakdown: {
    marginTop: 14,
    padding: "12px 14px",
    background: C.surface,
    border: `1px solid ${C.border}`, borderRadius: 10,
    display: "flex", flexDirection: "column", gap: 8,
  },
  breakdownRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  breakdownLabel: { fontSize: 13, color: C.body },
  breakdownValue: { fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500, color: C.text },
  fullSellNote: {
    marginTop: 4, fontSize: 12, color: "#fde68a", lineHeight: 1.5,
    padding: "8px 10px",
    background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)",
    borderRadius: 7,
  },
};