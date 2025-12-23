import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../services/searchService';
import { chatService } from '../services/chatService';

export default function Discover() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    level: '',
  });
  const [loading, setLoading] = useState(false);
  const [startingChat, setStartingChat] = useState(null);

  useEffect(() => {
    handleSearch();
  }, []);

  // Auto-search when filters change (with debounce for text input)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, filters.q ? 500 : 0); // Debounce text search by 500ms

    return () => clearTimeout(timer);
  }, [filters]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await searchService.searchSkills(filters);
      setSkills(response.data.skills || []);
    } catch (error) {
      console.error('Error searching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (skill) => {
    if (!skill.owner || !skill.owner._id) {
      console.error('Skill owner not found');
      return;
    }

    setStartingChat(skill._id);
    try {
      // Create or get existing conversation
      const response = await chatService.createOrGetConversation(skill.owner._id);
      const conversationId = response.data.conversation._id;

      // Navigate to messages page
      navigate('/messages', { state: { conversationId } });
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please try again.');
    } finally {
      setStartingChat(null);
    }
  };

  return (
    <div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Discover skills & mentors</h2>
        <p className="text-sm text-slate-600">Search people who can teach you what you want, and who want to learn from you.</p>
      </div>

      {/* Search and Filters */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search skills..."
            className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">All Categories</option>
            <option>Programming</option>
            <option>Design</option>
            <option>Language</option>
            <option>Business</option>
            <option>Marketing</option>
            <option>Other</option>
          </select>
          <select
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">All Levels</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Expert</option>
          </select>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-105 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Searching...</div>
        ) : skills.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-12 text-center">
            <p className="text-sm text-slate-600">No skills found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-sm font-semibold text-white">
                      {skill.owner?.name?.substring(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{skill.name}</h3>
                      <p className="text-sm text-slate-600">{skill.owner?.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span className={`rounded-full px-2 py-0.5 ${skill.level === 'Expert' ? 'bg-emerald-50 text-emerald-700' :
                            skill.level === 'Intermediate' ? 'bg-blue-50 text-blue-700' :
                              'bg-rose-50 text-rose-700'
                          }`}>
                          {skill.level}
                        </span>
                        <span>•</span>
                        <span>{skill.category}</span>
                        <span>•</span>
                        <span>{skill.owner?.timezone}</span>
                      </div>
                      {skill.description && (
                        <p className="mt-2 text-sm text-slate-600">{skill.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartChat(skill)}
                    disabled={startingChat === skill._id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-105 disabled:opacity-50"
                  >
                    <span className="iconify" data-icon="lucide:message-circle-more" data-width="14" data-height="14"></span>
                    {startingChat === skill._id ? 'Starting...' : 'Start chat'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
