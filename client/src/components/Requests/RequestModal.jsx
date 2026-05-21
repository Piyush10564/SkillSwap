import { useState } from 'react';
import { requestService } from '../../services/requestService';

export default function RequestModal({ skill, onClose, onCreated }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const teacherId = skill.owner?._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacherId) return;
    setLoading(true);
    try {
      await requestService.createRequest({ teacherId, skillId: skill._id, message });
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create request', err);
      alert(err?.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-md card-surface p-6">
        <h3 className="app-section-title text-lg font-semibold text-strong mb-3">Request to learn "{skill.name}"</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional message to the teacher"
            className="w-full rounded-xl border soft-border bg-white/80 px-4 py-2 text-sm text-strong placeholder:text-soft focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,74,0.18)] focus-ring"
            rows={4}
          />

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-full border soft-border bg-white/80 px-4 py-2 text-strong hover:bg-white focus-ring">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 rounded-full surface-accent px-4 py-2 text-white focus-ring">
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
