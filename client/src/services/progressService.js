import api from './api';

export const progressService = {
  // Create progress entry
  createProgress: async (data) => {
    const response = await api.post('/progress', data);
    return response.data;
  },

  // Get user's progress
  getUserProgress: async (userId, limit = 20, offset = 0) => {
    const response = await api.get(`/progress/user/${userId}`, {
      params: { limit, offset },
    });
    return response.data;
  },

  // Get skill progress (leaderboard)
  getSkillProgress: async (skillId, limit = 10, offset = 0) => {
    const response = await api.get(`/progress/skill/${skillId}`, {
      params: { limit, offset },
    });
    return response.data;
  },

  // Get single progress entry
  getProgress: async (progressId) => {
    const response = await api.get(`/progress/${progressId}`);
    return response.data;
  },

  // Update progress
  updateProgress: async (progressId, data) => {
    const response = await api.patch(`/progress/${progressId}`, data);
    return response.data;
  },

  // Update progress after session
  updateProgressAfterSession: async (progressId, data) => {
    const response = await api.post(`/progress/${progressId}/session`, data);
    return response.data;
  },

  // Delete progress
  deleteProgress: async (progressId) => {
    const response = await api.delete(`/progress/${progressId}`);
    return response.data;
  },
};
