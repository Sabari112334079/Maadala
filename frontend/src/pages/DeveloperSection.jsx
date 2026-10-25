import { useEffect, useRef, useState } from "react";

/* ───────────── Configurable data ───────────── */
const DEVELOPER = {
  name: "Sabari Ragu",
  firstName: "Sabari",
  role: "Full Stack & Desktop Developer",
  location: "Tamil Nadu, India",
  // Default image (served from /public/images). Override it with the `image` prop.
  imageUrl: "/developer.png",
  email: "sabariragu2006@gmail.com",
  bio: "Hi, I'm Sabari — a developer passionate about building practical web applications that solve real-world problems. Maadalla is my personal finance tracking project, built to make asset management, liability tracking, and net worth analysis easier through a unified, intuitive interface.",
  availability: "Open to Developer Opportunities",
  stack: ["React.js", "Node.js", "MongoDB"],
};

const LINKS = [
  { id: "github", label: "GitHub", handle: "sabariragu2006", href: "https://github.com/sabariragu2006" },
  { id: "linkedin", label: "LinkedIn", handle: "in/sabariragu", href: "https://www.linkedin.com/in/sabariragu/" },
  { id: "globe", label: "Portfolio", handle: "sabariragu2006.netlify.app", href: "https://sabariragu2006.netlify.app/" },
];

const TRUST = ["Open to freelance", "Offline-capable apps", "AI-powered solutions", "SQLite specialist"];

const STATS = [
  { value: "3+", label: "PROJECTS" },
  { value: "AI", label: "INTEGRATED" },
  { value: "6+", label: "TECH STACKS" },
  { value: "Open", label: "TO FREELANCE" },
];

const SKILLS = [
  { icon: "globe", label: "Frontend", items: ["React.js", "JavaScript", "HTML", "CSS"] },
  { icon: "code", label: "Backend", items: ["Node.js", "Express.js", "REST APIs", "MERN Stack"] },
  { icon: "db", label: "Database", items: ["MongoDB", "SQLite", "SQL"] },
  { icon: "monitor", label: "Desktop", items: ["C#", "WPF", "WinForms", ".NET Framework"] },
  { icon: "cpu", label: "AI & Automation", items: ["Gemini AI API", "OCR (Tesseract)", "AI Integration"] },
  { icon: "tool", label: "Tools", items: ["Git", "GitHub", "Visual Studio", "VS Code"] },
];

const PROJECTS = [
  {
    id: "rsinfotech",
    glyph: "◈",
    name: "RS Infotech",
    tagline: "Business Website & Local SEO",
    desc: "A professional website with local SEO for a Kanchipuram security services business, built to help nearby customers find and contact them.",
    tech: ["Web Development", "Local SEO", "Responsive Design"],
    badge: "Live · Client Website",
    liveUrl: "https://rsinfotech.in/",
  },
  {
    id: "thugil",
    glyph: "⬡",
    name: "Thugil ERP",
    tagline: "Textile Shop Management",
    desc: "Offline-first desktop ERP for Indian textile businesses, covering billing, stock and customer records.",
    tech: ["C#", "WPF", ".NET", "SQLite", "MVVM"],
    badge: "Desktop App",
    downloadUrl: "/downloads/textileshop.exe",
    githubUrl: "https://github.com/sabariragu2006/",
  },
  {
    id: "babytech",
    glyph: "◉",
    name: "Baby Tech",
    tagline: "Web Development & SEO Services",
    desc: "My web development and local SEO services site, showcasing the websites and digital solutions I build for small businesses.",
    tech: ["React.js", "Web Development", "Local SEO"],
    badge: "Live · Website",
    liveUrl: "https://baby-tech.netlify.app/",
  },
];

const HIGHLIGHTS = [
  "Full-stack application development",
  "Financial data visualization and tracking",
  "REST API integration and database management",
];

const OFFERS = [
  "Custom desktop & web applications",
  "AI-integrated tools and automation",
  "Database design and management",
];

