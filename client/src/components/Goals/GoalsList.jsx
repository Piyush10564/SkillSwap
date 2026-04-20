import { useState, useEffect } from 'react';
import { goalService } from '../../services/goalService';
import GoalCard from './GoalCard';

export default function GoalsList({ userId }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  useEffect(() => {
    fetchGoals();
  }, [userId, statusFilter]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await goalService.getUserGoals(userId, statusFilter);
      setGoals(response.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load goals');
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
        <h2 className="text-2xl font-bold text-slate-900">Learning Goals</h2>
        <div className="flex gap-2">
          {['active', 'completed', 'abandoned'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          {error}
        </div>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl">
          <p className="text-slate-500">No {statusFilter} goals yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <GoalCard key={goal._id} goal={goal} onUpdate={fetchGoals} />
          ))}
        </div>
      )}
    </div>
  );
}
