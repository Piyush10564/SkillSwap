import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    timezone: '',
    learningStyle: '',
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        timezone: user.timezone || 'UTC',
        learningStyle: user.preferences?.learningStyle || 'any',
      });
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await profileService.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        timezone: formData.timezone,
        preferences: {
          learningStyle: formData.learningStyle,
        },
      };

      const response = await profileService.updateProfile(updateData);
      // API returns { success: true, data: { user: {...} } }
      if (response.data.success && response.data.data.user) {
        setUser(response.data.data.user);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      location: user.location || '',
      timezone: user.timezone || 'UTC',
      learningStyle: user.preferences?.learningStyle || 'any',
    });
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow if in edit mode
    if (!isEditing) {
      alert('Please click "Edit Profile" first to update your avatar');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await profileService.uploadAvatar(reader.result);
        // API returns { success: true, data: { avatarUrl: "..." } }
        if (response.data.success && response.data.data.avatarUrl) {
          setUser({ ...user, avatarUrl: response.data.data.avatarUrl });
          // Don't show error - upload was successful
        } else {
          // Only show error if success is false
          alert('Failed to upload avatar. Please try again.');
        }
      } catch (error) {
        console.error('Error uploading avatar:', error);
        alert(error.response?.data?.message || 'Failed to upload avatar. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Profile</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span className="iconify" data-icon="lucide:edit-3" data-width="14" data-height="14"></span>
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-105 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Profile Card */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div
                className={`h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-2xl font-semibold text-white ${isEditing ? 'cursor-pointer' : ''
                  }`}
                onClick={isEditing ? handleAvatarClick : undefined}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  user.name?.substring(0, 2).toUpperCase()
                )}
              </div>
              {isEditing && (
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <span className="iconify text-white" data-icon="lucide:camera" data-width="24" data-height="24"></span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={!isEditing}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{user.name}</h3>
              <p className="text-sm text-slate-500">{user.email}</p>
              {isEditing && (
                <p className="text-xs text-slate-400 mt-1">Click avatar to upload image (max 2MB)</p>
              )}
            </div>
          </div>
          {stats && (
            <p className="text-xs text-slate-500 mt-1">
              Member since {new Date(stats.memberSince).toLocaleDateString()}
            </p>
          )}

          {/* Profile Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              ) : (
                <p className="text-sm text-slate-600">{user?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={500}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Tell others about yourself..."
                />
              ) : (
                <p className="text-sm text-slate-600">{user?.bio || 'No bio added yet'}</p>
              )}
              {isEditing && (
                <p className="text-xs text-slate-500 mt-1">{formData.bio.length}/500 characters</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="City, Country"
                  />
                ) : (
                  <p className="text-sm text-slate-600">{user?.location || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                {isEditing ? (
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Kolkata">India</option>
                    <option value="Australia/Sydney">Sydney</option>
                  </select>
                ) : (
                  <p className="text-sm text-slate-600">{user?.timezone || 'UTC'}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Learning Style</label>
              {isEditing ? (
                <select
                  name="learningStyle"
                  value={formData.learningStyle}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="any">Any</option>
                  <option value="text">Text-based</option>
                  <option value="call">Video/Voice Call</option>
                  <option value="async">Asynchronous</option>
                </select>
              ) : (
                <p className="text-sm text-slate-600 capitalize">{user?.preferences?.learningStyle || 'Any'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Statistics</h3>
            {stats ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Skills Offered</span>
                  <span className="text-lg font-semibold text-indigo-600">{stats.skillsOffered}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Skills Learning</span>
                  <span className="text-lg font-semibold text-emerald-600">{stats.skillsLearning}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <span className="text-sm font-medium text-slate-700">Total Skills</span>
                  <span className="text-xl font-bold text-slate-900">{stats.totalSkills}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-slate-500">Loading stats...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