/* ───────────── Inline icons (no dependency) ───────────── */
const ICONS = {
  github: <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />,
  linkedin: <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />,
  globe: <><circle cx="12" cy="12" r="9.5" /><path d="M2.5 12h19M12 2.5c2.6 2.7 4 6 4 9.5s-1.4 6.8-4 9.5c-2.6-2.7-4-6-4-9.5s1.4-6.8 4-9.5Z" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  code: <><path d="m8 8-4 4 4 4" /><path d="m16 8 4 4-4 4" /><path d="m13.5 5-3 14" /></>,
  db: <><ellipse cx="12" cy="5.5" rx="8" ry="3" /><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>,
  monitor: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  cpu: <><rect x="6" y="6" width="12" height="12" rx="2" /><rect x="9.5" y="9.5" width="5" height="5" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></>,
  tool: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  external: <><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  download: <><path d="M12 4v11" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></>,
  pin: <><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  shield: <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6L12 3Z" />,
};
const FILLED = new Set(["github", "linkedin"]);

function Icon({ name, size = 16 }) {
  const filled = FILLED.has(name);
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  );
}

/* ───────────── Scoped plain CSS ───────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');

/* Neutralise Vite's default #root styles so the page uses the full width */
html, body { width: 100%; margin: 0; padding: 0; background: #07080d; }
#root { width: 100%; max-width: none; margin: 0; padding: 0; text-align: left; }

.dv-root {
  --bg: #07080d;
  --accent: #34d399;
  --accent-dark: #0d9488;
  --text: #ffffff;
  --body: rgba(255,255,255,0.78);
  --muted: rgba(255,255,255,0.5);
  --border: rgba(255,255,255,0.09);
  --border-soft: rgba(255,255,255,0.06);
  --card: rgba(255,255,255,0.03);
  --serif: 'DM Serif Display', Georgia, serif;
  --mono: 'DM Mono', ui-monospace, monospace;
  --sans: 'DM Sans', system-ui, sans-serif;

  position: relative;
  isolation: isolate;
  display: block;
  width: 100%;
  min-width: 0;
  overflow-x: clip;
  min-height: 100vh;
  background: var(--bg);
  color: var(--body);
  font-family: var(--sans);
  line-height: 1.6;
  text-align: left;
}
.dv-root *, .dv-root *::before, .dv-root *::after { box-sizing: border-box; }
.dv-root h1, .dv-root h2, .dv-root h3, .dv-root p, .dv-root ul { margin: 0; padding: 0; }
.dv-root ul { list-style: none; }
.dv-root a { text-decoration: none; color: inherit; }
.dv-root button { font-family: inherit; cursor: pointer; }
.dv-root main { display: block; width: 100%; }

/* background */
.dv-grid-bg {
  position: absolute; inset: 0; z-index: -2; pointer-events: none;
  background-image:
    linear-gradient(rgba(52,211,153,0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(52,211,153,0.035) 1px, transparent 1px);
  background-size: 52px 52px;
  -webkit-mask-image: radial-gradient(ellipse 80% 45% at 50% 18%, #000 0%, transparent 100%);
  mask-image: radial-gradient(ellipse 80% 45% at 50% 18%, #000 0%, transparent 100%);
}
.dv-glow {
  position: absolute; z-index: -1; pointer-events: none;
  top: 40px; left: 50%; transform: translateX(-50%);
  width: min(760px, 120vw); height: 460px; border-radius: 50%;
  background: radial-gradient(circle, rgba(52,211,153,0.09) 0%, transparent 65%);
}

.dv-wrap { width: 100%; max-width: 1160px; margin: 0 auto; padding: 0 48px; }

/* top bar */
.dv-topbar {
  position: sticky; top: 0; z-index: 20; height: 68px; width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px;
  background: rgba(7,8,13,0.88);
  -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-soft);
}
.dv-brand { display: flex; align-items: center; gap: 10px; }
.dv-brand-mark {
  width: 32px; height: 32px; border-radius: 8px; display: grid; place-items: center;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: #041009; font-size: 15px;
}
.dv-brand-name { font-family: var(--serif); font-size: 20px; color: var(--text); }
.dv-back {
  background: transparent; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px;
  color: var(--text); padding: 8px 16px; font-size: 13px; font-weight: 500;
  transition: border-color .15s, color .15s;
}
.dv-back:hover, .dv-back:focus-visible { border-color: var(--accent); color: var(--accent); outline: none; }
.dv-nav-links { display: flex; gap: 32px; align-items: center; }
/* every nav link shares one style; no "active page" highlight */
.dv-nav-link {
  background: none; border: 0; padding: 4px 0; font-size: 13px; letter-spacing: .02em;
  color: var(--body); transition: color .15s;
}
.dv-nav-link:hover, .dv-nav-link:focus-visible { color: var(--text); outline: none; }
.dv-nav-actions { display: flex; gap: 10px; align-items: center; }
.dv-nav-actions .dv-btn { padding: 9px 18px; }

/* reveal */
.dv-reveal { opacity: 0; transform: translateY(22px); transition: opacity .8s ease, transform .8s ease; }
.dv-reveal.is-in { opacity: 1; transform: none; }

/* hero */
.dv-hero { padding: 84px 48px 64px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.dv-avatar-wrap { position: relative; margin-bottom: 26px; }
.dv-avatar-wrap::before {
  content: ""; position: absolute; inset: -22px; border-radius: 50%; z-index: -1;
  background: radial-gradient(circle, rgba(52,211,153,0.24), transparent 68%); filter: blur(8px);
}
.dv-avatar {
  width: 176px; aspect-ratio: 896 / 1200; border-radius: 24px; overflow: hidden; display: grid; place-items: center;
  border: 1px solid rgba(52,211,153,0.5);
  background: linear-gradient(145deg, rgba(52,211,153,0.14), rgba(13,148,136,0.06));
  box-shadow: 0 0 0 6px rgba(52,211,153,0.05), 0 0 44px rgba(52,211,153,0.18);
}
.dv-avatar img { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; }
.dv-avatar span { font-family: var(--serif); font-size: 58px; color: var(--accent); }
.dv-status-dot {
  position: absolute; right: 6px; bottom: 6px; width: 14px; height: 14px; border-radius: 50%;
  background: var(--accent); border: 2px solid var(--bg); box-shadow: 0 0 10px var(--accent);
}

.dv-eyebrow { font-family: var(--mono); font-size: 11px; letter-spacing: .22em; color: var(--accent); }
.dv-pill-status {
  display: inline-flex; align-items: center; gap: 9px; padding: 6px 16px; margin-bottom: 22px;
  font-family: var(--mono); font-size: 11px; letter-spacing: .06em; color: var(--text);
  background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.3); border-radius: 999px;
}
.dv-pulse { position: relative; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
.dv-pulse::after {
  content: ""; position: absolute; inset: 0; border-radius: 50%; background: var(--accent);
  animation: dv-pulse 2.4s ease-out infinite;
}
@keyframes dv-pulse { from { transform: scale(1); opacity: .6; } to { transform: scale(3.2); opacity: 0; } }

.dv-hero h1 {
  font-family: var(--serif); font-weight: 400; color: var(--text);
  font-size: clamp(40px, 7vw, 76px); line-height: 1.04; letter-spacing: -1.5px; margin-bottom: 10px;
}
.dv-grad {
  background: linear-gradient(120deg, #34d399 0%, #2dd4bf 55%, #0d9488 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.dv-role { font-family: var(--mono); font-size: 13px; letter-spacing: .06em; color: var(--accent); margin-bottom: 8px; }
.dv-loc { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--muted); margin-bottom: 22px; }
.dv-loc svg { color: var(--accent); }
.dv-bio { max-width: 620px; font-size: clamp(14.5px, 1.5vw, 16.5px); line-height: 1.8; margin-bottom: 26px; }

.dv-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 30px; }
.dv-tag {
  padding: 5px 13px; font-family: var(--mono); font-size: 12px; color: var(--accent);
  background: rgba(52,211,153,0.06); border: 1px solid rgba(52,211,153,0.25); border-radius: 8px;
  transition: transform .3s ease, border-color .3s, background .3s, box-shadow .3s;
}
.dv-tag:hover { transform: translateY(-2px); border-color: rgba(52,211,153,0.6); background: rgba(52,211,153,0.12); box-shadow: 0 6px 20px rgba(52,211,153,0.15); }

.dv-socials { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 34px; }
.dv-social {
  display: inline-flex; align-items: center; gap: 9px; padding: 10px 18px;
  font-size: 13px; font-weight: 500; color: var(--body);
  background: var(--card); border: 1px solid var(--border); border-radius: 10px;
  transition: transform .3s ease, border-color .3s, background .3s, box-shadow .3s, color .3s;
}
.dv-social svg { color: var(--accent); }
.dv-social:hover, .dv-social:focus-visible {
  transform: translateY(-2px); color: var(--text); outline: none;
  border-color: rgba(52,211,153,0.5); background: rgba(52,211,153,0.07); box-shadow: 0 8px 24px rgba(52,211,153,0.12);
}

.dv-trust { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px 26px; }
.dv-trust li { display: flex; align-items: center; gap: 7px; font-size: 13px; color: var(--muted); }
.dv-trust svg { color: var(--accent); }

/* stats */
.dv-stats {
  display: grid; grid-template-columns: repeat(4, 1fr); width: 100%;
  border-top: 1px solid var(--border-soft); border-bottom: 1px solid var(--border-soft);
  background: #0a0c12;
}
.dv-stat { padding: 28px 12px; text-align: center; border-left: 1px solid var(--border-soft); }
.dv-stat:first-child { border-left: 0; }
.dv-stat b { display: block; font-family: var(--serif); font-weight: 400; font-size: 34px; line-height: 1; color: var(--text); letter-spacing: -1px; }
.dv-stat span { display: block; margin-top: 9px; font-family: var(--mono); font-size: 10.5px; letter-spacing: .14em; color: var(--muted); }

/* section heads */
.dv-section { padding-top: 84px; }
.dv-head { text-align: center; margin-bottom: 44px; }
.dv-head .dv-eyebrow { display: block; margin-bottom: 14px; }
.dv-head h2 { font-family: var(--serif); font-weight: 400; color: var(--text); font-size: clamp(28px, 4.4vw, 44px); line-height: 1.12; letter-spacing: -1px; margin-bottom: 12px; }
.dv-head p { max-width: 480px; margin: 0 auto; font-size: 14.5px; color: var(--body); }

/* skills */
.dv-skills { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; width: 100%; }
.dv-card {
  position: relative; padding: 24px; background: var(--card);
  border: 1px solid var(--border); border-radius: 16px; min-width: 0;
  transition: transform .25s ease, border-color .25s, box-shadow .25s, background .25s;
}
.dv-card:hover { transform: translateY(-3px); border-color: rgba(52,211,153,0.35); background: rgba(255,255,255,0.045); box-shadow: 0 10px 40px rgba(52,211,153,0.08); }
.dv-card-top { display: flex; align-items: center; gap: 11px; margin-bottom: 16px; }
.dv-ico {
  width: 34px; height: 34px; border-radius: 9px; display: grid; place-items: center; color: var(--accent);
  background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.28);
}
.dv-card-label { font-family: var(--mono); font-size: 11px; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; color: var(--accent); }
.dv-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.dv-chip {
  padding: 4px 12px; font-family: var(--mono); font-size: 11.5px; color: var(--text); white-space: nowrap;
  background: rgba(52,211,153,0.07); border: 1px solid rgba(52,211,153,0.2); border-radius: 999px;
}

/* projects */
.dv-projects { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; width: 100%; }
.dv-project { display: flex; flex-direction: column; gap: 18px; padding: 28px 26px; }
.dv-project-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.dv-glyph {
  width: 50px; height: 50px; border-radius: 13px; display: grid; place-items: center; font-size: 22px; color: var(--accent);
  background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.3);
}
.dv-badge {
  padding: 4px 12px; font-family: var(--mono); font-size: 10.5px; letter-spacing: .06em; color: var(--accent); white-space: nowrap;
  background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.28); border-radius: 999px;
}
.dv-project h3 { font-family: var(--serif); font-weight: 400; font-size: 24px; color: var(--text); margin-bottom: 4px; }
.dv-tagline { font-size: 13px; font-weight: 600; color: var(--accent); margin-bottom: 10px; }
.dv-project p.dv-desc { font-size: 13.5px; color: var(--body); line-height: 1.7; }
.dv-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; }

