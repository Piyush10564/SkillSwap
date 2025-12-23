import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { searchService } from '../services/searchService';
import { chatService } from '../services/chatService';
import { skillsService } from '../services/skillsService';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [skills, setSkills] = useState({ offer: [], learn: [] });
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suggestionsRes, skillsRes, conversationsRes] = await Promise.all([
          searchService.getSuggestions(),
          skillsService.getMySkills(),
          chatService.getConversations()
        ]);

        console.log('Skills response:', skillsRes); // Debug log

        setSuggestions(suggestionsRes.data.suggestions || []);

        // Handle skills response - check the actual structure
        if (skillsRes.data) {
          setSkills({
            offer: skillsRes.data.skillsOffer || skillsRes.data.offer || [],
            learn: skillsRes.data.skillsLearn || skillsRes.data.learn || []
          });
        }

        // Get conversations with unread messages
        const convos = conversationsRes.data.conversations || [];
        const unreadConvos = convos.filter(c => c.unreadCount > 0).slice(0, 3);
        setConversations(unreadConvos);
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
  const skillProgress = totalSkills > 0 ? Math.round((skills.offer.length / totalSkills) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
            Welcome back, {user?.name}
          </h2>
          <p className="text-sm text-slate-600">
            Trade what you know for what you want to learn. Here's what's happening in your skill circle today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/skills')}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span className="iconify" data-icon="lucide:plus" data-width="14" data-height="14"></span>
            Add skill
          </button>
          <button
            onClick={() => navigate('/discover')}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:brightness-105"
          >
            <span className="iconify" data-icon="lucide:rabbit" data-width="14" data-height="14"></span>
            Find a swap
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1.1fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Skills Overview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-slate-900">Your skills overview</h3>
                <p className="text-sm text-slate-500">Keep your skills up to date to improve your matches.</p>
              </div>
              <button
                onClick={() => navigate('/skills')}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100"
              >
                <span className="iconify" data-icon="lucide:settings-2" data-width="12" data-height="12"></span>
                Manage
              </button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {/* Skills you can teach */}
              <div className="rounded-xl bg-slate-50/80 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700">Skills you can teach</span>
                  <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-emerald-50 px-2 text-xs font-medium text-emerald-700">
                    {skills.offer.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.offer.slice(0, 3).map((skill) => (
                    <span key={skill._id} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">
                      {skill.name}
                      <span className="text-[0.65rem] text-emerald-700/80">{skill.level}</span>
                    </span>
                  ))}
                  {skills.offer.length > 3 && (
                    <button
                      onClick={() => navigate('/skills')}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      +{skills.offer.length - 3} more
                    </button>
                  )}
                  {skills.offer.length === 0 && (
                    <p className="text-xs text-slate-500">No skills added yet</p>
                  )}
                </div>
              </div>

              {/* Skills you want to learn */}
              <div className="rounded-xl bg-slate-50/80 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700">Skills you want to learn</span>
                  <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-indigo-50 px-2 text-xs font-medium text-indigo-700">
                    {skills.learn.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.learn.slice(0, 3).map((skill) => (
                    <span key={skill._id} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-800">
                      {skill.name}
                      <span className="text-[0.65rem] text-indigo-700/80">{skill.level}</span>
                    </span>
                  ))}
                  {skills.learn.length > 3 && (
                    <button
                      onClick={() => navigate('/skills')}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      +{skills.learn.length - 3} more
                    </button>
                  )}
                  {skills.learn.length === 0 && (
                    <p className="text-xs text-slate-500">No skills added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Suggested Swaps */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-slate-900">Suggested swaps</h3>
                <p className="text-sm text-slate-500">Based on your skills and timezone.</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100"
              >
                <span className="iconify" data-icon="lucide:refresh-ccw" data-width="12" data-height="12"></span>
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:flex-row sm:items-center">
                    <div className="flex flex-1 items-center gap-3">
                      <div className="h-10 w-10 rounded-full skeleton"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 skeleton rounded"></div>
                        <div className="h-3 w-48 skeleton rounded"></div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-full skeleton rounded"></div>
                      <div className="h-3 w-3/4 skeleton rounded"></div>
                    </div>
                    <div className="h-9 w-28 skeleton rounded-full"></div>
                  </div>
                ))}
              </div>
            ) : suggestions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center animate-fade-in">
                <h4 className="text-sm font-semibold text-slate-800">No suggestions yet</h4>
                <p className="mt-2 text-xs text-slate-500">
                  Add skills to get personalized matches
                </p>
                <button
                  onClick={() => navigate('/skills')}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  <span className="iconify" data-icon="lucide:plus" data-width="14" data-height="14"></span>
                  Add skills
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((match, index) => (
                  <div
                    key={match.user._id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:flex-row sm:items-center hover-lift animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-1 items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-sm font-semibold text-white">
                        {match.user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{match.user.name}</span>
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[0.65rem] text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Online
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
                          <span className="iconify" data-icon="lucide:map-pin" data-width="11" data-height="11"></span>
                          {match.user.location || 'Location not set'} • {match.user.timezone}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2 sm:max-w-xs">
                      {match.canTeachMe.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                            <span className="iconify" data-icon="lucide:book-open-check" data-width="12" data-height="12"></span>
                            Can teach you
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {match.canTeachMe.map((skill, idx) => (
                              <span key={idx} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-800">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {match.wantsToLearnFromMe.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                            <span className="iconify" data-icon="lucide:graduation-cap" data-width="12" data-height="12"></span>
                            Wants to learn
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {match.wantsToLearnFromMe.map((skill, idx) => (
                              <span key={idx} className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 sm:flex-col sm:items-end">
                      <button className="inline-flex items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50">
                        View profile
                      </button>
                      <button
                        onClick={() => handleStartChat(match.user._id)}
                        disabled={startingChat === match.user._id}
                        className="inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:brightness-105 disabled:opacity-50"
                      >
                        <span className="iconify" data-icon="lucide:message-circle-more" data-width="12" data-height="12"></span>
                        {startingChat === match.user._id ? 'Starting...' : 'Start chat'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Skill Progress Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-slate-900">Skill Progress</h3>
                <p className="text-sm text-slate-500">Your learning journey.</p>
              </div>
              <button
                onClick={() => navigate('/skills')}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100"
              >
                <span className="iconify" data-icon="lucide:trending-up" data-width="12" data-height="12"></span>
                Details
              </button>
            </div>

            {totalSkills === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center">
                <h4 className="text-sm font-semibold text-slate-800">Start your journey</h4>
                <p className="mt-2 text-xs text-slate-500">
                  Add skills to track your progress and see how you're growing.
                </p>
                <button
                  onClick={() => navigate('/skills')}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  <span className="iconify" data-icon="lucide:plus" data-width="14" data-height="14"></span>
                  Add your first skill
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Progress Circle */}
                <div className="flex items-center justify-center">
                  <div className="relative h-32 w-32">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${skillProgress * 2.51} 251`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="50%" stopColor="#0ea5e9" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-slate-900">{skillProgress}%</span>
                      <span className="text-xs text-slate-500">Mastered</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-emerald-50/80 p-3 text-center">
                    <div className="text-2xl font-bold text-emerald-700">{skills.offer.length}</div>
                    <div className="text-xs text-emerald-600">Can Teach</div>
                  </div>
                  <div className="rounded-xl bg-indigo-50/80 p-3 text-center">
                    <div className="text-2xl font-bold text-indigo-700">{skills.learn.length}</div>
                    <div className="text-xs text-indigo-600">Learning</div>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50/80 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Total Skills</span>
                    <span className="font-semibold text-slate-900">{totalSkills}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications / Messages */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold tracking-tight text-slate-900">Notifications</h3>
              <button
                onClick={() => navigate('/messages')}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                View all
              </button>
            </div>

            {conversations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center">
                <h4 className="text-sm font-semibold text-slate-800">You're all caught up</h4>
                <p className="mt-2 text-xs text-slate-500">
                  We'll let you know when there's a new match, message, or session update.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((convo) => (
                  <div
                    key={convo._id}
                    onClick={() => navigate('/messages', { state: { conversationId: convo._id } })}
                    className="flex items-start gap-2 rounded-xl bg-slate-50/80 p-3 cursor-pointer hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="mt-0.5">
                      <span className="iconify text-sky-500" data-icon="lucide:message-circle-more" data-width="14" data-height="14"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-slate-900 font-medium truncate">
                          New message from {convo.participant?.name || 'Unknown'}
                        </p>
                        {convo.unreadCount > 0 && (
                          <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-indigo-500 px-1.5 text-[0.65rem] font-medium text-white flex-shrink-0">
                            {convo.unreadCount}
                          </span>
                        )}
                      </div>
                      {convo.lastMessage && (
                        <p className="mt-1 text-xs text-slate-500 truncate">
                          {convo.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
