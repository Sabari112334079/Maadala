import { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";

const ASSETS_API      = "http://localhost:5000/api/assets";
const LIABILITIES_API = "http://localhost:5000/api/liabilities";

// ─── Theme (shared with the rest of the app) ──────────────────────────────────
const C = {
  bg:         "#07080d",
  text:       "#ffffff",
  body:       "rgba(255,255,255,0.82)",
  muted:      "rgba(255,255,255,0.62)",
  faint:      "rgba(255,255,255,0.40)",
  border:     "rgba(255,255,255,0.12)",
  borderSoft: "rgba(255,255,255,0.07)",
  surface:    "rgba(255,255,255,0.035)",
  accent:     "#34d399",   // net worth / positive
  accentDark: "#0d9488",
  assets:     "#a5b4fc",   // assets series
  assetsDeep: "#818cf8",
  negative:   "#f87171",   // liabilities / negative
  amber:      "#fbbf24",   // debt ratio
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (val) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val || 0);

const fmtFull = (val) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val || 0);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", year: "2-digit" });

const fmtDateLong = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const gainColor = (v) => (v > 0 ? C.accent : v < 0 ? C.negative : C.muted);
const gainPrefix = (v) => (v > 0 ? "+" : "");

/**
 * Merge all asset value_history + liability payment_history snapshots into
 * a unified sorted timeline. For each unique date, compute:
 *   - totalAssets  = sum of each asset's current_value at that point in time
 *   - totalLiabilities = sum of each liability's balance at that point
 *   - netWorth     = totalAssets - totalLiabilities
 *
 * We use a "step-forward" approach: for each date point, carry forward the
 * last known value for every asset/liability that hasn't been updated yet.
 */
function buildTimeline(assets, liabilities) {
  // Collect every snapshot date across all assets and liabilities
  const dateSet = new Set();

  assets.forEach((a) => {
    (a.value_history || []).forEach((s) => dateSet.add(new Date(s.recorded_at).toISOString().split("T")[0]));
    if (a.createdAt) dateSet.add(new Date(a.createdAt).toISOString().split("T")[0]);
  });

  liabilities.forEach((l) => {
    (l.payment_history || []).forEach((s) => dateSet.add(new Date(s.recorded_at).toISOString().split("T")[0]));
    if (l.createdAt) dateSet.add(new Date(l.createdAt).toISOString().split("T")[0]);
  });

  // Always include today
  dateSet.add(new Date().toISOString().split("T")[0]);

  const dates = Array.from(dateSet).sort();

  // For each date, compute the best-known value for each asset/liability
  return dates.map((date) => {
    let totalAssets = 0;
    let totalLiabilities = 0;

    assets.forEach((a) => {
      const history = (a.value_history || []).filter(
        (s) => new Date(s.recorded_at).toISOString().split("T")[0] <= date
      );
      if (history.length > 0) {
        totalAssets += history[history.length - 1].value;
      } else if (new Date(a.createdAt).toISOString().split("T")[0] <= date) {
        // Asset existed but no snapshot yet — use invested_value as baseline
        totalAssets += a.invested_value || 0;
      }
    });

    liabilities.forEach((l) => {
      const history = (l.payment_history || []).filter(
        (s) => new Date(s.recorded_at).toISOString().split("T")[0] <= date
      );
      if (history.length > 0) {
        totalLiabilities += history[history.length - 1].balance_after;
      } else if (new Date(l.createdAt).toISOString().split("T")[0] <= date) {
        totalLiabilities += l.original_amount || 0;
      }
    });

    return {
      date,
      label: fmtDate(date),
      totalAssets: Math.round(totalAssets),
      totalLiabilities: Math.round(totalLiabilities),
      netWorth: Math.round(totalAssets - totalLiabilities),
    };
  });
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const nw = data.netWorth;

  return (
    <div style={tooltipStyles.wrap}>
      <div style={tooltipStyles.date}>{fmtDateLong(data.date)}</div>
      <div style={tooltipStyles.row}>
        <span style={{ ...tooltipStyles.dot, background: C.assets }} />
        <span style={tooltipStyles.label}>Assets</span>
        <span style={tooltipStyles.value}>{fmtFull(data.totalAssets)}</span>
      </div>
      <div style={tooltipStyles.row}>
        <span style={{ ...tooltipStyles.dot, background: C.negative }} />
        <span style={tooltipStyles.label}>Liabilities</span>
        <span style={tooltipStyles.value}>{fmtFull(data.totalLiabilities)}</span>
      </div>
      <div style={tooltipStyles.divider} />
      <div style={tooltipStyles.row}>
        <span style={{ ...tooltipStyles.dot, background: gainColor(nw) }} />
        <span style={{ ...tooltipStyles.label, color: C.text }}>Net Worth</span>
        <span style={{ ...tooltipStyles.value, color: gainColor(nw), fontWeight: 600 }}>
          {gainPrefix(nw)}{fmtFull(nw)}
        </span>
      </div>
    </div>
  );
}

