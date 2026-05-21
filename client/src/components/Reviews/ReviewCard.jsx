export default function ReviewCard({ review }) {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-slate-300'}>
        ⭐
      </span>
    ));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="card-surface p-6 hover-lift">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center text-white font-semibold shadow-sm">
            {review.reviewerId?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium text-strong">{review.reviewerId?.name || 'Anonymous'}</p>
            <p className="text-xs text-soft">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-0.5">{renderStars(review.rating)}</div>
      </div>

      {review.comment && (
        <p className="text-muted text-sm leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}
