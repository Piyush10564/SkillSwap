# SkillSwap Enhanced Features - Integration Guide

## Overview
This guide explains how to integrate and set up the new features added to SkillSwap.

## Features Added
1. Review & Rating System
2. Goals / Learning Targets
3. Badge System (Gamification)
4. Skill Credit System
5. Session Notes
6. Progress Tracking

---

## Setup Steps

### 1. Database Initialization

Add a seed function to your database setup or server startup:

```javascript
// In server/src/server.js or database initialization file
import { seedBadges } from './utils/badgeHelper.js';

// After connecting to database
await seedBadges();
console.log('✅ Database initialized with default badges');
```

### 2. Import Models in Mongoose Connection
Ensure all models are imported in your database connection file:

```javascript
// server/src/config/database.js - add these imports
import User from '../models/User.js';
import Review from '../models/Review.js';
import Goal from '../models/Goal.js';
import Badge from '../models/Badge.js';
import UserBadge from '../models/UserBadge.js';
import Transaction from '../models/Transaction.js';
import SessionNote from '../models/SessionNote.js';
import ProgressTracking from '../models/ProgressTracking.js';
```

### 3. Update Review Controller to Auto-Award Badges

In `server/src/controllers/reviewController.js`, import the badge helper:

```javascript
import { autoAwardBadges } from '../utils/badgeHelper.js';

// After updating user rating (in createReview and updateReview):
await autoAwardBadges(receiverId);
```

### 4. Update Credit Earning/Spending

Call badge check when credits are earned:

```javascript
// In creditController.js
import { autoAwardBadges } from '../utils/badgeHelper.js';

// After earnCredits:
await autoAwardBadges(userId);
```

### 5. Environment Variables
Add to `.env` if needed:
```
# Credits configuration (optional)
CREDITS_PER_HOUR=10
CREDITS_EXCHANGE_RATE=1
```

---

## API Endpoints Summary

### Reviews: `/api/reviews`
- `POST /` - Create review
- `GET /user/:userId` - Get user reviews
- `GET /session/:sessionId` - Get session reviews
- `PATCH /:reviewId` - Update review
- `DELETE /:reviewId` - Delete review

### Goals: `/api/goals`
- `POST /` - Create goal
- `GET /user/:userId` - Get user goals
- `GET /:goalId` - Get single goal
- `PATCH /:goalId` - Update progress
- `DELETE /:goalId` - Delete goal

### Badges: `/api/badges`
- `GET /` - Get all badges
- `GET /user/:userId` - Get user badges
- `POST /` - Create badge (admin)
- `POST /award` - Award badge to user
- `DELETE /:badgeId` - Delete badge (admin)

### Credits: `/api/credits`
- `GET /:userId` - Get credit balance
- `GET /summary/:userId` - Get credit summary
- `GET /transactions/:userId` - Get transaction history
- `POST /earn` - Earn credits
- `POST /spend` - Spend credits

### Notes: `/api/notes`
- `POST /` - Create note
- `GET /session/:sessionId` - Get session notes
- `GET /user/:userId` - Get user notes
- `GET /:noteId` - Get single note
- `PATCH /:noteId` - Update note
- `DELETE /:noteId` - Delete note

### Progress: `/api/progress`
- `POST /` - Create progress tracking
- `GET /user/:userId` - Get user progress
- `GET /skill/:skillId` - Get skill progress (leaderboard)
- `GET /:progressId` - Get single progress
- `PATCH /:progressId` - Update progress
- `POST /:progressId/session` - Update after session
- `DELETE /:progressId` - Delete progress

---

## Database Schema Updates

### User Model - New Fields
```javascript
{
  averageRating: Number,      // 0-5
  totalReviews: Number,       // count
  credits: Number            // default 0
}
```

---

## Frontend Integration Checklist

- [ ] Create Review submission form component
- [ ] Create Review display/rating component
- [ ] Create Goals management page
- [ ] Create Goal progress visualization
- [ ] Create Badge showcase component
- [ ] Create Credits display widget
- [ ] Create Transaction history view
- [ ] Create Session notes editor
- [ ] Create Progress tracking dashboard
- [ ] Add review notifications
- [ ] Add badge achievement notifications
- [ ] Update user profile to show badges & stats

---

## Testing

### Test Review System
```javascript
// Create a review
POST /api/reviews
{
  "receiverId": "user_id",
  "sessionId": "session_id",
  "rating": 5,
  "comment": "Excellent!"
}

// Get user reviews
GET /api/reviews/user/user_id

// User's averageRating should update
GET /api/auth/me
// Should see "averageRating": 5, "totalReviews": 1
```

### Test Credits
```javascript
// Earn credits
POST /api/credits/earn
{
  "userId": "user_id",
  "credits": 10,
  "description": "Teaching session"
}

// Check balance
GET /api/credits/user_id

// View transaction
GET /api/credits/transactions/user_id
```

### Test Goals
```javascript
// Create goal
POST /api/goals
{
  "skillId": "skill_id",
  "title": "Master React",
  "targetDate": "2024-06-20T00:00:00Z"
}

// Update progress
PATCH /api/goals/goal_id
{
  "progress": 50
}

// When progress reaches 100, status auto-updates to "completed"
```

### Test Badges
```javascript
// Get available badges
GET /api/badges

// Get user badges
GET /api/badges/user/user_id

// Badges should auto-award when criteria met:
// - Top Rated: averageRating >= 4.5 && totalReviews >= 5
// - Credit Master: credits >= 100
// - etc.
```

---

## Performance Considerations

1. **Indexes Created**
   - Reviews: compound index on (reviewerId, receiverId, sessionId)
   - Goals: index on userId
   - UserBadges: compound index on (userId, badgeId)
   - Transactions: indexes on userId and createdAt
   - SessionNotes: indexes on sessionId and userId
   - ProgressTracking: compound index on (userId, skillId)

2. **Recommendations**
   - Cache user badges in memory or use Redis
   - Consider pagination for large transaction histories
   - Pre-calculate aggregate stats (ratings, totals) periodically
   - Archive old transactions after certain period

---

## Troubleshooting

### "BadgeHelper not found"
- Ensure `badgeHelper.js` exists in `server/src/utils/`
- Check import path is correct

### "Duplicate badge error"
- This is expected - UserBadge has unique compound index
- The try/catch in badgeHelper handles this gracefully

### Review not updating averageRating
- Ensure database connection is working
- Check User model has new fields saved
- Verify query returns all reviews for user

### Credits not accumulating
- Check creditController is being called
- Verify User.credits field is being incremented
- Check transaction is being logged in Transaction model

---

## Future Enhancements

1. **Advanced Gamification**
   - Leaderboards per skill
   - Streak tracking
   - Achievement levels

2. **Notifications**
   - New review received
   - Badge earned
   - Goal milestone reached
   - Credit transfer notifications

3. **Analytics**
   - User engagement metrics
   - Skill popularity
   - Rating distribution
   - Progress trends

4. **Social Features**
   - Follow users
   - Share achievements
   - Recommendation system based on progress

5. **Certification**
   - Digital certificates for experts
   - Skill verification by community

---

## Support
For issues or questions, refer to the API_DOCUMENTATION.md file for detailed endpoint specifications.