const tooltipStyles = {
  wrap: {
    background: "rgba(8,12,18,0.96)",
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "14px 18px",
    fontFamily: "'DM Mono', monospace",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
    minWidth: 230,
  },
  date: { fontSize: 11, letterSpacing: "0.1em", color: C.muted, marginBottom: 10 },
  row: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  dot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  label: { fontSize: 12, color: C.body, flex: 1 },
  value: { fontSize: 13, color: C.text },
  divider: { height: 1, background: C.border, margin: "8px 0" },
};

// ─── Time Range Selector ──────────────────────────────────────────────────────

const RANGES = ["1M", "3M", "6M", "1Y", "ALL"];

function filterByRange(data, range) {
  if (range === "ALL" || data.length === 0) return data;
  const now = new Date();
  const months = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12 }[range];
  const cutoff = new Date(now.setMonth(now.getMonth() - months)).toISOString().split("T")[0];
  const filtered = data.filter((d) => d.date >= cutoff);
  return filtered.length > 0 ? filtered : data;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ ...cardStyles.card, borderColor: `${color}40` }}>
      <div style={{ ...cardStyles.dot, background: color }} />
      <span style={{ ...cardStyles.label, color }}>{label}</span>
      <span style={{ ...cardStyles.value, color: C.text }}>{value}</span>
      {sub && <span style={cardStyles.sub}>{sub}</span>}
    </div>
  );
}

const cardStyles = {
  card: {
    display: "flex", flexDirection: "column", gap: 5,
    padding: "16px 20px",
    background: C.surface,
    border: "1px solid",
    borderRadius: 14,
    position: "relative",
    flex: 1, minWidth: 150,
  },
  dot: {
    position: "absolute", top: 16, right: 16,
    width: 6, height: 6, borderRadius: "50%",
  },
  label: { fontFamily: "'DM Mono', monospace", fontSize: 10.5, letterSpacing: "0.16em" },
  value: { fontSize: 24, fontWeight: 400, letterSpacing: "-0.5px", fontFamily: "'DM Serif Display', serif" },
  sub: { fontSize: 12, color: C.muted, marginTop: 2 },
};

// ─── Asset Breakdown Bar ──────────────────────────────────────────────────────