.dv-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 18px; border-radius: 9px; font-size: 13px; font-weight: 600;
  transition: opacity .18s, box-shadow .18s, border-color .18s, color .18s, background .18s;
}
.dv-btn-primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark)); color: #041009; border: 0;
  box-shadow: 0 0 28px rgba(52,211,153,0.22);
}
.dv-btn-primary:hover, .dv-btn-primary:focus-visible { opacity: .88; box-shadow: 0 0 44px rgba(52,211,153,0.36); outline: none; }
.dv-btn-ghost { background: transparent; color: var(--body); border: 1px solid rgba(255,255,255,0.2); }
.dv-btn-ghost:hover, .dv-btn-ghost:focus-visible { border-color: var(--accent); color: var(--accent); outline: none; }

/* about the project */
.dv-about { width: 100%; max-width: 820px; margin: 0 auto; padding: 32px; border-radius: 20px; -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); }
.dv-about::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px; border-radius: 20px 20px 0 0;
  background: linear-gradient(90deg, transparent, rgba(52,211,153,0.55), transparent);
}
.dv-dots { display: flex; align-items: center; gap: 6px; margin-bottom: 22px; }
.dv-dots i { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.14); }
.dv-dots code { margin-left: 8px; font-family: var(--mono); font-size: 11px; color: var(--muted); }
.dv-about h3 { font-family: var(--serif); font-weight: 400; font-size: 26px; color: var(--text); margin-bottom: 10px; }
.dv-about > p { font-size: 15px; line-height: 1.75; }
.dv-hl { margin: 22px 0; display: grid; gap: 12px; }
.dv-hl li { display: flex; align-items: baseline; gap: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--border-soft); font-size: 14.5px; color: rgba(255,255,255,0.88); }
.dv-hl li:last-child { border-bottom: 0; padding-bottom: 0; }
.dv-hl b { font-family: var(--mono); font-weight: 400; font-size: 11.5px; color: var(--accent); }
.dv-code {
  margin: 0; padding: 14px 16px; overflow-x: auto; font-family: var(--mono); font-size: 13px;
  background: rgba(0,0,0,0.38); border: 1px solid rgba(52,211,153,0.16); border-radius: 10px;
}
.dv-code .k { color: var(--accent-dark); } .dv-code .v { color: rgba(255,255,255,0.92); }
.dv-code .o { color: var(--muted); } .dv-code .s { color: var(--accent); }

