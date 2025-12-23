import { Link } from 'react-router-dom';
import Footer from '../components/Footer/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex flex-col">
      {/* Hero Section */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 shadow-lg flex items-center justify-center">
                <span className="text-lg font-semibold tracking-tight text-white">SS</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">SkillSwap</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Exchange what you know for what you want to learn
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              Connect with people worldwide to trade skills, knowledge, and expertise. No money involved, just pure knowledge exchange.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 px-6 py-3 text-base font-medium text-white shadow-lg shadow-indigo-300 hover:brightness-105"
            >
              Get Started Free
              <span className="iconify" data-icon="lucide:arrow-right" data-width="18" data-height="18"></span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 flex-1">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Our Mission</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            We believe everyone has valuable skills to share. SkillSwap creates a global community where knowledge flows freely,
            enabling people to learn from each other without financial barriers.
          </p>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 text-center mb-12">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                <span className="iconify text-indigo-600" data-icon="lucide:user-plus" data-width="24" data-height="24"></span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">1. Create Your Profile</h3>
              <p className="text-sm text-slate-600">
                Sign up and list the skills you can teach and what you want to learn. It's completely free!
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-sky-50 flex items-center justify-center mb-4">
                <span className="iconify text-sky-600" data-icon="lucide:search" data-width="24" data-height="24"></span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">2. Find Your Match</h3>
              <p className="text-sm text-slate-600">
                Browse skills or get matched with people who can teach you what you want to learn.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-violet-50 flex items-center justify-center mb-4">
                <span className="iconify text-violet-600" data-icon="lucide:message-circle" data-width="24" data-height="24"></span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">3. Start Swapping</h3>
              <p className="text-sm text-slate-600">
                Connect via chat, schedule sessions, and start exchanging knowledge in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 text-center mb-12">Features</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <span className="iconify text-emerald-600" data-icon="lucide:zap" data-width="20" data-height="20"></span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Real-time Chat</h3>
                <p className="text-sm text-slate-600">Instant messaging with typing indicators and online status</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <span className="iconify text-blue-600" data-icon="lucide:users" data-width="20" data-height="20"></span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Smart Matching</h3>
                <p className="text-sm text-slate-600">AI-powered suggestions based on your skills and interests</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <span className="iconify text-purple-600" data-icon="lucide:globe" data-width="20" data-height="20"></span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Global Community</h3>
                <p className="text-sm text-slate-600">Connect with learners and teachers from around the world</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center">
                  <span className="iconify text-rose-600" data-icon="lucide:shield-check" data-width="20" data-height="20"></span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Safe & Secure</h3>
                <p className="text-sm text-slate-600">Your data is protected with industry-standard encryption</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-4">
            Ready to start learning?
          </h2>
          <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
            Join thousands of learners and teachers exchanging skills every day. It's free and always will be.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 px-6 py-3 text-base font-medium text-white shadow-lg shadow-indigo-300 hover:brightness-105"
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
