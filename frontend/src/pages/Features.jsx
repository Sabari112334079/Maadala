import { useState, useEffect, useRef } from "react";

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
  indigo:     "#818cf8",
};

const inr = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, seen];
}

function useCountUp(target, run, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf, start;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return val;
}

// ─── Shared bits ──────────────────────────────────────────────────────────────
function Tag({ label, color }) {
  return (
    <span style={{
      fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em",
      color: C.text, background: `${color}1f`, border: `1px solid ${color}55`,
      padding: "3px 10px", borderRadius: 20,
    }}>{label}</span>
  );
}

function Panel({ children, color = C.accent, style }) {
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${C.border}`,
      borderRadius: 18, padding: 22,
      boxShadow: `0 20px 60px ${color}10`,
      ...style,
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${color}88, transparent)`,
      }} />
      {children}
    </div>
  );
}

// ─── Feature demos ────────────────────────────────────────────────────────────

// 1 · Assets: values count up, gains pop in
const ASSETS = [
  { name: "Nifty 50 Index Fund", inst: "Zerodha",   inv: 120000, cur: 148500, color: C.accent },
  { name: "Apartment, Chennai",  inst: "Real estate", inv: 4200000, cur: 4650000, color: C.indigo },
  { name: "Bitcoin",             inst: "WazirX",     inv: 60000,  cur: 52400,  color: C.amber },
];
function AssetRow({ a, run, delay }) {
  const cur = useCountUp(a.cur, run, 1300);
  const gain = a.cur - a.inv;
  const pct = (gain / a.inv) * 100;
  const up = gain >= 0;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
      borderBottom: `1px solid ${C.borderSoft}`,
      opacity: run ? 1 : 0, transform: run ? "none" : "translateX(-16px)",
      transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: C.text, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
        <div style={{ fontSize: 11.5, color: C.muted }}>{a.inst}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13.5, color: C.text }}>{inr(cur)}</div>
        <span style={{
          fontSize: 11, fontFamily: "'DM Mono', monospace",
          color: up ? C.accent : C.negative,
        }}>{up ? "+" : "−"}{Math.abs(pct).toFixed(1)}%</span>
      </div>
    </div>
  );
}
function AssetsDemo({ run }) {
  return (
    <Panel color={C.indigo}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
        {["Buy", "Sell"].map((b, i) => (
          <span key={b} style={{
            fontSize: 11, fontFamily: "'DM Mono', monospace", padding: "4px 12px", borderRadius: 20,
            color: i === 0 ? C.accent : C.negative,
            background: i === 0 ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
            border: `1px solid ${i === 0 ? "rgba(52,211,153,0.35)" : "rgba(248,113,113,0.35)"}`,
          }}>{b}</span>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 11, color: C.muted, fontFamily: "'DM Mono', monospace" }}>3 assets</span>
      </div>
      {ASSETS.map((a, i) => <AssetRow key={a.name} a={a} run={run} delay={i * 140} />)}
    </Panel>
  );
}

// 2 · Liabilities: progress bars fill
const DEBTS = [
  { name: "Home loan",     lender: "SBI",      pct: 38, bal: 2850000, rate: 8.5, color: C.teal },
  { name: "Car loan",      lender: "HDFC",     pct: 72, bal: 210000,  rate: 9.2, color: C.accent },
  { name: "Credit card",   lender: "ICICI",    pct: 15, bal: 64000,   rate: 36,  color: C.negative },
];
function LiabilitiesDemo({ run }) {
  return (
    <Panel color={C.teal}>
      {DEBTS.map((d, i) => (
        <div key={d.name} style={{ marginBottom: i === DEBTS.length - 1 ? 0 : 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 13.5, color: C.text, fontWeight: 500 }}>{d.name}</div>
              <div style={{ fontSize: 11.5, color: C.muted }}>{d.lender} · {d.rate}% p.a.</div>
            </div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: C.negative }}>{inr(d.bal)}</div>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99,
              width: run ? `${d.pct}%` : "0%",
              background: `linear-gradient(90deg, ${C.accentDark}, ${C.accent})`,
              transition: `width 1.4s cubic-bezier(0.22,1,0.36,1) ${i * 180}ms`,
            }} />
          </div>
          <div style={{ fontSize: 11, color: C.accent, fontFamily: "'DM Mono', monospace", marginTop: 6 }}>{d.pct}% paid off</div>
        </div>
      ))}
    </Panel>
  );
}

