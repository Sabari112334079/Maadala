import { useState, useEffect, useRef } from "react";

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  bg:        "#07080d",
  text:      "#ffffff",                    // headings, key values
  body:      "rgba(255,255,255,0.82)",     // paragraphs
  muted:     "rgba(255,255,255,0.62)",     // labels, captions
  border:    "rgba(255,255,255,0.10)",
  borderSoft:"rgba(255,255,255,0.06)",
  accent:    "#34d399",
  accentDark:"#0d9488",
  negative:  "#f87171",
};

// ─── Ticker data (static, sample figures) ─────────────────────────────────────
const TICKER_ITEMS = [
  { label: "PORTFOLIO",   val: "+12.4%",    pos: true },
  { label: "NET WORTH",   val: "$84,200",   pos: true },
  { label: "ASSETS",      val: "↑ $128K",   pos: true },
  { label: "LIABILITIES", val: "↓ $43K",    pos: false },
  { label: "GAIN / LOSS", val: "+$6,840",   pos: true },
  { label: "DEBT RATIO",  val: "25.3%",     pos: true },
  { label: "INVESTMENTS", val: "8 assets",  pos: true },
  { label: "CASH FLOW",   val: "+$2,100",   pos: true },
  { label: "RETURNS",     val: "18.7% YTD", pos: true },
  { label: "SAVINGS",     val: "$31,500",   pos: true },
];

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "◈",
    title: "Asset Management",
    desc: "Track every investment across stocks, real estate, crypto, and more. Buy, sell, and monitor performance with real-time gain/loss calculations and full value history.",
    tags: ["Buy & Sell", "Value History", "Gain / Loss"],
    color: "#818cf8",
  },
  {
    icon: "⬡",
    title: "Liability Tracking",
    desc: "Manage all your debts — loans, mortgages, credit cards — with payment scheduling, EMI estimates, and payoff progress bars.",
    tags: ["Debt Payoff", "EMI Calculator", "Progress Bar"],
    color: "#f87171",
  },
  {
    icon: "◉",
    title: "Net Worth Chart",
    desc: "Interactive area chart showing assets, liabilities, and net worth over time. Filter by 1M, 3M, 6M, 1Y, or ALL with a unified timeline built from all your history snapshots.",
    tags: ["Time Ranges", "Area Chart", "Trend Analysis"],
    color: "#2dd4bf",
  },
  {
    icon: "⬘",
    title: "Transaction Log",
    desc: "Every buy, sell, payment, and balance update is automatically recorded. Filter by type, date range, or entity. Paginated history with expand-on-click details.",
    tags: ["Auto-Logged", "Filterable", "Paginated"],
    color: "#fbbf24",
  },
  {
    icon: "◍",
    title: "Portfolio Reports",
    desc: "Dual donut charts for current vs invested allocation. Sortable gain/loss table, best and worst performers highlighted, and a full liability summary — all in one view.",
    tags: ["Donut Charts", "Allocation", "Performance Table"],
    color: "#e2b55a",
  },
  {
    icon: "◬",
    title: "Inline Editing",
    desc: "Click any value directly in the table to edit it. No modal, no page reload. Update current asset value or outstanding debt balance instantly with Enter to confirm.",
    tags: ["Click-to-Edit", "Instant Save", "No Friction"],
    color: "#c084fc",
  },
  {
    icon: "◎",
    title: "Smart Sell Engine",
    desc: "Proportional cost-basis reduction on partial sells. Automatic realized gain/loss calculation. Full-exit detection with a confirmation badge before you commit.",
    tags: ["Cost Basis", "Realized Gains", "Partial Sell"],
    color: "#34d399",
  },
  {
    icon: "⬟",
    title: "Live Sidebar",
    desc: "Always-visible portfolio health donut, net worth, all-time gain, and live nav counters. Data refreshes automatically every 60 seconds — no manual reload needed.",
    tags: ["Auto-Refresh", "Health Score", "Live Counts"],
    color: "#38bdf8",
  },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { val: "8",    label: "MODULES" },
  { val: "30+",  label: "API ENDPOINTS" },
  { val: "100%", label: "AUTO-LOGGED" },
  { val: "∞",    label: "HISTORY" },
];

