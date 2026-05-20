import { useState, useEffect } from 'react';
import { creditService } from '../../services/creditService';

export default function CreditCard({ userId }) {
  const [credits, setCredits] = useState(0);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCredits();
  }, [userId]);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const [creditRes, summaryRes] = await Promise.all([
        creditService.getUserCredits(userId),
        creditService.getCreditSummary(userId),
      ]);
      setCredits(creditRes.data.credits);
      setSummary(summaryRes.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load credits');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card-surface p-6 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200">
        <div className="animate-pulse">Loading credits...</div>
      </div>
    );
  }

  return (
    <div className="card-surface p-6 bg-gradient-to-br from-indigo-500 via-sky-500 to-violet-500 shadow-lg text-white">
      <h3 className="text-sm font-medium opacity-90 mb-2">Skill Credits Balance</h3>
      <div className="text-4xl font-bold mb-4">{credits}</div>

      {summary && (
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-white/20 rounded-lg p-3">
            <p className="opacity-75 text-xs">Earned</p>
            <p className="font-semibold">{summary.totalEarned}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="opacity-75 text-xs">Spent</p>
            <p className="font-semibold">{summary.totalSpent}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="opacity-75 text-xs">Transactions</p>
            <p className="font-semibold">{summary.transactionCount}</p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs opacity-75 mt-3">⚠️ Error loading data</p>
      )}
    </div>
  );
}
