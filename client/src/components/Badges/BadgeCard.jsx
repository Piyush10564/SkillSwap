export default function BadgeCard({ badge, earned = false, compact = false }) {
  return (
    <div
      className={`card-surface transition-transform hover:scale-105 hover-lift ${compact ? 'p-4 text-left' : 'p-4 text-center'} ${
        earned
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-lg shadow-[rgba(255,184,77,0.16)]'
          : 'bg-white/70 border-2 soft-border opacity-60'
      }`}
    >
      {compact ? (
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-sm">
            {badge.icon || '🏅'}
          </div>

          <div className="min-w-0">
            <h4 className="font-semibold text-strong text-sm leading-tight">{badge.name}</h4>
            <p className="mt-1 text-xs leading-relaxed text-muted">{badge.description}</p>
            {!earned && (
              <p className="mt-2 text-xs font-medium text-soft">Locked</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 text-4xl">{badge.icon || '🏅'}</div>
          <h4 className="mb-1 text-sm font-semibold leading-tight text-strong">{badge.name}</h4>
          <p className="text-xs leading-relaxed text-muted">{badge.description}</p>
          {!earned && (
            <p className="mt-2 text-xs font-medium text-soft">
              Locked
            </p>
          )}
        </>
      )}
    </div>
  );
}
