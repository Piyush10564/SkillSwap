import { useState, useEffect } from 'react';
import { noteService } from '../../services/noteService';
import NoteCard from './NoteCard';
import { useAuth } from '../../context/AuthContext';

const getEntityId = (entity) => {
  if (!entity) return null;
  if (typeof entity === 'string') return entity;
  return entity._id || null;
};

export default function NotesList({ userId, sessionId, refreshToken = 0 }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0 });

  useEffect(() => {
    fetchNotes();
  }, [userId, sessionId, pagination.offset, refreshToken]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = sessionId
        ? await noteService.getSessionNotes(sessionId)
        : await noteService.getUserNotes(userId, pagination.limit, pagination.offset);

      const notesData = response.data || [];
      setNotes(notesData);
      setPagination(response.pagination || { total: notesData.length || 0, limit: 20, offset: 0 });
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await noteService.deleteNote(noteId);
      setNotes(notes.filter((n) => n._id !== noteId));
    } catch (err) {
      setError('Failed to delete note');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin text-3xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Your Notes</h2>
        <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
          {pagination.total} notes
        </span>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          {error}
        </div>
      )}

      {notes.length === 0 ? (
        <div className="card-surface p-12 text-center bg-slate-50">
          <p className="text-slate-500">No notes yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => {
            const noteOwnerId = getEntityId(note.userId);
            const currentUserId = user?._id ? String(user._id) : null;
            const canDelete = currentUserId && noteOwnerId === currentUserId;

            return <NoteCard key={note._id} note={note} onDelete={canDelete ? handleDelete : undefined} />;
          })}
        </div>
      )}
    </div>
  );
}
