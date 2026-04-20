import api from './api';

export const badgeService = {
  // Get all badges
  getAllBadges: async () => {
    const response = await api.get('/badges');
    return response.data;
  },

  // Get badges for a user
  getUserBadges: async (userId) => {
    const response = await api.get(`/badges/user/${userId}`);
    return response.data;
  },

  // Create a badge (admin)
  createBadge: async (data) => {
    const response = await api.post('/badges', data);
    return response.data;
  },

  // Award a badge to user
  awardBadge: async (userId, badgeId) => {
    const response = await api.post('/badges/award', { userId, badgeId });
    return response.data;
  },

  // Delete a badge (admin)
  deleteBadge: async (badgeId) => {
    const response = await api.delete(`/badges/${badgeId}`);
    return response.data;
  },
};
