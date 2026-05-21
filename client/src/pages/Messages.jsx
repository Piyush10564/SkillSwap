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
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [notesRefreshToken, setNotesRefreshToken] = useState(0);
  const [endingSession, setEndingSession] = useState(false);
  const { socket, connected } = useSocket();
  const messagesEndRef = useRef(null);

  const emojiOptions = ['😀', '😂', '😊', '😍', '🙌', '👍', '🔥', '🎉', '💡', '🤝'];

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

  const handleAddEmoji = (emoji) => {
    setNewMessage((current) => `${current}${emoji}`);
    setEmojiPickerOpen(false);
  };

  return (
    <div>
      <h2 className="app-section-title text-xl font-semibold text-strong mb-6">Messages</h2>

      <div className="grid gap-4 lg:grid-cols-[320px,minmax(0,1fr),360px]">
        {/* Conversations List */}
        <div className="page-surface p-0 overflow-hidden">
          <div className="border-b soft-border px-4 py-3">
            <h3 className="font-semibold text-strong text-sm">Conversations</h3>
          </div>
          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto max-h-[600px]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-soft">
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
                    className={`flex w-full items-center gap-3 border-b soft-border p-4 text-left hover:bg-white/70 ${isSelected ? 'bg-[rgba(255,107,74,0.08)]' : ''
                      }`}
                  >
                    <div className="h-10 w-10 flex-shrink-0 rounded-full brand-gradient flex items-center justify-center text-sm font-semibold text-white">
                      {otherParticipant?.name?.substring(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-strong truncate">
                          {otherParticipant?.name || 'Unknown User'}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full surface-accent px-1.5 text-xs font-medium text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-xs text-soft truncate">
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
                  <div className="h-10 w-10 rounded-full brand-gradient flex items-center justify-center text-sm font-semibold text-white">
                    {selectedConversation.participant?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-strong text-sm">
                      {selectedConversation.participant?.name || 'Unknown User'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-soft">
                      <span>{connected ? 'Online' : 'Offline'}</span>
                      {selectedConversation.startedAt && selectedConversation.status === 'active' && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">Session active</span>
                      )}
                      {selectedConversation.status === 'ended' && (
                        <span className="rounded-full bg-white/70 px-2 py-0.5 text-soft">Session ended</span>
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
                            ? 'surface-accent text-white'
                            : 'bg-white/80 text-strong'
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
                <div className="relative">
                  {emojiPickerOpen && (
                    <div className="absolute bottom-full left-0 mb-3 z-20 w-[min(100%,18rem)] rounded-2xl border soft-border bg-white p-3 shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-strong">
                          Quick emojis
                        </span>
                        <button
                          type="button"
                          onClick={() => setEmojiPickerOpen(false)}
                          className="text-xs font-medium text-soft hover:text-strong"
                        >
                          Close
                        </button>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {emojiOptions.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleAddEmoji(emoji)}
                            className="rounded-xl border soft-border bg-slate-50 py-2 text-lg hover:bg-white hover-lift"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEmojiPickerOpen((current) => !current)}
                      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border soft-border bg-white/80 text-lg hover:bg-white focus-ring ${emojiPickerOpen ? 'surface-accent border-transparent text-white' : 'text-strong'}`}
                      aria-label="Add emoji"
                    >
                      😊
                    </button>

                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-full border soft-border bg-transparent px-4 py-2 text-sm text-strong placeholder:text-soft focus:border-[color:var(--accent)] focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,74,0.18)] focus-ring"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="rounded-full surface-accent px-6 py-2 text-sm font-medium text-white shadow-sm hover:brightness-105 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-soft text-sm">
              Select a conversation to start messaging
            </div>
          )}
        </div>

        {/* Session Notes */}
        <div className="page-surface p-0 flex flex-col h-[600px] overflow-hidden">
          {selectedConversation ? (
            <>
              <div className="border-b soft-border px-4 py-3">
                <h3 className="font-semibold text-strong text-sm">Session Notes</h3>
                <p className="text-xs text-soft">Keep learning notes alongside this chat</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <NoteEditor sessionId={selectedConversation._id} onSuccess={handleNoteSaved} />
                <NotesList sessionId={selectedConversation._id} refreshToken={notesRefreshToken} />
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-soft">
              Open a teaching session to add and review notes here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