/* contact CTA */
.dv-cta {
  position: relative; overflow: hidden; display: flex; align-items: center; justify-content: space-between; gap: 40px;
  width: 100%; padding: 52px 48px; border-radius: 22px;
  background: linear-gradient(135deg, rgba(52,211,153,0.09) 0%, rgba(255,255,255,0.025) 55%, rgba(7,8,13,0.4) 100%);
  border: 1px solid rgba(52,211,153,0.28); box-shadow: 0 0 80px rgba(52,211,153,0.06);
}
.dv-cta::after {
  content: ""; position: absolute; right: -60px; top: -60px; width: 220px; height: 220px; border-radius: 50%;
  border: 1px solid rgba(52,211,153,0.22); pointer-events: none;
}
.dv-cta h2 { font-family: var(--serif); font-weight: 400; font-size: clamp(26px, 3.4vw, 38px); line-height: 1.12; letter-spacing: -.8px; color: var(--text); margin: 12px 0 14px; }
.dv-cta p { font-size: 14.5px; max-width: 480px; margin-bottom: 22px; }
.dv-offers { display: grid; gap: 10px; }
.dv-offers li { display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: rgba(255,255,255,0.88); }
.dv-offers svg { color: var(--accent); flex-shrink: 0; }
.dv-cta-btns { display: flex; flex-direction: column; gap: 10px; width: 220px; flex-shrink: 0; position: relative; z-index: 1; }
.dv-cta-btns .dv-btn { padding: 14px 20px; }

