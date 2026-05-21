import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import BadgeShowcase from '../components/Badges/BadgeShowcase';

export default function Profile() {
  const { user, setUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    timezone: '',
    learningStyle: '',
  });

  const fileInputRef = useRef(null);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);

      const response = await profileService.getStats();
      setStats(response.data.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStatsError(error.message || 'Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        timezone: user.timezone || 'UTC',
        learningStyle: user.preferences?.learningStyle || 'any',
      });

      fetchStats();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      if (response.data.success && response.data.data.user) {
        setUser(response.data.data.user);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);

      alert(
        error.response?.data?.message ||
          'Failed to update profile. Please try again.'
      );
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

  const compressImageFile = (file, maxBytes = 2 * 1024 * 1024) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);

        let width = image.width;
        let height = image.height;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Unable to process image'));
          return;
        }

        const tryExport = (quality = 0.9) => {
          canvas.width = width;
          canvas.height = height;
          context.clearRect(0, 0, width, height);
          context.drawImage(image, 0, 0, width, height);
          return canvas.toDataURL('image/jpeg', quality);
        };

        let output = tryExport(0.92);

        while (output.length > maxBytes && width > 320 && height > 320) {
          width = Math.floor(width * 0.85);
          height = Math.floor(height * 0.85);
          output = tryExport(0.82);
        }

        resolve(output);
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Unable to read image'));
      };

      image.src = objectUrl;
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!isEditing) {
      alert('Please click "Edit Profile" first to update your avatar');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      const avatarData =
        file.size > 2 * 1024 * 1024
          ? await compressImageFile(file)
          : await new Promise((resolve, reject) => {
              const reader = new FileReader();

              reader.onloadend = () => resolve(reader.result);
              reader.onerror = () => reject(new Error('Unable to read image'));
              reader.readAsDataURL(file);
            });

      const response = await profileService.uploadAvatar(avatarData);

      if (response.data.success && response.data.data.avatarUrl) {
        setUser({
          ...user,
          avatarUrl: response.data.data.avatarUrl,
        });
      } else {
        alert('Failed to upload avatar. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);

      alert(
        error.response?.data?.message ||
          error.message ||
          'Failed to upload avatar. Please try again.'
      );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="app-section-title text-xl font-semibold text-strong">
          Profile
        </h2>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-full border soft-border bg-white/70 px-4 py-2 text-sm font-medium text-strong hover:bg-white focus-ring"
          >
            <span
              className="iconify"
              data-icon="lucide:edit-3"
              data-width="14"
              data-height="14"
            ></span>

            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full border soft-border bg-white/70 px-4 py-2 text-sm font-medium text-strong hover:bg-white focus-ring disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full surface-accent px-4 py-2 text-sm font-medium shadow-sm hover:brightness-105 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        {/* Main Profile Card */}
        <div className="lg:col-span-2 page-surface p-6 self-start">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div
                className={`h-24 w-24 rounded-full brand-gradient flex items-center justify-center text-2xl font-semibold text-white ${
                  isEditing ? 'cursor-pointer' : ''
                }`}
                onClick={isEditing ? handleAvatarClick : undefined}
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  user?.name?.substring(0, 2).toUpperCase()
                )}
              </div>

              {isEditing && (
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <span
                    className="iconify text-white"
                    data-icon="lucide:camera"
                    data-width="24"
                    data-height="24"
                  ></span>
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
              <h3 className="text-xl font-semibold text-slate-900">
                {user?.name}
              </h3>

              <p className="text-sm text-slate-500">{user?.email}</p>

              {isEditing && (
                <p className="text-xs text-slate-400 mt-1">
                  Click avatar to upload image (max 2MB)
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mb-6 rounded-2xl border soft-border bg-slate-50/70 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-strong">
                    Profile picture
                  </h4>

                  <p className="mt-1 text-xs text-soft">
                    Upload a clear square image. JPG or PNG, up to 2MB.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-2xl border soft-border bg-white shadow-sm">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center brand-gradient text-sm font-semibold text-white">
                        {user?.name?.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="inline-flex items-center gap-2 rounded-full surface-accent px-4 py-2 text-sm font-medium shadow-sm hover:brightness-105 focus-ring"
                  >
                    <span
                      className="iconify"
                      data-icon="lucide:upload"
                      data-width="14"
                      data-height="14"
                    ></span>

                    Upload picture
                  </button>
                </div>
              </div>
            </div>
          )}

          {stats && (
            <p className="text-xs text-soft mt-1">
              Member since{' '}
              {new Date(stats.memberSince).toLocaleDateString()}
            </p>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-strong mb-1">
                Name
              </label>

              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border soft-border bg-transparent px-4 py-2 text-sm focus:border-[color:var(--accent)] focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,74,0.18)] focus-ring"
                />
              ) : (
                <p className="text-sm text-muted">{user?.name}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-strong mb-1">
                Bio
              </label>

              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={500}
                  placeholder="Tell others about yourself..."
                  className="w-full rounded-xl border soft-border bg-transparent px-4 py-2 text-sm focus:border-[color:var(--accent)] focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,74,0.18)] focus-ring"
                />
              ) : (
                <p className="text-sm text-muted">
                  {user?.bio || 'No bio added yet'}
                </p>
              )}

              {isEditing && (
                <p className="text-xs text-soft mt-1">
                  {formData.bio.length}/500 characters
                </p>
              )}
            </div>

            {/* Location + Timezone */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-strong mb-1">
                  Location
                </label>

                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    className="w-full rounded-xl border soft-border bg-transparent px-4 py-2 text-sm focus:border-[color:var(--accent)] focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,74,0.18)] focus-ring"
                  />
                ) : (
                  <p className="text-sm text-muted">
                    {user?.location || 'Not set'}
                  </p>
                )}
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-strong mb-1">
                  Timezone
                </label>

                {isEditing ? (
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border soft-border bg-transparent px-4 py-2 text-sm focus:border-[color:var(--accent)] focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,74,0.18)] focus-ring"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">
                      Eastern Time
                    </option>
                    <option value="America/Chicago">
                      Central Time
                    </option>
                    <option value="America/Denver">
                      Mountain Time
                    </option>
                    <option value="America/Los_Angeles">
                      Pacific Time
                    </option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Kolkata">India</option>
                    <option value="Australia/Sydney">Sydney</option>
                  </select>
                ) : (
                  <p className="text-sm text-muted">
                    {user?.timezone || 'UTC'}
                  </p>
                )}
              </div>
            </div>

            {/* Learning Style */}
            <div>
              <label className="block text-sm font-medium text-strong mb-1">
                Learning Style
              </label>

              {isEditing ? (
                <select
                  name="learningStyle"
                  value={formData.learningStyle}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border soft-border bg-white/80 px-4 py-2 text-sm focus:border-[color:var(--accent)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,74,0.18)] focus-ring"
                >
                  <option value="any">Any</option>
                  <option value="text">Text-based</option>
                  <option value="call">Video/Voice Call</option>
                  <option value="async">Asynchronous</option>
                </select>
              ) : (
                <p className="text-sm text-muted capitalize">
                  {user?.preferences?.learningStyle || 'Any'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4 self-start">
          {/* Stats */}
          <div className="page-surface p-6">
            <h3 className="app-section-title text-base font-semibold text-strong mb-4">
              Statistics
            </h3>

            {statsLoading ? (
              <div className="text-center py-4 text-sm text-soft">
                Loading stats...
              </div>
            ) : statsError ? (
              <div className="text-center py-4">
                <p className="text-sm text-red-600 mb-2">
                  Error: {statsError}
                </p>

                <button
                  onClick={fetchStats}
                  className="text-xs text-[color:var(--accent)] hover:brightness-90 font-medium"
                >
                  Retry
                </button>
              </div>
            ) : stats ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">
                    Skills Offered
                  </span>

                  <span className="text-lg font-semibold text-[color:var(--accent)]">
                    {stats.skillsOffered}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">
                    Skills Learning
                  </span>

                  <span className="text-lg font-semibold text-emerald-600">
                    {stats.skillsLearning}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t soft-border">
                  <span className="text-sm font-medium text-strong">
                    Total Skills
                  </span>

                  <span className="text-xl font-bold text-strong">
                    {stats.totalSkills}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-soft">
                No data available
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="page-surface p-6">
            <h3 className="app-section-title text-base font-semibold text-strong mb-4">
              Badges
            </h3>

            <BadgeShowcase userId={user?._id} compact />
          </div>
        </div>
      </div>

      <div className="mt-6 page-surface p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="app-section-title text-base font-semibold text-strong">
            Profile snapshot
          </h3>

          <span className="chip chip-soft">At a glance</span>
        </div>

        {stats ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border soft-border bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-soft">
                Skills offered
              </p>
              <p className="mt-2 text-2xl font-semibold text-strong">
                {stats.skillsOffered}
              </p>
            </div>

            <div className="rounded-2xl border soft-border bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-soft">
                Skills learning
              </p>
              <p className="mt-2 text-2xl font-semibold text-strong">
                {stats.skillsLearning}
              </p>
            </div>

            <div className="rounded-2xl border soft-border bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-soft">
                Total skills
              </p>
              <p className="mt-2 text-2xl font-semibold text-strong">
                {stats.totalSkills}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">Loading snapshot...</p>
        )}
      </div>
    </div>
  );
}