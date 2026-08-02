export default function FilterBar({
  categories,
  activeCategory,
  onCategoryChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
}) {
  return (
    <div className="flex flex-col gap-3 mb-8">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search memes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
        </div>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-full w-fit">
          <button
            onClick={() => onSortChange('new')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              sort === 'new'
                ? 'bg-white dark:bg-slate-900 shadow-sm text-brand-600 dark:text-brand-400'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            🆕 Newest
          </button>
          <button
            onClick={() => onSortChange('top')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              sort === 'top'
                ? 'bg-white dark:bg-slate-900 shadow-sm text-brand-600 dark:text-brand-400'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            🏆 Top
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            !activeCategory
              ? 'bg-gradient-to-r from-brand-500 to-fuchsia-500 text-white shadow-glow'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => onCategoryChange(c.slug)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeCategory === c.slug
                ? 'bg-gradient-to-r from-brand-500 to-fuchsia-500 text-white shadow-glow'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
