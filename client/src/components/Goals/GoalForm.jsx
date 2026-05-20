import { useState, useEffect } from 'react';
import { goalService } from '../../services/goalService';
import { skillsService } from '../../services/skillsService';

export default function GoalForm({ onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [skillId, setSkillId] = useState('');
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch user's skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoadingSkills(true);
        const response = await skillsService.getMySkills();
        
        // Handle the response structure: { success, data: { offer: [], learn: [] } }
        let skillsList = [];
        if (response && response.data) {
          // response.data contains { offer: [], learn: [] }
          skillsList = [...(response.data.offer || []), ...(response.data.learn || [])];
        }
        
        setSkills(skillsList);
      } catch (err) {
        console.error('Failed to fetch skills:', err);
        setSkills([]);
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchSkills();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!skillId) {
      setError('Please select a skill');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await goalService.createGoal({
        title,
        description,
        targetDate,
        skillId,
      });
      setTitle('');
      setDescription('');
      setTargetDate('');
      setSkillId('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-surface p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Create Learning Goal</h3>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Select Skill *</label>
        <select
          value={skillId}
          onChange={(e) => setSkillId(e.target.value)}
          disabled={loadingSkills}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
        >
          <option value="">
            {loadingSkills ? 'Loading skills...' : 'Choose a skill for your goal'}
          </option>
          {skills.map((skill) => (
            <option key={skill._id || skill.id} value={skill._id || skill.id}>
              {skill.name}
            </option>
          ))}
        </select>
        {skills.length === 0 && !loadingSkills && (
          <p className="text-xs text-amber-600 mt-1">
            💡 No skills found. Please add a skill first in the Skills section.
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Goal Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Master React Hooks"
          required
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What do you want to learn?"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
          rows={3}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Target Date *</label>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <button
        type="submit"
        disabled={loading || loadingSkills || !skillId}
        className="w-full rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-300 hover:brightness-105 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Goal'}
      </button>
    </form>
  );
}
