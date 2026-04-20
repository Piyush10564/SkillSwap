import api from './api';

export const noteService = {
  // Create a note
  createNote: async (data) => {
    const response = await api.post('/notes', data);
    return response.data;
  },

  // Get notes for a session
  getSessionNotes: async (sessionId) => {
    const response = await api.get(`/notes/session/${sessionId}`);
    return response.data;
  },

  // Get notes for a user
  getUserNotes: async (userId, limit = 20, offset = 0) => {
    const response = await api.get(`/notes/user/${userId}`, {
      params: { limit, offset },
    });
    return response.data;
  },

  // Get a single note
  getNote: async (noteId) => {
    const response = await api.get(`/notes/${noteId}`);
    return response.data;
  },

  // Update a note
  updateNote: async (noteId, data) => {
    const response = await api.patch(`/notes/${noteId}`, data);
    return response.data;
  },

  // Delete a note
  deleteNote: async (noteId) => {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data;
  },
};
