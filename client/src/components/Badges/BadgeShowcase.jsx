import { useState, useEffect } from 'react';
import { badgeService } from '../../services/badgeService';
import BadgeCard from './BadgeCard';

export default function BadgeShowcase({ userId, compact = false }) {
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
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={compact ? 'app-section-title text-lg font-bold text-strong' : 'app-section-title text-2xl font-bold text-strong'}>
          Badges
        </h2>
        <span className="chip chip-soft">
          {userBadges.length} / {allBadges.length}
        </span>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className={compact ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'}>
        {allBadges.map((badge) => (
          <BadgeCard
            key={badge._id}
            badge={badge}
            earned={earnedBadgeIds.has(badge._id)}
            compact={compact}
          />
        ))}
      </div>

      {userBadges.length === 0 && (
        <div className="card-surface p-12 text-center">
          <p className="text-soft">No badges yet. Keep going! 🚀</p>
        </div>
      )}
    </div>
  );
}
