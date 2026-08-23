import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
type User = { id: string; email: string; displayName: string; role: string };
type Goal = { id: string; title: string; description?: string; status: string; currentValue: number; targetValue?: number; trackingType: string };
type Task = { id: string; title: string; dueDate?: string; status: string; priority?: string };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('progressly.accessToken');
  const response = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } });
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.message || `Request failed (${response.status})`); }
  return response.status === 204 ? (undefined as T) : response.json();
}

function Auth({ onAuthenticated }: { onAuthenticated: (user: User, accessToken: string) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', displayName: '', password: '' });
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); setError(''); try { const data = await request<{ accessToken: string; user: User }>(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(form) }); localStorage.setItem('progressly.accessToken', data.accessToken); onAuthenticated(data.user, data.accessToken); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }
  return <main className="auth shell"><p className="eyebrow">PERSONAL PROGRESS, MADE VISIBLE</p><h1>Progressly</h1><p className="lead">Goals, daily rhythm, and measurable momentum in one calm workspace.</p><form className="panel auth-form" onSubmit={submit}><div className="tabs"><button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Log in</button><button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Create account</button></div>{mode === 'register' && <input required minLength={2} placeholder="Display name" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} />}<input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /><input required minLength={8} type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />{error && <p className="error">{error}</p>}<button className="primary" disabled={busy}>{busy ? 'Working…' : mode === 'login' ? 'Log in' : 'Create account'}</button></form></main>;
}

function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [goals, setGoals] = useState<Goal[]>([]); const [tasks, setTasks] = useState<Task[]>([]); const [title, setTitle] = useState(''); const [taskTitle, setTaskTitle] = useState(''); const [error, setError] = useState('');
  async function load() { try { const [g, t] = await Promise.all([request<{ content: Goal[] }>('/goals?size=50'), request<{ content: Task[] }>('/tasks?size=50')]); setGoals(g.content); setTasks(t.content); } catch (e) { setError((e as Error).message); } }
  useEffect(() => { load(); }, []);
  async function addGoal(e: React.FormEvent) { e.preventDefault(); if (!title.trim()) return; await request('/goals', { method: 'POST', body: JSON.stringify({ title, trackingType: 'TASK' }) }); setTitle(''); load(); }
  async function addTask(e: React.FormEvent) { e.preventDefault(); if (!taskTitle.trim()) return; await request('/tasks', { method: 'POST', body: JSON.stringify({ title: taskTitle, recurrence: 'NONE' }) }); setTaskTitle(''); load(); }
  async function completeTask(id: string) { await request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'COMPLETED' }) }); load(); }
  return <main className="app-shell"><header className="topbar"><div><p className="eyebrow">PROGRESSLY</p><h1>Good to see you, {user.displayName}</h1></div><button className="ghost" onClick={onLogout}>Log out</button></header>{error && <p className="error">{error}</p>}<section className="metrics"><div className="metric"><span>Active goals</span><strong>{goals.filter(g => g.status !== 'COMPLETED').length}</strong></div><div className="metric"><span>Tasks</span><strong>{tasks.length}</strong></div><div className="metric"><span>Completed</span><strong>{tasks.filter(t => t.status === 'COMPLETED').length}</strong></div></section><section className="columns"><div className="panel"><div className="section-head"><h2>Goals</h2><span>{goals.length}</span></div><form className="inline-form" onSubmit={addGoal}><input placeholder="Add a goal…" value={title} onChange={e => setTitle(e.target.value)} /><button className="primary">Add</button></form>{goals.length === 0 ? <p className="muted">Create your first goal.</p> : goals.map(goal => <article className="list-item" key={goal.id}><div><strong>{goal.title}</strong><small>{goal.status.replace('_', ' ')}</small></div><span className="tag">{goal.trackingType}</span></article>)}</div><div className="panel"><div className="section-head"><h2>Today’s tasks</h2><span>{tasks.length}</span></div><form className="inline-form" onSubmit={addTask}><input placeholder="Add a task…" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} /><button className="primary">Add</button></form>{tasks.length === 0 ? <p className="muted">Add a task for today.</p> : tasks.map(task => <article className={`list-item ${task.status === 'COMPLETED' ? 'done' : ''}`} key={task.id}><div><strong>{task.title}</strong><small>{task.status.replace('_', ' ')}</small></div>{task.status !== 'COMPLETED' && <button className="check" onClick={() => completeTask(task.id)}>Complete</button>}</article>)}</div></section></main>;
}

export function App() { const [user, setUser] = useState<User | null>(null); useEffect(() => { const token = localStorage.getItem('progressly.accessToken'); if (token) request<User>('/auth/me').then(setUser).catch(() => localStorage.removeItem('progressly.accessToken')); }, []); if (!user) return <Auth onAuthenticated={(next) => setUser(next)} />; return <Dashboard user={user} onLogout={() => { localStorage.removeItem('progressly.accessToken'); setUser(null); }} />; }
const rootElement = document.getElementById('root'); if (rootElement) createRoot(rootElement).render(<StrictMode><App /></StrictMode>);
