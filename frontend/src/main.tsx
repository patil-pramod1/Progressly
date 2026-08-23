import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

export function App() {
  return <main className="shell"><p className="eyebrow">PERSONAL PROGRESS, MADE VISIBLE</p><h1>Progressly</h1><p className="lead">Your flexible workspace for goals, habits, tasks, and the small wins that compound.</p><div className="status"><span className="dot" /> Phase 1 foundation ready</div><section className="cards"><article><span>01</span><h2>Goals</h2><p>Define what progress means to you.</p></article><article><span>02</span><h2>Daily rhythm</h2><p>Turn intentions into trackable actions.</p></article><article><span>03</span><h2>Insights</h2><p>See the patterns behind your momentum.</p></article></section></main>;
}

const rootElement = document.getElementById('root');
if (rootElement) createRoot(rootElement).render(<StrictMode><App /></StrictMode>);
