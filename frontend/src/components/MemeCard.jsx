import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

export default function MemeCard({ meme }) {
  const [upvotes, setUpvotes] = useState(meme.upvotes);
  const [downvotes, setDownvotes] = useState(meme.downvotes);
  const [crazyVotes, setCrazyVotes] = useState(meme.crazy_votes ?? 0);
  const [myVote, setMyVote] = useState(null);
  const [pop, setPop] = useState(false);
  const [copied, setCopied] = useState(false);

  async function vote(type) {
    try {
      const { data } = await api.post(`/memes/${meme.slug}/vote`, { type });
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
      setCrazyVotes(data.crazyVotes);
      setMyVote(data.yourVote);
      setPop(true);
      setTimeout(() => setPop(false), 350);
    } catch (e) {
      console.error('Vote failed', e);
    }
  }

  async function share(e) {
    e.preventDefault();
    const url = `${window.location.origin}/meme/${meme.slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg hover:shadow-brand-500/10 transition">
      {meme.is_pinned ? (
        <div className="bg-gradient-to-r from-amber-400 to-pink-500 text-white text-xs font-bold px-3 py-1 text-center">
          ⭐ Hall of Fame
        </div>
      ) : null}
      <Link to={`/meme/${meme.slug}`}>
        {meme.media_type === 'video' ? (
          <video
            src={meme.image_url}
            controls
            muted
            loop
            playsInline
            className="w-full h-56 object-cover bg-black"
          />
        ) : (
          <img
            src={meme.image_url}
            alt={meme.title}
            loading="lazy"
            className="w-full h-56 object-cover bg-slate-100 dark:bg-slate-800"
          />
        )}
      </Link>
      <div className="p-4">
        <Link to={`/meme/${meme.slug}`}>
          <h3 className="font-bold text-lg leading-snug hover:text-brand-500 transition">
            {meme.title}
          </h3>
        </Link>
        {meme.caption ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {meme.caption}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-1.5 mt-2">
          {meme.categories?.map((c) => (
            <span
              key={c.slug}
              className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
            >
              {c.name}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => vote('up')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold transition ${
                myVote === 'up'
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-orange-500/20'
              }`}
            >
              <span className={pop && myVote === 'up' ? 'animate-pop' : ''}>👍</span>
              {upvotes}
            </button>
            <button
              onClick={() => vote('crazy')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold transition ${
                myVote === 'crazy'
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-500/20'
              }`}
            >
              <span className={pop && myVote === 'crazy' ? 'animate-pop' : ''}>🤯</span>
              {crazyVotes}
            </button>
            <button
              onClick={() => vote('down')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold transition ${
                myVote === 'down'
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              👎 {downvotes}
            </button>
          </div>
          <button
            onClick={share}
            className="text-sm text-slate-500 hover:text-brand-500 transition"
            title="Copy link"
          >
            {copied ? '✅ Copied' : '🔗 Share'}
          </button>
        </div>
      </div>
    </div>
  );
}