// 3 · Net worth chart: draws itself, range tabs replay it
const RANGES = {
  "1M": { assets: [62, 63, 62.5, 64, 65, 66, 66.5, 68], liab: [30, 30, 29.8, 29.5, 29.4, 29, 28.8, 28.5] },
  "3M": { assets: [55, 57, 56, 59, 61, 63, 66, 68], liab: [33, 32.5, 32, 31, 30.5, 30, 29, 28.5] },
  "6M": { assets: [48, 52, 51, 56, 60, 62, 65, 68], liab: [37, 36, 34.5, 33, 31.5, 30.5, 29.5, 28.5] },
  "1Y": { assets: [40, 44, 47, 50, 56, 60, 64, 68], liab: [42, 40, 37.5, 35, 33, 31, 29.8, 28.5] },
};
function buildPath(vals, w, h, min, max) {
  const step = w / (vals.length - 1);
  return vals.map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(h - ((v - min) / (max - min)) * h).toFixed(1)}`).join(" ");
}
function NetWorthDemo({ run }) {
  const [range, setRange] = useState("6M");
  const W = 420, H = 190;
  const d = RANGES[range];
  const nw = d.assets.map((a, i) => a - d.liab[i]);
  const all = [...d.assets, ...d.liab, ...nw];
  const min = Math.min(...all) - 4, max = Math.max(...all) + 4;
  const aPath = buildPath(d.assets, W, H, min, max);
  const lPath = buildPath(d.liab, W, H, min, max);
  const nPath = buildPath(nw, W, H, min, max);
  const latest = nw[nw.length - 1];
  return (
    <Panel color={C.teal}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: "0.14em", color: C.muted, fontFamily: "'DM Mono', monospace" }}>NET WORTH</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: C.accent, letterSpacing: "-0.5px" }}>
            ₹{latest.toFixed(1)}L
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {Object.keys(RANGES).map((r) => (
            <button key={r} onClick={() => setRange(r)} style={{
              padding: "4px 11px", borderRadius: 20, cursor: "pointer",
              fontSize: 11, fontFamily: "'DM Mono', monospace",
              background: range === r ? "rgba(52,211,153,0.14)" : "transparent",
              border: `1px solid ${range === r ? "rgba(52,211,153,0.5)" : C.border}`,
              color: range === r ? C.accent : C.body,
            }}>{r}</button>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H + 6}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} key={range + String(run)}>
        <defs>
          <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.accent} stopOpacity="0.30" />
            <stop offset="100%" stopColor={C.accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 5" />
        ))}
        <path d={`${nPath} L${W},${H} L0,${H} Z`} fill="url(#nwFill)"
          style={{ opacity: run ? 1 : 0, transition: "opacity 1.2s ease 0.5s" }} />
        <path d={aPath} fill="none" stroke={C.indigo} strokeWidth="1.6" pathLength="1"
          style={{ strokeDasharray: 1, strokeDashoffset: run ? 0 : 1, transition: "stroke-dashoffset 1.6s ease" }} />
        <path d={lPath} fill="none" stroke={C.negative} strokeWidth="1.6" pathLength="1"
          style={{ strokeDasharray: 1, strokeDashoffset: run ? 0 : 1, transition: "stroke-dashoffset 1.6s ease 0.15s" }} />
        <path d={nPath} fill="none" stroke={C.accent} strokeWidth="2.4" pathLength="1" strokeLinecap="round"
          style={{ strokeDasharray: 1, strokeDashoffset: run ? 0 : 1, transition: "stroke-dashoffset 1.8s ease 0.3s" }} />
      </svg>
      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
        {[["Assets", C.indigo], ["Liabilities", C.negative], ["Net worth", C.accent]].map(([l, c]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.body }}>
            <span style={{ width: 14, height: 3, borderRadius: 2, background: c }} />{l}
          </span>
        ))}
      </div>
    </Panel>
  );
}

// 4 · Transactions: rows slide in, expand on click
const TXS = [
  { icon: "↑", label: "Buy",     name: "Nifty 50 Index Fund", amt: "+ ₹25,000", color: C.accent,   date: "24 Oct" },
  { icon: "↓", label: "Sell",    name: "Bitcoin",             amt: "− ₹18,000", color: C.negative, date: "22 Oct", gain: "+₹2,400" },
  { icon: "↓", label: "Payment", name: "Car loan",            amt: "− ₹14,500", color: C.teal,     date: "20 Oct" },
  { icon: "✎", label: "Value Updated", name: "Apartment, Chennai", amt: "~ ₹4,650,000", color: C.amber, date: "18 Oct" },
];
function TransactionsDemo({ run }) {
  const [open, setOpen] = useState(1);
  return (
    <Panel color={C.amber} style={{ padding: 0 }}>
      {TXS.map((t, i) => (
        <div key={i}
          onClick={() => setOpen(open === i ? -1 : i)}
          style={{
            padding: "14px 18px", cursor: "pointer",
            borderBottom: i === TXS.length - 1 ? "none" : `1px solid ${C.borderSoft}`,
            background: open === i ? "rgba(52,211,153,0.04)" : "transparent",
            opacity: run ? 1 : 0, transform: run ? "none" : "translateY(14px)",
            transition: `opacity 0.6s ease ${i * 130}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 130}ms, background 0.2s`,
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `${t.color}1f`, border: `1px solid ${t.color}40`, color: t.color, fontSize: 14,
            }}>{t.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, color: C.text, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
              <div style={{ fontSize: 11.5, color: t.color }}>{t.label}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: t.color }}>{t.amt}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{t.date}</div>
            </div>
          </div>
          <div style={{
            maxHeight: open === i ? 60 : 0, overflow: "hidden",
            transition: "max-height 0.35s ease", paddingLeft: 46,
          }}>
            <div style={{ fontSize: 11.5, color: C.body, paddingTop: 10, fontFamily: "'DM Mono', monospace" }}>
              Recorded automatically{t.gain ? ` · realized gain ${t.gain}` : ""}
            </div>
          </div>
        </div>
      ))}
    </Panel>
  );
}

// 5 · Reports: donut sweeps in
const SLICES = [
  { name: "Equity",      pct: 38, color: C.accent },
  { name: "Real estate", pct: 31, color: C.indigo },
  { name: "Crypto",      pct: 18, color: C.amber },
  { name: "Cash",        pct: 13, color: C.teal },
];
function ReportsDemo({ run }) {
  const r = 62, circ = 2 * Math.PI * r;
  const [hover, setHover] = useState(null);
  let acc = 0;
  const active = hover !== null ? SLICES[hover] : null;
  return (
    <Panel color={C.accent}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 170, height: 170 }}>
          <svg viewBox="0 0 160 160" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
            <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="18" />
            {SLICES.map((s, i) => {
              const len = (s.pct / 100) * circ - 3;
              const off = -acc;
              acc += (s.pct / 100) * circ;
              return (
                <circle key={s.name} cx="80" cy="80" r={r} fill="none"
                  stroke={s.color} strokeWidth={hover === i ? 22 : 18}
                  strokeDasharray={`${run ? len : 0} ${circ}`}
                  strokeDashoffset={off}
                  opacity={hover === null || hover === i ? 1 : 0.3}
                  onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                  style={{ transition: `stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1) ${i * 150}ms, stroke-width 0.2s, opacity 0.2s`, cursor: "pointer" }} />
              );
            })}
          </svg>
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", pointerEvents: "none", textAlign: "center",
          }}>
            <div style={{ fontSize: 10.5, letterSpacing: "0.12em", color: active ? active.color : C.muted, fontFamily: "'DM Mono', monospace" }}>
              {active ? active.name.toUpperCase() : "ALLOCATION"}
            </div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: active ? active.color : C.text }}>
              {active ? `${active.pct}%` : "4 classes"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, minWidth: 150 }}>
          {SLICES.map((s, i) => (
            <div key={s.name} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              style={{ display: "flex", alignItems: "center", gap: 9, cursor: "default", opacity: hover === null || hover === i ? 1 : 0.4, transition: "opacity 0.2s" }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color }} />
              <span style={{ flex: 1, fontSize: 12.5, color: C.body }}>{s.name}</span>
              <span style={{ fontSize: 12, color: C.muted, fontFamily: "'DM Mono', monospace" }}>{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

// 6 · Inline editing: self-playing click-to-edit loop
function InlineEditDemo({ run }) {
  const [phase, setPhase] = useState(0); // 0 idle, 1 editing, 2 saved
  const [typed, setTyped] = useState("");
  const NEW = "1,32,500";
  useEffect(() => {
    if (!run) return;
    let timers = [];
    const cycle = () => {
      setPhase(0); setTyped("");
      timers.push(setTimeout(() => setPhase(1), 1400));
      NEW.split("").forEach((_, i) => {
        timers.push(setTimeout(() => setTyped(NEW.slice(0, i + 1)), 1900 + i * 140));
      });
      timers.push(setTimeout(() => setPhase(2), 1900 + NEW.length * 140 + 700));
      timers.push(setTimeout(cycle, 1900 + NEW.length * 140 + 3200));
    };
    cycle();
    return () => timers.forEach(clearTimeout);
  }, [run]);

  return (
    <Panel color="#c084fc">
      <div style={{ fontSize: 10.5, letterSpacing: "0.14em", color: C.muted, fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>
        ASSETS
      </div>
      {[
        { n: "Nifty 50 Index Fund", v: "₹1,25,000", edit: true },
        { n: "Gold ETF",            v: "₹48,200" },
        { n: "Bitcoin",             v: "₹52,400" },
      ].map((row) => (
        <div key={row.n} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "11px 0", borderBottom: `1px solid ${C.borderSoft}`, gap: 10,
        }}>
          <span style={{ fontSize: 13.5, color: C.text }}>{row.n}</span>
          {row.edit ? (
            <span style={{
              minWidth: 112, textAlign: "right", padding: "5px 10px", borderRadius: 8,
              fontFamily: "'DM Mono', monospace", fontSize: 13,
              color: phase === 2 ? C.accent : C.text,
              background: phase === 1 ? "rgba(192,132,252,0.10)" : phase === 2 ? "rgba(52,211,153,0.12)" : "transparent",
              border: `1px solid ${phase === 1 ? "rgba(192,132,252,0.6)" : phase === 2 ? "rgba(52,211,153,0.5)" : "transparent"}`,
              transition: "all 0.25s",
            }}>
              {phase === 0 && row.v}
              {phase === 1 && <>₹{typed}<span style={{ animation: "ftBlink 1s steps(1) infinite" }}>|</span></>}
              {phase === 2 && <>₹{NEW} ✓</>}
            </span>
          ) : (
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.body, padding: "5px 10px" }}>{row.v}</span>
          )}
        </div>
      ))}
      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 14, fontFamily: "'DM Mono', monospace", minHeight: 16 }}>
        {phase === 0 && "Click a value to edit"}
        {phase === 1 && "Type, then press Enter"}
        {phase === 2 && "Saved · logged to history"}
      </div>
    </Panel>
  );
}

// 7 · Smart sell engine: interactive slider
function SellDemo() {
  const invested = 100000, current = 150000;
  const [pct, setPct] = useState(40);
  const proceeds = Math.round((current * pct) / 100);
  const ratio = proceeds / current;
  const costOut = invested * ratio;
  const gain = proceeds - costOut;
  const remInv = invested - costOut;
  const remCur = current - proceeds;
  const full = pct === 100;
  return (
    <Panel color={C.accent}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.muted, marginBottom: 4, fontFamily: "'DM Mono', monospace" }}>
        <span>INVESTED {inr(invested)}</span><span>NOW {inr(current)}</span>
      </div>
      <div style={{ fontSize: 12.5, color: C.body, margin: "14px 0 6px" }}>How much are you selling?</div>
      <input type="range" min="5" max="100" step="5" value={pct}
        onChange={(e) => setPct(+e.target.value)}
        aria-label="Sell percentage"
        style={{ width: "100%", accentColor: C.accent, cursor: "pointer" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: C.text }}>{inr(proceeds)}</span>
        <span style={{ fontSize: 12, color: C.muted, fontFamily: "'DM Mono', monospace" }}>{pct}% of position</span>
      </div>
      {[
        ["Cost basis released", inr(costOut), C.body],
        ["Realized gain", `${gain >= 0 ? "+" : "−"}${inr(Math.abs(gain))}`, gain >= 0 ? C.accent : C.negative],
        ["Remaining invested", inr(remInv), C.body],
        ["Remaining value", inr(remCur), C.body],
      ].map(([l, v, c]) => (
        <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: `1px solid ${C.borderSoft}`, fontSize: 12.5 }}>
          <span style={{ color: C.muted }}>{l}</span>
          <span style={{ color: c, fontFamily: "'DM Mono', monospace", transition: "color 0.2s" }}>{v}</span>
        </div>
      ))}
      <div style={{
        marginTop: 12, padding: "8px 12px", borderRadius: 9, fontSize: 11.5,
        fontFamily: "'DM Mono', monospace", textAlign: "center",
        color: full ? C.amber : C.muted,
        background: full ? "rgba(251,191,36,0.10)" : "transparent",
        border: `1px solid ${full ? "rgba(251,191,36,0.4)" : "transparent"}`,
        transition: "all 0.25s", minHeight: 34,
      }}>
        {full ? "Full exit — position will be closed" : "Partial sell — cost basis reduced proportionally"}
      </div>
    </Panel>
  );
}

// 8 · Live sidebar: health ring + refresh countdown
function SidebarDemo({ run }) {
  const [sec, setSec] = useState(60);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => {
      setSec((s) => {
        if (s <= 1) { setFlash(true); setTimeout(() => setFlash(false), 900); return 60; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [run]);
  const r = 34, circ = 2 * Math.PI * r, health = 82;
  return (
    <Panel color="#38bdf8" style={{ maxWidth: 300, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div style={{ position: "relative", width: 84, height: 84 }}>
          <svg viewBox="0 0 84 84" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
            <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle cx="42" cy="42" r={r} fill="none" stroke={C.accent} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${run ? (health / 100) * circ : 0} ${circ}`}
              style={{ transition: "stroke-dasharray 1.6s cubic-bezier(0.22,1,0.36,1)" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'DM Serif Display', serif", fontSize: 22, color: C.text }}>{health}</div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: "0.14em", color: C.muted, fontFamily: "'DM Mono', monospace" }}>PORTFOLIO HEALTH</div>
          <div style={{ fontSize: 14, color: C.accent, fontWeight: 500 }}>Strong</div>
        </div>
      </div>
      {[["Net worth", "₹68.5L", C.text], ["All-time gain", "+₹6.8L", C.accent], ["Assets", "8", C.body], ["Liabilities", "3", C.body]].map(([l, v, c]) => (
        <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: `1px solid ${C.borderSoft}`, fontSize: 12.5 }}>
          <span style={{ color: C.muted }}>{l}</span>
          <span style={{ color: c, fontFamily: "'DM Mono', monospace" }}>{v}</span>
        </div>
      ))}
      <div style={{
        marginTop: 14, display: "flex", alignItems: "center", gap: 8, fontSize: 11.5,
        fontFamily: "'DM Mono', monospace", color: flash ? C.accent : C.muted, transition: "color 0.3s",
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%", background: C.accent,
          animation: "ftPulse 2s ease-in-out infinite",
        }} />
        {flash ? "Refreshed just now" : `Auto-refresh in ${sec}s`}
      </div>
    </Panel>
  );
}

