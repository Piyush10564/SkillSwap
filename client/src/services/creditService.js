import api from './api';

export const creditService = {
  // Get user's credit balance
  getUserCredits: async (userId) => {
    const response = await api.get(`/credits/${userId}`);
    return response.data;
  },

  // Get credit summary
  getCreditSummary: async (userId) => {
    const response = await api.get(`/credits/summary/${userId}`);
    return response.data;
  },

  // Get transaction history
  getUserTransactions: async (userId, limit = 20, offset = 0) => {
    const response = await api.get(`/credits/transactions/${userId}`, {
      params: { limit, offset },
    });
    return response.data;
  },

  // Earn credits
  earnCredits: async (data) => {
    const response = await api.post('/credits/earn', data);
    return response.data;
  },

  // Spend credits
  spendCredits: async (data) => {
    const response = await api.post('/credits/spend', data);
    return response.data;
  },
};
