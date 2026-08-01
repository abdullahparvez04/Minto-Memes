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
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search memes..."
          className="w-full sm:w-72 px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <div className="flex gap-2">
          <button
            onClick={() => onSortChange('new')}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
              sort === 'new'
                ? 'bg-brand-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            🆕 Newest
          </button>
          <button
            onClick={() => onSortChange('top')}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
              sort === 'top'
                ? 'bg-brand-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            🏆 Top
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-3 py-1 rounded-full text-sm font-medium border ${
            !activeCategory
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
              : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => onCategoryChange(c.slug)}
            className={`px-3 py-1 rounded-full text-sm font-medium border ${
              activeCategory === c.slug
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}