/* footer */
.dv-footer { margin-top: 84px; padding: 28px 0 36px; border-top: 1px solid var(--border-soft); width: 100%; }
.dv-footer .dv-wrap { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; }
.dv-footer p, .dv-footer div { font-size: 12.5px; color: var(--muted); }
.dv-footer a { color: var(--accent); font-weight: 600; }
.dv-footer .dv-note { display: flex; align-items: center; gap: 6px; }
.dv-footer .dv-note svg { color: var(--accent); }

/* responsive */
@media (max-width: 1024px) {
  .dv-skills { grid-template-columns: repeat(2, 1fr); }
  .dv-projects { grid-template-columns: 1fr; }
  .dv-cta { flex-direction: column; align-items: flex-start; }
  .dv-cta-btns { width: 100%; flex-direction: row; flex-wrap: wrap; }
  .dv-cta-btns .dv-btn { flex: 1 1 150px; }
}
@media (max-width: 640px) {
  .dv-wrap, .dv-topbar { padding-left: 20px; padding-right: 20px; }
  .dv-hero { padding: 56px 20px 48px; }
  .dv-avatar { width: 148px; }
  .dv-section { padding-top: 60px; }
  .dv-nav-links { display: none; }
  .dv-skills { grid-template-columns: 1fr; }
  .dv-stats { grid-template-columns: repeat(2, 1fr); }
  .dv-stat:nth-child(3) { border-left: 0; }
  .dv-stat:nth-child(n+3) { border-top: 1px solid var(--border-soft); }
  .dv-about { padding: 24px 20px; }
  .dv-cta { padding: 36px 24px; }
  .dv-footer { margin-top: 60px; }
  .dv-footer .dv-wrap { flex-direction: column; align-items: flex-start; }
}

