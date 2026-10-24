import { useState, useEffect, useCallback } from "react";

const API_BASE = `${import.meta.env.VITE_API_URL}/transactions`;

// ─── Theme (shared with HomePage) ─────────────────────────────────────────────
const C = {
  bg:         "#07080d",
  text:       "#ffffff",
  body:       "rgba(255,255,255,0.82)",
  muted:      "rgba(255,255,255,0.62)",
  faint:      "rgba(255,255,255,0.40)",
  border:     "rgba(255,255,255,0.10)",
  borderSoft: "rgba(255,255,255,0.06)",
  surface:    "rgba(255,255,255,0.03)",
  accent:     "#34d399",
  accentDark: "#0d9488",
  teal:       "#2dd4bf",
  amber:      "#fbbf24",
  negative:   "#f87171",
};

// ─── Config ───────────────────────────────────────────────────────────────────
const TYPE_META = {
  asset_create:             { label: "Asset Added",     color: "#34d399", bg: "rgba(52,211,153,0.12)",  icon: "✦", sign: "+" },
  asset_buy:                { label: "Buy",             color: "#34d399", bg: "rgba(52,211,153,0.12)",  icon: "↑", sign: "+" },
  asset_sell:               { label: "Sell",            color: "#f87171", bg: "rgba(248,113,113,0.12)", icon: "↓", sign: "−" },
  asset_value_update:       { label: "Value Updated",   color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  icon: "✎", sign: "~" },
  liability_create:         { label: "Debt Added",      color: "#f87171", bg: "rgba(248,113,113,0.12)", icon: "⊕", sign: "−" },
  liability_payment:        { label: "Payment",         color: "#2dd4bf", bg: "rgba(45,212,191,0.12)",  icon: "↓", sign: "−" },
  liability_balance_update: { label: "Balance Updated", color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  icon: "✎", sign: "~" },
};

const ENTITY_FILTERS = ["all", "asset", "liability"];

