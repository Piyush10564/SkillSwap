import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { chatService } from '../services/chatService';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import NoteEditor from '../components/Notes/NoteEditor';
import NotesList from '../components/Notes/NotesList';

export default function Messages() {
  const location = useLocation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [notesRefreshToken, setNotesRefreshToken] = useState(0);
  const [endingSession, setEndingSession] = useState(false);
  const { socket, connected } = useSocket();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Auto-select conversation from navigation state
  useEffect(() => {
    const conversationId = location.state?.conversationId || new URLSearchParams(location.search).get('conversationId');

    if (conversationId && conversations.length > 0) {
      const conv = conversations.find((c) => c._id === conversationId);
      if (conv) {
        handleSelectConversation(conv);
      }
    }
  }, [location.state, location.search, conversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket || !connected) return;

    socket.on('chat:message:new', ({ message, conversationId }) => {
      if (selectedConversation?._id === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
      fetchConversations(); // Update conversation list
    });

    return () => {
      socket.off('chat:message:new');
    };
  }, [socket, connected, selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await chatService.getConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await chatService.getMessages(conversationId);
      setMessages(response.data.messages || []);

      // Join conversation room
      if (socket && connected) {
        socket.emit('chat:join', conversationId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation._id);
  };

  const handleNoteSaved = () => {
    setNotesRefreshToken((current) => current + 1);
  };

  const handleEndSession = async () => {
    if (!selectedConversation?._id) return;
    if (endingSession || selectedConversation.status === 'ended') return;

    try {
      setEndingSession(true);
      const response = await chatService.endSession(selectedConversation._id);
      const updatedConversation = response?.data?.conversation || selectedConversation;
      setSelectedConversation((current) => ({
        ...current,
        status: updatedConversation.status || 'ended',
        endedAt: updatedConversation.endedAt || new Date().toISOString(),
        startedAt: updatedConversation.startedAt || current?.startedAt,
      }));
      await fetchConversations();
    } catch (error) {
      console.error('Error ending session:', error);
      alert(error?.response?.data?.message || 'Failed to end session');
    } finally {
      setEndingSession(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const content = newMessage.trim();
    setNewMessage('');

    if (socket && connected) {
      // Send via socket
      socket.emit('chat:message', {
        conversationId: selectedConversation._id,
        content,
      });
    } else {
      // Fallback to REST API
      try {
        await chatService.sendMessage(selectedConversation._id, content);
        fetchMessages(selectedConversation._id);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-6">Messages</h2>

      <div className="grid gap-4 lg:grid-cols-[320px,minmax(0,1fr),360px]">
        {/* Conversations List */}
        <div className="page-surface p-0 overflow-hidden">
          <div className="border-b soft-border px-4 py-3">
            <h3 className="font-semibold text-slate-900 text-sm">Conversations</h3>
          </div>
          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto max-h-[600px]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                No conversations yet. Start chatting with someone!
              </div>
            ) : (
              conversations.map((conversation) => {
                // Use participant (singular) - API returns pre-filtered other participant
                const otherParticipant = conversation.participant;
                const isSelected = selectedConversation?._id === conversation._id;

                return (
                  <button
                    key={conversation._id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`flex w-full items-center gap-3 border-b soft-border p-4 text-left hover:bg-white/5 ${isSelected ? 'bg-indigo-50' : ''
                      }`}
                  >
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-semibold text-white">
                      {otherParticipant?.name?.substring(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {otherParticipant?.name || 'Unknown User'}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-indigo-500 px-1.5 text-xs font-medium text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-xs text-slate-500 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Messages Thread */}
        <div className="page-surface p-0 flex flex-col h-[600px]">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="border-b soft-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-sm font-semibold text-white">
                    {selectedConversation.participant?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 text-sm">
                      {selectedConversation.participant?.name || 'Unknown User'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{connected ? 'Online' : 'Offline'}</span>
                      {selectedConversation.startedAt && selectedConversation.status === 'active' && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">Session active</span>
                      )}
                      {selectedConversation.status === 'ended' && (
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-slate-500">Session ended</span>
                      )}
                    </div>
                  </div>
                  {selectedConversation.startedAt && selectedConversation.status === 'active' && (
                    <button
                      type="button"
                      onClick={handleEndSession}
                      disabled={endingSession}
                      className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60"
                    >
                      {endingSession ? 'Ending...' : 'End Session'}
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => {
                  // Robust sender ID comparison - handle multiple formats
                  const getSenderId = (sender) => {
                    if (!sender) return null;
                    if (typeof sender === 'string') return sender;
                    if (sender._id) return sender._id.toString ? sender._id.toString() : String(sender._id);
                    return String(sender);
                  };

                  const messageSenderId = getSenderId(message.sender);
                  const currentUserId = user?._id ? (user._id.toString ? user._id.toString() : String(user._id)) : null;
                  const isOwnMessage = messageSenderId && currentUserId && messageSenderId === currentUserId;

                  return (
                    <div
                      key={message._id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwnMessage
                          ? 'bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 text-white'
                          : 'bg-white/5 text-slate-900'
                          }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-slate-500'
                          }`}>
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="border-t soft-border p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full border soft-border bg-transparent px-4 py-2 text-sm focus:border-indigo-400 focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 px-6 py-2 text-sm font-medium text-white shadow-sm hover:brightness-105 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              Select a conversation to start messaging
            </div>
          )}
        </div>

        {/* Session Notes */}
        <div className="page-surface p-0 flex flex-col h-[600px] overflow-hidden">
          {selectedConversation ? (
            <>
              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="font-semibold text-slate-900 text-sm">Session Notes</h3>
                <p className="text-xs text-slate-500">Keep learning notes alongside this chat</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <NoteEditor sessionId={selectedConversation._id} onSuccess={handleNoteSaved} />
                <NotesList sessionId={selectedConversation._id} refreshToken={notesRefreshToken} />
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-500">
              Open a teaching session to add and review notes here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
