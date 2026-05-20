import api from './api';

export const requestService = {
  createRequest: (payload) => api.post('/requests', payload),
  getIncoming: () => api.get('/requests/incoming'),
  getOutgoing: () => api.get('/requests/outgoing'),
  updateStatus: (id, status) => api.patch(`/requests/${id}`, { status }),
};

export default requestService;
