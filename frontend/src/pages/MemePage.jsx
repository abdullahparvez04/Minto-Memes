import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';
import MemeCard from '../components/MemeCard.jsx';
import MemeCardSkeleton from '../components/Skeleton.jsx';

export default function MemePage() {
  const { slug } = useParams();
  const [meme, setMeme] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMeme(null);
    setNotFound(false);
    api
      .get(`/memes/${slug}`)
      .then(({ data }) => setMeme(data))
      .catch(() => setNotFound(true));
  }, [slug]);

  async function goRandom() {
    const { data } = await api.get('/memes/random');
    navigate(`/meme/${data.slug}`);
  }

  if (notFound) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-2">😵</p>
        <p className="text-lg font-semibold">This meme doesn't exist (or was deleted).</p>
        <Link to="/" className="text-brand-500 font-medium mt-4 inline-block">
          ← Back to feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-slate-500 hover:text-brand-500">
        ← Back to feed
      </Link>
      <div className="mt-4">{meme ? <MemeCard meme={meme} /> : <MemeCardSkeleton />}</div>
      <button
        onClick={goRandom}
        className="w-full mt-4 py-2.5 rounded-full font-semibold bg-brand-500 text-white hover:bg-brand-600 transition"
      >
        🎲 Show me another
      </button>
    </div>
  );
}