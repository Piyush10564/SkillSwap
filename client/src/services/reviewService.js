import api from './api';

export const reviewService = {
  // Create a review
  createReview: async (data) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  // Get reviews for a user
  getUserReviews: async (userId, limit = 10, offset = 0) => {
    const response = await api.get(`/reviews/user/${userId}`, {
      params: { limit, offset },
    });
    return response.data;
  },

  // Get reviews for a session
  getSessionReviews: async (sessionId) => {
    const response = await api.get(`/reviews/session/${sessionId}`);
    return response.data;
  },

  // Update a review
  updateReview: async (reviewId, data) => {
    const response = await api.patch(`/reviews/${reviewId}`, data);
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};
