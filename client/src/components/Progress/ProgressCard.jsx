export default function ProgressCard({ progress }) {
  const getMilestoneColor = (milestone) => {
    switch (milestone) {
      case 'expert':
        return 'from-purple-500 to-pink-500';
      case 'advanced':
        return 'from-green-500 to-emerald-500';
      case 'intermediate':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-yellow-500 to-orange-500';
    }
  };

  const getMilestoneEmoji = (milestone) => {
    switch (milestone) {
      case 'expert':
        return '🌟';
      case 'advanced':
        return '🚀';
      case 'intermediate':
        return '📈';
      default:
        return '🌱';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="card-surface p-6 hover-lift">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-semibold text-strong">{progress.skillId?.name || 'Unknown Skill'}</h4>
          <p className="text-xs text-soft">Last session: {formatDate(progress.lastSessionDate)}</p>
        </div>
        <div className="text-4xl">{getMilestoneEmoji(progress.milestone)}</div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-strong">Progress</span>
          <span className="text-sm font-semibold text-strong">{progress.progress}%</span>
        </div>
        <div className="w-full bg-slate-200/70 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getMilestoneColor(progress.milestone)} transition-all duration-300`}
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="bg-white/70 rounded-lg p-3 border border-white/70">
          <p className="text-muted">Sessions</p>
          <p className="font-bold text-strong">{progress.completedSessions}</p>
        </div>
        <div className="bg-white/70 rounded-lg p-3 border border-white/70">
          <p className="text-muted">Hours</p>
          <p className="font-bold text-strong">{progress.totalHoursLearned}</p>
        </div>
        <div className="bg-white/70 rounded-lg p-3 border border-white/70">
          <p className="text-muted">Level</p>
          <p className="font-bold text-strong capitalize">{progress.milestone}</p>
        </div>
      </div>
    </div>
  );
}
