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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md card-surface p-6">
        <h3 className="text-lg font-semibold mb-3">Request to learn "{skill.name}"</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional message to the teacher"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
            rows={4}
          />

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-slate-200 px-4 py-2">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 text-white px-4 py-2">
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
