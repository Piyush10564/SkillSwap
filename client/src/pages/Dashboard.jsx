import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { searchService } from '../services/searchService';
import { chatService } from '../services/chatService';
import { skillsService } from '../services/skillsService';
import { requestService } from '../services/requestService';
import { creditService } from '../services/creditService';
import { progressService } from '../services/progressService';
import { useNavigate } from 'react-router-dom';

const formatTime = (value) => {
  if (!value) return 'just now';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'just now';

  const diffMinutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function Dashboard() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [skills, setSkills] = useState({ offer: [], learn: [] });
  const [conversations, setConversations] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [credits, setCredits] = useState(0);
  const [progress, setProgress] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suggestionsRes, skillsRes, conversationsRes, requestsRes, creditRes, progressRes] = await Promise.all([
          searchService.getSuggestions(),
          skillsService.getMySkills(),
          chatService.getConversations(),
          requestService.getIncoming(),
          creditService.getUserCredits(user?._id),
          progressService.getUserProgress(user?._id),
        ]);

        setSuggestions(suggestionsRes.data.suggestions || []);

        // Handle skills response - check the actual structure
        if (skillsRes.data) {
          setSkills({
            offer: skillsRes.data.skillsOffer || skillsRes.data.offer || [],
            learn: skillsRes.data.skillsLearn || skillsRes.data.learn || []
          });
        }

        // Get conversations with unread messages
        const convosList = conversationsRes.data?.conversations || conversationsRes.data || [];
        const unreadConvos = (convosList || [])
          .filter((c) => c.unreadCount > 0)
          .slice(0, 4)
          .map((conversation) => ({
            ...conversation,
            title: conversation.participant?.name || 'Unknown user',
            subtitle: conversation.lastMessage?.content || 'New message waiting',
          }));

        setConversations(unreadConvos);
        setIncomingRequests((requestsRes.data?.requests || []).filter((request) => request.status === 'pending').slice(0, 4));
        setCredits(creditRes.data?.credits ?? 0);
        setProgress((progressRes.data || []).slice(0, 3));

        const latestNotifications = [];
        unreadConvos.slice(0, 2).forEach((conversation) => {
          latestNotifications.push({
            id: conversation._id,
            type: 'chat',
            title: `Message from ${conversation.title}`,
            subtitle: conversation.subtitle,
          });
        });
        (requestsRes.data?.requests || [])
          .filter((request) => request.status === 'pending')
          .slice(0, 2)
          .forEach((request) => {
            latestNotifications.push({
              id: request._id,
              type: 'request',
              title: `Request from ${request.learner?.name || 'Learner'}`,
              subtitle: request.skillName || 'Learning request',
            });
          });

        setNotifications(latestNotifications.slice(0, 4));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStartChat = async (userId) => {
    setStartingChat(userId);
    try {
      const response = await chatService.createOrGetConversation(userId);
      const conversationId = response.data.conversation._id;
      navigate('/messages', { state: { conversationId } });
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please try again.');
    } finally {
      setStartingChat(null);
    }
  };

  // Calculate skill progress (percentage of skills learned vs total)
  const totalSkills = skills.offer.length + skills.learn.length;
  const totalProgress = progress.reduce((sum, entry) => sum + (entry.progress || 0), 0);
  const averageProgress = progress.length > 0 ? Math.round(totalProgress / progress.length) : 0;
  const pendingRequestsCount = incomingRequests.length;
  const unreadChatsCount = conversations.reduce((sum, conversation) => sum + (conversation.unreadCount || 0), 0);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center section-shell text-strong">
        <div className="rounded-3xl border border-white/70 bg-white/80 px-6 py-5 shadow-xl shadow-[rgba(8,21,39,0.08)] backdrop-blur">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden section-shell text-strong">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,107,74,0.10),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(0,184,217,0.12),_transparent_22%),linear-gradient(180deg,_rgba(255,255,255,0)_0%,_rgba(255,255,255,0)_100%)]" />
      <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />
      <div className="absolute right-0 top-36 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] glass-panel p-6 shadow-2xl shadow-[rgba(8,21,39,0.12)] xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-medium text-strong">
              Live overview
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Updated for today
            </div>
            <div>
              <h2 className="app-section-title text-3xl font-semibold text-strong sm:text-4xl">
                Welcome back, {user?.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
                Track chats, requests, credits, and progress from one focused dashboard.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/skills')}
              className="rounded-full border soft-border bg-white/80 px-4 py-2 text-sm font-medium text-strong transition hover:bg-white focus-ring"
            >
              Add skill
            </button>
            <button
              onClick={() => navigate('/discover')}
              className="rounded-full surface-accent px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(255,107,74,0.18)] transition hover:brightness-110 focus-ring"
            >
              Find a swap
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="flex h-full flex-col rounded-3xl glass-panel p-5 shadow-xl shadow-[rgba(8,21,39,0.08)]">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--accent)]">Credits left</p>
                <div className="mt-3 flex-1">
                  <div className="text-3xl font-semibold text-strong">{credits}</div>
                  <p className="mt-1 text-xs text-soft">Balance available for learning</p>
                </div>
                <div className="mt-4 inline-flex w-fit rounded-2xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">
                  {credits >= 500 ? 'Ready' : 'Use wisely'}
                </div>
              </div>

              <div className="flex h-full flex-col rounded-3xl card-surface p-5 text-strong shadow-xl shadow-[rgba(8,21,39,0.08)]">
                <p className="text-xs uppercase tracking-[0.2em] text-soft">Unread chats</p>
                <div className="mt-3 flex-1">
                  <div className="text-3xl font-semibold">{unreadChatsCount}</div>
                  <p className="mt-1 text-xs text-soft">Messages waiting for you</p>
                </div>
                <div className="mt-4 inline-flex w-fit rounded-2xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">Chat</div>
              </div>

              <div className="flex h-full flex-col rounded-3xl card-surface p-5 text-strong shadow-xl shadow-[rgba(8,21,39,0.08)]">
                <p className="text-xs uppercase tracking-[0.2em] text-soft">Incoming requests</p>
                <div className="mt-3 flex-1">
                  <div className="text-3xl font-semibold">{pendingRequestsCount}</div>
                  <p className="mt-1 text-xs text-soft">Need your attention</p>
                </div>
                <div className="mt-4 inline-flex w-fit rounded-2xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">Requests</div>
              </div>

              <div className="flex h-full flex-col rounded-3xl card-surface p-5 text-strong shadow-xl shadow-[rgba(8,21,39,0.08)]">
                <p className="text-xs uppercase tracking-[0.2em] text-soft">Progress avg</p>
                <div className="mt-3 flex-1">
                  <div className="text-3xl font-semibold">{averageProgress}%</div>
                  <p className="mt-1 text-xs text-soft">Across tracked skills</p>
                </div>
                <div className="mt-4 inline-flex w-fit rounded-2xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">Progress</div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[2rem] card-surface p-6 shadow-xl shadow-[rgba(8,21,39,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="app-section-title text-lg font-semibold text-strong">Chats Notification</h3>
                    <p className="text-sm text-soft">Unread conversations and recent activity</p>
                  </div>
                  <button onClick={() => navigate('/messages')} className="text-sm font-medium text-[color:var(--accent)] hover:brightness-90">
                    Open messages
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {conversations.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-5 text-sm text-soft">No unread chats right now.</div>
                  ) : (
                    conversations.map((conversation) => (
                      <button
                        key={conversation._id}
                        onClick={() => navigate('/messages', { state: { conversationId: conversation._id } })}
                        className="flex w-full items-center gap-4 rounded-2xl border border-white/70 bg-white/80 px-4 py-4 text-left transition hover:border-[rgba(255,107,74,0.2)] hover:bg-white hover-lift"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl brand-gradient text-sm font-semibold text-white">
                          {conversation.title?.substring(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <span className="truncate font-medium text-strong">{conversation.title}</span>
                            <span className="shrink-0 text-xs text-soft">{formatTime(conversation.updatedAt)}</span>
                          </div>
                          <p className="mt-1 truncate text-sm text-soft">{conversation.subtitle}</p>
                        </div>
                        <div className="rounded-full bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white">
                          {conversation.unreadCount}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] card-surface p-6 shadow-xl shadow-[rgba(8,21,39,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="app-section-title text-lg font-semibold text-strong">Incoming Requests</h3>
                    <p className="text-sm text-soft">Pending learners waiting for your answer</p>
                  </div>
                  <button onClick={() => navigate('/requests')} className="text-sm font-medium text-[color:var(--accent)] hover:brightness-90">
                    View all
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {incomingRequests.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-5 text-sm text-soft">No incoming requests.</div>
                  ) : (
                    incomingRequests.map((request) => (
                      <div key={request._id} className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 hover-lift">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-strong">{request.learner?.name || 'Learner'}</div>
                            <p className="mt-1 text-sm text-soft">{request.skillName || 'Learning request'}</p>
                            {request.message && <p className="mt-2 text-sm text-muted line-clamp-2">{request.message}</p>}
                          </div>
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Pending</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
              <div className="rounded-[2rem] card-surface p-6 shadow-xl shadow-[rgba(8,21,39,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="app-section-title text-lg font-semibold text-strong">Skill Snapshot</h3>
                    <p className="text-sm text-soft">Teach, learn, and track your balance</p>
                </div>
                  <button onClick={() => navigate('/skills')} className="text-sm font-medium text-[color:var(--accent)] hover:brightness-90">
                  Manage
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/80 p-4 border border-white/70">
                    <p className="text-xs uppercase tracking-[0.2em] text-soft">Can teach</p>
                    <p className="mt-2 text-2xl font-semibold text-strong">{skills.offer.length}</p>
                </div>
                  <div className="rounded-2xl bg-white/80 p-4 border border-white/70">
                    <p className="text-xs uppercase tracking-[0.2em] text-soft">Learning</p>
                    <p className="mt-2 text-2xl font-semibold text-strong">{skills.learn.length}</p>
                </div>
              </div>

                <div className="mt-5 rounded-2xl surface-accent p-5 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/80">Current status</p>
                <div className="mt-2 text-3xl font-semibold">{totalSkills} skills</div>
                  <p className="mt-2 text-sm text-white/80">
                  {totalSkills === 0 ? 'Add your first skill to unlock recommendations.' : 'Your profile is active in the swap network.'}
                </p>
              </div>
            </div>

              <div className="rounded-[2rem] card-surface p-6 shadow-xl shadow-[rgba(8,21,39,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="app-section-title text-lg font-semibold text-strong">Learning Progress</h3>
                    <p className="text-sm text-soft">Recent tracked skills and milestones</p>
                </div>
                  <button onClick={() => navigate('/features')} className="text-sm font-medium text-[color:var(--accent)] hover:brightness-90">
                  Explore
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {progress.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-5 text-sm text-soft">No progress tracked yet.</div>
                ) : (
                  progress.map((item) => (
                      <div key={item._id} className="rounded-2xl border border-white/70 bg-white/80 p-4 hover-lift">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="font-medium text-strong">{item.skillId?.name || 'Unknown skill'}</div>
                            <p className="text-xs text-soft">Last session {formatTime(item.lastSessionDate)}</p>
                        </div>
                          <div className="text-sm font-semibold text-strong">{item.progress || 0}%</div>
                      </div>
                        <div className="mt-3 h-2 rounded-full bg-slate-200/80 overflow-hidden">
                        <div
                            className="h-2 rounded-full bg-gradient-to-r from-[color:var(--accent)] via-[color:var(--accent-gold)] to-[color:var(--accent-secondary)]"
                          style={{ width: `${Math.min(100, item.progress || 0)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[2rem] card-surface p-6 shadow-xl shadow-[rgba(8,21,39,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="app-section-title text-lg font-semibold text-strong">Live Notifications</h3>
                  <p className="text-sm text-soft">Combined chat and request highlights</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-5 text-sm text-soft">No new notifications.</div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start gap-3 rounded-2xl bg-white/80 px-4 py-4 border border-white/70">
                      <div className={`mt-0.5 h-2.5 w-2.5 rounded-full ${notification.type === 'chat' ? 'bg-sky-500' : 'bg-amber-500'}`} />
                      <div className="min-w-0">
                        <p className="font-medium text-strong">{notification.title}</p>
                        <p className="mt-1 text-sm text-soft">{notification.subtitle}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
