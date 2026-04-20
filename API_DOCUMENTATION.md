# SkillSwap Enhanced Features - API Documentation

## Overview
This document covers all the new features added to SkillSwap:
1. Review & Rating System
2. Goals / Learning Targets
3. Badge System (Gamification)
4. Skill Credit System (Time-based Exchange)
5. Session Notes
6. Progress Tracking

---

## 1. Review & Rating System

### POST /api/reviews
Create a new review for another user after a session.

**Headers:** `Authorization: Bearer {token}`
**Body:**
```json
{
  "receiverId": "user_id",
  "sessionId": "conversation_id",
  "rating": 5,
  "comment": "Great teacher, very patient!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "_id": "review_id",
    "reviewerId": "your_user_id",
    "receiverId": "user_id",
    "sessionId": "conversation_id",
    "rating": 5,
    "comment": "Great teacher, very patient!",
    "createdAt": "2024-04-20T10:00:00Z"
  }
}
```

### GET /api/reviews/user/:userId
Get all reviews for a user (with pagination).

**Query Params:**
- `limit` (default: 10)
- `offset` (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "review_id",
      "reviewerId": {
        "_id": "user_id",
        "name": "John",
        "avatarUrl": "url"
      },
      "rating": 5,
      "comment": "Great teacher!",
      "createdAt": "2024-04-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 10,
    "offset": 0
  }
}
```

### GET /api/reviews/session/:sessionId
Get all reviews for a specific session.

### PATCH /api/reviews/:reviewId
Update your review.

**Headers:** `Authorization: Bearer {token}`
**Body:**
```json
{
  "rating": 4,
  "comment": "Updated comment"
}
```

### DELETE /api/reviews/:reviewId
Delete your review.

**Headers:** `Authorization: Bearer {token}`

---

## 2. Goals / Learning Targets

### POST /api/goals
Create a new learning goal.

**Headers:** `Authorization: Bearer {token}`
**Body:**
```json
{
  "skillId": "skill_id",
  "title": "Master Java OOP",
  "description": "Learn Object-Oriented Programming concepts",
  "targetDate": "2024-06-20T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Goal created successfully",
  "data": {
    "_id": "goal_id",
    "userId": "your_user_id",
    "skillId": "skill_id",
    "title": "Master Java OOP",
    "description": "Learn Object-Oriented Programming concepts",
    "targetDate": "2024-06-20T00:00:00Z",
    "progress": 0,
    "status": "active",
    "completedAt": null,
    "createdAt": "2024-04-20T10:00:00Z"
  }
}
```

### GET /api/goals/user/:userId
Get all goals for a user.

**Query Params:**
- `status` (active, completed, abandoned)
- `limit` (default: 10)
- `offset` (default: 0)

### GET /api/goals/:goalId
Get a single goal.

### PATCH /api/goals/:goalId
Update goal progress, status, or details.

**Headers:** `Authorization: Bearer {token}`
**Body:**
```json
{
  "progress": 50,
  "status": "active"
}
```

### DELETE /api/goals/:goalId
Delete a goal.

**Headers:** `Authorization: Bearer {token}`

---

## 3. Badge System (Gamification)

### GET /api/badges
Get all available badges.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "badge_id",
      "name": "Top Rated",
      "description": "Maintained an average rating of 4.5+ stars",
      "icon": "🏆",
      "criteria": {
        "type": "rating",
        "value": 4.5
      },
      "createdAt": "2024-04-20T10:00:00Z"
    }
  ]
}
```

### GET /api/badges/user/:userId
Get badges earned by a user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_badge_id",
      "userId": "user_id",
      "badgeId": {
        "_id": "badge_id",
        "name": "Top Rated",
        "description": "Maintained an average rating of 4.5+ stars",
        "icon": "🏆"
      },
      "unlockedAt": "2024-04-20T10:00:00Z"
    }
  ]
}
```

### POST /api/badges (Admin)
Create a new badge.

**Headers:** `Authorization: Bearer {token}`
**Body:**
```json
{
  "name": "Master Teacher",
  "description": "Taught 50+ sessions",
  "icon": "👨‍🏫",
  "criteria": {
    "type": "sessions",
    "value": 50
  }
}
```

---

## 4. Skill Credit System

### GET /api/credits/:userId
Get user's credit balance.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_id",
    "credits": 150
  }
}
```

