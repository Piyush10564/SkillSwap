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
    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-semibold text-slate-900">{progress.skillId?.name || 'Unknown Skill'}</h4>
          <p className="text-xs text-slate-500">Last session: {formatDate(progress.lastSessionDate)}</p>
        </div>
        <div className="text-4xl">{getMilestoneEmoji(progress.milestone)}</div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">Progress</span>
          <span className="text-sm font-semibold text-slate-900">{progress.progress}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getMilestoneColor(progress.milestone)} transition-all duration-300`}
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-slate-600">Sessions</p>
          <p className="font-bold text-slate-900">{progress.completedSessions}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-slate-600">Hours</p>
          <p className="font-bold text-slate-900">{progress.totalHoursLearned}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-slate-600">Level</p>
          <p className="font-bold text-slate-900 capitalize">{progress.milestone}</p>
        </div>
      </div>
    </div>
  );
}