const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
function Tag({ label, color }) {
  return (
    <span style={{
      fontSize: 10.5,
      fontFamily: "'DM Mono', monospace",
      letterSpacing: "0.08em",
      color: C.text,
      background: `${color}1f`,
      border: `1px solid ${color}55`,
      padding: "3px 10px",
      borderRadius: 20,
    }}>{label}</span>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onLogin, onRegister,onFeatures, onDeveloper  }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { label: "Get started", id: "get-started" },
    { label: "Developers", id: "developer" },
    { label: "Features", id: "features" },
  ];

  const linkStyle = {
    fontSize: 13, color: C.body,
    fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
    letterSpacing: "0.02em", cursor: "pointer",
    transition: "color 0.15s", userSelect: "none",
  };

  return (
    <nav className="vf-nav" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 48px", height: 68,
      background: scrolled ? "rgba(7,8,13,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.borderSoft}` : "1px solid transparent",
      transition: "all 0.3s ease",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, color: "#041009",
        }}>◈</div>
        <span style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 20, color: C.text, letterSpacing: "-0.3px",
        }}>Maadalla</span>
      </div>

      {/* Links */}
      <div className="vf-nav-links" style={{ display: "flex", gap: 36, alignItems: "center" }}>
        {links.map((l) => (
  <span key={l.id} style={linkStyle}
    onClick={
      l.id === "features" && onFeatures ? onFeatures
      : l.id === "developer" && onDeveloper ? onDeveloper
      : () => scrollToId(l.id)
    }
    onMouseEnter={(e) => e.target.style.color = C.text}
    onMouseLeave={(e) => e.target.style.color = C.body}
  >{l.label}</span>
))}
      </div>

      {/* Auth */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onLogin} style={{
          padding: "9px 20px", background: "transparent",
          border: "1px solid rgba(255,255,255,0.22)", borderRadius: 8,
          color: C.text, fontSize: 13,
          fontFamily: "'DM Sans', sans-serif", fontWeight: 500, letterSpacing: "0.02em",
          cursor: "pointer", transition: "all 0.15s",
        }}
          onMouseEnter={(e) => { e.target.style.borderColor = C.accent; e.target.style.color = C.accent; }}
          onMouseLeave={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.22)"; e.target.style.color = C.text; }}
        >Log in</button>

        <button onClick={onRegister} style={{
          padding: "9px 20px",
          background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
          border: "none", borderRadius: 8,
          color: "#041009", fontSize: 13,
          fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em",
          fontWeight: 600, cursor: "pointer", transition: "opacity 0.15s",
        }}
          onMouseEnter={(e) => e.target.style.opacity = "0.85"}
          onMouseLeave={(e) => e.target.style.opacity = "1"}
        >Get Started</button>
      </div>
    </nav>
  );
}