### GET /api/credits/summary/:userId
Get credit summary (earned, spent, balance).

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_id",
    "currentBalance": 150,
    "totalEarned": 200,
    "totalSpent": 50,
    "transactionCount": 10
  }
}
```

### GET /api/credits/transactions/:userId
Get transaction history.

**Headers:** `Authorization: Bearer {token}`
**Query Params:**
- `limit` (default: 20)
- `offset` (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "transaction_id",
      "userId": "user_id",
      "type": "earn",
      "credits": 10,
      "description": "Earned credits from teaching",
      "balance": 150,
      "createdAt": "2024-04-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 20,
    "offset": 0
  }
}
```

### POST /api/credits/earn
Award credits to a user (teaching reward).

**Headers:** `Authorization: Bearer {token}`
**Body:**
```json
{
  "userId": "user_id",
  "credits": 10,
  "sessionId": "conversation_id",
  "description": "1 hour teaching session"
}
```

### POST /api/credits/spend
Deduct credits from a user (learning cost).

**Headers:** `Authorization: Bearer {token}`
**Body:**
```json
{
  "userId": "user_id",
  "credits": 5,
  "sessionId": "conversation_id",
  "description": "1 hour learning session"
}
```

---

## 5. Session Notes

### POST /api/notes
Create a note for a session.

**Headers:** `Authorization: Bearer {token}`
**Body:**
```json
{
  "sessionId": "conversation_id",
  "content": "Learned about polymorphism, need to practice more",
  "tags": ["java", "oop", "polymorphism"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "_id": "note_id",
    "userId": "your_user_id",
    "sessionId": "conversation_id",
    "content": "Learned about polymorphism...",
    "tags": ["java", "oop", "polymorphism"],
    "createdAt": "2024-04-20T10:00:00Z"
  }
}
```

### GET /api/notes/session/:sessionId
Get all notes for a session.

### GET /api/notes/user/:userId
Get all notes created by a user.

**Headers:** `Authorization: Bearer {token}`
**Query Params:**
- `limit` (default: 20)
- `offset` (default: 0)

### GET /api/notes/:noteId
Get a single note.

### PATCH /api/notes/:noteId
Update a note.

**Headers:** `Authorization: Bearer {token}`
**Body:**
```json
{
  "content": "Updated content",
  "tags": ["java", "oop"]
}
```

### DELETE /api/notes/:noteId
Delete a note.

**Headers:** `Authorization: Bearer {token}`

---

## 6. Progress Tracking

### POST /api/progress
Create a progress tracking entry for a skill.

**Headers:** `Authorization: Bearer {token}`
**Body:**
```json
{
  "userId": "your_user_id",
  "skillId": "skill_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Progress tracking created successfully",
  "data": {
    "_id": "progress_id",
    "userId": "your_user_id",
    "skillId": "skill_id",
    "completedSessions": 0,
    "totalHoursLearned": 0,
    "progress": 0,
    "milestone": "beginner",
    "lastSessionDate": null,
    "createdAt": "2024-04-20T10:00:00Z"
  }
}
```

### GET /api/progress/user/:userId
Get all progress entries for a user.

**Query Params:**
- `limit` (default: 20)
- `offset` (default: 0)

### GET /api/progress/skill/:skillId
Get progress entries for a skill (leaderboard).

**Query Params:**
- `limit` (default: 10)
- `offset` (default: 0)

### GET /api/progress/:progressId
Get a single progress entry.

### PATCH /api/progress/:progressId
Manually update progress.

**Headers:** `Authorization: Bearer {token}`
**Body:**
```json
{
  "completedSessions": 5,
  "totalHoursLearned": 10,
  "progress": 50,
  "milestone": "intermediate"
}
```

### POST /api/progress/:progressId/session
Update progress after completing a session (auto-calculates).

**Headers:** `Authorization: Bearer {token}`
**Body:**
```json
{
  "durationHours": 1.5,
  "progressIncrement": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Progress updated after session",
  "data": {
    "_id": "progress_id",
    "completedSessions": 6,
    "totalHoursLearned": 11.5,
    "progress": 60,
    "milestone": "intermediate",
    "lastSessionDate": "2024-04-20T11:30:00Z"
  }
}
```

### DELETE /api/progress/:progressId
Delete a progress entry.

**Headers:** `Authorization: Bearer {token}`

---

## User Model Updates

User schema now includes:
```json
{
  "averageRating": 4.5,          // Average rating from reviews
  "totalReviews": 12,             // Total reviews received
  "credits": 150                  // Skill credit balance
}
```

---

## Notes
- All timestamps are in ISO 8601 format
- Pagination uses limit/offset pattern
- Private routes require authentication token in Authorization header
- Credits represent 1 hour of teaching/learning as a base unit (can be customized)
- Badges are automatically awarded when criteria are met
- Progress milestones: beginner (0-25%) → intermediate (25-75%) → advanced (75-99%) → expert (100%)
