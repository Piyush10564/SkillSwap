import { useState, useEffect } from 'react';
import { reviewService } from '../../services/reviewService';
import ReviewCard from './ReviewCard';

export default function ReviewsList({ userId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0 });

  useEffect(() => {
    fetchReviews();
  }, [userId, pagination.offset]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getUserReviews(
        userId,
        pagination.limit,
        pagination.offset
      );
      setReviews(response.data);
      setPagination(response.pagination);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin text-3xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Reviews</h2>
        <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
          {pagination.total} reviews
        </span>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          {error}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl">
          <p className="text-slate-500">No reviews yet</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>

          {pagination.total > pagination.limit && (
            <div className="flex gap-2 justify-center pt-4">
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    offset: Math.max(0, pagination.offset - pagination.limit),
                  })
                }
                disabled={pagination.offset === 0}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
              >
                ← Previous
              </button>
              <span className="px-4 py-2 text-sm text-slate-600">
                Page {Math.floor(pagination.offset / pagination.limit) + 1}
              </span>
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    offset: pagination.offset + pagination.limit,
                  })
                }
                disabled={pagination.offset + pagination.limit >= pagination.total}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