@media (prefers-reduced-motion: reduce) {
  .dv-root * { transition: none !important; animation: none !important; }
  .dv-reveal { opacity: 1; transform: none; }
  .dv-root *:hover { transform: none !important; }
}
`;

/* ───────────── Component ───────────── */
/**
 * Props
 *  - image:      developer photo. A public path ("/images/sabari.png"), a full URL,
 *                or an imported asset (import me from "../assets/sabari.jpg").
 *                Falls back to DEVELOPER.imageUrl, then to initials if it fails to load.
 *  - onBack / onHome / onFeatures / onLogin / onRegister: optional nav callbacks.
 */
export default function DeveloperSection({ image, onBack, onHome, onFeatures, onLogin, onRegister }) {
  const rootRef = useRef(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const imageSrc = image || DEVELOPER.imageUrl;

  // Try again whenever a new image is supplied
  useEffect(() => {
    setImgFailed(false);
  }, [imageSrc]);

  /* fade-up reveal for every .dv-reveal block */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = root.querySelectorAll(".dv-reveal");
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(DEVELOPER.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${DEVELOPER.email}`;
    }
  };

  const initials = DEVELOPER.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const showImage = imageSrc && !imgFailed;

  return (
    <div id="developer" className="dv-root" ref={rootRef}>
      <style>{CSS}</style>
      <div className="dv-grid-bg" aria-hidden="true" />
      <div className="dv-glow" aria-hidden="true" />

      {onBack && (
        <header className="dv-topbar">
          <div className="dv-brand" onClick={onHome || onBack} style={{ cursor: "pointer" }}>
            <div className="dv-brand-mark" aria-hidden="true">◈</div>
            <span className="dv-brand-name">Maadalla</span>
          </div>

          <nav className="dv-nav-links" aria-label="Main">
            <button type="button" className="dv-nav-link" onClick={onHome || onBack}>Home</button>
            <button type="button" className="dv-nav-link" aria-current="page">Developer</button>
            {onFeatures && (
              <button type="button" className="dv-nav-link" onClick={onFeatures}>Features</button>
            )}
          </nav>

          <div className="dv-nav-actions">
            {onLogin && <button type="button" className="dv-back" onClick={onLogin}>Log in</button>}
            {onRegister && (
              <button type="button" className="dv-btn dv-btn-primary" onClick={onRegister}>Get Started</button>
            )}
          </div>
        </header>
      )}

      <main>
        {/* ── HERO ── */}
        <section className="dv-wrap dv-hero dv-reveal" aria-labelledby="dv-heading">
          <div className="dv-avatar-wrap">
            <div className="dv-avatar">
              {showImage ? (
                <img
                  src={imageSrc}
                  alt={`Portrait of ${DEVELOPER.name}`}
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <span aria-hidden="true">{initials}</span>
              )}
            </div>
            <span className="dv-status-dot" aria-hidden="true" />
          </div>

          <p className="dv-eyebrow" style={{ marginBottom: 14 }}>THE PERSON BEHIND THE CODE</p>

          <div className="dv-pill-status">
            <span className="dv-pulse" aria-hidden="true" />
            {DEVELOPER.availability}
          </div>

          <h1 id="dv-heading">
            Hi, I'm <span className="dv-grad">{DEVELOPER.firstName}</span>
          </h1>
          <p className="dv-role">{DEVELOPER.role}</p>
          <p className="dv-loc"><Icon name="pin" size={14} /> {DEVELOPER.location}</p>

          <p className="dv-bio">{DEVELOPER.bio}</p>

          <ul className="dv-tags" aria-label="Core technologies">
            {DEVELOPER.stack.map((t) => (
              <li key={t} className="dv-tag">{t}</li>
            ))}
          </ul>

          <nav className="dv-socials" aria-label="Developer links">
            {LINKS.map((l) => (
              <a
                key={l.id}
                className="dv-social"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit Sabari Ragu on ${l.label} (opens in a new tab)`}
              >
                <Icon name={l.id} size={16} /> {l.label}
              </a>
            ))}
            <button type="button" className="dv-social" onClick={copyEmail}>
              <Icon name="mail" size={16} /> {copied ? "Copied!" : "sabariragu2006@gmail.com"}
            </button>
          </nav>

          <ul className="dv-trust">
            {TRUST.map((t) => (
              <li key={t}><Icon name="check" size={14} /> {t}</li>
            ))}
          </ul>
        </section>

        {/* ── STATS ── */}
        <section className="dv-stats dv-reveal" aria-label="Highlights">
          {STATS.map((s) => (
            <div key={s.label} className="dv-stat">
              <b>{s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </section>

        {/* ── SKILLS ── */}
        <section className="dv-wrap dv-section" aria-labelledby="dv-skills-h">
          <div className="dv-head dv-reveal">
            <span className="dv-eyebrow">TECHNICAL SKILLS</span>
            <h2 id="dv-skills-h">What I build with</h2>
            <p>A versatile toolkit spanning frontend, backend, desktop, and AI, built through real projects.</p>
          </div>
          <div className="dv-skills">
            {SKILLS.map((g) => (
              <article key={g.label} className="dv-card dv-reveal">
                <div className="dv-card-top">
                  <span className="dv-ico"><Icon name={g.icon} size={16} /></span>
                  <span className="dv-card-label">{g.label}</span>
                </div>
                <ul className="dv-chips">
                  {g.items.map((s) => <li key={s} className="dv-chip">{s}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* ── PROJECTS ── */}
        <section className="dv-wrap dv-section" aria-labelledby="dv-projects-h">
          <div className="dv-head dv-reveal">
            <span className="dv-eyebrow">FEATURED PROJECTS</span>
            <h2 id="dv-projects-h">Things I've built</h2>
            <p>From full-stack web apps to AI-powered desktop tools, each project solves a real problem.</p>
          </div>
          <div className="dv-projects">
            {PROJECTS.map((p) => (
              <article key={p.id} className="dv-card dv-project dv-reveal">
                <div className="dv-project-top">
                  <span className="dv-glyph" aria-hidden="true">{p.glyph}</span>
                  <span className="dv-badge">{p.badge}</span>
                </div>
                <div>
                  <h3>{p.name}</h3>
                  <p className="dv-tagline">{p.tagline}</p>
                  <p className="dv-desc">{p.desc}</p>
                </div>
                <ul className="dv-chips">
                  {p.tech.map((t) => <li key={t} className="dv-chip">{t}</li>)}
                </ul>
                <div className="dv-actions">
                  {p.liveUrl && (
                    <a className="dv-btn dv-btn-primary" href={p.liveUrl} target="_blank" rel="noopener noreferrer">
                      <Icon name="external" size={14} /> Live Demo
                    </a>
                  )}
                  {p.downloadUrl && (
                    <a className="dv-btn dv-btn-primary" href={p.downloadUrl} download>
                      <Icon name="download" size={14} /> Download
                    </a>
                  )}
                  {p.githubUrl && (
                    <a className="dv-btn dv-btn-ghost" href={p.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Icon name="github" size={14} /> Code
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── WHY I BUILT MAADALLA ── */}
        <section className="dv-wrap dv-section" aria-labelledby="dv-why-h">
          <div className="dv-card dv-about dv-reveal">
            <div className="dv-dots" aria-hidden="true">
              <i /><i /><i /><code>maadalla.config.js</code>
            </div>
            <h3 id="dv-why-h">Why I built Maadalla</h3>
            <p>
              I built Maadalla to explore how full-stack development can simplify personal financial
              management, from tracking assets and liabilities to visualizing net worth and recording
              transactions.
            </p>
            <ul className="dv-hl">
              {HIGHLIGHTS.map((h, i) => (
                <li key={h}><b aria-hidden="true">0{i + 1}</b><span>{h}</span></li>
              ))}
            </ul>
            <pre className="dv-code" aria-hidden="true">
              <code>
                <span className="k">const</span> <span className="v">vision</span>{" "}
                <span className="o">=</span> <span className="s">"Financial Clarity"</span>
                <span className="o">;</span>
              </code>
            </pre>
          </div>
        </section>

        {/* ── CONTACT CTA ── */}
        <section className="dv-wrap dv-section" aria-labelledby="dv-contact-h">
          <div className="dv-cta dv-reveal">
            <div>
              <span className="dv-eyebrow">GET IN TOUCH</span>
              <h2 id="dv-contact-h">Let's build something together</h2>
              <p>Open to freelance projects, collaborations, and full-time opportunities. Reach out, I'd love to hear from you.</p>
              <ul className="dv-offers">
                {OFFERS.map((o) => (
                  <li key={o}><Icon name="check" size={15} /> {o}</li>
                ))}
              </ul>
            </div>
            <div className="dv-cta-btns">
              <a className="dv-btn dv-btn-primary" href={`mailto:${DEVELOPER.email}`}>
                <Icon name="mail" size={16} /> Email Me
              </a>
              <a className="dv-btn dv-btn-ghost" href={LINKS[1].href} target="_blank" rel="noopener noreferrer">
                <Icon name="linkedin" size={16} /> LinkedIn
              </a>
              <a className="dv-btn dv-btn-ghost" href={LINKS[0].href} target="_blank" rel="noopener noreferrer">
                <Icon name="github" size={16} /> GitHub
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="dv-footer">
        <div className="dv-wrap">
          <div className="dv-brand">
            <div className="dv-brand-mark" style={{ width: 24, height: 24, fontSize: 11, borderRadius: 6 }} aria-hidden="true">◈</div>
            <span className="dv-brand-name" style={{ fontSize: 17 }}>Maadalla</span>
          </div>
          <p>
            Built by <a href={LINKS[0].href} target="_blank" rel="noopener noreferrer">Sabari</a> · {DEVELOPER.location} · © {new Date().getFullYear()}
          </p>
          <div className="dv-note"><Icon name="shield" size={13} /> Personal Finance Tracker</div>
        </div>
      </footer>
    </div>
  );
}