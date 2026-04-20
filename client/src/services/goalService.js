import api from './api';

export const goalService = {
  // Create a goal
  createGoal: async (data) => {
    const response = await api.post('/goals', data);
    return response.data;
  },

  // Get goals for a user
  getUserGoals: async (userId, status = null, limit = 10, offset = 0) => {
    const params = { limit, offset };
    if (status) params.status = status;
    const response = await api.get(`/goals/user/${userId}`, { params });
    return response.data;
  },

  // Get a single goal
  getGoal: async (goalId) => {
    const response = await api.get(`/goals/${goalId}`);
    return response.data;
  },

  // Update a goal
  updateGoal: async (goalId, data) => {
    const response = await api.patch(`/goals/${goalId}`, data);
    return response.data;
  },

  // Delete a goal
  deleteGoal: async (goalId) => {
    const response = await api.delete(`/goals/${goalId}`);
    return response.data;
  },
};
