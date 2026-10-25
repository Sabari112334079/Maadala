import { useState } from "react";

const url = import.meta.env.VITE_API_URL;
if (!url) throw new Error("VITE_API_URL is not set. Add it to your .env file and restart Vite.");

export const API_BASE  = url.replace(/\/+$/, "");
export const TOKEN_KEY = "Maadalla_token";
// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  bg:         "#07080d",
  text:       "#ffffff",
  body:       "rgba(255,255,255,0.82)",
  muted:      "rgba(255,255,255,0.62)",
  faint:      "rgba(255,255,255,0.40)",
  border:     "rgba(255,255,255,0.14)",
  borderSoft: "rgba(255,255,255,0.08)",
  accent:     "#34d399",
  accentDark: "#0d9488",
  negative:   "#f87171",
};

// ─── Decorative left-panel stats (sample figures) ─────────────────────────────
const PANEL_STATS = [
  { label: "PORTFOLIO HEALTH", val: "94%",     color: "#34d399" },
  { label: "NET WORTH",        val: "$84,200", color: "#ffffff" },
  { label: "TOTAL ASSETS",     val: "$128K",   color: "#a5b4fc" },
  { label: "DEBT CLEARED",     val: "67%",     color: "#5eead4" },
];

const FEATURES_LIST = [
  "Asset buy / sell with cost-basis tracking",
  "Automatic transaction logging",
  "Net worth chart with full history",
  "Live portfolio health sidebar",
  "Liability payoff progress & EMI",
  "Donut allocation reports",
];