const fmt = (val) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Math.abs(val) || 0);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const gainColor = (v) => (v > 0 ? C.accent : v < 0 ? C.negative : C.muted);

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({ filters, onChange }) {
  return (
    <div style={fbStyles.wrap}>
      <div style={fbStyles.group}>
        <span style={fbStyles.groupLabel}>TYPE</span>
        <div style={fbStyles.pills}>
          {ENTITY_FILTERS.map((f) => (
            <button
              key={f}
              style={{ ...fbStyles.pill, ...(filters.entity_type === f ? fbStyles.pillActive : {}) }}
              onClick={() => onChange({ ...filters, entity_type: f, page: 1 })}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={fbStyles.group}>
        <span style={fbStyles.groupLabel}>FROM</span>
        <input
          style={fbStyles.dateInput}
          type="date"
          value={filters.from}
          onChange={(e) => onChange({ ...filters, from: e.target.value, page: 1 })}
        />
        <span style={fbStyles.groupLabel}>TO</span>
        <input
          style={fbStyles.dateInput}
          type="date"
          value={filters.to}
          onChange={(e) => onChange({ ...filters, to: e.target.value, page: 1 })}
        />
      </div>

      {(filters.entity_type !== "all" || filters.from || filters.to) && (
        <button
          style={fbStyles.clearBtn}
          onClick={() => onChange({ entity_type: "all", from: "", to: "", page: 1 })}
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
}

const fbStyles = {
  wrap: {
    display: "flex", alignItems: "center", flexWrap: "wrap", gap: 16,
    padding: "14px 18px",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 12, marginBottom: 16,
  },
  group: { display: "flex", alignItems: "center", gap: 8 },
  groupLabel: { fontSize: 10.5, letterSpacing: "0.14em", color: C.muted },
  pills: { display: "flex", gap: 4 },
  pill: {
    padding: "5px 14px", borderRadius: 20,
    background: "transparent", border: `1px solid ${C.border}`,
    color: C.body, fontSize: 11.5, fontFamily: "'DM Mono', monospace",
    cursor: "pointer", letterSpacing: "0.04em", transition: "all 0.15s",
  },
  pillActive: {
    background: "rgba(52,211,153,0.12)",
    borderColor: "rgba(52,211,153,0.45)",
    color: C.accent,
  },
  dateInput: {
    padding: "5px 10px",
    background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
    borderRadius: 8, color: C.body, fontSize: 11.5,
    fontFamily: "'DM Mono', monospace", outline: "none",
    colorScheme: "dark",
  },
  clearBtn: {
    padding: "5px 12px", borderRadius: 8,
    background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)",
    color: C.negative, fontSize: 11.5, fontFamily: "'DM Mono', monospace",
    cursor: "pointer", marginLeft: "auto",
  },
};

// ─── Transaction Row ──────────────────────────────────────────────────────────
function TxRow({ tx, onDelete }) {
  const [hovered, setHovered]   = useState(false);
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[tx.type] || { label: tx.type, color: C.muted, bg: "rgba(255,255,255,0.06)", icon: "·", sign: "" };

  return (
    <>
      <div
        style={{
          ...txStyles.row,
          background: hovered ? "rgba(52,211,153,0.04)" : "rgba(255,255,255,0.01)",
          borderColor: expanded ? C.border : "transparent",
          borderBottomColor: C.borderSoft,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{ ...txStyles.iconCell, background: meta.bg, color: meta.color, border: `1px solid ${meta.color}40` }}>
          {meta.icon}
        </div>

        <div style={txStyles.nameCell}>
          <div style={txStyles.entityName}>{tx.entity_name}</div>
          <div style={txStyles.typePill}>
            <span style={{ ...txStyles.typeDot, background: meta.color }} />
            <span style={{ color: meta.color }}>{meta.label}</span>
          </div>
        </div>

        <div style={txStyles.amountCell}>
          <span style={{
            ...txStyles.amount,
            color: tx.type === "asset_sell" ? C.negative
                 : tx.type === "liability_payment" ? C.teal
                 : tx.type === "asset_buy" || tx.type === "asset_create" ? C.accent
                 : C.body,
          }}>
            {meta.sign} {fmt(tx.amount)}
          </span>
          {tx.value_after !== null && tx.value_after !== undefined && (
            <span style={txStyles.valueAfter}>→ {fmt(tx.value_after)}</span>
          )}
        </div>

        {tx.realized_gain !== null && tx.realized_gain !== undefined && (
          <div style={txStyles.gainCell}>
            <span style={{ fontSize: 10.5, color: C.muted, letterSpacing: "0.1em" }}>GAIN</span>
            <span style={{ fontSize: 13, color: gainColor(tx.realized_gain), fontWeight: 500 }}>
              {tx.realized_gain >= 0 ? "+" : ""}{fmt(tx.realized_gain)}
            </span>
          </div>
        )}

        <div style={txStyles.dateCell}>
          <span style={txStyles.dateMain}>{fmtDate(tx.transaction_date)}</span>
          <span style={txStyles.dateTime}>{fmtTime(tx.transaction_date)}</span>
        </div>

        <div style={{ ...txStyles.chevron, opacity: hovered ? 1 : 0.5, transform: expanded ? "rotate(180deg)" : "none" }}>
          ⌄
        </div>
      </div>

      {expanded && (
        <div style={txStyles.expandedRow}>
          <div style={txStyles.expandGrid}>
            <div style={txStyles.expandItem}>
              <span style={txStyles.expandLabel}>ENTITY TYPE</span>
              <span style={txStyles.expandValue}>{tx.entity_type}</span>
            </div>
            <div style={txStyles.expandItem}>
              <span style={txStyles.expandLabel}>TRANSACTION TYPE</span>
              <span style={{ ...txStyles.expandValue, color: meta.color }}>{meta.label}</span>
            </div>
            <div style={txStyles.expandItem}>
              <span style={txStyles.expandLabel}>AMOUNT</span>
              <span style={txStyles.expandValue}>{fmt(tx.amount)}</span>
            </div>
            {tx.value_after !== null && tx.value_after !== undefined && (
              <div style={txStyles.expandItem}>
                <span style={txStyles.expandLabel}>VALUE AFTER</span>
                <span style={txStyles.expandValue}>{fmt(tx.value_after)}</span>
              </div>
            )}
            {tx.realized_gain !== null && tx.realized_gain !== undefined && (
              <div style={txStyles.expandItem}>
                <span style={txStyles.expandLabel}>REALIZED GAIN/LOSS</span>
                <span style={{ ...txStyles.expandValue, color: gainColor(tx.realized_gain) }}>
                  {tx.realized_gain >= 0 ? "+" : ""}{fmt(tx.realized_gain)}
                </span>
              </div>
            )}
            {tx.note && (
              <div style={{ ...txStyles.expandItem, gridColumn: "1 / -1" }}>
                <span style={txStyles.expandLabel}>NOTE</span>
                <span style={txStyles.expandValue}>{tx.note}</span>
              </div>
            )}
            <div style={txStyles.expandItem}>
              <span style={txStyles.expandLabel}>RECORDED</span>
              <span style={txStyles.expandValue}>{fmtDate(tx.createdAt)} {fmtTime(tx.createdAt)}</span>
            </div>
          </div>
          <button
            style={txStyles.deleteBtn}
            onClick={(e) => { e.stopPropagation(); onDelete(tx); }}
            title="Delete transaction"
          >
            ✕ Delete record
          </button>
        </div>
      )}
    </>
  );
}

const txStyles = {
  row: {
    display: "flex", alignItems: "center", gap: 16,
    padding: "14px 18px",
    border: "1px solid transparent",
    borderBottom: `1px solid ${C.borderSoft}`,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  iconCell: {
    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 600,
  },
  nameCell: { flex: 1, minWidth: 140 },
  entityName: { fontSize: 14, color: C.text, fontWeight: 500, marginBottom: 3 },
  typePill: { display: "flex", alignItems: "center", gap: 5, fontSize: 11.5 },
  typeDot: { width: 5, height: 5, borderRadius: "50%", flexShrink: 0 },
  amountCell: { display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 110 },
  amount: { fontSize: 15, fontWeight: 500, fontFamily: "'DM Mono', monospace", letterSpacing: "-0.3px" },
  valueAfter: { fontSize: 11, color: C.muted, marginTop: 2 },
  gainCell: { display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 90 },
  dateCell: { display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 100 },
  dateMain: { fontSize: 12, color: C.body },
  dateTime: { fontSize: 10.5, color: C.muted, marginTop: 2 },
  chevron: { fontSize: 18, color: C.muted, transition: "transform 0.2s, opacity 0.15s", lineHeight: 1 },
  expandedRow: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "14px 18px 18px 70px",
    background: "rgba(52,211,153,0.03)",
    borderBottom: `1px solid ${C.borderSoft}`,
  },
  expandGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px 32px", flex: 1 },
  expandItem: { display: "flex", flexDirection: "column", gap: 3 },
  expandLabel: { fontSize: 10.5, letterSpacing: "0.14em", color: C.muted },
  expandValue: { fontSize: 13, color: C.text, fontFamily: "'DM Mono', monospace" },
  deleteBtn: {
    padding: "6px 12px", borderRadius: 7, flexShrink: 0,
    background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)",
    color: C.negative, fontSize: 11.5, fontFamily: "'DM Mono', monospace",
    cursor: "pointer", alignSelf: "flex-end", marginLeft: 24,
  },
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ tx, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const meta = TYPE_META[tx.type] || {};

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${tx._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDeleted(tx._id);
      onClose();
    } catch {
      setLoading(false);
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyles.box}>
        <div style={modalStyles.header}>
          <div style={{ ...modalStyles.tag, color: C.negative }}>DELETE RECORD</div>
          <h2 style={modalStyles.title}>Remove Transaction</h2>
        </div>
        <div style={modalStyles.body}>
          <p style={modalStyles.text}>
            This will permanently remove the{" "}
            <span style={{ color: meta.color }}>{meta.label}</span> transaction for{" "}
            <span style={{ color: C.text }}>{tx.entity_name}</span> ({fmt(tx.amount)}).
            The underlying asset/liability record is not affected.
          </p>
        </div>
        <div style={modalStyles.footer}>
          <button style={modalStyles.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
          <button style={modalStyles.deleteBtn} onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting…" : "Delete Record"}
          </button>
        </div>
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(3,5,8,0.88)",
    backdropFilter: "blur(10px)", zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
  },
  box: {
    width: "100%", maxWidth: 440,
    background: "#0a0c12",
    border: "1px solid rgba(52,211,153,0.25)", borderRadius: 18,
    boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(52,211,153,0.06)",
    overflow: "hidden",
    fontFamily: "'DM Mono', monospace",
  },
  header: { padding: "22px 24px 16px", borderBottom: `1px solid ${C.border}` },
  tag: { fontSize: 10.5, letterSpacing: "0.2em", marginBottom: 5 },
  title: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 22, fontWeight: 400, color: C.text,
  },
  body: { padding: "18px 24px" },
  text: { fontSize: 13, color: C.body, lineHeight: 1.7 },
  footer: {
    display: "flex", justifyContent: "flex-end", gap: 10,
    padding: "14px 24px 20px", borderTop: `1px solid ${C.border}`,
  },
  cancelBtn: {
    padding: "9px 16px", background: "transparent",
    border: "1px solid rgba(255,255,255,0.22)", borderRadius: 9,
    color: C.text, fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer",
  },
  deleteBtn: {
    padding: "9px 18px",
    background: "linear-gradient(135deg,#7f1d1d,#dc2626)",
    border: "none", borderRadius: 9, color: "#fff",
    fontSize: 12, fontFamily: "'DM Mono', monospace",
    cursor: "pointer", boxShadow: "0 4px 14px rgba(220,38,38,0.2)",
  },
};

// ─── Summary Strip ────────────────────────────────────────────────────────────
function SummaryStrip({ summary }) {
  if (!summary) return null;
  const { typeBreakdown = [], totalCount = 0 } = summary;

  const buys  = typeBreakdown.find((t) => t._id === "asset_buy")?.total_amount || 0;
  const sells = typeBreakdown.find((t) => t._id === "asset_sell")?.total_amount || 0;
  const pays  = typeBreakdown.find((t) => t._id === "liability_payment")?.total_amount || 0;

  return (
    <div style={ssStyles.wrap}>
      <div style={ssStyles.item}>
        <span style={ssStyles.label}>TOTAL TRANSACTIONS</span>
        <span style={{ ...ssStyles.val, color: C.text }}>{totalCount}</span>
      </div>
      <div style={ssStyles.sep} />
      <div style={ssStyles.item}>
        <span style={ssStyles.label}>TOTAL BOUGHT</span>
        <span style={{ ...ssStyles.val, color: C.accent }}>{fmt(buys)}</span>
      </div>
      <div style={ssStyles.sep} />
      <div style={ssStyles.item}>
        <span style={ssStyles.label}>TOTAL SOLD</span>
        <span style={{ ...ssStyles.val, color: C.negative }}>{fmt(sells)}</span>
      </div>
      <div style={ssStyles.sep} />
      <div style={ssStyles.item}>
        <span style={ssStyles.label}>DEBT PAYMENTS</span>
        <span style={{ ...ssStyles.val, color: C.teal }}>{fmt(pays)}</span>
      </div>
    </div>
  );
}

const ssStyles = {
  wrap: {
    display: "flex", flexWrap: "wrap", gap: 0,
    background: C.surface,
    border: `1px solid ${C.border}`, borderRadius: 12,
    marginBottom: 16, overflow: "hidden",
  },
  item: {
    display: "flex", flexDirection: "column", gap: 4,
    padding: "14px 22px", flex: 1, minWidth: 130,
  },
  sep: { width: 1, background: C.borderSoft, alignSelf: "stretch" },
  label: { fontSize: 10.5, letterSpacing: "0.14em", color: C.muted },
  val: { fontSize: 18, fontWeight: 500, fontFamily: "'DM Mono', monospace", letterSpacing: "-0.3px" },
};

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;

  return (
    <div style={pgStyles.wrap}>
      <button style={pgStyles.btn} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>← Prev</button>
      <span style={pgStyles.info}>
        Page {page} of {pages} · {pagination.total} records
      </span>
      <button style={pgStyles.btn} disabled={page >= pages} onClick={() => onPageChange(page + 1)}>Next →</button>
    </div>
  );
}

const pgStyles = {
  wrap: { display: "flex", alignItems: "center", justifyContent: "center", gap: 16, paddingTop: 20 },
  btn: {
    padding: "8px 16px", borderRadius: 8,
    background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.35)",
    color: C.text, fontSize: 12, fontFamily: "'DM Mono', monospace",
    cursor: "pointer",
  },
  info: { fontSize: 12, color: C.muted, fontFamily: "'DM Mono', monospace" },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination,   setPagination]   = useState(null);
  const [summary,      setSummary]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [deleteTx,     setDeleteTx]     = useState(null);
  const [filters, setFilters] = useState({
    entity_type: "all",
    from: "",
    to: "",
    page: 1,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.entity_type !== "all") params.set("entity_type", filters.entity_type);
      if (filters.from) params.set("from", filters.from);
      if (filters.to)   params.set("to",   filters.to);
      params.set("page",  filters.page);
      params.set("limit", 20);

      const [txRes, sumRes] = await Promise.all([
        fetch(`${API_BASE}?${params}`),
        fetch(`${API_BASE}/summary`),
      ]);

      if (!txRes.ok) throw new Error("Could not load transactions.");
      const txData  = await txRes.json();
      const sumData = sumRes.ok ? await sumRes.json() : null;

      setTransactions(txData.transactions || []);
      setPagination(txData.pagination || null);
      setSummary(sumData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleted = (id) => {
    setTransactions((prev) => prev.filter((t) => t._id !== id));
    if (summary) setSummary((s) => ({ ...s, totalCount: s.totalCount - 1 }));
  };

  const handlePageChange = (newPage) =>
    setFilters((f) => ({ ...f, page: newPage }));

  const grouped = transactions.reduce((acc, tx) => {
    const key = fmtDate(tx.transaction_date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  return (
    <div style={styles.page}>
      <div style={styles.glow} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.pageHeader}>
          <div>
            <p style={styles.pageEyebrow}>HISTORY</p>
            <h1 style={styles.pageTitle}>Transactions</h1>
          </div>
          {summary && (
            <div style={styles.totalBadge}>
              <span style={styles.totalLabel}>ALL TIME</span>
              <span style={styles.totalValue}>{summary.totalCount} records</span>
            </div>
          )}
        </div>

        <SummaryStrip summary={summary} />
        <FilterBar filters={filters} onChange={setFilters} />

        <div style={styles.divider} />

        {loading ? (
          <div style={styles.centerState}>
            <p style={styles.stateText}>Loading transactions…</p>
          </div>
        ) : error ? (
          <div style={styles.centerState}>
            <p style={{ color: C.negative, fontSize: 13 }}>{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div style={styles.centerState}>
            <div style={styles.emptyIcon}>◈</div>
            <p style={styles.stateTitle}>No transactions found</p>
            <p style={styles.stateText}>
              Transactions are logged automatically when you buy, sell, or make payments.
            </p>
          </div>
        ) : (
          <>
            <div style={styles.tableWrap}>
              <div style={styles.tableHead}>
                <span style={{ width: 36 }} />
                <span style={{ flex: 1 }}>ENTITY</span>
                <span style={{ minWidth: 110, textAlign: "right" }}>AMOUNT</span>
                <span style={{ minWidth: 90, textAlign: "right" }}>GAIN/LOSS</span>
                <span style={{ minWidth: 100, textAlign: "right" }}>DATE</span>
                <span style={{ width: 24 }} />
              </div>

              {Object.entries(grouped).map(([date, txs]) => (
                <div key={date}>
                  <div style={styles.dateGroup}>{date}</div>
                  {txs.map((tx) => (
                    <TxRow key={tx._id} tx={tx} onDelete={setDeleteTx} />
                  ))}
                </div>
              ))}
            </div>

            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </>
        )}
      </div>

      {deleteTx && (
        <DeleteModal
          tx={deleteTx}
          onClose={() => setDeleteTx(null)}
          onDeleted={handleDeleted}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
        button:focus-visible, input:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #07080d; }
        ::-webkit-scrollbar-thumb { background: #2a3142; border-radius: 99px; }
      `}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'DM Mono', monospace",
    color: C.text,
    position: "relative",
    overflowX: "hidden",
  },
  glow: {
    position: "fixed", top: "-10%", left: "50%",
    transform: "translateX(-50%)",
    width: 800, height: 500, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 65%)",
    pointerEvents: "none", zIndex: 0,
  },
  container: {
    position: "relative", zIndex: 1,
    maxWidth: 960, margin: "0 auto",
    padding: "56px 24px 80px",
    animation: "fadeUp 0.5s ease both",
  },
  pageHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 24,
  },
  pageEyebrow: { fontSize: 11, letterSpacing: "0.2em", color: C.accent, marginBottom: 6 },
  pageTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 52, fontWeight: 400, color: C.text,
    lineHeight: 1, letterSpacing: "-1px",
  },
  totalBadge: {
    display: "flex", flexDirection: "column", alignItems: "flex-end",
    padding: "10px 16px",
    background: "rgba(52,211,153,0.08)",
    border: "1px solid rgba(52,211,153,0.3)",
    borderRadius: 10,
  },
  totalLabel: { fontSize: 10.5, letterSpacing: "0.14em", color: C.muted, marginBottom: 3 },
  totalValue: { fontSize: 18, fontWeight: 500, color: C.accent, letterSpacing: "-0.3px" },
  divider: {
    height: 1,
    background: `linear-gradient(90deg, transparent, ${C.border} 30%, ${C.border} 70%, transparent)`,
    marginBottom: 16,
  },
  tableWrap: {
    background: "rgba(255,255,255,0.02)",
    border: `1px solid ${C.border}`,
    borderRadius: 14, overflow: "hidden",
  },
  tableHead: {
    display: "flex", alignItems: "center", gap: 16,
    padding: "10px 18px",
    background: "rgba(0,0,0,0.35)",
    borderBottom: `1px solid ${C.borderSoft}`,
    fontSize: 10.5, letterSpacing: "0.14em", color: C.muted,
  },
  dateGroup: {
    padding: "10px 18px 6px",
    fontSize: 10.5, letterSpacing: "0.14em", color: C.accent,
    background: "rgba(52,211,153,0.05)",
    borderBottom: `1px solid ${C.borderSoft}`,
  },
  centerState: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", paddingTop: 80, gap: 10, textAlign: "center",
  },
  emptyIcon: { fontSize: 44, color: C.accent, opacity: 0.5, lineHeight: 1, marginBottom: 8 },
  stateTitle: { fontSize: 20, fontFamily: "'DM Serif Display', serif", color: C.text },
  stateText: { fontSize: 13, color: C.muted, maxWidth: 300, lineHeight: 1.6 },
};