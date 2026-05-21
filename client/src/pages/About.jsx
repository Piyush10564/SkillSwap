import { Link } from 'react-router-dom';
import Footer from '../components/Footer/Footer';

export default function About() {
  return (
    <div className="min-h-screen section-shell flex flex-col">
      <div className="border-b soft-border glass-panel">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="h-12 w-12 rounded-2xl brand-gradient shadow-lg flex items-center justify-center">
                <span className="text-lg font-semibold tracking-tight text-white">SS</span>
              </div>
              <span className="app-section-title text-2xl font-bold text-strong">SkillSwap</span>
            </div>

            <h1 className="app-section-title text-4xl md:text-5xl font-bold text-strong mb-4">
              Exchange what you know for what you want to learn
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
              Connect with people worldwide to trade skills, knowledge, and expertise. No money involved, just pure knowledge exchange.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full surface-accent px-6 py-3 text-base font-medium text-white shadow-lg shadow-[rgba(255,107,74,0.18)] hover:brightness-105"
            >
              Get Started Free
              <span className="iconify" data-icon="lucide:arrow-right" data-width="18" data-height="18"></span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 flex-1">
        <div className="text-center mb-12">
          <h2 className="app-section-title text-3xl font-bold text-strong mb-4">Our Mission</h2>
          <p className="text-lg text-muted max-w-3xl mx-auto">
            We believe everyone has valuable skills to share. SkillSwap creates a global community where knowledge flows freely,
            enabling people to learn from each other without financial barriers.
          </p>
        </div>

        <div id="how-it-works" className="mb-16">
          <h2 className="app-section-title text-3xl font-bold text-strong text-center mb-12">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="page-surface p-6">
              <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
                <span className="iconify text-[color:var(--accent)]" data-icon="lucide:user-plus" data-width="24" data-height="24"></span>
              </div>
              <h3 className="app-section-title text-lg font-semibold text-strong mb-2">1. Create Your Profile</h3>
              <p className="text-sm text-muted">
                Sign up and list the skills you can teach and what you want to learn. It's completely free!
              </p>
            </div>

            <div className="page-surface p-6">
              <div className="h-12 w-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-4">
                <span className="iconify text-cyan-700" data-icon="lucide:search" data-width="24" data-height="24"></span>
              </div>
              <h3 className="app-section-title text-lg font-semibold text-strong mb-2">2. Find Your Match</h3>
              <p className="text-sm text-muted">
                Browse skills or get matched with people who can teach you what you want to learn.
              </p>
            </div>

            <div className="page-surface p-6">
              <div className="h-12 w-12 rounded-xl bg-violet-50 flex items-center justify-center mb-4">
                <span className="iconify text-violet-600" data-icon="lucide:message-circle" data-width="24" data-height="24"></span>
              </div>
              <h3 className="app-section-title text-lg font-semibold text-strong mb-2">3. Start Swapping</h3>
              <p className="text-sm text-muted">
                Connect via chat, schedule sessions, and start exchanging knowledge in real-time.
              </p>
            </div>
          </div>
        </div>

        <div id="features" className="mb-16">
          <h2 className="app-section-title text-3xl font-bold text-strong text-center mb-12">Features</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <span className="iconify text-emerald-600" data-icon="lucide:zap" data-width="20" data-height="20"></span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-strong mb-1">Real-time Chat</h3>
                <p className="text-sm text-muted">Instant messaging with typing indicators and online status</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                  <span className="iconify text-cyan-600" data-icon="lucide:users" data-width="20" data-height="20"></span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-strong mb-1">Smart Matching</h3>
                <p className="text-sm text-muted">AI-powered suggestions based on your skills and interests</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-violet-50 flex items-center justify-center">
                  <span className="iconify text-violet-600" data-icon="lucide:globe" data-width="20" data-height="20"></span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-strong mb-1">Global Community</h3>
                <p className="text-sm text-muted">Connect with learners and teachers from around the world</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center">
                  <span className="iconify text-rose-600" data-icon="lucide:shield-check" data-width="20" data-height="20"></span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-strong mb-1">Safe & Secure</h3>
                <p className="text-sm text-muted">Your data is protected with industry-standard encryption</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card-surface p-8 md:p-12 bg-gradient-to-br from-orange-50 to-cyan-50 border soft-border text-center">
          <h2 className="app-section-title text-2xl md:text-3xl font-bold text-strong mb-4">
            Ready to start learning?
          </h2>
          <p className="text-lg text-muted mb-6 max-w-2xl mx-auto">
            Join thousands of learners and teachers exchanging skills every day. It's free and always will be.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full surface-accent px-6 py-3 text-base font-medium text-white shadow-lg shadow-[rgba(255,107,74,0.18)] hover:brightness-105"
          >
            Sign Up Now
            <span className="iconify" data-icon="lucide:arrow-right" data-width="18" data-height="18"></span>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
