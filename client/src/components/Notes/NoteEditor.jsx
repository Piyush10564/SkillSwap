import { useState } from 'react';
import { noteService } from '../../services/noteService';

export default function NoteEditor({ sessionId, userId, onSuccess }) {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await noteService.createNote({
        sessionId,
        content,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      });
      setContent('');
      setTags('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-surface p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Learning Notes</h3>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Notes *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you learn? What should you practice?"
          required
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
          rows={4}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., react, hooks, performance"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-300 hover:brightness-105 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Note'}
      </button>
    </form>
  );
}
