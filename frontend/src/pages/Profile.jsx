import { useState } from "react";

const API = "http://localhost:5000/api/auth";

// ─── Theme (shared with HomePage / Transactions / Reports) ────────────────────
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
const TOKEN_KEYS = ["Maadalla_token", "vaultfolio_token", "maadalla_token", "token"];

function getToken() {
  for (const k of TOKEN_KEYS) {
    const v = localStorage.getItem(k);
    if (v) return v.replace(/^"|"$/g, "");
  }
  return "";
}

function getInitials(name = "") {
  return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() || "").slice(0, 2).join("") || "?";
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  const ok = type === "success";
  return (
    <div style={{
      position: "fixed", bottom: 32, right: 32, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 20px",
      background: ok ? "rgba(52,211,153,0.10)" : "rgba(248,113,113,0.10)",
      border: `1px solid ${ok ? "rgba(52,211,153,0.4)" : "rgba(248,113,113,0.4)"}`,
      borderRadius: 12,
      boxShadow: `0 12px 40px ${ok ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)"}`,
      backdropFilter: "blur(12px)",
      animation: "toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
      maxWidth: 340,
    }}>
      <span style={{ fontSize: 15, color: ok ? C.accent : C.negative }}>{ok ? "✓" : "⚠"}</span>
      <span style={{
        fontSize: 12, color: ok ? C.accent : C.negative,
        fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em",
      }}>{msg}</span>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, type = "text", value, onChange, placeholder, error, disabled }) {
  const [show, setShow] = useState(false);
  const [focus, setFocus] = useState(false);
  const t = type === "password" ? (show ? "text" : "password") : type;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontSize: 10.5, fontFamily: "'DM Mono', monospace",
        letterSpacing: "0.14em", color: error ? C.negative : focus ? C.accent : C.muted,
        marginBottom: 7, transition: "color 0.15s",
      }}>{label}</div>
      <div style={{ position: "relative" }}>
        <input
          type={t}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            width: "100%",
            padding: type === "password" ? "12px 44px 12px 14px" : "12px 14px",
            background: disabled ? "rgba(255,255,255,0.01)" : focus ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${error ? "rgba(248,113,113,0.6)" : focus ? "rgba(52,211,153,0.55)" : C.border}`,
            borderRadius: 10,
            color: disabled ? C.faint : C.text,
            fontSize: 13, fontFamily: "'DM Mono', monospace",
            outline: "none", transition: "all 0.18s",
            boxShadow: focus && !disabled ? "0 0 0 3px rgba(52,211,153,0.10)" : "none",
            cursor: disabled ? "not-allowed" : "text",
          }}
        />
        {type === "password" && (
          <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? "Hide password" : "Show password"} style={{
            position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: show ? C.accent : C.muted, padding: 2,
            display: "flex", transition: "color 0.15s",
          }}>
            {show
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: 11, color: C.negative, fontFamily: "'DM Mono', monospace", marginTop: 5 }}>{error}</p>}
    </div>
  );
}

// ─── Password strength bar ────────────────────────────────────────────────────
function StrengthBar({ password }) {
  if (!password) return null;
  let s = 0;
  if (password.length >= 8)          s++;
  if (/[A-Z]/.test(password))        s++;
  if (/[0-9]/.test(password))        s++;
  if (/[^a-zA-Z0-9]/.test(password)) s++;
  const colors = ["", "#f87171", "#fbbf24", "#34d399", "#2dd4bf"];
  const labels = ["", "Weak", "Fair", "Strong", "Very strong"];
  return (
    <div style={{ marginTop: -10, marginBottom: 18 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i <= s ? colors[s] : "rgba(255,255,255,0.08)",
            transition: "background 0.3s",
          }}/>
        ))}
      </div>
      <span style={{ fontSize: 10, color: colors[s], fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em" }}>
        {labels[s]}
      </span>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ children, delay = 0, danger = false }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${danger ? "rgba(248,113,113,0.22)" : C.border}`,
      borderRadius: 18, overflow: "hidden",
      animation: `fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both`,
      animationDelay: `${delay}ms`,
      position: "relative",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: danger
          ? "linear-gradient(90deg, transparent 0%, rgba(248,113,113,0.45) 50%, transparent 100%)"
          : "linear-gradient(90deg, transparent 0%, rgba(52,211,153,0.5) 50%, transparent 100%)",
      }}/>
      {children}
    </div>
  );
}

