import { useState, useEffect } from "react";
import Sidebar          from "./components/Sidebar";
import AssetManager     from "./pages/AssetManager";
import Liabilities      from "./pages/Liabilities";
import NetWorth         from "./pages/Networth";
import Transactions     from "./pages/Transactions";
import Reports          from "./pages/Reports";
import Profile          from "./pages/Profile";
import HomePage         from "./pages/Homepage";
import Features         from "./pages/Features";
import AuthPage         from "./pages/AuthPage";
import DeveloperSection from "./pages/DeveloperSection";

// Must match the key AuthPage writes on login/register
const TOKEN_KEY  = "Maadalla_token";
const ACTIVE_KEY = "Maadalla_active";
const ME_URL     = "http://localhost:5000/api/auth/me";

function App() {
  // view: "home" | "features" | "developer" | "login" | "register" | "app"
  const [view,     setView]     = useState("home");
  const [devBack,  setDevBack]  = useState("home"); // where "Back" goes from the developer view
  const [active,   setActive]   = useState(() => localStorage.getItem(ACTIVE_KEY) || "assets");
  const [user,     setUser]     = useState(null);
  const [checking, setChecking] = useState(true); // true until session restore finishes
  const [menuOpen, setMenuOpen] = useState(false); // mobile sidebar drawer

  // Remember which tab the user was on
  useEffect(() => {
    try { localStorage.setItem(ACTIVE_KEY, active); } catch { /* ignore */ }
  }, [active]);

  // Start every public page at the top (e.g. after clicking "Features" in the footer)
  useEffect(() => {
    if (view !== "app") window.scrollTo(0, 0);
  }, [view]);

  // Close the drawer whenever we leave the app view or switch tabs
  useEffect(() => {
    setMenuOpen(false);
  }, [view, active]);

  // Lock page scroll while the mobile drawer is open
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

  // If the window grows past the mobile breakpoint, make sure the drawer state resets
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const onChange = (e) => { if (e.matches) setMenuOpen(false); };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Re-hydrate user from stored token on page load
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        console.info("[session] no token in localStorage");
        setChecking(false);
        return;
      }

      try {
        const res = await fetch(ME_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Only clear the token when the server says it is invalid/expired.
        // A 404/500 means a backend problem, not a bad token.
        if (res.status === 401 || res.status === 403) {
          console.warn("[session] token rejected by server:", res.status);
          localStorage.removeItem(TOKEN_KEY);
          return;
        }
        if (!res.ok) {
          console.error("[session] /auth/me failed with status", res.status);
          return;
        }

        const data = await res.json();
        // Accept either { user: {...} } or the user object directly
        const restored = data?.user ?? data;

        if (restored && (restored.email || restored.id || restored._id)) {
          setUser(restored);
          setView("app");
        } else {
          console.error("[session] unexpected /auth/me response shape:", data);
        }
      } catch (error) {
        // Server unreachable — keep the token so a later refresh can still work
        console.error("[session] failed to restore session:", error);
      } finally {
        setChecking(false);
      }
    };

    restoreSession();
  }, []);

  const handleAuthSuccess = (data) => {
    setUser(data.user ?? data);
    setView("app");
    setActive("assets");
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ACTIVE_KEY);
    setUser(null);
    setActive("assets");
    setView("home");
  };

  // Called by Profile page after a successful name/email update
  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  // Open the developer view and remember which page to return to
  const openDeveloper = () => {
    setDevBack(view);
    setView("developer");
  };

  // Avoid flashing the home page while the session is being checked
  if (checking) {
    return (
      <div style={{
        minHeight: "100vh", background: "#07080d",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(255,255,255,0.62)",
        fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: "0.12em",
      }}>
        LOADING…
      </div>
    );
  }

  if (view === "home") {
    return (
      <HomePage
        onLogin={()    => setView("login")}
        onRegister={() => setView("register")}
        onFeatures={() => setView("features")}
        onDeveloper={openDeveloper}
      />
    );
  }

  if (view === "features") {
    return (
      <Features
        onLogin={()    => setView("login")}
        onRegister={() => setView("register")}
        onHome={()     => setView("home")}
        onDeveloper={openDeveloper}
      />
    );
  }

  if (view === "developer") {
    return (
      <DeveloperSection
        onBack={() => setView(devBack)}
        onHome={() => setView("home")}
        onFeatures={() => setView("features")}
        onLogin={() => setView("login")}
        onRegister={() => setView("register")}
      />
    );
  }

  if (view === "login" || view === "register") {
    return (
      <AuthPage
        initialMode={view}
        onAuthSuccess={handleAuthSuccess}
        onDeveloper={openDeveloper}
      />
    );
  }

  return (
    <div className="app-shell">
      <style>{`
        .app-shell { display: flex; width: 100%; min-height: 100vh; background: #07080d; }
        .app-content { margin-left: 260px; flex: 1; min-width: 0; min-height: 100vh; overflow-x: hidden; }

        /* Mobile top bar (hidden on desktop) */
        .app-topbar { display: none; }

        @media (max-width: 900px) {
          .app-content { margin-left: 0; padding-top: 58px; }
          .app-topbar {
            display: flex; align-items: center; gap: 12px;
            position: fixed; top: 0; left: 0; right: 0; z-index: 90; height: 58px;
            padding: 0 16px;
            background: rgba(7,8,13,0.92);
            -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
            border-bottom: 1px solid rgba(255,255,255,0.07);
          }
          .app-menu-btn {
            width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.14);
            color: #ffffff; cursor: pointer;
            transition: border-color .15s, color .15s;
          }
          .app-menu-btn:hover, .app-menu-btn:focus-visible { border-color: #34d399; color: #34d399; outline: none; }
          .app-brand { display: flex; align-items: center; gap: 9px; min-width: 0; }
          .app-brand-mark {
            width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            background: linear-gradient(135deg, #34d399, #0d9488);
            color: #041009; font-size: 13px;
          }
          .app-brand-name { font-family: 'DM Serif Display', serif; font-size: 19px; color: #ffffff; }
          .app-page-title {
            margin-left: auto; font-family: 'DM Mono', monospace; font-size: 11px;
            letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.62);
            white-space: nowrap;
          }
        }
        @media (max-width: 380px) { .app-page-title { display: none; } }
      `}</style>

      {/* Mobile top bar: menu button + brand + current page */}
      <header className="app-topbar">
        <button
          type="button"
          className="app-menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
        <div className="app-brand">
          <span className="app-brand-mark" aria-hidden="true">◈</span>
          <span className="app-brand-name">Maadalla</span>
        </div>
        <span className="app-page-title">{active}</span>
      </header>

      <Sidebar
        active={active}
        setActive={setActive}
        onLogout={handleLogout}
        onLogin={() => setView("login")}
        onRegister={() => setView("register")}
        user={user}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="app-content">
        {active === "assets"       && <AssetManager />}
        {active === "liabilities"  && <Liabilities />}
        {active === "networth"     && <NetWorth />}
        {active === "transactions" && <Transactions />}
        {active === "reports"      && <Reports />}
        {active === "profile"      && (
          <Profile
            user={user}
            onUserUpdate={handleUserUpdate}
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
  );
}

export default App;