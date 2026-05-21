import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';

const getEntityId = (entity) => {
  if (!entity) return null;
  if (typeof entity === 'string') return entity;
  return entity._id || null;
};

export default function RequestItem({ request, onAction }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [startingSession, setStartingSession] = useState(false);
  const isTeacher = user && getEntityId(request.teacher) === user._id;
  const isLearner = user && getEntityId(request.learner) === user._id;
  const otherParticipantId = isTeacher ? getEntityId(request.learner) : isLearner ? getEntityId(request.teacher) : null;

  const handleStartSession = async () => {
    if (!otherParticipantId) return;

    try {
      setStartingSession(true);
      const response = await chatService.createOrGetConversation(otherParticipantId);
      const conversation = response?.data?.conversation || response?.conversation;

      if (conversation?._id) {
        await chatService.startSession(conversation._id);
        navigate(`/messages?conversationId=${conversation._id}`, {
          state: { conversationId: conversation._id },
        });
      }
    } catch (error) {
      console.error('Failed to start session', error);
      alert(error?.response?.data?.message || 'Failed to start session');
    } finally {
      setStartingSession(false);
    }
  };

  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-xl card-surface hover-lift">
      <div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full brand-gradient flex items-center justify-center text-sm font-semibold text-white">{request.learner?.name?.substring(0,2).toUpperCase() || 'U'}</div>
          <div>
            <div className="font-medium text-strong">{request.learner?.name}</div>
            <div className="text-xs text-soft">{request.skillName || 'General request'}</div>
          </div>
        </div>
        {request.message && <p className="mt-2 text-sm text-muted">{request.message}</p>}
        <div className="mt-2 text-xs text-soft">{new Date(request.createdAt).toLocaleString()}</div>
      </div>

      <div className="flex items-center gap-2">
        {isTeacher && request.status === 'pending' && (
          <>
            <button onClick={() => onAction(request._id, 'accepted')} className="rounded-full bg-emerald-600 text-white px-3 py-1 text-sm shadow-sm hover:brightness-105">Accept</button>
            <button onClick={() => onAction(request._id, 'rejected')} className="rounded-full border soft-border bg-white/70 px-3 py-1 text-sm text-strong hover:bg-white">Ignore</button>
          </>
        )}

        {isLearner && request.status === 'pending' && (
          <button onClick={() => onAction(request._id, 'cancelled')} className="rounded-full border soft-border bg-white/70 px-3 py-1 text-sm text-strong hover:bg-white">Cancel</button>
        )}

        {request.status === 'accepted' && otherParticipantId && (
          <button
            onClick={handleStartSession}
            disabled={startingSession}
            className="rounded-full surface-accent px-3 py-1 text-sm font-medium shadow-sm hover:brightness-105 disabled:opacity-60"
          >
            {startingSession ? 'Opening...' : 'Start Session'}
          </button>
        )}

        <div className="text-xs text-soft">{request.status}</div>
      </div>
    </div>
  );
}
