import { useEffect, useState } from 'react';
import api from '../api/client.js';

function badgeColor(badge) {
  const map = {
    'Most Memed': 'from-pink-500 to-rose-500',
    Legend: 'from-amber-400 to-orange-500',
    'Fan Favorite': 'from-emerald-400 to-teal-500',
  };
  return map[badge] || 'from-brand-500 to-purple-500';
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🏫 Teachers Hall of Fame</h1>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : teachers.length === 0 ? (
        <p className="text-slate-500">No teachers added yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {teachers.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-center bg-white dark:bg-slate-900"
            >
              <img
                src={t.photo_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + t.name}
                alt={t.name}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-3 bg-slate-100"
              />
              <p className="font-bold">{t.name}</p>
              {t.badge ? (
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${badgeColor(
                    t.badge
                  )}`}
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