import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <nav className="sticky top-0 z-20 backdrop-blur bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-extrabold tracking-tight">
          Minto<span className="text-brand-500">Memes</span> 🔥
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/teachers"
            className="hidden sm:inline-flex text-sm font-medium hover:text-brand-500"
          >
            🏫 Teachers
          </Link>
          <Link
            to="/polls"
            className="hidden sm:inline-flex text-sm font-medium hover:text-brand-500"
          >
            📊 Polls
          </Link>
          <button
            onClick={() => setDark((d) => !d)}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle dark mode"
          >
            {dark ? '☀️' : '🌙'}
          </button>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/admin" className="text-sm font-medium hover:text-brand-500">
                Dashboard
              </Link>
              <button onClick={logout} className="text-sm text-slate-500 hover:text-red-500">
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