// ─── Ticker strip ─────────────────────────────────────────────────────────────
function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{
      overflow: "hidden",
      borderTop: `1px solid ${C.borderSoft}`,
      borderBottom: `1px solid ${C.borderSoft}`,
      background: "#0a0c12", padding: "13px 0",
    }}>
      <div style={{
        display: "flex", gap: 48,
        animation: "ticker 30s linear infinite",
        width: "max-content",
      }}>
        {doubled.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span style={{
              fontSize: 11, letterSpacing: "0.12em", color: C.muted,
              fontFamily: "'DM Mono', monospace",
            }}>{item.label}</span>
            <span style={{
              fontSize: 13, fontFamily: "'DM Mono', monospace", fontWeight: 500,
              color: item.pos ? C.accent : C.negative,
            }}>{item.val}</span>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 14 }}>·</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onRegister }) {
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      textAlign: "center",
      padding: "120px 24px 60px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Grid bg */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(52,211,153,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(52,211,153,0.035) 1px, transparent 1px)
        `,
        backgroundSize: "52px 52px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 100%)",
      }} />

      {/* Radial glow */}
      <div style={{
        position: "absolute", top: "32%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 700, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "6px 16px",
        background: "rgba(52,211,153,0.08)",
        border: "1px solid rgba(52,211,153,0.3)",
        borderRadius: 20, marginBottom: 32,
        animation: "fadeUp 0.55s ease both",
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%", background: C.accent,
          animation: "pulse 2s ease-in-out infinite",
        }} />
        <span style={{
          fontSize: 11, fontFamily: "'DM Mono', monospace",
          letterSpacing: "0.14em", color: C.text,
        }}>PERSONAL FINANCE TRACKER</span>
      </div>

      {/* H1 */}
      <h1 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: "clamp(44px, 8vw, 88px)",
        color: C.text, lineHeight: 1.02,
        letterSpacing: "-2px", maxWidth: 820,
        marginBottom: 22,
        animation: "fadeUp 0.6s ease both 0.06s",
      }}>
        Your wealth,<br />
        <span style={{
          background: "linear-gradient(120deg, #34d399 0%, #2dd4bf 45%, #818cf8 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>crystal clear.</span>
      </h1>

      {/* Subhead */}
      <p style={{
        fontSize: "clamp(15px, 1.8vw, 18px)",
        color: C.body, maxWidth: 560,
        lineHeight: 1.7, marginBottom: 40,
        fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
        animation: "fadeUp 0.6s ease both 0.12s",
      }}>
        Track assets, liabilities, and net worth in one place.
        Smart sell engine, automatic transaction logging, and live portfolio health — built for people who care about every dollar.
      </p>

      {/* CTA */}
      <div style={{
        display: "flex", gap: 16, alignItems: "center",
        animation: "fadeUp 0.6s ease both 0.18s", flexWrap: "wrap", justifyContent: "center",
      }}>
        <button onClick={onRegister} style={{
          padding: "15px 34px",
          background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
          border: "none", borderRadius: 10,
          color: "#041009", fontSize: 14,
          fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em",
          fontWeight: 600, cursor: "pointer",
          boxShadow: "0 0 40px rgba(52,211,153,0.25)",
          transition: "box-shadow 0.2s",
        }}
          onMouseEnter={(e) => e.target.style.boxShadow = "0 0 64px rgba(52,211,153,0.4)"}
          onMouseLeave={(e) => e.target.style.boxShadow = "0 0 40px rgba(52,211,153,0.25)"}
        >Create free account →</button>
        <span style={{
          fontSize: 12, color: C.muted,
          fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em",
        }}>No credit card required</span>
      </div>

      {/* Stats */}
      <div style={{
        display: "flex", gap: 0, marginTop: 80,
        animation: "fadeUp 0.6s ease both 0.24s",
        flexWrap: "wrap", justifyContent: "center",
        border: `1px solid ${C.border}`, borderRadius: 14,
        background: "rgba(255,255,255,0.025)",
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            textAlign: "center", padding: "22px 40px",
            borderLeft: i === 0 ? "none" : `1px solid ${C.borderSoft}`,
          }}>
            <div style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 36, color: C.text, lineHeight: 1, letterSpacing: "-1px",
            }}>{s.val}</div>
            <div style={{
              fontSize: 10.5, color: C.muted,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.14em", marginTop: 8,
            }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function FeatureCard({ feature, visible, delay }) {
  const [hovered, setHovered] = useState(false);
  const { icon, title, desc, tags, color } = feature;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "28px 26px",
        background: hovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? `${color}66` : C.border}`,
        borderRadius: 16,
        cursor: "default",
        transition: "all 0.22s ease",
        transform: visible ? (hovered ? "translateY(-2px)" : "translateY(0)") : "translateY(22px)",
        opacity: visible ? 1 : 0,
        transitionDelay: hovered ? "0ms" : `${delay}ms`,
        boxShadow: hovered ? `0 10px 40px ${color}1a` : "none",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Top shimmer */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: hovered
          ? `linear-gradient(90deg, transparent, ${color}88, transparent)`
          : "transparent",
        transition: "background 0.3s",
      }} />

      {/* Icon */}
      <div style={{
        fontSize: 20, color,
        marginBottom: 16,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 44, height: 44, borderRadius: 11,
        background: `${color}1a`,
        border: `1px solid ${color}40`,
        transition: "transform 0.22s",
        transform: hovered ? "scale(1.08)" : "scale(1)",
      }}>{icon}</div>

      <h3 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 20, color: C.text,
        marginBottom: 10, lineHeight: 1.2, letterSpacing: "-0.2px",
        fontWeight: 400,
      }}>{title}</h3>

      <p style={{
        fontSize: 14, color: C.body,
        lineHeight: 1.65, marginBottom: 18,
        fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
      }}>{desc}</p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {tags.map((t, i) => <Tag key={i} label={t} color={color} />)}
      </div>
    </div>
  );
}

