import { useEffect, useState } from 'react';
import api from '../api/client.js';

function badgeStyle(badge) {
  const map = {
    'Most Memed': 'from-pink-500 to-rose-500',
    Legend: 'from-amber-400 to-orange-500',
    'Fan Favorite': 'from-emerald-400 to-teal-500',
  };
  return map[badge] || 'from-brand-500 to-fuchsia-500';
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teachers').then(({ data }) => {
      setTeachers(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          🏫 Teachers{' '}
          <span className="bg-gradient-to-r from-brand-500 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">
            Hall of Fame
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
          The icons, the legends, the ones who make school unforgettable.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-center"
            >
              <div className="skeleton w-20 h-20 rounded-full mx-auto mb-3" />
              <div className="skeleton h-4 w-2/3 mx-auto rounded" />
            </div>
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <p className="text-center text-slate-500">No teachers added yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {teachers.map((t, i) => (
            <div
              key={t.id}
              style={{ animationDelay: `${i * 60}ms` }}
              className="group rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-5 text-center bg-white dark:bg-slate-900 shadow-card hover:shadow-glow hover:-translate-y-1 transition-all duration-300 animate-fadeUp"
            >
              <div className="relative w-20 h-20 mx-auto mb-3">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-400 to-fuchsia-400 opacity-0 group-hover:opacity-30 blur-md transition-opacity" />
                <img
                  src={t.photo_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + t.name}
                  alt={t.name}
                  className="relative w-20 h-20 rounded-full object-cover bg-slate-100 ring-2 ring-white dark:ring-slate-900"
                />
              </div>
              <p className="font-display font-bold">{t.name}</p>
              {t.badge ? (
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${badgeStyle(
                    t.badge
                  )} shadow-sm`}
                >
                  🏅 {t.badge}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
