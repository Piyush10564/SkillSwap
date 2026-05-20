/**
 * Credit Rules Configuration
 * Defines how many credits users earn or spend for various actions
 */

export const CREDIT_RULES = {
  // EARNING CREDITS
  TEACH_SESSION_COMPLETION: 50, // Credits earned when finishing a teaching session
  TEACH_SESSION_PER_MINUTE: 5, // Credits earned per minute of active teaching session
  POSITIVE_REVIEW_EARNED: 10, // Bonus for receiving a positive review (4-5 stars)
  GOAL_COMPLETION: 25, // Credits earned when completing a learning goal
  FIRST_TIME_TEACHER: 100, // One-time bonus for first teaching session
  
  // SPENDING CREDITS
  BOOK_SESSION: 30, // Credits to book a learning session
  REQUEST_COACHING: 20, // Credits to request personalized coaching
  
  // THRESHOLDS
  POSITIVE_REVIEW_THRESHOLD: 4, // Stars (4-5 considered positive)
};

/**
 * Description templates for transactions
 */
export const TRANSACTION_DESCRIPTIONS = {
  teach: 'Earned from teaching',
  teach_session: 'Earned from teaching session time',
  positive_review: 'Bonus for receiving positive review',
  goal_completed: 'Earned from completing learning goal',
  first_teacher: 'First time teacher bonus',
  book_session: 'Paid for booking a learning session',
  request_coaching: 'Paid for requesting coaching',
};
