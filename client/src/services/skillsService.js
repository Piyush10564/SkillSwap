import api from './api';

export const skillsService = {
  getMySkills: async () => {
    const response = await api.get('/skills/mine');
    return response.data;
  },

  createSkill: async (data) => {
    const response = await api.post('/skills', data);
    return response.data;
  },

  updateSkill: async (id, data) => {
    const response = await api.put(`/skills/${id}`, data);
    return response.data;
  },

  deleteSkill: async (id) => {
    const response = await api.delete(`/skills/${id}`);
    return response.data;
  },
};
