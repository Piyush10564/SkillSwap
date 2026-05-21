import { useState } from 'react';
import { goalService } from '../../services/goalService';

export default function GoalCard({ goal, onUpdate }) {
  const [progress, setProgress] = useState(goal.progress);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleProgressChange = async (e) => {
    const newProgress = parseInt(e.target.value);
    setProgress(newProgress);

    try {
      setUpdating(true);
      await goalService.updateGoal(goal._id, { progress: newProgress });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update progress:', error);
      setProgress(goal.progress);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'abandoned':
        return 'bg-slate-100 text-slate-700 border border-slate-200';
      default:
        return 'bg-sky-100 text-sky-700 border border-sky-200';
    }
  };

  const getProgressColor = (p) => {
    if (p >= 75) return 'from-green-500 to-emerald-500';
    if (p >= 50) return 'from-[color:var(--accent-tertiary)] to-[color:var(--accent-secondary)]';
    if (p >= 25) return 'from-amber-500 to-[color:var(--accent-gold)]';
    return 'from-rose-500 to-pink-500';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const daysLeft = Math.ceil(
    (new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="card-surface p-6 hover-lift">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-strong mb-1">{goal.title}</h4>
          <p className="text-xs text-soft">{goal.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
          {goal.status}
        </span>
      </div>

      {goal.description && <p className="text-sm text-muted mb-4">{goal.description}</p>}

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-strong">Progress</span>
          <span className="text-sm font-semibold text-strong">{progress}%</span>
        </div>
        <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getProgressColor(progress)} transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 text-xs text-muted mb-4">
        <span>📅 Target: {formatDate(goal.targetDate)}</span>
        {daysLeft > 0 && <span>⏰ {daysLeft} days left</span>}
      </div>

      {goal.status === 'active' && (
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={progress}
          onChange={handleProgressChange}
          disabled={updating}
          className="w-full cursor-pointer accent-[color:var(--accent)]"
        />
      )}
    </div>
  );
}
