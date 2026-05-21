import { useState, useEffect } from 'react';
import { badgeService } from '../../services/badgeService';
import BadgeCard from './BadgeCard';

export default function BadgeShowcase({ userId }) {
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const [allRes, userRes] = await Promise.all([
        badgeService.getAllBadges(),
        badgeService.getUserBadges(userId),
      ]);
      setAllBadges(allRes.data);
      setUserBadges(userRes.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load badges');
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

  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId?._id || ub.badgeId));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Badges</h2>
        <span className="text-sm font-medium text-slate-600 bg-white/5 px-3 py-1 rounded-full">
          {userBadges.length} / {allBadges.length}
        </span>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {allBadges.map((badge) => (
          <BadgeCard
            key={badge._id}
            badge={badge}
            earned={earnedBadgeIds.has(badge._id)}
          />
        ))}
      </div>

      {userBadges.length === 0 && (
        <div className="card-surface p-12 text-center">
          <p className="text-slate-500">No badges yet. Keep going! 🚀</p>
        </div>
      )}
    </div>
  );
}
