# SkillSwap Features Quick Reference

## Files Overview

### Models (7 new files)
| File | Purpose |
|------|---------|
| `Review.js` | User reviews (1-5 stars + comment) |
| `Goal.js` | Learning goals with progress tracking |
| `Badge.js` | Achievement badges |
| `UserBadge.js` | User-Badge relationships |
| `Transaction.js` | Credit history audit trail |
| `SessionNote.js` | Notes from sessions |
| `ProgressTracking.js` | Skill learning progress |

### Controllers (6 new files)
| File | Endpoints |
|------|-----------|
| `reviewController.js` | POST, GET, PATCH, DELETE reviews |
| `goalController.js` | CRUD goals + progress |
| `badgeController.js` | Badges, user badges, awards |
| `creditController.js` | Earn/spend, transactions, balance |
| `noteController.js` | CRUD session notes |
| `progressController.js` | CRUD progress, session updates |

### Routes (6 new files)
All imported in `app.js` under `/api/` prefix:
- `/api/reviews`
- `/api/goals`
- `/api/badges`
- `/api/credits`
- `/api/notes`
- `/api/progress`

### Utilities
- `badgeHelper.js` - Badge auto-awarding logic + seed function

### Documentation
- `API_DOCUMENTATION.md` - Complete API reference
- `INTEGRATION_GUIDE.md` - Setup & integration steps

---

## Quick Integration

### 1. Seed Badges (Run Once)
```javascript
import { seedBadges } from './utils/badgeHelper.js';
await seedBadges();
```

### 2. Auto-Award Badges (After Key Events)
```javascript
import { autoAwardBadges } from './utils/badgeHelper.js';

// After review creation or rating update
await autoAwardBadges(userId);

// After credits earned
await autoAwardBadges(userId);
```

### 3. Authenticate Routes
Routes marked `[Private]` require:
```javascript
router.post('/', authenticate, controller);
```

---

## API Examples

### Create Review
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "123",
    "sessionId": "456",
    "rating": 5,
    "comment": "Great!"
  }'
```

### Earn Credits
```bash
curl -X POST http://localhost:5000/api/credits/earn \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123",
    "credits": 10,
    "description": "Teaching session"
  }'
```

### Create Goal
```bash
curl -X POST http://localhost:5000/api/goals \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "skillId": "skill123",
    "title": "Master React",
    "targetDate": "2024-06-20T00:00:00Z"
  }'
```

### Update Progress
```bash
curl -X PATCH http://localhost:5000/api/progress/prog123/session \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "durationHours": 1.5,
    "progressIncrement": 10
  }'
```

---

## User Model Updates
```javascript
// Added to User schema:
{
  averageRating: 4.5,        // Auto-calculated from reviews
  totalReviews: 15,          // Auto-updated count
  credits: 250               // Incremented by earning, decremented by spending
}
```

---

## Key Features

### Review System
- ✅ 1-5 star ratings with text comments
- ✅ Prevents duplicate reviews per session
- ✅ Auto-calculates average rating
- ✅ Anonymous or attributed reviews

### Goals
- ✅ Learning targets with deadlines
- ✅ Progress tracking (0-100%)
- ✅ Status management (active/completed/abandoned)
- ✅ Auto-completion at 100%

### Badges
- ✅ Gamification through achievements
- ✅ Auto-award based on criteria
- ✅ Pre-seeded badges
- ✅ Admin badge creation

### Credits
- ✅ Virtual currency (1 hour teaching = X credits)
- ✅ Balance tracking
- ✅ Transaction audit trail
- ✅ Earn when teaching, spend when learning

### Notes
- ✅ Session-based note taking
- ✅ Tag support for organization
- ✅ User-level and session-level queries
- ✅ Full CRUD with authorization

### Progress
- ✅ Skill-specific learning progress
- ✅ Session counting & hours tracking
- ✅ Milestone auto-progression (beginner→expert)
- ✅ Leaderboard by skill

---

## Authorization

| Endpoint | Auth Required | Notes |
|----------|---------------|-------|
| GET public data | ❌ No | Reviews, goals, badges, progress |
| Create/Update/Delete | ✅ Yes | User must own resource |
| Get user data | ⚠️ Conditional | Own data needs auth, public data doesn't |
| Transactions | ✅ Yes | Always requires authentication |

---

## Database Indexes

All models use optimized indexes:
- Compound unique indexes to prevent duplicates
- Single indexes on frequently queried fields (userId, skillId, etc.)
- Sorted by createdAt for pagination

---

## Frontend Components Needed

- [ ] Rating component (1-5 stars)
- [ ] Review form/display
- [ ] Goal progress bar
- [ ] Badge showcase
- [ ] Credit wallet widget
- [ ] Transaction history
- [ ] Notes editor
- [ ] Progress chart/dashboard

---

## Testing Checklist

- [ ] Create review → Check averageRating updated
- [ ] Earn credits → Check balance increased
- [ ] Create goal → Check in database
- [ ] Update progress → Check milestone auto-update
- [ ] Check badge auto-award
- [ ] Create note → Check tags saved
- [ ] Verify all CRUD operations
- [ ] Test authorization (should fail without token)

---

## Common Issues

| Issue | Solution |
|-------|----------|
| "Duplicate key error" on UserBadge | Normal - badge already earned. Check error handling. |
| Reviews not updating rating | Check Review model saved correctly, recalculate in controller |
| Credits not showing up | Check User.credits field updated, Transaction logged |
| Goals not auto-completing | Verify progress reaches exactly 100, check status enum |
| Badge criteria not met | Check criteria logic in badgeHelper.js matches badge |

---

## Performance Tips

1. Cache user badges in Redis
2. Paginate all list endpoints
3. Use indexes effectively (already done)
4. Pre-calculate aggregate stats
5. Archive transactions periodically
6. Consider denormalizing frequent queries

---

Generated: April 20, 2026
For detailed API specs, see API_DOCUMENTATION.md