function BreakdownBar({ assets, liabilities }) {
  const totalAssets = assets.reduce((s, a) => s + (a.current_value || a.invested_value || 0), 0);
  const totalLiab   = liabilities.reduce((s, l) => s + (l.current_balance || 0), 0);
  const total = totalAssets + totalLiab;
  if (!total) return null;

  const assetPct = (totalAssets / total) * 100;
  const liabPct  = (totalLiab   / total) * 100;

  return (
    <div style={bbStyles.wrap}>
      <div style={bbStyles.header}>
        <span style={bbStyles.title}>PORTFOLIO COMPOSITION</span>
      </div>
      <div style={bbStyles.bar}>
        <div style={{ ...bbStyles.segment, width: `${assetPct}%`, background: `linear-gradient(90deg, ${C.assetsDeep}, ${C.assets})` }} />
        <div style={{ ...bbStyles.segment, width: `${liabPct}%`, background: "linear-gradient(90deg, #dc2626, #f87171)" }} />
      </div>
      <div style={bbStyles.legend}>
        <div style={bbStyles.legendItem}>
          <span style={{ ...bbStyles.legendDot, background: C.assets }} />
          <span style={bbStyles.legendLabel}>Assets</span>
          <span style={bbStyles.legendVal}>{fmt(totalAssets)}</span>
          <span style={bbStyles.legendPct}>{assetPct.toFixed(1)}%</span>
        </div>
        <div style={bbStyles.legendItem}>
          <span style={{ ...bbStyles.legendDot, background: C.negative }} />
          <span style={bbStyles.legendLabel}>Liabilities</span>
          <span style={bbStyles.legendVal}>{fmt(totalLiab)}</span>
          <span style={bbStyles.legendPct}>{liabPct.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

const bbStyles = {
  wrap: {
    padding: "20px 24px",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 16, marginBottom: 20,
  },
  header: { marginBottom: 14 },
  title: { fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.16em", color: C.muted },
  bar: {
    display: "flex", height: 8, borderRadius: 99,
    overflow: "hidden", background: "rgba(255,255,255,0.08)", marginBottom: 14, gap: 2,
  },
  segment: { height: "100%", borderRadius: 99, transition: "width 0.6s ease" },
  legend: { display: "flex", gap: 32, flexWrap: "wrap" },
  legendItem: { display: "flex", alignItems: "center", gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  legendLabel: { fontSize: 13, color: C.body },
  legendVal: { fontSize: 13, color: C.text, fontWeight: 500, fontFamily: "'DM Mono', monospace" },
  legendPct: { fontSize: 12, color: C.muted, fontFamily: "'DM Mono', monospace" },
};

// ─── Top Assets / Liabilities Summary ────────────────────────────────────────

function SummaryList({ items, type }) {
  const isAsset = type === "asset";
  const sorted = [...items].sort((a, b) =>
    isAsset
      ? (b.current_value || b.invested_value) - (a.current_value || a.invested_value)
      : b.current_balance - a.current_balance
  ).slice(0, 5);

  const total = items.reduce((s, i) =>
    s + (isAsset ? (i.current_value || i.invested_value || 0) : (i.current_balance || 0)), 0
  );

  const color = isAsset ? C.assets : C.negative;

  return (
    <div style={slStyles.wrap}>
      <div style={slStyles.header}>
        <span style={{ ...slStyles.title, color }}>
          {isAsset ? "▲ TOP ASSETS" : "▼ TOP LIABILITIES"}
        </span>
        <span style={slStyles.total}>{fmt(total)}</span>
      </div>
      {sorted.map((item, i) => {
        const val = isAsset ? (item.current_value || item.invested_value || 0) : (item.current_balance || 0);
        const pct = total ? (val / total) * 100 : 0;
        return (
          <div key={item._id || i} style={{ ...slStyles.row, ...(i === sorted.length - 1 ? slStyles.rowLast : {}) }}>
            <div style={slStyles.rowLeft}>
              <div style={{ ...slStyles.avatar, background: `${color}1f`, color, border: `1px solid ${color}55` }}>
                {(isAsset ? item.asset_name : item.liability_name)?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={slStyles.name}>{isAsset ? item.asset_name : item.liability_name}</div>
                <div style={slStyles.sub}>{isAsset ? item.institution : item.lender}</div>
              </div>
            </div>
            <div style={slStyles.rowRight}>
              <span style={{ ...slStyles.val, color: C.text }}>{fmt(val)}</span>
              <div style={slStyles.miniBar}>
                <div style={{ ...slStyles.miniFill, width: `${pct}%`, background: color }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const slStyles = {
  wrap: {
    padding: "20px 22px",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 16, flex: 1, minWidth: 280,
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 16,
  },
  title: { fontFamily: "'DM Mono', monospace", fontSize: 10.5, letterSpacing: "0.16em" },
  total: { fontSize: 13, color: C.body, fontFamily: "'DM Mono', monospace" },
  row: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    paddingBottom: 12, marginBottom: 12,
    borderBottom: `1px solid ${C.borderSoft}`,
  },
  rowLast: { borderBottom: "none", marginBottom: 0, paddingBottom: 0 },
  rowLeft: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontFamily: "'DM Serif Display', serif",
  },
  name: { fontSize: 14, color: C.text, fontWeight: 500 },
  sub: { fontSize: 12, color: C.muted },
  rowRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 },
  val: { fontSize: 13.5, fontWeight: 500, fontFamily: "'DM Mono', monospace" },
  miniBar: { width: 64, height: 3, background: "rgba(255,255,255,0.10)", borderRadius: 99, overflow: "hidden" },
  miniFill: { height: "100%", borderRadius: 99, transition: "width 0.5s ease" },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NetWorth() {
  const [assets, setAssets]           = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [range, setRange]             = useState("ALL");

  useEffect(() => {
    (async () => {
      try {
        const [aRes, lRes] = await Promise.all([
          fetch(ASSETS_API),
          fetch(LIABILITIES_API),
        ]);
        if (!aRes.ok || !lRes.ok) throw new Error("Failed to load data.");
        const [aData, lData] = await Promise.all([aRes.json(), lRes.json()]);
        setAssets(aData);
        setLiabilities(lData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const timeline   = useMemo(() => buildTimeline(assets, liabilities), [assets, liabilities]);
  const chartData  = useMemo(() => filterByRange(timeline, range), [timeline, range]);

  const latest     = chartData[chartData.length - 1] || {};
  const earliest   = chartData[0] || {};
  const netWorth   = latest.netWorth   || 0;
  const totalAssets = latest.totalAssets || 0;
  const totalLiab  = latest.totalLiabilities || 0;

  const change     = netWorth - (earliest.netWorth || 0);
  const changePct  = earliest.netWorth
    ? ((change / Math.abs(earliest.netWorth)) * 100)
    : 0;

  const minVal     = Math.min(...chartData.map((d) => Math.min(d.totalAssets, d.totalLiabilities, d.netWorth)), 0);
  const maxVal     = Math.max(...chartData.map((d) => Math.max(d.totalAssets, d.totalLiabilities, d.netWorth)), 0);
  const yPad       = (maxVal - minVal) * 0.12;

  if (loading) return (
    <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={styles.glow} />
      <p style={{ fontFamily: "'DM Mono', monospace", color: C.muted, fontSize: 13, zIndex: 1 }}>
        Computing net worth…
      </p>
    </div>
  );

  if (error) return (
    <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={styles.glow} />
      <p style={{ fontFamily: "'DM Mono', monospace", color: C.negative, fontSize: 13, zIndex: 1 }}>{error}</p>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.glow} />

      <div style={styles.container}>

        {/* ── Page Header ── */}
        <div style={styles.pageHeader}>
          <div>
            <p style={styles.pageEyebrow}>FINANCIAL OVERVIEW</p>
            <h1 style={styles.pageTitle}>Net Worth</h1>
          </div>
          <div style={styles.netWorthDisplay}>
            <span style={styles.netWorthLabel}>CURRENT NET WORTH</span>
            <span style={{ ...styles.netWorthValue, color: netWorth < 0 ? C.negative : C.text }}>
              {fmtFull(netWorth)}
            </span>
            {change !== 0 && (
              <span style={{ ...styles.netWorthChange, color: gainColor(change) }}>
                {gainPrefix(change)}{fmtFull(change)} ({gainPrefix(changePct)}{changePct.toFixed(1)}%) in period
              </span>
            )}
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={styles.statsGrid}>
          <StatCard
            label="TOTAL ASSETS"
            value={fmt(totalAssets)}
            sub={`${assets.length} position${assets.length !== 1 ? "s" : ""}`}
            color={C.assets}
          />
          <StatCard
            label="TOTAL LIABILITIES"
            value={fmt(totalLiab)}
            sub={`${liabilities.length} liabilit${liabilities.length !== 1 ? "ies" : "y"}`}
            color={C.negative}
          />
          <StatCard
            label="NET WORTH"
            value={fmt(netWorth)}
            sub={netWorth >= 0 ? "Positive position" : "Net negative"}
            color={netWorth >= 0 ? C.accent : C.negative}
          />
          <StatCard
            label="DEBT RATIO"
            value={totalAssets ? `${((totalLiab / totalAssets) * 100).toFixed(1)}%` : "—"}
            sub="Liabilities / Assets"
            color={C.amber}
          />
        </div>

        {/* ── Area Chart ── */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <span style={styles.chartTitle}>Net Worth Over Time</span>
              <span style={styles.chartSub}>
                {chartData.length > 1
                  ? `${fmtDateLong(chartData[0].date)} — ${fmtDateLong(chartData[chartData.length - 1].date)}`
                  : "Tracking begins when you add history"}
              </span>
            </div>
            <div style={styles.rangeRow}>
              {RANGES.map((r) => (
                <button
                  key={r}
                  style={{ ...styles.rangeBtn, ...(range === r ? styles.rangeBtnActive : {}) }}
                  onClick={() => setRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {chartData.length < 2 ? (
            <div style={styles.chartEmpty}>
              <span style={styles.chartEmptyIcon}>◈</span>
              <p style={styles.chartEmptyText}>
                Not enough history yet. Update asset values or make liability payments to build your timeline.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradAssets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.assets} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={C.assets} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradLiab" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.negative} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={C.negative} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradNW" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.accent} stopOpacity={0.32} />
                    <stop offset="95%" stopColor={C.accent} stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />

                <XAxis
                  dataKey="label"
                  tick={{ fill: C.muted, fontSize: 11, fontFamily: "'DM Mono', monospace" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => fmt(v)}
                  tick={{ fill: C.muted, fontSize: 10.5, fontFamily: "'DM Mono', monospace" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[minVal - yPad, maxVal + yPad]}
                  width={90}
                />

                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 }} />

                {/* Zero reference line */}
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" />

                <Area
                  type="monotone"
                  dataKey="totalAssets"
                  name="Assets"
                  stroke={C.assets}
                  strokeWidth={1.8}
                  fill="url(#gradAssets)"
                  dot={false}
                  activeDot={{ r: 4, fill: C.assets, stroke: C.bg, strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="totalLiabilities"
                  name="Liabilities"
                  stroke={C.negative}
                  strokeWidth={1.8}
                  fill="url(#gradLiab)"
                  dot={false}
                  activeDot={{ r: 4, fill: C.negative, stroke: C.bg, strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="netWorth"
                  name="Net Worth"
                  stroke={C.accent}
                  strokeWidth={2.6}
                  fill="url(#gradNW)"
                  dot={false}
                  activeDot={{ r: 5, fill: C.accent, stroke: C.bg, strokeWidth: 2 }}
                />

                <Legend
                  wrapperStyle={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11.5,
                    color: C.body,
                    paddingTop: 16,
                    letterSpacing: "0.06em",
                  }}
                  iconType="circle"
                  iconSize={7}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Composition + Breakdown ── */}
        <BreakdownBar assets={assets} liabilities={liabilities} />

        {/* ── Asset / Liability lists ── */}
        {(assets.length > 0 || liabilities.length > 0) && (
          <div style={styles.listsRow}>
            {assets.length > 0      && <SummaryList items={assets}      type="asset"     />}
            {liabilities.length > 0 && <SummaryList items={liabilities} type="liability" />}
          </div>
        )}

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        button { font-family: inherit; }
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
    maxWidth: 1060, margin: "0 auto",
    padding: "56px 24px 80px",
    animation: "fadeUp 0.5s ease both",
  },

  pageHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-end", flexWrap: "wrap", gap: 24,
    marginBottom: 32,
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
  netWorthDisplay: {
    display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5,
    padding: "16px 22px",
    background: "rgba(52,211,153,0.07)",
    border: "1px solid rgba(52,211,153,0.3)",
    borderRadius: 14,
  },
  netWorthLabel: { fontFamily: "'DM Mono', monospace", fontSize: 10.5, letterSpacing: "0.18em", color: C.accent },
  netWorthValue: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 36, fontWeight: 400, letterSpacing: "-1px", lineHeight: 1,
  },
  netWorthChange: { fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: "0.02em" },

  statsGrid: {
    display: "flex", gap: 12, flexWrap: "wrap",
    marginBottom: 20,
  },

  chartCard: {
    padding: "24px",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 18,
    marginBottom: 20,
    minWidth: 0,
    width: "100%",
  },
  chartHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", flexWrap: "wrap", gap: 14,
    marginBottom: 24,
  },
  chartTitle: {
    display: "block",
    fontSize: 16, fontWeight: 500, color: C.text,
    letterSpacing: "0.01em", marginBottom: 4,
  },
  chartSub: { display: "block", fontSize: 12, color: C.muted },
  rangeRow: { display: "flex", gap: 4 },
  rangeBtn: {
    padding: "6px 13px",
    background: "transparent",
    border: `1px solid ${C.border}`,
    borderRadius: 7, color: C.body,
    fontSize: 11.5, fontFamily: "'DM Mono', monospace",
    cursor: "pointer", letterSpacing: "0.06em",
    transition: "all 0.15s",
  },
  rangeBtnActive: {
    background: "rgba(52,211,153,0.14)",
    borderColor: "rgba(52,211,153,0.5)",
    color: C.accent,
  },
  chartEmpty: {
    height: 240, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 12,
  },
  chartEmptyIcon: { fontSize: 36, color: "rgba(52,211,153,0.35)" },
  chartEmptyText: {
    fontSize: 14, color: C.body, maxWidth: 340, textAlign: "center", lineHeight: 1.6,
  },

  listsRow: { display: "flex", gap: 16, flexWrap: "wrap" },
};