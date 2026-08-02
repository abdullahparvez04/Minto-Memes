import { useEffect, useState } from 'react';
import api from '../api/client.js';

function getVotedPolls() {
  try {
    return JSON.parse(localStorage.getItem('voted_polls') || '{}');
  } catch {
    return {};
  }
}

function saveVotedPoll(pollId, optionId) {
  const voted = getVotedPolls();
  voted[pollId] = optionId;
  localStorage.setItem('voted_polls', JSON.stringify(voted));
}

function PollCard({ poll, votedOptionId, onVoted }) {
  const [options, setOptions] = useState(poll.options);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const hasVoted = votedOptionId != null;
  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

  async function vote(optionId) {
    setError('');
    setVoting(true);
    try {
      const { data } = await api.post(`/polls/${poll.id}/vote`, { optionId });
      setOptions(data.options);
      saveVotedPoll(poll.id, optionId);
      onVoted(poll.id, optionId);
    } catch (err) {
      setError(err.response?.data?.error || 'Vote failed');
    } finally {
      setVoting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-5 bg-white dark:bg-slate-900 shadow-card hover:shadow-glow transition-all duration-300 animate-fadeUp">
      <h3 className="font-display font-bold text-lg mb-4">{poll.question}</h3>
      <div className="space-y-2.5">
        {options.map((opt) => {
          const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
          const isMine = votedOptionId === opt.id;
          return (
            <button
              key={opt.id}
              disabled={hasVoted || voting}
              onClick={() => vote(opt.id)}
              className={`w-full text-left relative overflow-hidden rounded-xl border px-4 py-3 transition-all ${
                isMine
                  ? 'border-brand-400 ring-1 ring-brand-400'
                  : 'border-slate-200 dark:border-slate-700'
              } ${
                hasVoted
                  ? 'cursor-default'
                  : 'hover:border-brand-300 dark:hover:border-brand-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {hasVoted ? (
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-500/15 to-fuchsia-500/15 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              ) : null}
              <div className="relative flex justify-between items-center">
                <span className="font-medium">
                  {isMine ? '✅ ' : ''}
                  {opt.option_text}
                </span>
                {hasVoted ? <span className="font-bold text-brand-600 dark:text-brand-400">{pct}%</span> : null}
              </div>
            </button>
          );
        })}
      </div>
      {error ? <p className="text-red-500 text-sm mt-2">{error}</p> : null}
      {hasVoted ? (
        <p className="text-xs text-slate-400 mt-3">{totalVotes} total votes</p>
      ) : null}
    </div>
  );
}

export default function PollsPage() {
  const [polls, setPolls] = useState([]);
  const [votedMap, setVotedMap] = useState(getVotedPolls());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/polls').then(({ data }) => {
      setPolls(data);
      setLoading(false);
    });
  }, []);

  function handleVoted(pollId, optionId) {
    setVotedMap((prev) => ({ ...prev, [pollId]: optionId }));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">
      <div className="text-center mb-4">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          📊{' '}
          <span className="bg-gradient-to-r from-brand-500 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">
            Polls
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
          Have your say. One vote, real results.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="skeleton h-5 w-2/3 rounded mb-4" />
              <div className="skeleton h-10 w-full rounded-xl mb-2" />
              <div className="skeleton h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : polls.length === 0 ? (
        <p className="text-center text-slate-500">No polls yet — check back soon!</p>
      ) : (
        polls.map((poll) => (
          <PollCard
            key={poll.id}
            poll={poll}
            votedOptionId={votedMap[poll.id]}
            onVoted={handleVoted}
          />
        ))
      )}
    </div>
  );
}