function FeaturesSection() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="features" ref={ref} className="vf-section" style={{ padding: "90px 48px 100px", maxWidth: 1160, margin: "0 auto" }}>
      <div style={{ marginBottom: 56, textAlign: "center" }}>
        <div style={{
          fontSize: 11, letterSpacing: "0.2em", color: C.accent,
          fontFamily: "'DM Mono', monospace", marginBottom: 14,
        }}>EVERYTHING YOU NEED</div>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "clamp(30px, 4.5vw, 48px)",
          color: C.text, letterSpacing: "-1px", lineHeight: 1.12,
          fontWeight: 400,
        }}>
          Built for complete<br />financial clarity
        </h2>
      </div>

      {/* Mosaic grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="vf-row vf-row-1" style={{ display: "grid", gridTemplateColumns: "1.65fr 1fr 1fr", gap: 14 }}>
          {FEATURES.slice(0, 3).map((f, i) => (
            <FeatureCard key={i} feature={f} visible={visible} delay={i * 75} />
          ))}
        </div>
        <div className="vf-row vf-row-2" style={{ display: "grid", gridTemplateColumns: "1fr 1.65fr", gap: 14 }}>
          {FEATURES.slice(3, 5).map((f, i) => (
            <FeatureCard key={i} feature={f} visible={visible} delay={225 + i * 75} />
          ))}
        </div>
        <div className="vf-row vf-row-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {FEATURES.slice(5, 8).map((f, i) => (
            <FeatureCard key={i} feature={f} visible={visible} delay={375 + i * 75} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CTASection({ onRegister, onLogin }) {
  return (
    <section id="get-started" style={{
      padding: "60px 24px 100px", textAlign: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600, height: 300, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(52,211,153,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: 560, margin: "0 auto", position: "relative",
        padding: "56px 44px",
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(52,211,153,0.25)",
        borderRadius: 22,
        boxShadow: "0 0 80px rgba(52,211,153,0.06)",
      }}>
        <div style={{
          fontSize: 11, letterSpacing: "0.2em", color: C.accent,
          fontFamily: "'DM Mono', monospace", marginBottom: 18,
        }}>START TODAY · FREE</div>

        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 38, color: C.text,
          letterSpacing: "-1px", lineHeight: 1.12, marginBottom: 16,
          fontWeight: 400,
        }}>
          Take control of<br />your finances
        </h2>

        <p style={{
          fontSize: 15, color: C.body,
          lineHeight: 1.7, marginBottom: 36,
          fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
        }}>
          Track every dollar, invest with confidence, and always know your net worth at a glance.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onRegister} style={{
            padding: "14px 30px",
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
            border: "none", borderRadius: 10,
            color: "#041009", fontSize: 14,
            fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em",
            fontWeight: 600, cursor: "pointer",
            boxShadow: "0 0 30px rgba(52,211,153,0.25)",
            transition: "opacity 0.18s",
          }}
            onMouseEnter={(e) => e.target.style.opacity = "0.85"}
            onMouseLeave={(e) => e.target.style.opacity = "1"}
          >Register — it's free</button>

          <button onClick={onLogin} style={{
            padding: "14px 30px", background: "transparent",
            border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10,
            color: C.text, fontSize: 14,
            fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em", fontWeight: 500,
            cursor: "pointer", transition: "all 0.18s",
          }}
            onMouseEnter={(e) => { e.target.style.borderColor = C.accent; e.target.style.color = C.accent; }}
            onMouseLeave={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.25)"; e.target.style.color = C.text; }}
          >Log in →</button>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ onLogin, onRegister, onFeatures }) {
  const linkStyle = {
    fontSize: 13, color: C.body,
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.02em", cursor: "pointer",
    transition: "color 0.15s",
  };

  return (
    <footer style={{
      borderTop: `1px solid ${C.borderSoft}`,
      padding: "40px 48px 32px",
    }}>
      <div style={{
        maxWidth: 1160, margin: "0 auto",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: 20,
      }}>
        {/* Logo */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, color: "#041009",
            }}>◈</div>
            <span style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 17, color: C.text,
            }}>Maadalla</span>
          </div>
          <p style={{ fontSize: 12, color: C.muted, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em" }}>
            © {new Date().getFullYear()} Maadalla · Personal Finance Tracker
          </p>
        </div>

     {/* Links */}
<div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center" }}>
  {["Features", "Privacy", "Terms", "Contact"].map((l) => (
    <span key={l} style={linkStyle}
      onClick={l === "Features" ? (onFeatures ?? (() => scrollToId("features"))) : undefined}
      onMouseEnter={(e) => e.target.style.color = C.accent}
      onMouseLeave={(e) => e.target.style.color = C.body}
    >{l}</span>
  ))}
</div>

        {/* Auth */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onLogin} style={{
            padding: "8px 18px", background: "transparent",
            border: "1px solid rgba(255,255,255,0.22)", borderRadius: 7,
            color: C.text, fontSize: 12.5,
            fontFamily: "'DM Sans', sans-serif", fontWeight: 500, letterSpacing: "0.02em",
            cursor: "pointer", transition: "all 0.15s",
          }}
            onMouseEnter={(e) => { e.target.style.borderColor = C.accent; e.target.style.color = C.accent; }}
            onMouseLeave={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.22)"; e.target.style.color = C.text; }}
          >Log in</button>

          <button onClick={onRegister} style={{
            padding: "8px 18px",
            background: "rgba(52,211,153,0.12)",
            border: "1px solid rgba(52,211,153,0.4)", borderRadius: 7,
            color: C.text, fontSize: 12.5,
            fontFamily: "'DM Sans', sans-serif", fontWeight: 500, letterSpacing: "0.02em",
            cursor: "pointer", transition: "background 0.15s",
          }}
            onMouseEnter={(e) => e.target.style.background = "rgba(52,211,153,0.24)"}
            onMouseLeave={(e) => e.target.style.background = "rgba(52,211,153,0.12)"}
          >Register</button>
        </div>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function HomePage({ onLogin, onRegister, onFeatures,onDeveloper  }) {
  const handleLogin    = onLogin    ?? (() => {});
  const handleRegister = onRegister ?? (() => {});

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      fontFamily: "'DM Sans', sans-serif",
      color: C.text,
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.45; transform: scale(0.8); }
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #07080d; }
        ::-webkit-scrollbar-thumb { background: #2a3142; border-radius: 99px; }
        button { font-family: inherit; }

        @media (max-width: 900px) {
          .vf-row { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .vf-nav { padding: 0 20px !important; }
          .vf-nav-links { display: none !important; }
          .vf-section { padding: 60px 20px 70px !important; }
          .vf-row { grid-template-columns: 1fr !important; }
        }
      `}</style>

<Navbar onLogin={handleLogin} onRegister={handleRegister} onFeatures={onFeatures} onDeveloper={onDeveloper} />      <Hero      onRegister={handleRegister} />
      <Ticker />
      <FeaturesSection />
      <CTASection onRegister={handleRegister} onLogin={handleLogin} />
      <Footer onLogin={handleLogin} onRegister={handleRegister} onFeatures={onFeatures} />
    </div>
  );
}