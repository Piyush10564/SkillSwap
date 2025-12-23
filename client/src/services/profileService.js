import api from './api';

export const profileService = {
  updateProfile: (data) => api.put('/profile', data),
  uploadAvatar: (avatar) => api.post('/profile/avatar', { avatar }),
  getStats: () => api.get('/profile/stats'),
};
