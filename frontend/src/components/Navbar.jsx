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
    <nav className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="font-display text-lg sm:text-xl font-bold tracking-tight flex items-center gap-1.5 hover:opacity-80 transition"
        >
          <span>Minto</span>
          <span className="bg-gradient-to-r from-brand-500 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">
            Memes
          </span>
          <span className="animate-float">🔥</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/teachers"
            className="px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 transition whitespace-nowrap"
          >
            🏫 <span className="hidden xs:inline">Teachers</span>
          </Link>
          <Link
            to="/polls"
            className="px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 transition whitespace-nowrap"
          >
            📊 <span className="hidden xs:inline">Polls</span>
          </Link>
          <button
            onClick={() => setDark((d) => !d)}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition"
            aria-label="Toggle dark mode"
          >
            {dark ? '☀️' : '🌙'}
          </button>
          {isAuthenticated ? (
            <div className="flex items-center gap-1 pl-1">
              <Link
                to="/admin"
                className="px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="px-2.5 py-1.5 rounded-full text-xs sm:text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
