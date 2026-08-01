import { useEffect, useRef } from 'react';
import MemeCard from './MemeCard.jsx';
import MemeCardSkeleton from './Skeleton.jsx';

export default function MemeGrid({ memes, loading, hasMore, onLoadMore }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { rootMargin: '400px' }
    );
    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, onLoadMore]);

  if (!loading && memes.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="text-4xl mb-2">🕵️</p>
        <p>No memes found. Try a different filter or search.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {memes.map((meme) => (
          <MemeCard key={meme.id} meme={meme} />
        ))}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => <MemeCardSkeleton key={`sk-${i}`} />)}
      </div>
      <div ref={sentinelRef} className="h-10" />
    </div>
  );
}