// ─── Feature definitions ──────────────────────────────────────────────────────
const FEATURES = [
  {
    id: "assets", icon: "◈", color: C.indigo, title: "Asset Management",
    lead: "Every investment, one list.",
    desc: "Add stocks, funds, property, crypto or anything else you own. Buy more, sell some, and see gain or loss per asset as soon as the value changes. Each asset keeps its full value history.",
    tags: ["Buy & Sell", "Value History", "Gain / Loss"],
    Demo: AssetsDemo,
  },
  {
    id: "liabilities", icon: "⬡", color: C.teal, title: "Liability Tracking",
    lead: "Know exactly what you owe.",
    desc: "Track loans, mortgages and credit cards with lender, interest rate and monthly payment. Log a payment and the balance and payoff bar update right away.",
    tags: ["Debt Payoff", "Interest Rate", "Progress Bar"],
    Demo: LiabilitiesDemo,
  },
  {
    id: "networth", icon: "◉", color: C.accent, title: "Net Worth Chart",
    lead: "Watch the gap between assets and debt.",
    desc: "One chart shows assets, liabilities and net worth over time, built from every value snapshot you've recorded. Switch between 1M, 3M, 6M and 1Y to see short-term moves or the long trend.",
    tags: ["Time Ranges", "Area Chart", "Trend Analysis"],
    Demo: NetWorthDemo,
  },
  {
    id: "transactions", icon: "⬘", color: C.amber, title: "Transaction Log",
    lead: "A record you never have to write.",
    desc: "Every buy, sell, payment and balance update is logged automatically. Filter by type or date range, page through the history, and click any row for details.",
    tags: ["Auto-Logged", "Filterable", "Paginated"],
    Demo: TransactionsDemo,
  },
  {
    id: "reports", icon: "◍", color: C.accent, title: "Portfolio Reports",
    lead: "See where your money sits.",
    desc: "Donut charts compare current allocation with what you originally invested. A sortable gain/loss table highlights your best and worst performers, with a liability summary alongside.",
    tags: ["Donut Charts", "Allocation", "Performance Table"],
    Demo: ReportsDemo,
  },
  {
    id: "inline", icon: "◬", color: "#c084fc", title: "Inline Editing",
    lead: "Change a number where you see it.",
    desc: "Click a current value or outstanding balance right in the table, type the new figure and press Enter. No modal and no page reload, and the change is recorded in your history.",
    tags: ["Click-to-Edit", "Instant Save", "No Friction"],
    Demo: InlineEditDemo,
  },
  {
    id: "sell", icon: "◎", color: C.accent, title: "Smart Sell Engine",
    lead: "Partial sells, done properly.",
    desc: "When you sell part of a position, the cost basis is reduced in proportion and the realized gain or loss is worked out for you. Selling everything is flagged before you confirm. Try the slider.",
    tags: ["Cost Basis", "Realized Gains", "Partial Sell"],
    Demo: SellDemo, interactive: true,
  },
  {
    id: "sidebar", icon: "⬟", color: "#38bdf8", title: "Live Sidebar",
    lead: "Your numbers, always in view.",
    desc: "A health score, net worth, all-time gain and live counts stay visible on every page. The data refreshes itself every 60 seconds, so you never need to reload.",
    tags: ["Auto-Refresh", "Health Score", "Live Counts"],
    Demo: SidebarDemo,
  },
];

