import { useState } from 'react';
import { reviewService } from '../../services/reviewService';

export default function ReviewForm({ receiverId, sessionId, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await reviewService.createReview({
        receiverId,
        sessionId,
        rating: parseInt(rating),
        comment,
      });
      setRating(5);
      setComment('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-surface p-6">
      <h3 className="app-section-title text-lg font-semibold text-strong mb-4">Leave a Review</h3>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-strong mb-2">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-3xl transition-transform ${
                star <= rating ? 'text-[color:var(--accent-gold)] scale-110' : 'text-slate-300'
              }`}
            >
              ⭐
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-strong mb-2">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          className="w-full rounded-xl border soft-border bg-white/80 px-4 py-3 text-sm text-strong placeholder:text-soft focus:border-[color:var(--accent)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,74,0.18)] focus-ring"
          rows={4}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full surface-accent py-2.5 text-sm font-medium text-white shadow-sm hover:brightness-105 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
