import { useEffect, useState, useCallback } from 'react';
import api from '../api/client.js';
import FilterBar from '../components/FilterBar.jsx';
import MemeGrid from '../components/MemeGrid.jsx';

export default function Home() {
  const [memes, setMemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('new');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
  }, []);

  const fetchMemes = useCallback(
    async (pageNum, replace) => {
      setLoading(true);
      try {
        const { data } = await api.get('/memes', {
          params: { category, search, sort, page: pageNum, limit: 9 },
        });
        setMemes((prev) => (replace ? data.data : [...prev, ...data.data]));
        setHasMore(data.hasMore);
      } finally {
        setLoading(false);
      }
    },
    [category, search, sort]
  );

  useEffect(() => {
    setPage(1);
    fetchMemes(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, search, sort]);

  function loadMore() {
    if (loading) return;
    const next = page + 1;
    setPage(next);
    fetchMemes(next, false);
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-4 text-center">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          The freshest{' '}
          <span className="bg-gradient-to-r from-brand-500 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">
            school memes
          </span>
          , daily 🔥
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base">
          Vote, laugh, and share — curated by your school, made for you.
        </p>
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <FilterBar
          categories={categories}
          activeCategory={category}
          onCategoryChange={setCategory}
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
        />
        <MemeGrid memes={memes} loading={loading} hasMore={hasMore} onLoadMore={loadMore} />
      </div>
    </div>
  );
}