const STEPS = [
  { t: "Add what you own and owe", d: "Enter assets and liabilities once, with their starting values." },
  { t: "Log what happens", d: "Buy, sell, pay or update a value. Each action is recorded for you." },
  { t: "Read the picture", d: "Charts, reports and the sidebar update to show where you stand." },
];

// ─── Feature row ──────────────────────────────────────────────────────────────
function FeatureRow({ f, index }) {
  const [ref, seen] = useInView(0.3);
  const reverse = index % 2 === 1;
  const { Demo } = f;
  return (
    <section id={f.id} ref={ref} className={`ft-row${reverse ? " ft-rev" : ""}`} style={{
      display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 56, alignItems: "center",
      padding: "72px 0", borderTop: `1px solid ${C.borderSoft}`, scrollMarginTop: 90,
    }}>
      <div className="ft-text" style={{
        opacity: seen ? 1 : 0, transform: seen ? "none" : "translateX(" + (reverse ? "28px" : "-28px") + ")",
        transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, marginBottom: 18,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          color: f.color, background: `${f.color}1a`, border: `1px solid ${f.color}40`,
        }}>{f.icon}</div>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif", fontWeight: 400,
          fontSize: "clamp(28px, 3.6vw, 40px)", color: C.text, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 12,
        }}>{f.title}</h2>
        <p style={{ fontSize: 17, color: f.color, fontFamily: "'DM Serif Display', serif", fontStyle: "italic", marginBottom: 14 }}>{f.lead}</p>
        <p style={{ fontSize: 15, color: C.body, lineHeight: 1.75, marginBottom: 20, maxWidth: 480 }}>{f.desc}</p>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {f.tags.map((t) => <Tag key={t} label={t} color={f.color} />)}
        </div>
      </div>
      <div className="ft-demo" style={{
        opacity: seen ? 1 : 0, transform: seen ? "none" : "translateY(30px) scale(0.98)",
        transition: "all 0.9s cubic-bezier(0.22,1,0.36,1) 0.12s", minWidth: 0,
      }}>
        <Demo run={seen} />
        {f.interactive && (
          <div style={{ textAlign: "center", fontSize: 11.5, color: C.muted, marginTop: 10, fontFamily: "'DM Mono', monospace" }}>
            Interactive — drag the slider
          </div>
        )}
      </div>
    </section>
  );
}