function SectionHead({ eyebrow, title, sub, danger = false }) {
  return (
    <div style={{ padding: "26px 28px 0" }}>
      <div style={{
        fontSize: 10.5, fontFamily: "'DM Mono', monospace",
        letterSpacing: "0.2em", color: danger ? C.negative : C.accent, marginBottom: 6,
      }}>{eyebrow}</div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: sub ? 4 : 20 }}>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 22, color: C.text, letterSpacing: "-0.4px", fontWeight: 400,
        }}>{title}</h2>
      </div>
      {sub && <p style={{ fontSize: 13, color: C.muted, fontWeight: 400, marginBottom: 20, lineHeight: 1.65 }}>{sub}</p>}
    </div>
  );
}

function SectionBody({ children }) {
  return <div style={{ padding: "0 28px 26px" }}>{children}</div>;
}

// ─── Avatar hero ──────────────────────────────────────────────────────────────
function AvatarHero({ name, email }) {
  const initials = getInitials(name);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 26, padding: "0 28px" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          position: "absolute", inset: -3, borderRadius: "50%",
          background: `conic-gradient(from 0deg, ${C.accent}, ${C.accentDark}, ${C.teal}, ${C.accent})`,
          animation: "spin 6s linear infinite",
        }}/>
        <div style={{
          position: "relative", width: 64, height: 64, borderRadius: "50%",
          background: "linear-gradient(135deg, #0f2a22, #07110e)",
          border: `2px solid ${C.bg}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'DM Serif Display', serif",
          fontSize: 22, color: C.accent, letterSpacing: "1px",
        }}>{initials}</div>
      </div>
      <div>
        <div style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 20, color: C.text, letterSpacing: "-0.4px", marginBottom: 4,
        }}>{name || "Your Name"}</div>
        <div style={{
          fontSize: 12, color: C.muted,
          fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em",
        }}>{email || "—"}</div>
      </div>
    </div>
  );
}

// ─── Account Info ─────────────────────────────────────────────────────────────
function AccountInfo({ user, onUserUpdate, toast }) {
  const [name,    setName]    = useState(user?.name  || "");
  const [email,   setEmail]   = useState(user?.email || "");
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  console.log("TOKEN SENT:", JSON.stringify(getToken()).slice(0, 40));
console.log("ALL STORAGE KEYS:", Object.keys(localStorage));

  const dirty = name !== (user?.name || "") || email !== (user?.email || "");

  const save = async () => {
    const e = {};
    if (!name.trim())                      e.name  = "Name is required";
    if (!email.trim())                     e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const res  = await fetch(`${API}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      onUserUpdate?.(data.user);
      toast("Profile updated", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section delay={60}>
      <SectionHead eyebrow="01 — ACCOUNT" title="Personal Information" />
      <AvatarHero name={name} email={email} />
      <SectionBody>
        <div className="profile-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="FULL NAME"      value={name}  onChange={setName}  placeholder="Your full name"   error={errors.name} />
          <Field label="EMAIL ADDRESS"  type="email" value={email} onChange={setEmail} placeholder="you@example.com" error={errors.email} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Btn
            onClick={save}
            disabled={!dirty || loading}
            loading={loading}
            color={C.accent}
            label="Save changes"
          />
        </div>
      </SectionBody>
    </Section>
  );
}

// ─── Change Password ──────────────────────────────────────────────────────────
function ChangePassword({ toast }) {
  const [cur,     setCur]     = useState("");
  const [next,    setNext]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const save = async () => {
    const e = {};
    if (!cur)               e.cur     = "Required";
    if (!next)              e.next    = "Required";
    else if (next.length < 8) e.next  = "Min 8 characters";
    if (next !== confirm)   e.confirm = "Passwords don't match";
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const res  = await fetch(`${API}/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ currentPassword: cur, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setCur(""); setNext(""); setConfirm("");
      toast("Password changed", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section delay={130}>
      <SectionHead eyebrow="02 — SECURITY" title="Change Password" />
      <SectionBody>
        <Field label="CURRENT PASSWORD" type="password" value={cur} onChange={setCur} placeholder="Current password" error={errors.cur} />
        <div className="profile-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <Field label="NEW PASSWORD" type="password" value={next} onChange={setNext} placeholder="Min. 8 characters" error={errors.next} />
            <StrengthBar password={next} />
          </div>
          <Field label="CONFIRM NEW PASSWORD" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat new password" error={errors.confirm} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Btn onClick={save} loading={loading} color={C.teal} label="Update password" />
        </div>
      </SectionBody>
    </Section>
  );
}

// ─── Stats strip ─────────────────────────────────────────────────────────────
function StatsStrip({ user }) {
  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";
  const shortId = user?.id ? `#${String(user.id).slice(-6).toUpperCase()}` : "—";
  const items = [
    { label: "MEMBER SINCE", val: joined },
    { label: "PLAN",         val: "Personal" },
    { label: "ACCOUNT ID",   val: shortId },
  ];
  return (
    <div className="profile-stats" style={{
      display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10,
      animation: "fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both",
      animationDelay: "10ms",
      marginBottom: 14,
    }}>
      {items.map((item, i) => (
        <div key={i} style={{
          padding: "14px 18px",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
        }}>
          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: C.muted, fontFamily: "'DM Mono', monospace", marginBottom: 7 }}>
            {item.label}
          </div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: C.accent, letterSpacing: "-0.3px" }}>
            {item.val}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Danger Zone ─────────────────────────────────────────────────────────────
function DangerZone({ onLogout, toast }) {
  const [open,    setOpen]    = useState(false);
  const [text,    setText]    = useState("");
  const [loading, setLoading] = useState(false);

  const del = async () => {
    if (text !== "DELETE") return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Delete failed");
      }
TOKEN_KEYS.forEach((k) => localStorage.removeItem(k));
localStorage.removeItem("user");
localStorage.removeItem("Maadalla_active");      onLogout?.();
    } catch (err) {
      toast(err.message, "error");
      setLoading(false);
    }
  };

  return (
    <Section delay={200} danger>
      <SectionHead
        eyebrow="03 — DANGER ZONE"
        title="Delete Account"
        danger
        sub="Permanently erase your account and all portfolio data — assets, liabilities, transactions. This cannot be undone."
      />
      <SectionBody>
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            style={{
              padding: "10px 22px",
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.35)",
              borderRadius: 10, color: C.negative,
              fontSize: 12, fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.08em", cursor: "pointer", transition: "all 0.18s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.16)"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.6)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(248,113,113,0.08)"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.35)"; }}
          >
            Delete my account
          </button>
        ) : (
          <div style={{
            padding: 18,
            background: "rgba(248,113,113,0.05)",
            border: "1px solid rgba(248,113,113,0.25)",
            borderRadius: 12,
            animation: "fadeUp 0.25s ease both",
          }}>
            <p style={{ fontSize: 12, color: C.body, fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em", marginBottom: 12 }}>
              Type <span style={{ color: C.negative }}>DELETE</span> to confirm permanently deleting your account.
            </p>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="DELETE"
              style={{
                width: "100%", padding: "10px 14px", marginBottom: 12,
                background: "rgba(248,113,113,0.05)",
                border: "1px solid rgba(248,113,113,0.35)",
                borderRadius: 9, color: C.negative,
                fontSize: 13, fontFamily: "'DM Mono', monospace",
                letterSpacing: "0.15em", outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={del}
                disabled={text !== "DELETE" || loading}
                style={{
                  padding: "9px 22px",
                  background: text === "DELETE" && !loading ? C.negative : "rgba(248,113,113,0.10)",
                  border: "none", borderRadius: 9,
                  color: text === "DELETE" && !loading ? "#1a0505" : "rgba(248,113,113,0.5)",
                  fontSize: 12, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em",
                  fontWeight: 600, cursor: text !== "DELETE" || loading ? "not-allowed" : "pointer",
                  transition: "all 0.18s",
                }}
              >{loading ? "Deleting…" : "Confirm delete"}</button>
              <button
                onClick={() => { setOpen(false); setText(""); }}
                style={{
                  padding: "9px 20px", background: "transparent",
                  border: "1px solid rgba(255,255,255,0.22)", borderRadius: 9,
                  color: C.text, fontSize: 12, fontFamily: "'DM Mono', monospace",
                  letterSpacing: "0.07em", cursor: "pointer", transition: "all 0.18s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; e.currentTarget.style.color = C.text; }}
              >Cancel</button>
            </div>
          </div>
        )}
      </SectionBody>
    </Section>
  );
}

// ─── Generic button ───────────────────────────────────────────────────────────
function Btn({ onClick, disabled, loading, color, label }) {
  const [hover, setHover] = useState(false);
  const active = !disabled && !loading;
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "10px 26px",
        background: active
          ? hover
            ? `linear-gradient(135deg, ${color}dd, ${C.accentDark}dd)`
            : `linear-gradient(135deg, ${color}, ${C.accentDark})`
          : `${color}14`,
        border: active ? "none" : `1px solid ${color}33`,
        borderRadius: 10,
        color: active ? "#041009" : `${color}80`,
        fontSize: 12, fontFamily: "'DM Mono', monospace",
        letterSpacing: "0.08em", fontWeight: 600,
        cursor: active ? "pointer" : "not-allowed",
        transition: "all 0.18s",
        boxShadow: active ? `0 0 28px ${color}33` : "none",
        transform: active && hover ? "translateY(-1px)" : "none",
      }}
    >
      {loading ? "Saving…" : label}
    </button>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Profile({ user, onUserUpdate, onLogout }) {
  const [toastMsg,  setToastMsg]  = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 4000);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      padding: "52px 52px 100px",
      fontFamily: "'DM Sans', sans-serif",
      color: C.text,
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(14px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        input::placeholder { color: rgba(255,255,255,0.30); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #07080d inset !important;
          -webkit-text-fill-color: #ffffff !important;
        }
        button:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #07080d; }
        ::-webkit-scrollbar-thumb { background: #2a3142; border-radius: 99px; }
        button { font-family: inherit; }

        @media (max-width: 640px) {
          .profile-pad   { padding: 36px 20px 80px !important; }
          .profile-grid  { grid-template-columns: 1fr !important; }
          .profile-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Background grid (same as home hero) */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(52,211,153,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(52,211,153,0.035) 1px, transparent 1px)
        `,
        backgroundSize: "52px 52px",
        maskImage: "radial-gradient(ellipse 70% 50% at 50% 0%, black 0%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 0%, black 0%, transparent 100%)",
      }}/>

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: -140, left: "50%", transform: "translateX(-50%)",
        width: 800, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 0,
      }}/>

      <div className="profile-pad" style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 38, animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both" }}>
          <div style={{
            fontSize: 11, letterSpacing: "0.2em", color: C.accent,
            fontFamily: "'DM Mono', monospace", marginBottom: 10,
          }}>SETTINGS · PROFILE</div>

          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 48, color: C.text, fontWeight: 400,
            letterSpacing: "-2px", lineHeight: 1,
            marginBottom: 10,
          }}>
            {user?.name
              ? <>{user.name.split(" ")[0]}<span style={gradText}>'s profile.</span></>
              : <>Your <span style={gradText}>account.</span></>
            }
          </h1>

          <p style={{ fontSize: 13, color: C.body, fontWeight: 400, lineHeight: 1.6 }}>
            {user?.email || "Manage your identity, security, and account settings."}
          </p>
        </div>

        <StatsStrip user={user} />

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <AccountInfo user={user} onUserUpdate={onUserUpdate} toast={showToast} />
          <ChangePassword toast={showToast} />
          <DangerZone onLogout={onLogout} toast={showToast} />
        </div>

      </div>

      <Toast msg={toastMsg} type={toastType} />
    </div>
  );
}

const gradText = {
  fontStyle: "italic",
  background: "linear-gradient(120deg, #34d399 0%, #2dd4bf 45%, #818cf8 100%)",
  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};