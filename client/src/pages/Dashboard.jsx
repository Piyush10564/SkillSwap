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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.16),_transparent_22%),linear-gradient(180deg,_#0f172a_0%,_#111827_38%,_#f8fafc_38%,_#f8fafc_100%)]" />
      <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute right-0 top-36 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
              Live overview
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Updated for today
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Welcome back, {user?.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">
                Track chats, requests, credits, and progress from one focused dashboard.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/skills')}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Add skill
            </button>
            <button
              onClick={() => navigate('/discover')}
              className="rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
            >
              Find a swap
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-5 shadow-xl shadow-slate-950/20">
                <p className="text-xs uppercase tracking-[0.2em] text-sky-300/80">Credits left</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-3xl font-semibold text-white">{credits}</div>
                    <p className="text-xs text-slate-400">Balance available for learning</p>
                  </div>
                  <div className="rounded-2xl bg-sky-500/15 px-3 py-2 text-sky-200">{credits >= 500 ? 'Ready' : 'Use wisely'}</div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-xl shadow-slate-200/50">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Unread chats</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-3xl font-semibold">{unreadChatsCount}</div>
                    <p className="text-xs text-slate-500">Messages waiting for you</p>
                  </div>
                  <div className="rounded-2xl bg-indigo-50 px-3 py-2 text-indigo-600">Chat</div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-xl shadow-slate-200/50">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Incoming requests</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-3xl font-semibold">{pendingRequestsCount}</div>
                    <p className="text-xs text-slate-500">Need your attention</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 px-3 py-2 text-amber-600">Requests</div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-xl shadow-slate-200/50">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Progress avg</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-3xl font-semibold">{averageProgress}%</div>
                    <p className="text-xs text-slate-500">Across tracked skills</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-emerald-600">Progress</div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Chats Notification</h3>
                    <p className="text-sm text-slate-500">Unread conversations and recent activity</p>
                  </div>
                  <button onClick={() => navigate('/messages')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                    Open messages
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {conversations.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No unread chats right now.</div>
                  ) : (
                    conversations.map((conversation) => (
                      <button
                        key={conversation._id}
                        onClick={() => navigate('/messages', { state: { conversationId: conversation._id } })}
                        className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/60"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-sm font-semibold text-white">
                          {conversation.title?.substring(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <span className="truncate font-medium text-slate-900">{conversation.title}</span>
                            <span className="shrink-0 text-xs text-slate-500">{formatTime(conversation.updatedAt)}</span>
                          </div>
                          <p className="mt-1 truncate text-sm text-slate-500">{conversation.subtitle}</p>
                        </div>
                        <div className="rounded-full bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white">
                          {conversation.unreadCount}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Incoming Requests</h3>
                    <p className="text-sm text-slate-500">Pending learners waiting for your answer</p>
                  </div>
                  <button onClick={() => navigate('/requests')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                    View all
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {incomingRequests.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No incoming requests.</div>
                  ) : (
                    incomingRequests.map((request) => (
                      <div key={request._id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-slate-900">{request.learner?.name || 'Learner'}</div>
                            <p className="mt-1 text-sm text-slate-500">{request.skillName || 'Learning request'}</p>
                            {request.message && <p className="mt-2 text-sm text-slate-600 line-clamp-2">{request.message}</p>}
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
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Skill Snapshot</h3>
                  <p className="text-sm text-slate-500">Teach, learn, and track your balance</p>
                </div>
                <button onClick={() => navigate('/skills')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  Manage
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Can teach</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{skills.offer.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Learning</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{skills.learn.length}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Current status</p>
                <div className="mt-2 text-3xl font-semibold">{totalSkills} skills</div>
                <p className="mt-2 text-sm text-slate-300">
                  {totalSkills === 0 ? 'Add your first skill to unlock recommendations.' : 'Your profile is active in the swap network.'}
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Learning Progress</h3>
                  <p className="text-sm text-slate-500">Recent tracked skills and milestones</p>
                </div>
                <button onClick={() => navigate('/features')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  Explore
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {progress.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No progress tracked yet.</div>
                ) : (
                  progress.map((item) => (
                    <div key={item._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-medium text-slate-900">{item.skillId?.name || 'Unknown skill'}</div>
                          <p className="text-xs text-slate-500">Last session {formatTime(item.lastSessionDate)}</p>
                        </div>
                        <div className="text-sm font-semibold text-slate-900">{item.progress || 0}%</div>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500"
                          style={{ width: `${Math.min(100, item.progress || 0)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Live Notifications</h3>
                  <p className="text-sm text-slate-500">Combined chat and request highlights</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No new notifications.</div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-4">
                      <div className={`mt-0.5 h-2.5 w-2.5 rounded-full ${notification.type === 'chat' ? 'bg-sky-500' : 'bg-amber-500'}`} />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{notification.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{notification.subtitle}</p>
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
