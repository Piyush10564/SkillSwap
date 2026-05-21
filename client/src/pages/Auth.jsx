import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    timezone: 'UTC',
  });
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
      } else {
        await signup(formData);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen section-shell flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-2xl brand-gradient shadow-lg shadow-[rgba(255,107,74,0.2)] items-center justify-center mb-4">
            <span className="text-lg font-semibold tracking-tight text-white">SS</span>
          </div>
          <h1 className="app-section-title text-2xl font-semibold text-strong mb-2">
            Welcome to SkillSwap
          </h1>
          <p className="text-sm text-muted">
            Exchange skills, not invoices
          </p>
        </div>

        <div className="rounded-[2rem] card-surface p-6 shadow-2xl backdrop-blur-xl">
          {/* Tabs */}
          <div className="mb-6 flex rounded-full bg-slate-100/80 p-1 text-sm border border-white/70">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 rounded-full py-2 text-center font-medium ${isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 rounded-full py-2 text-center font-medium ${!isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
            >
              Sign up
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-strong mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border soft-border bg-transparent px-4 py-2 text-sm placeholder:text-soft focus:border-[color:var(--accent)] focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,74,0.18)] focus-ring"
                  placeholder="Your name"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-strong mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border soft-border bg-transparent px-4 py-2 text-sm placeholder:text-soft focus:border-[color:var(--accent)] focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,74,0.18)] focus-ring"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-strong mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-xl border soft-border bg-transparent px-4 py-2 text-sm placeholder:text-soft focus:border-[color:var(--accent)] focus:bg-transparent focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,74,0.18)] focus-ring"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full surface-accent py-2.5 text-sm font-medium shadow-lg shadow-[rgba(255,107,74,0.18)] hover:brightness-105"
            >
              {isLogin ? 'Login' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
