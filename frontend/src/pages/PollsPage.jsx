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
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
      <h3 className="font-bold text-lg mb-3">{poll.question}</h3>
      <div className="space-y-2">
        {options.map((opt) => {
          const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
          const isMine = votedOptionId === opt.id;
          return (
            <button
              key={opt.id}
              disabled={hasVoted || voting}
              onClick={() => vote(opt.id)}
              className={`w-full text-left relative overflow-hidden rounded-lg border px-4 py-2.5 transition ${
                isMine ? 'border-brand-500' : 'border-slate-300 dark:border-slate-700'
              } ${hasVoted ? 'cursor-default' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {hasVoted ? (
                <div
                  className="absolute inset-y-0 left-0 bg-brand-500/15"
                  style={{ width: `${pct}%` }}
                />
              ) : null}
              <div className="relative flex justify-between">
                <span>
                  {isMine ? '✅ ' : ''}
                  {opt.option_text}
                </span>
                {hasVoted ? <span className="font-semibold">{pct}%</span> : null}
              </div>
            </button>
          );
        })}
      </div>
      {error ? <p className="text-red-500 text-sm mt-2">{error}</p> : null}
      {hasVoted ? <p className="text-xs text-slate-500 mt-3">{totalVotes} total votes</p> : null}
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
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <h1 className="text-2xl font-bold">📊 Polls</h1>
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : polls.length === 0 ? (
        <p className="text-slate-500">No polls yet — check back soon!</p>
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
