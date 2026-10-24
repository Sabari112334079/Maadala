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

  // Remember which tab the user was on
  useEffect(() => {
    try { localStorage.setItem(ACTIVE_KEY, active); } catch { /* ignore */ }
  }, [active]);

  // Start every public page at the top (e.g. after clicking "Features" in the footer)
  useEffect(() => {
    if (view !== "app") window.scrollTo(0, 0);
  }, [view]);

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
    <div style={{ display: "flex", width: "100%", background: "#07080d" }}>
      <Sidebar
        active={active}
        setActive={setActive}
        onLogout={handleLogout}
        onLogin={() => setView("login")}
        onRegister={() => setView("register")}
        user={user}
      />

      <div style={{
        marginLeft: 260,
        flex: 1,
        minWidth: 0,
        minHeight: "100vh",
        overflowY: "auto",
      }}>
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