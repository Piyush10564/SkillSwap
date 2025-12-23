import { useEffect, useState } from 'react';
import { skillsService } from '../services/skillsService';

export default function Skills() {
  const [skills, setSkills] = useState({ offer: [], learn: [] });
  const [activeTab, setActiveTab] = useState('offer');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Programming',
    level: 'Beginner',
    type: 'offer',
    description: '',
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await skillsService.getMySkills();
      setSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await skillsService.createSkill(formData);
      setShowAddModal(false);
      setFormData({ name: '', category: 'Programming', level: 'Beginner', type: 'offer', description: '' });
      fetchSkills();
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const handleDeleteSkill = async (id) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await skillsService.deleteSkill(id);
        fetchSkills();
      } catch (error) {
        console.error('Error deleting skill:', error);
      }
    }
  };

  const currentSkills = activeTab === 'offer' ? skills.offer : skills.learn;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">My skills</h2>
          <p className="text-sm text-slate-600">Tell SkillSwap what you can teach and what you want to learn.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-105"
        >
          <span className="iconify" data-icon="lucide:plus" data-width="14" data-height="14"></span>
          Add skill
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 rounded-full bg-slate-100/80 p-0.5 text-sm sm:max-w-md">
        <div className="flex">
          <button
            onClick={() => setActiveTab('offer')}
            className={`flex-1 rounded-full py-2 text-center font-medium ${activeTab === 'offer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
          >
            Skills I offer ({skills.offer.length})
          </button>
          <button
            onClick={() => setActiveTab('learn')}
            className={`flex-1 rounded-full py-2 text-center font-medium ${activeTab === 'learn' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
          >
            Skills I want to learn ({skills.learn.length})
          </button>
        </div>
      </div>

      {/* Skills List */}
      <div className="mt-6">
        {currentSkills.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
            <h3 className="text-sm font-semibold text-slate-800">No skills added yet</h3>
            <p className="mt-1 text-xs text-slate-500">
              Start by adding a skill you'd like to {activeTab === 'offer' ? 'teach' : 'learn'}.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm hover:bg-slate-50"
            >
              <span className="iconify" data-icon="lucide:plus" data-width="14" data-height="14"></span>
              Add skill
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {currentSkills.map((skill) => (
              <div key={skill._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{skill.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${skill.level === 'Expert' ? 'bg-emerald-50 text-emerald-700' :
                          skill.level === 'Intermediate' ? 'bg-blue-50 text-blue-700' :
                            'bg-rose-50 text-rose-700'
                        }`}>
                        {skill.level}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{skill.category}</p>
                    {skill.description && (
                      <p className="mt-2 text-sm text-slate-600">{skill.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteSkill(skill._id)}
                    className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <span className="iconify" data-icon="lucide:trash-2" data-width="16" data-height="16"></span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add new skill</h3>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Skill name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g. React, Spanish, UI Design"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option>Programming</option>
                  <option>Design</option>
                  <option>Language</option>
                  <option>Business</option>
                  <option>Marketing</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="offer">I can teach this</option>
                  <option value="learn">I want to learn this</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-105"
                >
                  Add skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