function Navbar({ onLogin, onRegister, onHome, onDeveloper }) {
      const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { label: "Home",         action: onHome },
    { label: "Developer",    action: onDeveloper },
    { label: "Features",     action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
  ];

  const linkStyle = {
    fontSize: 13, color: C.body,
    fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
    letterSpacing: "0.02em", cursor: "pointer",
    transition: "color 0.15s", userSelect: "none",
  };

  return (
    <nav className="ft-nav" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 48px", height: 68,
      background: scrolled ? "rgba(7,8,13,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.borderSoft}` : "1px solid transparent",
      transition: "all 0.3s ease",
    }}>
      {/* Logo */}
      <div onClick={onHome} style={{ display: "flex", alignItems: "center", gap: 10, cursor: onHome ? "pointer" : "default" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, color: "#041009",
        }}>◈</div>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: C.text, letterSpacing: "-0.3px" }}>Maadalla</span>
      </div>

      {/* Links */}
      <div className="ft-nav-links" style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {links.map((l) => (
          <span key={l.label} style={linkStyle}
            onClick={() => l.action?.()}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.body)}
          >{l.label}</span>
        ))}
      </div>

      {/* Auth */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onLogin} className="ft-ghost">Log in</button>
        <button onClick={onRegister} className="ft-solid">Get Started</button>
      </div>
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Features({ onLogin, onRegister, onHome, onDeveloper }) {
  const handleLogin    = onLogin    ?? (() => {});
  const handleRegister = onRegister ?? (() => {});
  const [heroRef, heroSeen] = useInView(0.1);
  const [stepsRef, stepsSeen] = useInView(0.25);

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'DM Sans', sans-serif", overflowX: "hidden", position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        button { font-family: inherit; }

        @keyframes ftPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.45; transform:scale(.8); } }
        @keyframes ftBlink { 0%,50% { opacity:1; } 51%,100% { opacity:0; } }
        @keyframes ftFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes ftFadeUp { from { opacity:0; transform: translateY(22px); } to { opacity:1; transform:none; } }

        .ft-ghost {
          padding: 9px 20px; background: transparent; color: ${C.text};
          border: 1px solid rgba(255,255,255,0.22); border-radius: 8px;
          font-size: 13px; font-weight: 500; letter-spacing: .02em; cursor: pointer; transition: all .15s;
        }
        .ft-ghost:hover { border-color: ${C.accent}; color: ${C.accent}; }
        .ft-solid {
          padding: 9px 20px; color: #041009; border: none; border-radius: 8px;
          background: linear-gradient(135deg, ${C.accent}, ${C.accentDark});
          font-size: 13px; font-weight: 600; letter-spacing: .02em; cursor: pointer; transition: opacity .15s;
        }
        .ft-solid:hover { opacity: .85; }
        .ft-chip {
          padding: 8px 16px; border-radius: 20px; cursor: pointer;
          background: rgba(255,255,255,0.03); border: 1px solid ${C.border};
          color: ${C.body}; font-size: 12.5px; transition: all .18s;
        }
        .ft-chip:hover { border-color: rgba(52,211,153,0.5); color: ${C.accent}; background: rgba(52,211,153,0.08); }
        button:focus-visible, input:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: #2a3142; border-radius: 99px; }

        .ft-rev .ft-text { order: 2; }
        .ft-rev .ft-demo { order: 1; }

        @media (max-width: 900px) {
          .ft-row { grid-template-columns: 1fr !important; gap: 32px !important; padding: 52px 0 !important; }
          .ft-rev .ft-text, .ft-rev .ft-demo { order: initial; }
          .ft-steps { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .ft-nav { padding: 0 20px !important; }
          .ft-wrap { padding-left: 20px !important; padding-right: 20px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
        }
      `}</style>

      <Navbar onLogin={handleLogin} onRegister={handleRegister} onHome={onHome} onDeveloper={onDeveloper} />
      
      {/* Hero */}
      <header ref={heroRef} style={{
        position: "relative", textAlign: "center", padding: "150px 24px 70px", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `linear-gradient(rgba(52,211,153,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.035) 1px, transparent 1px)`,
          backgroundSize: "52px 52px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 100%)",
        }} />
        <div style={{
          position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
          width: 700, height: 420, borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 65%)",
        }} />

        <div style={{ position: "relative", animation: "ftFadeUp .7s ease both" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: C.accent, fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>
            FEATURES
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif", fontWeight: 400,
            fontSize: "clamp(40px, 7vw, 76px)", lineHeight: 1.04, letterSpacing: "-2px",
            maxWidth: 800, margin: "0 auto 20px",
          }}>
            Everything you need to <span style={{
              fontStyle: "italic",
              background: "linear-gradient(120deg, #34d399 0%, #2dd4bf 45%, #818cf8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>see your money.</span>
          </h1>
          <p style={{ fontSize: "clamp(15px,1.8vw,18px)", color: C.body, maxWidth: 580, margin: "0 auto 34px", lineHeight: 1.7 }}>
            Maadalla tracks what you own, what you owe and every change in between. Here is what each part does, with a live preview of each.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 760, margin: "0 auto" }}>
            {FEATURES.map((f) => (
              <button key={f.id} className="ft-chip" onClick={() => go(f.id)}>{f.title}</button>
            ))}
          </div>
        </div>
      </header>

      {/* Feature rows */}
      <main className="ft-wrap" style={{ maxWidth: 1160, margin: "0 auto", padding: "0 48px" }}>
        {FEATURES.map((f, i) => <FeatureRow key={f.id} f={f} index={i} />)}

        {/* How it works */}
        <section ref={stepsRef} style={{ padding: "84px 0 40px", borderTop: `1px solid ${C.borderSoft}` }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", color: C.accent, fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>HOW IT WORKS</div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontSize: "clamp(28px,4vw,42px)", letterSpacing: "-1px" }}>
              Three steps, then it runs itself
            </h2>
          </div>
          <div className="ft-steps" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, position: "relative" }}>
            {STEPS.map((s, i) => (
              <div key={s.t} style={{
                padding: "26px 24px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
                opacity: stepsSeen ? 1 : 0, transform: stepsSeen ? "none" : "translateY(24px)",
                transition: `all .7s cubic-bezier(0.22,1,0.36,1) ${i * 150}ms`,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", marginBottom: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#041009", fontWeight: 600,
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
                }}>{i + 1}</div>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontSize: 20, marginBottom: 8, letterSpacing: "-0.2px" }}>{s.t}</h3>
                <p style={{ fontSize: 14, color: C.body, lineHeight: 1.65 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "60px 0 100px", textAlign: "center" }}>
          <div style={{
            maxWidth: 580, margin: "0 auto", padding: "52px 40px", position: "relative",
            background: "rgba(255,255,255,0.035)", border: "1px solid rgba(52,211,153,0.25)",
            borderRadius: 22, boxShadow: "0 0 80px rgba(52,211,153,0.06)",
          }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontSize: 36, letterSpacing: "-1px", lineHeight: 1.12, marginBottom: 14 }}>
              Start tracking today
            </h2>
            <p style={{ fontSize: 15, color: C.body, lineHeight: 1.7, marginBottom: 30 }}>
              Create a free account and add your first asset in a minute.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={handleRegister} style={{
                padding: "14px 30px", border: "none", borderRadius: 10, cursor: "pointer",
                background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
                color: "#041009", fontSize: 14, fontWeight: 600, letterSpacing: ".02em",
                boxShadow: "0 0 30px rgba(52,211,153,0.25)",
              }}>Create free account</button>
              <button onClick={handleLogin} className="ft-ghost" style={{ padding: "14px 30px", fontSize: 14, borderRadius: 10 }}>Log in</button>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: `1px solid ${C.borderSoft}`, padding: "28px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: C.muted, letterSpacing: ".02em" }}>
          © {new Date().getFullYear()} Maadalla · Personal Finance Tracker
        </p>
      </footer>
    </div>
  );
}