// ─── Input field component ────────────────────────────────────────────────────
function Field({ label, type = "text", value, onChange, placeholder, error, icon }) {
  const [focused, setFocused] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const inputType = type === "password" ? (showPw ? "text" : "password") : type;

  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: "block",
        fontSize: 11, letterSpacing: "0.12em",
        color: error ? C.negative : focused ? C.accent : C.body,
        fontFamily: "'DM Mono', monospace",
        marginBottom: 8,
        transition: "color 0.15s",
      }}>{label}</label>

      <div style={{ position: "relative" }}>
        {icon && (
          <div style={{
            position: "absolute", left: 14, top: "50%",
            transform: "translateY(-50%)",
            color: focused ? C.accent : C.muted,
            pointerEvents: "none",
            transition: "color 0.15s",
          }}>{icon}</div>
        )}

        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: icon ? "14px 44px 14px 42px" : "14px 44px 14px 16px",
            background: focused ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${error ? C.negative : focused ? "rgba(52,211,153,0.6)" : C.border}`,
            borderRadius: 10,
            color: C.text,
            fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
            outline: "none",
            transition: "all 0.18s",
            boxShadow: focused ? "0 0 0 3px rgba(52,211,153,0.12)" : "none",
          }}
        />

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            aria-label={showPw ? "Hide password" : "Show password"}
            style={{
              position: "absolute", right: 13, top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none",
              color: C.muted, cursor: "pointer",
              padding: 2, display: "flex",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = C.accent}
            onMouseLeave={(e) => e.currentTarget.style.color = C.muted}
          >
            {showPw ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>

      {error && (
        <p style={{
          fontSize: 12, color: C.negative,
          fontFamily: "'DM Sans', sans-serif",
          marginTop: 6, letterSpacing: "0.01em",
        }}>{error}</p>
      )}
    </div>
  );
}

// ─── Left decorative panel ────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="vf-left" style={{
      width: 420, flexShrink: 0,
      background: "linear-gradient(160deg, #0a121a 0%, #060b11 100%)",
      borderRight: `1px solid ${C.borderSoft}`,
      padding: "52px 44px",
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      {/* Grid bg */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(52,211,153,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(52,211,153,0.035) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        maskImage: "radial-gradient(ellipse 90% 90% at 30% 40%, black 0%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 90% 90% at 30% 40%, black 0%, transparent 100%)",
      }} />

      {/* Glow blob */}
      <div style={{
        position: "absolute", top: -60, left: -60,
        width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(52,211,153,0.10) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 52, position: "relative" }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, color: "#041009",
        }}>◈</div>
        <span style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 22, color: C.text, letterSpacing: "-0.3px",
        }}>Maadalla</span>
      </div>

      {/* Headline */}
      <div style={{ position: "relative", flex: 1 }}>
        <p style={{
          fontSize: 11, letterSpacing: "0.18em", color: C.accent,
          fontFamily: "'DM Mono', monospace", marginBottom: 14,
        }}>PERSONAL FINANCE TRACKER</p>

        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 38, color: C.text, fontWeight: 400,
          lineHeight: 1.1, letterSpacing: "-0.8px",
          marginBottom: 32,
        }}>
          Know every dollar.<br />
          <span style={{
            background: "linear-gradient(120deg, #34d399, #2dd4bf)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>Grow every cent.</span>
        </h2>

        {/* Feature list */}
        <div style={{ marginBottom: 40 }}>
          {FEATURES_LIST.map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              marginBottom: 13,
              animation: `fadeUp 0.5s ease both ${i * 60}ms`,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: "rgba(52,211,153,0.16)",
                border: "1px solid rgba(52,211,153,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 1,
                fontSize: 10, color: C.accent,
              }}>✓</div>
              <span style={{
                fontSize: 14, color: C.body,
                fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
                lineHeight: 1.5,
              }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Stats grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}>
          {PANEL_STATS.map((s, i) => (
            <div key={i} style={{
              padding: "14px 16px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${C.borderSoft}`,
              borderRadius: 10,
              animation: `fadeUp 0.5s ease both ${300 + i * 60}ms`,
            }}>
              <div style={{
                fontSize: 10, color: C.muted,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "0.1em", marginBottom: 6,
              }}>{s.label}</div>
              <div style={{
                fontSize: 19, color: s.color,
                fontFamily: "'DM Serif Display', serif",
                letterSpacing: "-0.5px",
              }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shared bits ──────────────────────────────────────────────────────────────
function Eyebrow({ children }) {
  return (
    <p style={{
      fontSize: 11, letterSpacing: "0.18em", color: C.accent,
      fontFamily: "'DM Mono', monospace", marginBottom: 12,
    }}>{children}</p>
  );
}

function Title({ children }) {
  return (
    <h1 style={{
      fontFamily: "'DM Serif Display', serif",
      fontSize: 38, color: C.text, fontWeight: 400,
      letterSpacing: "-0.8px", lineHeight: 1.1, marginBottom: 10,
    }}>{children}</h1>
  );
}

function Subtitle({ children, mb = 34 }) {
  return (
    <p style={{
      fontSize: 15, color: C.body,
      fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
      marginBottom: mb, lineHeight: 1.6,
    }}>{children}</p>
  );
}

function ErrorBanner({ message }) {
  return (
    <div role="alert" style={{
      padding: "11px 14px", marginBottom: 20,
      background: "rgba(248,113,113,0.10)",
      border: "1px solid rgba(248,113,113,0.35)",
      borderRadius: 8,
      fontSize: 13, color: "#fecaca",
      fontFamily: "'DM Sans', sans-serif",
    }}>{message}</div>
  );
}

const submitStyle = (loading) => ({
  width: "100%", padding: "15px",
  background: loading ? "rgba(52,211,153,0.4)" : `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
  border: "none", borderRadius: 10,
  color: "#041009", fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  letterSpacing: "0.02em", fontWeight: 600,
  cursor: loading ? "not-allowed" : "pointer",
  transition: "all 0.18s",
  boxShadow: loading ? "none" : "0 0 30px rgba(52,211,153,0.22)",
});

const switchTextStyle = {
  textAlign: "center",
  fontSize: 13.5, color: C.body,
  fontFamily: "'DM Sans', sans-serif",
};

const switchLinkStyle = {
  color: C.accent, cursor: "pointer", fontWeight: 500,
  borderBottom: "1px solid transparent",
  transition: "border-color 0.15s",
};

// ─── Login form ───────────────────────────────────────────────────────────────
function LoginForm({ onSuccess, onSwitch }) {
  const [fields,     setFields]     = useState({ email: "", password: "" });
  const [errors,     setErrors]     = useState({});
  const [loading,    setLoading]    = useState(false);
  const [serverErr,  setServerErr]  = useState("");

  const set = (k) => (v) => setFields((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!fields.email)    e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(fields.email)) e.email = "Enter a valid email";
    if (!fields.password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    setServerErr("");
    try {
      const res  = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fields.email, password: fields.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      if (data.token) localStorage.setItem("Maadalla_token", data.token);
      onSuccess(data);
    } catch (err) {
      setServerErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div style={{ animation: "fadeUp 0.45s ease both" }} onKeyDown={handleKeyDown}>
      <Eyebrow>WELCOME BACK</Eyebrow>
      <Title>Log in to your<br />portfolio</Title>
      <Subtitle>Track your wealth in real time.</Subtitle>

      {serverErr && <ErrorBanner message={serverErr} />}

      <Field
        label="EMAIL ADDRESS"
        type="email"
        value={fields.email}
        onChange={set("email")}
        placeholder="you@example.com"
        error={errors.email}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        }
      />

      <Field
        label="PASSWORD"
        type="password"
        value={fields.password}
        onChange={set("password")}
        placeholder="••••••••"
        error={errors.password}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        }
      />

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -6, marginBottom: 24 }}>
        <span style={{
          fontSize: 13, color: C.body,
          fontFamily: "'DM Sans', sans-serif",
          cursor: "pointer", transition: "color 0.15s",
        }}
          onMouseEnter={(e) => e.target.style.color = C.accent}
          onMouseLeave={(e) => e.target.style.color = C.body}
        >Forgot password?</span>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={submitStyle(loading)}
        onMouseEnter={(e) => { if (!loading) e.target.style.boxShadow = "0 0 50px rgba(52,211,153,0.38)"; }}
        onMouseLeave={(e) => { e.target.style.boxShadow = loading ? "none" : "0 0 30px rgba(52,211,153,0.22)"; }}
      >
        {loading ? "Logging in…" : "Log in →"}
      </button>

      <p style={{ ...switchTextStyle, marginTop: 26 }}>
        No account?{" "}
        <span onClick={onSwitch} style={switchLinkStyle}
          onMouseEnter={(e) => e.target.style.borderColor = C.accent}
          onMouseLeave={(e) => e.target.style.borderColor = "transparent"}
        >Create one →</span>
      </p>
    </div>
  );
}

// ─── Register form ────────────────────────────────────────────────────────────
function RegisterForm({ onSuccess, onSwitch }) {
  const [fields,    setFields]    = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [serverErr, setServerErr] = useState("");

  const set = (k) => (v) => setFields((f) => ({ ...f, [k]: v }));

  // Password strength
  const strength = (() => {
    const p = fields.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#f87171", "#fbbf24", "#34d399", "#2dd4bf"][strength];

  const validate = () => {
    const e = {};
    if (!fields.name)     e.name     = "Name is required";
    if (!fields.email)    e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(fields.email)) e.email = "Enter a valid email";
    if (!fields.password) e.password = "Password is required";
    else if (fields.password.length < 8) e.password = "Minimum 8 characters";
    if (fields.password !== fields.confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    setServerErr("");
    try {
      const res  = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fields.name, email: fields.email, password: fields.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      if (data.token) localStorage.setItem("Maadalla_token", data.token);
      onSuccess(data);
    } catch (err) {
      setServerErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div style={{ animation: "fadeUp 0.45s ease both" }} onKeyDown={handleKeyDown}>
      <Eyebrow>CREATE ACCOUNT</Eyebrow>
      <Title>Start tracking<br />your wealth</Title>
      <Subtitle mb={30}>Free forever. No credit card required.</Subtitle>

      {serverErr && <ErrorBanner message={serverErr} />}

      <Field
        label="FULL NAME"
        value={fields.name}
        onChange={set("name")}
        placeholder="Your full name"
        error={errors.name}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        }
      />

      <Field
        label="EMAIL ADDRESS"
        type="email"
        value={fields.email}
        onChange={set("email")}
        placeholder="you@example.com"
        error={errors.email}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        }
      />

      <Field
        label="PASSWORD"
        type="password"
        value={fields.password}
        onChange={set("password")}
        placeholder="Min. 8 characters"
        error={errors.password}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        }
      />

      {/* Password strength bar */}
      {fields.password && (
        <div style={{ marginTop: -10, marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 99,
                background: i <= strength ? strengthColor : "rgba(255,255,255,0.12)",
                transition: "background 0.25s",
              }} />
            ))}
          </div>
          <div style={{
            fontSize: 11, color: strengthColor,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: "0.1em",
            transition: "color 0.25s",
          }}>{strengthLabel}</div>
        </div>
      )}

      <Field
        label="CONFIRM PASSWORD"
        type="password"
        value={fields.confirm}
        onChange={set("confirm")}
        placeholder="••••••••"
        error={errors.confirm}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        }
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ ...submitStyle(loading), marginTop: 4 }}
        onMouseEnter={(e) => { if (!loading) e.target.style.boxShadow = "0 0 50px rgba(52,211,153,0.38)"; }}
        onMouseLeave={(e) => { e.target.style.boxShadow = loading ? "none" : "0 0 30px rgba(52,211,153,0.22)"; }}
      >
        {loading ? "Creating account…" : "Create account →"}
      </button>

      <p style={{ ...switchTextStyle, marginTop: 22 }}>
        Already have an account?{" "}
        <span onClick={onSwitch} style={switchLinkStyle}
          onMouseEnter={(e) => e.target.style.borderColor = C.accent}
          onMouseLeave={(e) => e.target.style.borderColor = "transparent"}
        >Log in →</span>
      </p>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function AuthPage({ initialMode = "login", onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // "login" | "register"

  const handleSuccess = (data) => {
    if (onAuthSuccess) onAuthSuccess(data);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: C.bg,
      fontFamily: "'DM Sans', sans-serif",
      color: C.text,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        input::placeholder { color: rgba(255,255,255,0.38); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #0c141d inset !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffffff;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #07080d; }
        ::-webkit-scrollbar-thumb { background: #2a3142; border-radius: 99px; }
        button { font-family: inherit; }

        @media (max-width: 900px) {
          .vf-left { display: none !important; }
        }
      `}</style>

      <LeftPanel />

      {/* Right form panel */}
      <div style={{
        flex: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
        overflowY: "auto",
        background: C.bg,
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {mode === "login" ? (
            <LoginForm
              key="login"
              onSuccess={handleSuccess}
              onSwitch={() => setMode("register")}
            />
          ) : (
            <RegisterForm
              key="register"
              onSuccess={handleSuccess}
              onSwitch={() => setMode("login")}
            />
          )}
        </div>
      </div>
    </div>
  );
}