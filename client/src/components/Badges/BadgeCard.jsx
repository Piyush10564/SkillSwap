export default function BadgeCard({ badge, earned = false }) {
  return (
    <div
      className={`rounded-2xl p-6 text-center transition-transform hover:scale-105 ${
        earned
          ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 shadow-lg shadow-yellow-200'
          : 'bg-slate-50 border-2 border-slate-200 opacity-50'
      }`}
    >
      <div className="text-5xl mb-3">{badge.icon || '🏅'}</div>
      <h4 className="font-semibold text-slate-900 mb-1">{badge.name}</h4>
      <p className="text-xs text-slate-600">{badge.description}</p>
      {!earned && (
        <p className="text-xs text-slate-500 mt-2 font-medium">
          Locked
        </p>
      )}
    </div>
  );
}
