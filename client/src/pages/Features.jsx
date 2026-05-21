import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import ReviewForm from '../components/Reviews/ReviewForm';
import ReviewsList from '../components/Reviews/ReviewsList';
import GoalForm from '../components/Goals/GoalForm';
import GoalsList from '../components/Goals/GoalsList';
import BadgeShowcase from '../components/Badges/BadgeShowcase';
import CreditCard from '../components/Credits/CreditCard';
import CreditHistory from '../components/Credits/CreditHistory';
import ProgressList from '../components/Progress/ProgressList';
import NotesList from '../components/Notes/NotesList';
import NoteEditor from '../components/Notes/NoteEditor';

export default function Features() {
  const { user } = useAuth();
  const [noteRefresh, setNoteRefresh] = useState(0);

  if (!user) {
    return (
      <div className="min-h-screen section-shell flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">Please log in to view features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen section-shell py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="app-section-title text-4xl font-bold text-strong mb-2">Enhanced Features</h1>
          <p className="text-muted">Track your learning journey with reviews, goals, badges, and more</p>
        </div>

        {/* Credits Section */}
        <div className="mb-12">
          <h2 className="app-section-title text-2xl font-bold text-strong mb-4">💰 Credits & Rewards</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <CreditCard userId={user._id} />
            </div>
            <div className="lg:col-span-2">
              <div className="card-surface p-6">
                <h3 className="app-section-title font-semibold text-strong mb-4">How Credits Work</h3>
                <ul className="space-y-3 text-sm text-muted">
                  <li className="flex gap-3">
                    <span className="text-lg">📈</span>
                    <span><strong>Earn Credits:</strong> Teach and share skills with others</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-lg">📉</span>
                    <span><strong>Spend Credits:</strong> Learn from expert teachers</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-lg">🔄</span>
                    <span><strong>Exchange:</strong> Fair time-based skill exchange system</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div className="mb-12">
          <h2 className="app-section-title text-2xl font-bold text-strong mb-4">🎯 Learning Goals</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <GoalForm onSuccess={() => window.location.reload()} />
            </div>
            <div className="lg:col-span-2">
              <GoalsList userId={user._id} />
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="mb-12">
          <h2 className="app-section-title text-2xl font-bold text-strong mb-4">🏅 Achievements & Badges</h2>
          <BadgeShowcase userId={user._id} />
        </div>

        {/* Progress Section */}
        <div className="mb-12">
          <h2 className="app-section-title text-2xl font-bold text-strong mb-4">📊 Learning Progress</h2>
          <ProgressList userId={user._id} />
        </div>

        {/* Reviews Section */}
        <div className="mb-12">
          <h2 className="app-section-title text-2xl font-bold text-strong mb-4">⭐ Reviews & Ratings</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="card-surface p-6">
                <h3 className="app-section-title font-semibold text-strong mb-4">Your Rating</h3>
                <div className="mb-4">
                  <div className="text-5xl font-bold text-[color:var(--accent-gold)] mb-2">
                    {user.averageRating?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < Math.round(user.averageRating || 0) ? 'text-[color:var(--accent-gold)]' : 'text-slate-300'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted mt-2">{user.totalReviews || 0} reviews</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <ReviewsList userId={user._id} />
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="mb-12">
          <h2 className="app-section-title text-2xl font-bold text-strong mb-4">📋 Credit Transactions</h2>
          <CreditHistory userId={user._id} />
        </div>

        {/* Notes Section */}
        <div className="mb-12">
          <h2 className="app-section-title text-2xl font-bold text-strong mb-4">📝 Learning Notes</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <NoteEditor userId={user._id} onSuccess={() => setNoteRefresh(noteRefresh + 1)} />
            </div>
            <div className="lg:col-span-2">
              <NotesList userId={user._id} key={noteRefresh} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
