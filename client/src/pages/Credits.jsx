import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { creditService } from '../services/creditService';

export default function Credits() {
  const { user } = useAuth();
  const [creditBalance, setCreditBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchCreditsData();
    }
  }, [user]);

  const fetchCreditsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch credit balance
      const creditsResponse = await creditService.getUserCredits(user._id);
      setCreditBalance(creditsResponse.data.credits);

      // Fetch transaction history
      const transactionsResponse = await creditService.getUserTransactions(user._id, 50, 0);
      setTransactions(transactionsResponse.data || []);
    } catch (err) {
      console.error('Error fetching credits data:', err);
      setError('Failed to load credits information');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionColor = (type) => {
    return type === 'earn' ? 'text-emerald-600' : 'text-red-600';
  };

  const getTransactionIcon = (type) => {
    return type === 'earn' ? '+' : '-';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-500">Loading credits information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Credits & Rewards</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your skill credits and transaction history</p>
      </div>

      {/* Credit Balance Card */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="card-surface p-8 bg-gradient-to-br from-indigo-500 via-sky-500 to-violet-500 border border-slate-200 shadow-lg text-white">
            <p className="text-sm font-medium opacity-90 mb-2">Available Balance</p>
            <div className="text-5xl font-bold mb-6">{creditBalance}</div>

            <div className="space-y-2 text-sm">
              <p className="opacity-90">💎 Skill Credits</p>
              <p className="text-xs opacity-75">Earn by teaching, reviews & completing goals</p>
            </div>
          </div>
        </div>

        {/* How Credits Work */}
        <div className="lg:col-span-2 space-y-4">
          <div className="page-surface p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">How to Earn Credits</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-600 font-semibold">+50</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Complete a Teaching Session</p>
                  <p className="text-xs text-slate-500">Earn when you finish teaching someone</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-600 font-semibold">+10</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Receive Positive Review</p>
                  <p className="text-xs text-slate-500">Get a 4-5 star review from someone you taught</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-600 font-semibold">+25</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Complete a Learning Goal</p>
                  <p className="text-xs text-slate-500">Finish a learning goal you set for yourself</p>
                </div>
              </div>
            </div>
          </div>

          <div className="page-surface p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">How to Spend Credits</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 font-semibold">-30</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Book a Learning Session</p>
                  <p className="text-xs text-slate-500">Pay to learn from an expert teacher</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 font-semibold">-20</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Request Coaching</p>
                  <p className="text-xs text-slate-500">Get personalized coaching from an expert</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="page-surface p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-slate-900">Transaction History</h3>
          <button
            onClick={fetchCreditsData}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">No transactions yet</p>
            <p className="text-slate-400 text-xs mt-1">Complete teaching sessions, goals, and reviews to earn credits</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Amount</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Balance</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-700">{transaction.description || 'Skill Credits'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'earn'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {transaction.type === 'earn' ? '📈 Earned' : '📉 Spent'}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${getTransactionColor(transaction.type)}`}>
                      {getTransactionIcon(transaction.type)}{transaction.credits}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-medium">{transaction.balance}</td>
                    <td className="py-3 px-4 text-right text-slate-500 text-xs">
                      {formatDate(transaction.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="card-surface p-6 border border-blue-200 bg-blue-50">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Tips to Earn More Credits</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Share your skills regularly to earn consistent credits</li>
              <li>✅ Maintain high ratings to attract more students</li>
              <li>✅ Complete your learning goals to unlock rewards</li>
              <li>✅ Help others and get positive reviews for bonuses</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
