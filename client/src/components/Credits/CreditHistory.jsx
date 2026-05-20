import { useState, useEffect } from 'react';
import { creditService } from '../../services/creditService';

export default function CreditHistory({ userId }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0 });

  useEffect(() => {
    fetchTransactions();
  }, [userId, pagination.offset]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await creditService.getUserTransactions(
        userId,
        pagination.limit,
        pagination.offset
      );
      setTransactions(response.data);
      setPagination(response.pagination);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Transaction History</h2>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          {error}
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="card-surface p-12 text-center bg-slate-50">
          <p className="text-slate-500">No transactions yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div
                key={transaction._id}
                className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">
                    {transaction.type === 'earn' ? '📈' : '📉'} {transaction.description}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(transaction.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.type === 'earn' ? 'text-green-600' : 'text-slate-600'
                    }`}
                  >
                    {transaction.type === 'earn' ? '+' : '-'}{transaction.credits}
                  </p>
                  <p className="text-xs text-slate-500">Balance: {transaction.balance}</p>
                </div>
              </div>
            ))}
          </div>

          {pagination.total > pagination.limit && (
            <div className="flex gap-2 justify-center pt-4">
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    offset: Math.max(0, pagination.offset - pagination.limit),
                  })
                }
                disabled={pagination.offset === 0}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
              >
                ← Previous
              </button>
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    offset: pagination.offset + pagination.limit,
                  })
                }
                disabled={pagination.offset + pagination.limit >= pagination.total}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
