import { useState, useEffect } from 'react';
import { progressService } from '../../services/progressService';
import ProgressCard from './ProgressCard';

export default function ProgressList({ userId }) {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await progressService.getUserProgress(userId);
      setProgress(response.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load progress');
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
        <h2 className="text-2xl font-bold text-slate-900">Learning Progress</h2>
        <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
          {progress.length} skills
        </span>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          {error}
        </div>
      )}

      {progress.length === 0 ? (
          <div className="card-surface p-12 text-center bg-slate-50">
            <p className="text-slate-500">No progress tracked yet</p>
          </div>
      ) : (
        <div className="grid gap-4">
          {progress.map((p) => (
            <ProgressCard key={p._id} progress={p} />
          ))}
        </div>
      )}
    </div>
  );
}
