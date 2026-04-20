import Badge from '../models/Badge.js';
import UserBadge from '../models/UserBadge.js';
import User from '../models/User.js';
import Review from '../models/Review.js';

/**
 * Auto-award badges based on user achievements
 */
export const autoAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const badges = await Badge.find();

    for (const badge of badges) {
      // Check if user already has this badge
      const hasBadge = await UserBadge.findOne({ userId, badgeId: badge._id });
      if (hasBadge) continue;

      let shouldAward = false;

      // Evaluate badge criteria
      switch (badge.name) {
        case 'First Review':
          const reviewCount = await Review.countDocuments({ reviewerId: userId });
          shouldAward = reviewCount >= 1;
          break;

        case 'Top Rated':
          shouldAward =
            user.averageRating >= 4.5 && user.totalReviews >= 5;
          break;

        case 'Helpful Reviewer':
          shouldAward = user.totalReviews >= 10;
          break;

        case 'Credit Master':
          shouldAward = user.credits >= 100;
          break;

        default:
          // Check generic criteria
          if (badge.criteria && badge.criteria.type) {
            if (badge.criteria.type === 'rating') {
              shouldAward =
                user.averageRating >= badge.criteria.value;
            } else if (badge.criteria.type === 'reviews') {
              shouldAward =
                user.totalReviews >= badge.criteria.value;
            } else if (badge.criteria.type === 'credits') {
              shouldAward = user.credits >= badge.criteria.value;
            }
          }
      }

      if (shouldAward) {
        await UserBadge.create({ userId, badgeId: badge._id }).catch(
          (error) => {
            // Badge might already exist, ignore
            if (!error.message.includes('duplicate')) {
              console.error('Error awarding badge:', error);
            }
          }
        );
      }
    }
  } catch (error) {
    console.error('Error in autoAwardBadges:', error);
  }
};

/**
 * Seed initial badges
 */
export const seedBadges = async () => {
  try {
    const badgeCount = await Badge.countDocuments();
    if (badgeCount > 0) {
      console.log('Badges already exist, skipping seed.');
      return;
    }

    const badges = [
      {
        name: 'First Review',
        description: 'Left your first review for another user',
        icon: '⭐',
        criteria: { type: 'reviews', value: 1 },
      },
      {
        name: 'Helpful Reviewer',
        description: 'Provided 10 helpful reviews',
        icon: '✍️',
        criteria: { type: 'reviews', value: 10 },
      },
      {
        name: 'Top Rated',
        description: 'Maintained an average rating of 4.5+ stars with at least 5 reviews',
        icon: '🏆',
        criteria: { type: 'rating', value: 4.5 },
      },
      {
        name: 'Credit Master',
        description: 'Accumulated 100 skill credits',
        icon: '💰',
        criteria: { type: 'credits', value: 100 },
      },
      {
        name: 'Learning Enthusiast',
        description: 'Completed your first learning goal',
        icon: '🎯',
        criteria: { type: 'goals', value: 1 },
      },
      {
        name: 'Skill Sharer',
        description: 'Added your first skill to offer',
        icon: '🤝',
        criteria: { type: 'skills', value: 1 },
      },
    ];

    await Badge.insertMany(badges);
    console.log('✅ Badges seeded successfully');
  } catch (error) {
    console.error('Error seeding badges:', error);
  }
};
