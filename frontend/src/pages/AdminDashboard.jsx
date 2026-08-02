import { useEffect, useState } from 'react';
import api from '../api/client.js';

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-4 text-center bg-white dark:bg-slate-900 shadow-card">
      <p className="font-display text-2xl font-extrabold bg-gradient-to-r from-brand-500 to-fuchsia-500 bg-clip-text text-transparent">
        {value}
      </p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function SectionCard({ children }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-5 space-y-3 bg-white dark:bg-slate-900 shadow-card">
      {children}
    </div>
  );
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 transition';

const primaryBtn =
  'px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-brand-500 to-fuchsia-500 text-white hover:shadow-glow transition-all disabled:opacity-60';

function UploadForm({ categories, onUploaded }) {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);
  const [selectedCats, setSelectedCats] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function toggleCat(id) {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title || (!file && !imageUrl)) {
      setError('Title and an image/video (file or URL) are required.');
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('caption', caption);
      if (file) form.append('image', file);
      else form.append('imageUrl', imageUrl);
      form.append('categoryIds', JSON.stringify(selectedCats));

      await api.post('/admin/memes', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTitle('');
      setCaption('');
      setImageUrl('');
      setFile(null);
      setSelectedCats([]);
      onUploaded();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <SectionCard>
        <h2 className="font-display font-bold text-lg">✨ Upload a new meme</h2>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
        <textarea
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className={inputClass}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-50 file:text-brand-700 dark:file:bg-brand-500/10 dark:file:text-brand-400 file:font-medium file:cursor-pointer"
          />
          <input
            placeholder="...or paste an image/video URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={!!file}
            className={`${inputClass} disabled:opacity-50`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => toggleCat(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCats.includes(c.id)
                  ? 'bg-gradient-to-r from-brand-500 to-fuchsia-500 text-white shadow-glow'
                  : 'border border-slate-200 dark:border-slate-700 hover:border-brand-300'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        {error ? <p className="text-red-500 text-sm">{error}</p> : null}
        <button disabled={submitting} className={primaryBtn}>
          {submitting ? 'Uploading...' : 'Upload meme'}
        </button>
      </SectionCard>
    </form>
  );
}

function MemeRow({ meme, onChanged }) {
  async function togglePin() {
    await api.patch(`/admin/memes/${meme.id}/pin`, { pinned: !meme.is_pinned });
    onChanged();
  }
  async function remove() {
    if (!confirm(`Delete "${meme.title}"? This can't be undone.`)) return;
    await api.delete(`/admin/memes/${meme.id}`);
    onChanged();
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <img src={meme.image_url} alt="" className="w-14 h-14 object-cover rounded-xl" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{meme.title}</p>
        <p className="text-xs text-slate-500">
          👍 {meme.upvotes} · 🤯 {meme.crazy_votes ?? 0} · 👎 {meme.downvotes}
        </p>
      </div>
      <button
        onClick={togglePin}
        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
          meme.is_pinned
            ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm'
            : 'border border-slate-200 dark:border-slate-700 hover:border-amber-300'
        }`}
      >
        {meme.is_pinned ? '★ Pinned' : '☆ Pin'}
      </button>
      <button onClick={remove} className="text-xs font-medium text-red-500 hover:underline">
        Delete
      </button>
    </div>
  );
}

const BADGE_SUGGESTIONS = ['Most Memed', 'Legend', 'Fan Favorite', 'Strictest', 'Funniest'];

function TeacherForm({ onAdded }) {
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [badge, setBadge] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name) {
      setError('Name is required.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/admin/teachers', { name, photoUrl, badge });
      setName('');
      setPhotoUrl('');
      setBadge('');
      onAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add teacher');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <SectionCard>
        <h2 className="font-display font-bold text-lg">🏫 Add a teacher</h2>
        <input
          placeholder="Teacher name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Photo URL (optional)"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Badge (e.g. Legend)"
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          className={inputClass}
        />
        <div className="flex flex-wrap gap-2">
          {BADGE_SUGGESTIONS.map((b) => (
            <button
              type="button"
              key={b}
              onClick={() => setBadge(b)}
              className="px-3.5 py-1.5 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-700 hover:border-brand-300 transition"
            >
              🏅 {b}
            </button>
          ))}
        </div>
        {error ? <p className="text-red-500 text-sm">{error}</p> : null}
        <button disabled={submitting} className={primaryBtn}>
          {submitting ? 'Adding...' : 'Add teacher'}
        </button>
      </SectionCard>
    </form>
  );
}

function TeacherRow({ teacher, onChanged }) {
  async function remove() {
    if (!confirm(`Remove "${teacher.name}"?`)) return;
    await api.delete(`/admin/teachers/${teacher.id}`);
    onChanged();
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <img
        src={teacher.photo_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + teacher.name}
        alt=""
        className="w-12 h-12 rounded-full object-cover bg-slate-100"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{teacher.name}</p>
        {teacher.badge ? <p className="text-xs text-slate-500">🏅 {teacher.badge}</p> : null}
      </div>
      <button onClick={remove} className="text-xs font-medium text-red-500 hover:underline">
        Remove
      </button>
    </div>
  );
}

function PollForm({ onAdded }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function updateOption(i, value) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));
  }

  function addOptionField() {
    setOptions((prev) => [...prev, '']);
  }

  function removeOptionField(i) {
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const cleaned = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || cleaned.length < 2) {
      setError('A question and at least 2 non-empty options are required.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/admin/polls', { question, options: cleaned });
      setQuestion('');
      setOptions(['', '']);
      onAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create poll');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <SectionCard>
        <h2 className="font-display font-bold text-lg">📊 Create a poll</h2>
        <input
          placeholder="Poll question (e.g. Best teacher?)"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className={inputClass}
        />
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                className={`flex-1 ${inputClass}`}
              />
              {options.length > 2 ? (
                <button
                  type="button"
                  onClick={() => removeOptionField(i)}
                  className="px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-red-500 hover:border-red-300 transition"
                >
                  ✕
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addOptionField}
          className="text-sm text-brand-600 dark:text-brand-400 font-semibold"
        >
          + Add another option
        </button>
        {error ? <p className="text-red-500 text-sm">{error}</p> : null}
        <button disabled={submitting} className={primaryBtn}>
          {submitting ? 'Creating...' : 'Create poll'}
        </button>
      </SectionCard>
    </form>
  );
}

function PollRow({ poll, onChanged }) {
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);

  async function remove() {
    if (!confirm(`Delete poll "${poll.question}"?`)) return;
    await api.delete(`/admin/polls/${poll.id}`);
    onChanged();
  }

  return (
    <div className="py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex items-center justify-between">
        <p className="font-semibold">{poll.question}</p>
        <button onClick={remove} className="text-xs font-medium text-red-500 hover:underline">
          Delete
        </button>
      </div>
      <div className="mt-1 space-y-0.5">
        {poll.options.map((o) => (
          <p key={o.id} className="text-xs text-slate-500">
            {o.option_text}: {o.votes} vote{o.votes === 1 ? '' : 's'}
          </p>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-1">{totalVotes} total votes</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [memes, setMemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [polls, setPolls] = useState([]);

  async function refresh() {
    const [
      { data: analyticsData },
      { data: memeData },
      { data: catData },
      { data: teacherData },
      { data: pollData },
    ] = await Promise.all([
      api.get('/admin/analytics'),
      api.get('/memes', { params: { limit: 50, sort: 'new' } }),
      api.get('/categories'),
      api.get('/teachers'),
      api.get('/polls'),
    ]);
    setAnalytics(analyticsData);
    setMemes(memeData.data);
    setCategories(catData);
    setTeachers(teacherData);
    setPolls(pollData);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Admin{' '}
        <span className="bg-gradient-to-r from-brand-500 to-fuchsia-500 bg-clip-text text-transparent">
          Dashboard
        </span>
      </h1>

      {analytics ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total memes" value={analytics.totalMemes} />
          <StatCard label="Upvotes" value={analytics.totalUpvotes} />
          <StatCard label="Downvotes" value={analytics.totalDownvotes} />
          <StatCard label="Interactions" value={analytics.totalInteractions} />
        </div>
      ) : null}

      <UploadForm categories={categories} onUploaded={refresh} />

      <div>
        <h2 className="font-display font-bold text-lg mb-2">Manage memes</h2>
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 px-4 bg-white dark:bg-slate-900 shadow-card">
          {memes.map((m) => (
            <MemeRow key={m.id} meme={m} onChanged={refresh} />
          ))}
          {memes.length === 0 && (
            <p className="py-6 text-center text-slate-500">No memes uploaded yet.</p>
          )}
        </div>
      </div>

      <TeacherForm onAdded={refresh} />

      <div>
        <h2 className="font-display font-bold text-lg mb-2">Manage teachers</h2>
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 px-4 bg-white dark:bg-slate-900 shadow-card">
          {teachers.map((t) => (
            <TeacherRow key={t.id} teacher={t} onChanged={refresh} />
          ))}
          {teachers.length === 0 && (
            <p className="py-6 text-center text-slate-500">No teachers added yet.</p>
          )}
        </div>
      </div>

      <PollForm onAdded={refresh} />

      <div>
        <h2 className="font-display font-bold text-lg mb-2">Manage polls</h2>
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 px-4 bg-white dark:bg-slate-900 shadow-card">
          {polls.map((p) => (
            <PollRow key={p.id} poll={p} onChanged={refresh} />
          ))}
          {polls.length === 0 && (
            <p className="py-6 text-center text-slate-500">No polls created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
