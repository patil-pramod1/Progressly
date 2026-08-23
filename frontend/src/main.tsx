import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

if (!window.matchMedia)
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({
      matches: false,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }),
  });

const accentOverride = document.createElement("style");
accentOverride.textContent = `.primary,.add-button{background:var(--token-primary)!important}.primary:hover,.add-button:hover{background:var(--token-primary-hover)!important}.progress-track div,.tracker-box.checked,.goal-dot{background:var(--token-primary)!important}.tracker-box.checked{color:#fff!important}.side-nav button.active{background:var(--token-primary-light)!important;color:var(--token-primary)!important}.brand-mark{background:var(--token-primary)!important;color:#fff!important}.ring{background:conic-gradient(var(--token-primary) var(--progress),#334733 0)}.tracker-summary strong,.goal-percent{color:var(--token-primary)!important}`;
document.head.appendChild(accentOverride);
const semanticColorStyle = document.createElement("style");
semanticColorStyle.textContent = `.eyebrow,.tag,.goal-percent,.tracker-summary strong,.tracker-box{color:var(--token-primary)!important}.tracker-box{border-color:color-mix(in srgb,var(--token-primary) 45%,var(--token-border))}.section-head span{color:var(--token-primary)!important}`;
document.head.appendChild(semanticColorStyle);
const pageStyle = document.createElement("style");
pageStyle.textContent = `.tracker-shell{display:none}html[data-page=tracker] .dashboard-layout,html[data-page=settings] .dashboard-layout{display:none}html[data-page=tracker] .tracker-shell{display:block}html[data-page=tracker] #settings-page,html[data-page=home] #settings-page{display:none!important}html[data-page=settings] #settings-page{display:block!important}.task-delete{border:1px solid var(--token-border);background:transparent;color:var(--token-muted);border-radius:6px;padding:.15rem .4rem;font-size:.9rem}.task-delete:hover{color:#ef4444;border-color:#ef4444}.tracker-box:disabled{opacity:.38;cursor:not-allowed;transform:none!important;border-style:dashed}.tracker-box:disabled:hover{border-color:#455746;transform:none}`;
document.head.appendChild(pageStyle);
const trackerPageStyle = document.createElement("style");
trackerPageStyle.textContent = `.tracker-scroll{max-height:70vh;overflow:auto}.tracker-row.header{position:sticky;top:0;z-index:3;background:var(--token-surface)}.tracker-name{position:sticky;left:0;z-index:2;background:var(--token-surface)}.tracker-row.header .tracker-name{z-index:4}`;
document.head.appendChild(trackerPageStyle);
const navigationStyle = document.createElement("style");
navigationStyle.textContent = `.back-button{display:none;position:fixed;z-index:9;top:1.25rem;left:260px;border:1px solid var(--token-border);background:var(--token-surface);color:var(--token-text);border-radius:9px;padding:.55rem .8rem;box-shadow:0 8px 20px #0002}.back-button:hover{color:var(--token-primary);border-color:var(--token-primary)}html[data-page=tracker] .back-button,html[data-page=settings] .back-button,html[data-page=goals] .back-button,html[data-page=tasks] .back-button,html[data-page=habits] .back-button{display:block}@media(max-width:760px){.back-button{left:1rem;top:1rem}}`;
document.head.appendChild(navigationStyle);
const interactionStyle = document.createElement("style");
interactionStyle.textContent = `.toast{top:1.25rem!important;bottom:auto!important;left:50%;right:auto!important;transform:translateX(-50%);animation:toast-top-in .25s ease-out!important}.settings-actions{display:flex;justify-content:flex-end;gap:.6rem;border-top:1px solid var(--token-border);margin-top:1.5rem;padding-top:1.2rem}.settings-actions button{border-radius:9px;padding:.65rem 1rem}.settings-cancel{border:1px solid var(--token-border);background:var(--token-bg);color:var(--token-muted)}.settings-actions button:disabled{opacity:.45;cursor:not-allowed}@keyframes toast-top-in{from{opacity:0;transform:translate(-50%,-10px)}to{opacity:1;transform:translate(-50%,0)}}`;
document.head.appendChild(interactionStyle);
const pageShellStyle = document.createElement("style");
pageShellStyle.textContent = `html[data-page=tracker] .dashboard-layout,html[data-page=settings] .dashboard-layout{display:contents!important}html[data-page=tracker] .dashboard-main,html[data-page=settings] .dashboard-main{display:none!important}html[data-page=tracker] .sidebar,html[data-page=settings] .sidebar{position:fixed;left:0;top:0;width:235px;height:100vh;z-index:6}html[data-page=tracker] .tracker-shell,html[data-page=settings] #settings-page{margin-left:235px;min-height:100vh}@media(max-width:760px){html[data-page=tracker] .sidebar,html[data-page=settings] .sidebar{display:none!important}html[data-page=tracker] .tracker-shell,html[data-page=settings] #settings-page{margin-left:0}}`;
document.head.appendChild(pageShellStyle);
const sectionPageStyle = document.createElement("style");
sectionPageStyle.textContent = `html[data-page=goals] .dashboard-main .welcome-banner,html[data-page=goals] .dashboard-main .metrics,html[data-page=goals] .dashboard-main .tasks-panel,html[data-page=goals] .dashboard-main .habits-panel,html[data-page=tasks] .dashboard-main .welcome-banner,html[data-page=tasks] .dashboard-main .metrics,html[data-page=tasks] .dashboard-main .goals-panel,html[data-page=tasks] .dashboard-main .habits-panel,html[data-page=habits] .dashboard-main .welcome-banner,html[data-page=habits] .dashboard-main .metrics,html[data-page=habits] .dashboard-main .goals-panel,html[data-page=habits] .dashboard-main .tasks-panel{display:none}html[data-page=goals] .dashboard-main .content-grid,html[data-page=tasks] .dashboard-main .content-grid,html[data-page=habits] .dashboard-main .content-grid{display:block}html[data-page=goals] .dashboard-main .goals-panel,html[data-page=tasks] .dashboard-main .tasks-panel,html[data-page=habits] .dashboard-main .habits-panel{display:block;max-width:900px;margin:auto}`;
document.head.appendChild(sectionPageStyle);
document.documentElement.dataset.page = "home";
document.addEventListener("click", (event) => { const target = event.target as HTMLElement; if (target.closest(".sidebar-bottom button")?.textContent?.includes("Settings")) document.documentElement.dataset.page = "settings"; if (target.closest(".settings-page-close")) document.documentElement.dataset.page = "home"; });
const paletteStyle = document.createElement("style");
paletteStyle.textContent = `html[data-theme=light]{--token-primary:#16a34a;--token-primary-hover:#15803d;--token-primary-light:#dcfce7;--token-secondary:#14b8a6}html[data-theme=dark]{--token-primary:#4ade80;--token-primary-hover:#22c55e;--token-primary-light:#14532d;--token-secondary:#2dd4bf}html[data-theme=light][data-accent=blue]{--token-primary:#2563eb;--token-primary-hover:#1d4ed8;--token-primary-light:#dbeafe;--token-secondary:#3b82f6}html[data-theme=dark][data-accent=blue]{--token-primary:#60a5fa;--token-primary-hover:#3b82f6;--token-primary-light:#1e3a8a;--token-secondary:#38bdf8}html[data-theme=light][data-accent=purple]{--token-primary:#7c3aed;--token-primary-hover:#6d28d9;--token-primary-light:#ede9fe;--token-secondary:#a855f7}html[data-theme=dark][data-accent=purple]{--token-primary:#a78bfa;--token-primary-hover:#8b5cf6;--token-primary-light:#4c1d95;--token-secondary:#c084fc}html[data-theme=light][data-accent=orange]{--token-primary:#ea580c;--token-primary-hover:#c2410c;--token-primary-light:#ffedd5;--token-secondary:#f97316}html[data-theme=dark][data-accent=orange]{--token-primary:#fb923c;--token-primary-hover:#f97316;--token-primary-light:#7c2d12;--token-secondary:#fdba74}html[data-theme=light][data-accent=rose]{--token-primary:#e11d48;--token-primary-hover:#be123c;--token-primary-light:#ffe4e6;--token-secondary:#f43f5e}html[data-theme=dark][data-accent=rose]{--token-primary:#fb7185;--token-primary-hover:#f43f5e;--token-primary-light:#881337;--token-secondary:#fda4af}.primary,.add-button{background:var(--token-primary)!important}.primary:hover,.add-button:hover{background:var(--token-primary-hover)!important}.progress-track div,.tracker-box.checked,.goal-dot{background:var(--token-primary)!important}.side-nav button.active{background:var(--token-primary-light)!important;color:var(--token-primary)!important}.brand-mark{background:var(--token-primary)!important}.settings-launcher,.settings-panel{display:none!important}`;
document.head.appendChild(paletteStyle);
const settingsStyle = document.createElement("style");
settingsStyle.textContent = `.settings-page{background:var(--token-bg);color:var(--token-text);padding:3rem 4.5vw 5rem;border-top:1px solid var(--token-border);min-height:70vh}.settings-page-inner{max-width:1100px;margin:auto}.settings-page-header{display:flex;justify-content:space-between;align-items:start;margin-bottom:2rem}.settings-page-header h2{font-size:2.4rem;letter-spacing:-.06em;margin:.4rem 0}.settings-page-header p:last-child,.settings-muted{color:var(--token-muted)}.settings-page-close{border:1px solid var(--token-border);background:var(--token-surface);color:var(--token-text);border-radius:9px;font-size:1.4rem;width:38px;height:38px}.settings-tabs{display:flex;gap:.35rem;border-bottom:1px solid var(--token-border);margin-bottom:2rem;overflow:auto}.settings-tabs button{border:0;background:transparent;color:var(--token-muted);padding:.8rem 1rem;border-bottom:2px solid transparent;white-space:nowrap}.settings-tabs button.active{color:var(--token-primary);border-color:var(--token-primary);font-weight:800}.settings-content{background:var(--token-surface);border:1px solid var(--token-border);border-radius:16px;padding:1.5rem}.settings-content h3{margin:.1rem 0 .3rem}.settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem;margin-top:1.5rem}.settings-field{display:grid;gap:.6rem;color:var(--token-muted);font-size:.8rem}.settings-field strong{color:var(--token-text)}.settings-field select{border:1px solid var(--token-border);background:var(--token-bg);color:var(--token-text);border-radius:9px;padding:.7rem}.settings-choice-row{display:flex;flex-wrap:wrap;gap:.45rem}.settings-choice-row button{border:1px solid var(--token-border);background:var(--token-bg);color:var(--token-muted);border-radius:9px;padding:.55rem .75rem}.settings-choice-row button.selected{background:var(--token-primary-light);border-color:var(--token-primary);color:var(--token-primary);font-weight:800}.settings-choice-row .swatch{display:flex;align-items:center;gap:.4rem}.swatch span{width:10px;height:10px;border-radius:50%;background:var(--swatch)}.swatch.green{--swatch:#16a34a}.swatch.blue{--swatch:#2563eb}.swatch.purple{--swatch:#7c3aed}.swatch.orange{--swatch:#ea580c}.swatch.rose{--swatch:#e11d48}@media(max-width:700px){.settings-page{padding:2rem 1rem}.settings-grid{grid-template-columns:1fr}.settings-page-header h2{font-size:2rem}}`;
document.head.appendChild(settingsStyle);
const surfacePaletteStyle = document.createElement("style");
surfacePaletteStyle.textContent = `.welcome-banner{background:linear-gradient(110deg,color-mix(in srgb,var(--token-primary) 18%,var(--token-surface)),var(--token-surface))!important}.story-copy em,.wave{color:var(--token-primary)!important}.metric-icon.lime{background:color-mix(in srgb,var(--token-primary) 18%,transparent);color:var(--token-primary)}.ring{background:conic-gradient(var(--token-primary) var(--progress),color-mix(in srgb,var(--token-primary) 20%,var(--token-surface)) 0)!important}.tracker-box.today{box-shadow:0 0 0 2px color-mix(in srgb,var(--token-primary) 30%,transparent)}html[data-theme=dark][data-accent=blue] .auth-story{background:radial-gradient(circle at 75% 35%,#1e3a8a 0,#172554 38%,#0f172a 75%)!important}html[data-theme=dark][data-accent=purple] .auth-story{background:radial-gradient(circle at 75% 35%,#4c1d95 0,#2e1065 38%,#0f172a 75%)!important}`;
document.head.appendChild(surfacePaletteStyle);
document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  if (
    target.closest(".sidebar-bottom button")?.textContent?.includes("Settings")
  ) {
    const page = document.getElementById("settings-page");
    page?.removeAttribute("hidden");
    page?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

const themeOverride = document.createElement("style");
themeOverride.textContent = `html[data-theme=light] body,html[data-theme=light] .dashboard-layout,html[data-theme=light] .tracker-shell{background:#f8fafc;color:#0f172a}html[data-theme=light] .sidebar,html[data-theme=light] .panel,html[data-theme=light] .metric,html[data-theme=light] .tracker-card,html[data-theme=light] .welcome-banner{background:#fff;border-color:#e2e8f0}html[data-theme=light] .auth-page{background:#f8fafc;color:#0f172a}html[data-theme=light] .auth-card{background:#fff;border-color:#e2e8f0}html[data-theme=light] .auth-story{background:linear-gradient(135deg,#ecfdf5,#dcfce7)}html[data-theme=light] .eyebrow,html[data-theme=light] .goal-percent{color:var(--token-primary)}html[data-theme=light] .primary,html[data-theme=light] .add-button{background:var(--token-primary);color:#fff}html[data-theme=light] .ring{background:conic-gradient(var(--token-primary) var(--progress),#e2e8f0 0)}html[data-theme=light] .progress-track div,html[data-theme=light] .tracker-box.checked{background:var(--token-primary)}html[data-theme=light] .tracker-box.checked{color:#fff}html[data-theme=light] .auth-card input,html[data-theme=light] .inline-form input{background:#fff;color:#0f172a;border-color:#e2e8f0}html[data-theme=light] .muted,html[data-theme=light] .section-head span{color:#64748b}html[data-theme=light] .side-nav button,html[data-theme=light] .sidebar-bottom button{color:#64748b}html[data-theme=light] .side-nav button.active{background:#dcfce7;color:#166534}.settings-panel{position:relative;right:auto;bottom:auto;width:min(1000px,calc(100% - 3rem));margin:2rem auto;padding:1.5rem}`;
document.head.appendChild(themeOverride);
document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  if (
    target.closest(".sidebar-bottom button") &&
    target.textContent?.includes("Settings")
  ) {
    window.setTimeout(() => {
      document.querySelector<HTMLButtonElement>(".settings-launcher")?.click();
      document
        .querySelector(".settings-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  }
});

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
type User = { id: string; email: string; displayName: string; role: string };
type Goal = {
  id: string;
  title: string;
  status: string;
  currentValue: number;
  targetValue?: number;
  trackingType: string;
};
type Task = { id: string; title: string; status: string; priority?: string };
type Habit = { id: string; name: string; frequency: string; active: boolean };
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("progressly.accessToken");
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${response.status})`);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">✦</span> Progressly
    </div>
  );
}
function Auth({ onAuthenticated }: { onAuthenticated: (user: User) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    email: "",
    displayName: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await request<{ accessToken: string; user: User }>(
        `/auth/${mode}`,
        { method: "POST", body: JSON.stringify(form) },
      );
      localStorage.setItem("progressly.accessToken", data.accessToken);
      onAuthenticated(data.user);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <section className="auth-story">
        <Brand />
        <div className="story-copy">
          <p className="eyebrow">A CALMER WAY TO MOVE FORWARD</p>
          <h1>
            Small steps.
            <br />
            <em>Real momentum.</em>
          </h1>
          <p>
            Bring your goals, daily actions, and habits together in one focused
            space.
          </p>
        </div>
        <div className="story-footer">
          <span>✓ Built for consistency</span>
          <span>✓ Designed for clarity</span>
        </div>
      </section>
      <section className="auth-card">
        <div className="mobile-brand">
          <Brand />
        </div>
        <div className="auth-heading">
          <p className="eyebrow">WELCOME BACK</p>
          <h2>
            {mode === "login" ? "Let’s keep moving." : "Start your journey."}
          </h2>
          <p>
            {mode === "login"
              ? "Sign in to continue your progress."
              : "Create an account and make progress visible."}
          </p>
        </div>
        <form onSubmit={submit}>
          <div className="tabs">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Log in
            </button>
            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => setMode("register")}
            >
              Create account
            </button>
          </div>
          {mode === "register" && (
            <label>
              Display name
              <input
                required
                minLength={2}
                placeholder="How should we call you?"
                value={form.displayName}
                onChange={(e) =>
                  setForm({ ...form, displayName: e.target.value })
                }
              />
            </label>
          )}
          <label>
            Email address
            <input
              required
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              required
              minLength={8}
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="primary full-width" disabled={busy}>
            {busy
              ? "Working…"
              : mode === "login"
                ? "Continue to dashboard →"
                : "Create my account →"}
          </button>
        </form>
        <p className="auth-note">
          Your data stays private and belongs to your account.
        </p>
      </section>
    </main>
  );
}
function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goalTitle, setGoalTitle] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [habitName, setHabitName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("Overview");
  const [notice, setNotice] = useState("");
  async function load() {
    try {
      setLoading(true);
      const [g, t, h] = await Promise.all([
        request<{ content: Goal[] }>("/goals?size=50"),
        request<{ content: Task[] }>("/tasks?size=50"),
        request<Habit[]>("/habits"),
      ]);
      setGoals(g.content);
      setTasks(t.content);
      setHabits(h);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  }
  function navigate(label: string) {
    setActiveView(label);
    if (label === "Monthly tracker") {
      document.documentElement.dataset.page = "tracker";
      return;
    }
    if (["Goals", "Tasks", "Habits"].includes(label)) {
      document.documentElement.dataset.page = label.toLowerCase();
      return;
    }
    document.documentElement.dataset.page = "home";
    if (["Goals", "Tasks", "Habits", "Settings"].includes(label))
      document
        .getElementById(`${label.toLowerCase()}-panel`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (label !== "Overview")
      notify(`${label} is ready for the next Progressly workspace update.`);
  }
  async function addGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    await request("/goals", {
      method: "POST",
      body: JSON.stringify({ title: goalTitle, trackingType: "TASK" }),
    });
    setGoalTitle("");
    load();
  }
  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    await request("/tasks", {
      method: "POST",
      body: JSON.stringify({ title: taskTitle, recurrence: "NONE" }),
    });
    setTaskTitle("");
    load();
  }
  async function addHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!habitName.trim()) return;
    await request("/habits", {
      method: "POST",
      body: JSON.stringify({ name: habitName, frequency: "DAILY" }),
    });
    setHabitName("");
    load();
  }
  async function completeTask(id: string) {
    await request(`/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    load();
  }
  async function deleteTask(id: string) {
    if (!window.confirm("Delete this task?")) return;
    await request(`/tasks/${id}`, { method: "DELETE" });
    load();
  }
  async function logHabit(id: string) {
    await request(`/habits/${id}/logs`, {
      method: "POST",
      body: JSON.stringify({ completed: true }),
    });
    load();
  }
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const completion = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;
  const activeGoals = goals.filter((g) => g.status !== "COMPLETED");
  const initials = user.displayName
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
        ? "Good afternoon"
        : "Good evening";
  const navItems = [
    ["Monthly tracker", "▦"],
    ["Overview", "⌂"],
    ["Goals", "◎"],
    ["Tasks", "✓"],
    ["Habits", "◷"],
    ["Calendar", "▦"],
    ["Analytics", "◌"],
  ];
  return (
    <main className="dashboard-layout">
      <aside className="sidebar">
        <Brand />
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {navItems.map(([label, icon]) => (
            <button
              key={label}
              className={activeView === label ? "active" : ""}
              onClick={() => navigate(label)}
            >
              <span>{icon}</span>
              {label}
              {label === "Goals" && <b>{activeGoals.length || ""}</b>}
              {label === "Tasks" && <b>{tasks.length || ""}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            onClick={() =>
              notify(
                "Settings will be available with your profile preferences.",
              )
            }
          >
            <span>⚙</span>Settings
          </button>
          <button onClick={onLogout}>
            <span>↪</span>Log out
          </button>
        </div>
      </aside>
      <section className="dashboard-main">
        <header className="dashboard-header">
          <div className="mobile-brand">
            <Brand />
          </div>
          <div>
            <p className="eyebrow">
              {new Date()
                .toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })
                .toUpperCase()}
            </p>
            <h1>
              {greeting}, {user.displayName.split(" ")[0]}{" "}
              <span className="wave">✦</span>
            </h1>
          </div>
          <div className="profile">
            <button
              className="icon-button"
              aria-label="Search"
              onClick={() =>
                notify("Search will be connected to your goals and tasks.")
              }
            >
              ⌕
            </button>
            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() => notify("You have no new notifications.")}
            >
              ♧
            </button>
            <span className="avatar">{initials}</span>
            <span className="profile-name">{user.displayName}</span>
          </div>
        </header>
        {notice && (
          <div className="toast" role="status">
            ✦ {notice}
            <button onClick={() => setNotice("")} aria-label="Dismiss">
              ×
            </button>
          </div>
        )}
        {error && <p className="error">{error}</p>}
        <section className="welcome-banner">
          <div>
            <p className="eyebrow">YOUR DAILY CHECK-IN</p>
            <h2>Make today count.</h2>
            <p>Progress is built one intentional action at a time.</p>
          </div>
          <div
            className="ring"
            style={
              { "--progress": `${completion * 3.6}deg` } as React.CSSProperties
            }
          >
            <div>
              <strong>{completion}%</strong>
              <small>today</small>
            </div>
          </div>
        </section>
        <section className="metrics">
          <div className="metric">
            <div className="metric-icon lime">◈</div>
            <span>Active goals</span>
            <strong>{activeGoals.length}</strong>
            <small>Keep your eye on the finish line</small>
          </div>
          <div className="metric">
            <div className="metric-icon blue">✓</div>
            <span>Today’s tasks</span>
            <strong>{tasks.length}</strong>
            <small>{completed} completed so far</small>
          </div>
          <div className="metric">
            <div className="metric-icon peach">◷</div>
            <span>Active habits</span>
            <strong>{habits.length}</strong>
            <small>Consistency compounds</small>
          </div>
          <div className="metric">
            <div className="metric-icon purple">↗</div>
            <span>Completion rate</span>
            <strong>{completion}%</strong>
            <small>
              {completion >= 70 ? "You’re on a good run" : "Every step counts"}
            </small>
          </div>
        </section>
        <section className="content-grid">
          <div className="panel goals-panel" id="goals-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">LONG-TERM FOCUS</p>
                <h2>Your goals</h2>
              </div>
              <span className="count-badge">{goals.length}</span>
            </div>
            <form className="inline-form" onSubmit={addGoal}>
              <input
                aria-label="New goal"
                placeholder="What are you working toward?"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
              />
              <button className="add-button" aria-label="Add goal">
                +
              </button>
            </form>
            {loading ? (
              <p className="muted">Loading your goals…</p>
            ) : goals.length === 0 ? (
              <div className="empty-state">
                <span>◎</span>
                <p>No goals yet</p>
                <small>Choose one meaningful thing to focus on.</small>
              </div>
            ) : (
              goals.slice(0, 5).map((goal) => {
                const progress = goal.targetValue
                  ? Math.min(
                      100,
                      Math.round((goal.currentValue / goal.targetValue) * 100),
                    )
                  : goal.status === "COMPLETED"
                    ? 100
                    : 0;
                return (
                  <article className="goal-item" key={goal.id}>
                    <div className="goal-title">
                      <span className="goal-dot" />
                      <div>
                        <strong>{goal.title}</strong>
                        <small>
                          {goal.status.replace("_", " ").toLowerCase()}
                        </small>
                      </div>
                      <span className="goal-percent">{progress}%</span>
                    </div>
                    <div className="progress-track">
                      <div style={{ width: `${progress}%` }} />
                    </div>
                  </article>
                );
              })
            )}
          </div>
          <div className="panel tasks-panel" id="tasks-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">FOR TODAY</p>
                <h2>Your tasks</h2>
              </div>
              <span className="count-badge">
                {completed}/{tasks.length}
              </span>
            </div>
            <form className="inline-form" onSubmit={addTask}>
              <input
                aria-label="New task"
                placeholder="Add something to do…"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
              <button className="add-button" aria-label="Add task">
                +
              </button>
            </form>
            {loading ? (
              <p className="muted">Loading your tasks…</p>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <span>✓</span>
                <p>Your day is clear</p>
                <small>Add a task to build momentum.</small>
              </div>
            ) : (
              tasks.slice(0, 6).map((task) => (
                <article
                  className={`task-item ${task.status === "COMPLETED" ? "done" : ""}`}
                  key={task.id}
                >
                  <button
                    className="task-check"
                    aria-label={`Complete ${task.title}`}
                    onClick={() =>
                      task.status !== "COMPLETED" && completeTask(task.id)
                    }
                  >
                    {task.status === "COMPLETED" ? "✓" : ""}
                  </button>
                  <div>
                    <strong>{task.title}</strong>
                    <small>
                      {task.status === "COMPLETED"
                        ? "Completed"
                      : task.priority || "Today"}
                    </small>
                  </div>
                  <button className="task-delete" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`}>×</button>
                </article>
              ))
            )}
          </div>
          <div className="panel habits-panel" id="habits-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">BUILD CONSISTENCY</p>
                <h2>Your habits</h2>
              </div>
              <span className="count-badge">{habits.length}</span>
            </div>
            <form className="inline-form" onSubmit={addHabit}>
              <input
                aria-label="New habit"
                placeholder="Add a daily habit…"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
              />
              <button className="add-button" aria-label="Add habit">
                +
              </button>
            </form>
            {loading ? (
              <p className="muted">Loading your habits…</p>
            ) : habits.length === 0 ? (
              <div className="empty-state">
                <span>◷</span>
                <p>No habits yet</p>
                <small>Start with one small repeatable action.</small>
              </div>
            ) : (
              habits.slice(0, 6).map((habit) => (
                <article className="habit-item" key={habit.id}>
                  <span className="habit-icon">✦</span>
                  <div>
                    <strong>{habit.name}</strong>
                    <small>{habit.frequency.toLowerCase()} routine</small>
                  </div>
                  <button
                    className="habit-done"
                    onClick={() => logHabit(habit.id)}
                  >
                    Done
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
const uiStyles = `.side-nav button,.sidebar-bottom button{display:flex;align-items:center;gap:.8rem;width:100%;border:0;background:transparent;color:#8e9c8d;border-radius:10px;padding:.8rem .75rem;text-align:left;font-size:.88rem}.side-nav button:hover,.sidebar-bottom button:hover{background:#253328;color:#c5e99c}.side-nav button.active{background:#b9ed76;color:#14220f;font-weight:800}.side-nav button span,.sidebar-bottom button span{width:18px;text-align:center;font-size:1.05rem}.side-nav button b{margin-left:auto;font-size:.7rem}.toast{position:fixed;right:2rem;bottom:2rem;z-index:5;display:flex;align-items:center;gap:.8rem;background:#b9ed76;color:#14220f;padding:.8rem 1rem;border-radius:12px;box-shadow:0 12px 30px #0005;font-size:.82rem;font-weight:700;animation:toast-in .25s ease-out}.toast button{border:0;background:transparent;color:#14220f;font-size:1.1rem}@keyframes toast-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`;
const trackerStyles = `.tracker-shell{padding:2rem 4.5vw 4rem;background:#0f1411;border-top:1px solid #29362d}.tracker-card{max-width:1440px;margin:auto;border:1px solid #2d3a30;border-radius:18px;background:#171e18;overflow:hidden}.tracker-head{display:flex;justify-content:space-between;align-items:center;padding:1.35rem 1.5rem;border-bottom:1px solid #2d3a30}.tracker-head h2{margin:.3rem 0;font-size:1.3rem;letter-spacing:-.05em}.tracker-head p{margin:0;color:#849283;font-size:.75rem}.tracker-summary{display:flex;gap:1.5rem;color:#a9b7a7;font-size:.78rem}.tracker-summary strong{color:#b9ed76;font-size:1.1rem;margin-left:.3rem}.tracker-scroll{overflow-x:auto}.tracker-grid{min-width:850px}.tracker-row{display:grid;grid-template-columns:170px repeat(var(--days),34px);align-items:center;padding:.6rem 1.5rem;border-bottom:1px solid #29362d}.tracker-row.header{color:#7e8d7d;font-size:.68rem;font-weight:800}.tracker-row.score{color:#91a092;font-size:.7rem}.tracker-name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:.7rem}.tracker-day{text-align:center}.tracker-box{display:grid;place-items:center;width:23px;height:23px;margin:auto;border:1px solid #455746;border-radius:6px;background:#111712;color:#b9ed76;font-size:.72rem;transition:all .18s ease}.tracker-box:hover{border-color:#b9ed76;transform:scale(1.12)}.tracker-box.checked{background:#b9ed76;border-color:#b9ed76;color:#14220f}.tracker-box.today{box-shadow:0 0 0 2px #b9ed7640}.tracker-footer{padding:.8rem 1.5rem;color:#718071;font-size:.7rem}@media(max-width:700px){.tracker-shell{padding:1.5rem .8rem 3rem}.tracker-head{align-items:flex-start;flex-direction:column;gap:.8rem}.tracker-summary{gap:1rem}}`;
type Preferences = {
  theme: "light" | "dark" | "system";
  accent: "green" | "blue" | "purple" | "orange" | "rose";
  density: "comfortable" | "compact";
  animations: "full" | "reduced" | "off";
  completionEffects: boolean;
  showEmojis: boolean;
};
const defaultPreferences: Preferences = {
  theme: "system",
  accent: "green",
  density: "comfortable",
  animations: "full",
  completionEffects: true,
  showEmojis: true,
};
export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<Preferences>(() =>
    JSON.parse(
      localStorage.getItem("progressly.preferences") ||
        JSON.stringify(defaultPreferences),
    ),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("progressly.accessToken");
    if (token)
      request<User>("/auth/me")
        .then(setUser)
        .catch(() => localStorage.removeItem("progressly.accessToken"));
  }, []);
  useEffect(() => {
    localStorage.setItem("progressly.preferences", JSON.stringify(preferences));
    const root = document.documentElement;
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    root.dataset.theme =
      preferences.theme === "system"
        ? systemDark
          ? "dark"
          : "light"
        : preferences.theme;
    root.dataset.accent = preferences.accent;
    root.dataset.density = preferences.density;
    root.dataset.motion = preferences.animations;
  }, [preferences]);
  useEffect(() => {
    if (preferences.theme !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      document.documentElement.dataset.theme = query.matches ? "dark" : "light";
    };
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, [preferences.theme]);
  function updatePreferences(next: Partial<Preferences>) {
    setPreferences((current) => ({ ...current, ...next }));
  }
  return (
    <>
      <style>{uiStyles + trackerStyles + designStyles}</style>
      {!user ? (
        <Auth onAuthenticated={setUser} />
      ) : (
        <>
          <Dashboard
            user={user}
            onLogout={() => {
              localStorage.removeItem("progressly.accessToken");
              setUser(null);
            }}
          />
          <MonthlyTracker />
          <PersonalizationPanel
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            preferences={preferences}
            update={updatePreferences}
          />
          <BackButton />
        </>
      )}
    </>
  );
}
function BackButton() { return <button className="back-button" onClick={() => Array.from(document.querySelectorAll<HTMLButtonElement>('.side-nav button')).find(button => button.textContent?.includes('Overview'))?.click()} aria-label="Back to home">← Back</button>; }
function MonthlyTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<
    Record<string, { date: string; completed: boolean }[]>
  >({});
  const [month, setMonth] = useState(new Date());
  const [error, setError] = useState("");
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const dates = useMemo(
    () =>
      Array.from({ length: days }, (_, i) => new Date(year, monthIndex, i + 1)),
    [year, monthIndex, days],
  );
  async function load() {
    try {
      const hs = await request<Habit[]>("/habits");
      setHabits(hs);
      const entries = await Promise.all(
        hs.map(
          async (h) =>
            [
              h.id,
              await request<{ date: string; completed: boolean }[]>(
                `/habits/${h.id}/logs`,
              ),
            ] as const,
        ),
      );
      setLogs(Object.fromEntries(entries));
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    load();
  }, [year, monthIndex]);
  function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
  async function toggle(habit: Habit, date: Date) {
    if (date.toDateString() !== new Date().toDateString()) return;
    const key = dateKey(date);
    const current =
      logs[habit.id]?.find((l) => l.date === key)?.completed === true;
    await request(`/habits/${habit.id}/logs`, {
      method: "POST",
      body: JSON.stringify({ completed: !current, date: key }),
    });
    load();
  }
  const checked = (habit: Habit, date: Date) =>
    logs[habit.id]?.some(
      (l) => l.date === dateKey(date) && l.completed,
    ) ?? false;
  const score = (date: Date) => habits.filter((h) => checked(h, date)).length;
  const totalChecks = dates.reduce((sum, d) => sum + score(d), 0);
  const totalPossible = habits.length * days;
  const overall = totalPossible
    ? Math.round((totalChecks / totalPossible) * 100)
    : 0;
  return (
    <section className="tracker-shell">
      <div className="tracker-card">
        <header className="tracker-head">
          <div>
            <p className="eyebrow">CONSISTENCY AT A GLANCE</p>
            <h2>Monthly progress tracker</h2>
            <p>Click any square to mark a habit complete for that day.</p>
          </div>
          <div className="tracker-summary">
            <span>
              {month.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </span>
            <span>
              Overall <strong>{overall}%</strong>
            </span>
            <button
              className="icon-button"
              onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}
              aria-label="Previous month"
            >
              ‹
            </button>
            <button
              className="icon-button"
              onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}
              aria-label="Next month"
            >
              ›
            </button>
          </div>
        </header>
        {error && <p className="error">{error}</p>}
        <div className="tracker-scroll">
          <div
            className="tracker-grid"
            style={{ "--days": days } as React.CSSProperties}
          >
            <div className="tracker-row header">
              <strong className="tracker-name">Activity</strong>
              {dates.map((d) => (
                <span className="tracker-day" key={d.toISOString()}>
                  {d.getDate()}
                </span>
              ))}
            </div>
            {habits.map((h) => (
              <div className="tracker-row" key={h.id}>
                <strong className="tracker-name">{h.name}</strong>
                {dates.map((d) => {
                  const isChecked = checked(h, d);
                  const isToday =
                    d.toDateString() === new Date().toDateString();
                  return (
                    <button
                      className={`tracker-box ${isChecked ? "checked" : ""} ${isToday ? "today" : ""}`}
                      key={d.toISOString()}
                      onClick={() => toggle(h, d)}
                      disabled={!isToday}
                      aria-label={`${h.name} ${d.toLocaleDateString()}${isToday ? "" : " (locked)"}`}
                    >
                      {isChecked ? "✓" : ""}
                    </button>
                  );
                })}
              </div>
            ))}
            <div className="tracker-row score">
              <strong className="tracker-name">Daily score</strong>
              {dates.map((d) => (
                <span className="tracker-day" key={d.toISOString()}>
                  {score(d)}
                </span>
              ))}
            </div>
          </div>
        </div>
        <footer className="tracker-footer">
          {habits.length
            ? `${totalChecks} of ${totalPossible} habit checks completed this month.`
            : "Create habits above to start building your monthly grid."}
        </footer>
      </div>
    </section>
  );
}
const designStyles = `:root{--token-primary:#16a34a;--token-primary-hover:#15803d;--token-primary-light:#dcfce7;--token-accent:#14b8a6;--token-bg:#f8fafc;--token-surface:#fff;--token-text:#0f172a;--token-muted:#64748b;--token-border:#e2e8f0;--token-radius:12px;--token-shadow:0 12px 35px #0f172a14}html[data-theme=dark]{--token-bg:#0f172a;--token-surface:#1e293b;--token-text:#f8fafc;--token-muted:#94a3b8;--token-border:#334155;--token-primary-light:#14532d;--token-shadow:0 12px 35px #0005}html[data-accent=blue]{--token-primary:#2563eb;--token-primary-hover:#1d4ed8;--token-primary-light:#dbeafe;--token-accent:#3b82f6}html[data-accent=purple]{--token-primary:#7c3aed;--token-primary-hover:#6d28d9;--token-primary-light:#ede9fe;--token-accent:#a855f7}html[data-accent=orange]{--token-primary:#ea580c;--token-primary-hover:#c2410c;--token-primary-light:#ffedd5;--token-accent:#f97316}html[data-accent=rose]{--token-primary:#e11d48;--token-primary-hover:#be123c;--token-primary-light:#ffe4e6;--token-accent:#f43f5e}html[data-density=compact] .panel{padding:1rem}html[data-density=compact] .dashboard-main{padding-top:1.5rem}html[data-motion=off] *,html[data-motion=reduced] *{animation:none!important;transition-duration:.01ms!important;scroll-behavior:auto!important}.dashboard-layout,.tracker-shell,.auth-page,.panel,.metric,.tracker-card{transition:background-color .25s ease,border-color .25s ease,color .25s ease}.settings-launcher{position:fixed;right:1.5rem;bottom:1.5rem;z-index:7;border:1px solid var(--token-border);background:var(--token-surface);color:var(--token-text);border-radius:999px;padding:.75rem 1rem;box-shadow:var(--token-shadow);font-weight:700}.settings-panel{position:fixed;right:1.5rem;bottom:5.2rem;z-index:8;width:min(360px,calc(100vw - 2rem));padding:1.2rem;background:var(--token-surface);color:var(--token-text);border:1px solid var(--token-border);border-radius:16px;box-shadow:var(--token-shadow);animation:toast-in .2s ease-out}.settings-panel h3{margin:.2rem 0 1rem}.setting-row{display:grid;gap:.45rem;margin:.8rem 0;color:var(--token-muted);font-size:.78rem;font-weight:700}.setting-row select{border:1px solid var(--token-border);background:var(--token-bg);color:var(--token-text);border-radius:8px;padding:.6rem}.setting-options{display:flex;gap:.4rem;flex-wrap:wrap}.setting-options button{border:1px solid var(--token-border);background:var(--token-bg);color:var(--token-muted);border-radius:8px;padding:.45rem .6rem;font-size:.75rem}.setting-options button.selected{background:var(--token-primary-light);border-color:var(--token-primary);color:var(--token-primary)}.settings-close{float:right;border:0;background:transparent;color:var(--token-muted);font-size:1.2rem}`;
function PersonalizationPanel({
  open,
  onClose,
  preferences,
  update,
}: {
  open: boolean;
  onClose: () => void;
  preferences: Preferences;
  update: (next: Partial<Preferences>) => void;
}) {
  const [visible, setVisible] = useState(open);
  useEffect(() => setVisible(open), [open]);
  return (
    <>
      {!visible && (
        <button className="settings-launcher" onClick={() => setVisible(true)}>
          ⚙ Personalize
        </button>
      )}
      {visible && (
        <aside className="settings-panel" aria-label="Personalization settings">
          <button
            className="settings-close"
            onClick={() => {
              setVisible(false);
              onClose();
            }}
            aria-label="Close settings"
          >
            ×
          </button>
          <p className="eyebrow">PERSONALIZATION</p>
          <h3>Make Progressly yours</h3>
          <div className="setting-row">
            <span>Theme</span>
            <div className="setting-options">
              {(["light", "dark", "system"] as const).map((value) => (
                <button
                  className={preferences.theme === value ? "selected" : ""}
                  onClick={() => update({ theme: value })}
                  key={value}
                >
                  {value[0].toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="setting-row">
            <span>Accent color</span>
            <div className="setting-options">
              {(["green", "blue", "purple", "orange", "rose"] as const).map(
                (value) => (
                  <button
                    className={preferences.accent === value ? "selected" : ""}
                    onClick={() => update({ accent: value })}
                    key={value}
                  >
                    {value[0].toUpperCase() + value.slice(1)}
                  </button>
                ),
              )}
            </div>
          </div>
          <label className="setting-row">
            Density
            <select
              value={preferences.density}
              onChange={(e) =>
                update({ density: e.target.value as Preferences["density"] })
              }
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </label>
          <label className="setting-row">
            Animations
            <select
              value={preferences.animations}
              onChange={(e) =>
                update({
                  animations: e.target.value as Preferences["animations"],
                })
              }
            >
              <option value="full">Full</option>
              <option value="reduced">Reduced</option>
              <option value="off">Off</option>
            </select>
          </label>
          <div className="setting-row">
            <span>Completion effects</span>
            <div className="setting-options">
              <button
                className={preferences.completionEffects ? "selected" : ""}
                onClick={() => update({ completionEffects: true })}
              >
                On
              </button>
              <button
                className={!preferences.completionEffects ? "selected" : ""}
                onClick={() => update({ completionEffects: false })}
              >
                Off
              </button>
            </div>
          </div>
          <p className="muted">
            Preferences are saved locally and apply instantly.
          </p>
        </aside>
      )}
    </>
  );
}
function SettingsPage() {
  const [tab, setTab] = useState("Personalization");
  const [preferences, setPreferences] = useState<Preferences>(() =>
    JSON.parse(
      localStorage.getItem("progressly.preferences") ||
        JSON.stringify(defaultPreferences),
    ),
  );
  const [dirty, setDirty] = useState(false);
  function apply(value: Preferences) {
    document.documentElement.dataset.theme =
      value.theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : value.theme;
    document.documentElement.dataset.accent = value.accent;
    document.documentElement.dataset.density = value.density;
    document.documentElement.dataset.motion = value.animations;
  }
  function update(next: Partial<Preferences>) {
    const value = { ...preferences, ...next };
    setPreferences(value);
    setDirty(true);
    apply(value);
  }
  function save() { localStorage.setItem("progressly.preferences", JSON.stringify(preferences)); setDirty(false); }
  function cancel() { const saved = JSON.parse(localStorage.getItem("progressly.preferences") || JSON.stringify(defaultPreferences)) as Preferences; setPreferences(saved); setDirty(false); apply(saved); }
  return (
    <section id="settings-page" className="settings-page" hidden>
      <div className="settings-page-inner">
        <div className="settings-page-header">
          <div>
            <p className="eyebrow">ACCOUNT SETTINGS</p>
            <h2>Settings</h2>
            <p>Personalize your workspace and control how Progressly feels.</p>
          </div>
          <button
            className="settings-page-close"
            onClick={() =>
              document
                .getElementById("settings-page")
                ?.setAttribute("hidden", "")
            }
          >
            ×
          </button>
        </div>
        <div className="settings-tabs" role="tablist">
          {[
            "User",
            "Personalization",
            "Notifications",
            "Preferences",
            "Security",
          ].map((item) => (
            <button
              role="tab"
              aria-selected={tab === item}
              className={tab === item ? "active" : ""}
              onClick={() => setTab(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
        {tab === "Personalization" && (
          <div className="settings-content">
            <h3>Personalization</h3>
            <p className="settings-muted">
              Choose the visual language and interaction style for your
              workspace.
            </p>
            <div className="settings-grid">
              <div className="settings-field">
                <strong>Theme</strong>
                <div className="settings-choice-row">
                  {(["light", "dark", "system"] as const).map((value) => (
                    <button
                      className={preferences.theme === value ? "selected" : ""}
                      onClick={() => update({ theme: value })}
                      key={value}
                    >
                      {value[0].toUpperCase() + value.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="settings-field">
                <strong>Accent colour</strong>
                <div className="settings-choice-row">
                  {(["green", "blue", "purple", "orange", "rose"] as const).map(
                    (value) => (
                      <button
                        className={`swatch ${value} ${preferences.accent === value ? "selected" : ""}`}
                        onClick={() => update({ accent: value })}
                        key={value}
                      >
                        <span />
                        {value[0].toUpperCase() + value.slice(1)}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <label className="settings-field">
                <strong>Density</strong>
                <select
                  value={preferences.density}
                  onChange={(e) =>
                    update({
                      density: e.target.value as Preferences["density"],
                    })
                  }
                >
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
              </label>
              <label className="settings-field">
                <strong>Animations</strong>
                <select
                  value={preferences.animations}
                  onChange={(e) =>
                    update({
                      animations: e.target.value as Preferences["animations"],
                    })
                  }
                >
                  <option value="full">Full</option>
                  <option value="reduced">Reduced</option>
                  <option value="off">Off</option>
                </select>
              </label>
              <div className="settings-field">
                <strong>Completion effects</strong>
                <div className="settings-choice-row">
                  <button
                    className={preferences.completionEffects ? "selected" : ""}
                    onClick={() => update({ completionEffects: true })}
                  >
                    On
                  </button>
                  <button
                    className={!preferences.completionEffects ? "selected" : ""}
                    onClick={() => update({ completionEffects: false })}
                  >
                    Off
                  </button>
                </div>
              </div>
              <div className="settings-field">
                <strong>Show emojis</strong>
                <div className="settings-choice-row">
                  <button
                    className={preferences.showEmojis ? "selected" : ""}
                    onClick={() => update({ showEmojis: true })}
                  >
                    On
                  </button>
                  <button
                    className={!preferences.showEmojis ? "selected" : ""}
                    onClick={() => update({ showEmojis: false })}
                  >
                    Off
                  </button>
                </div>
              </div>
            </div>
            <div className="settings-actions"><button className="settings-cancel" onClick={cancel} disabled={!dirty}>Cancel</button><button className="primary" onClick={save} disabled={!dirty}>Save changes</button></div>
          </div>
        )}
        {tab !== "Personalization" && (
          <div className="settings-content">
            <h3>{tab}</h3>
            <p className="settings-muted">
              This settings area is reserved for the {tab.toLowerCase()}{" "}
              experience and is ready for its backend preferences.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
const settingsHost = document.createElement("div");
settingsHost.id = "settings-root";
document.body.appendChild(settingsHost);
createRoot(settingsHost).render(<SettingsPage />);
const rootElement = document.getElementById("root");
if (rootElement)
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
