import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import Footer from '../Footer/Footer';
import { requestService } from '../../services/requestService';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: 'lucide:layout-dashboard', label: 'Dashboard' },
    { path: '/discover', icon: 'lucide:compass', label: 'Discover Skills' },
    { path: '/skills', icon: 'lucide:badges', label: 'My Skills' },
    { path: '/requests', icon: 'lucide:inbox', label: 'Requests' },
    { path: '/messages', icon: 'lucide:messages-square', label: 'Messages' },
    { path: '/credits', icon: 'lucide:coins', label: 'Credits' },
    { path: '/features', icon: 'lucide:sparkles', label: 'Features' },
    { path: '/profile', icon: 'lucide:user-round', label: 'Profile' },
  ];

  useEffect(() => {
    let active = true;

    const loadPendingRequests = async () => {
      if (!user) {
        setPendingRequestsCount(0);
        return;
      }

      try {
        const response = await requestService.getIncoming();
        const pending = (response.data.requests || []).filter((request) => request.status === 'pending');
        if (active) {
          setPendingRequestsCount(pending.length);
        }
      } catch (error) {
        if (active) {
          setPendingRequestsCount(0);
        }
      }
    };

    loadPendingRequests();

    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row text-sm section-shell">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col border-r soft-border bg-white/5 backdrop-blur-xl shadow-[0_0_40px_rgba(15,23,42,0.06)]">
        {/* Logo */}
        <div className="flex items-center gap-2 border-b soft-border px-6 py-5">
          <div className="h-8 w-8 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 shadow-sm flex items-center justify-center">
            <span className="text-xs font-semibold tracking-tight text-white">SS</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight text-slate-900">SkillSwap</span>
            <span className="text-[0.7rem] text-slate-500">Exchange what you know</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium ${isActive(item.path)
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-700 hover:bg-white/5'
                }`}
            >
              <span className="iconify" data-icon={item.icon} data-width="16" data-height="16" style={{ strokeWidth: '1.5' }}></span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.path === '/requests' && pendingRequestsCount > 0 && (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[0.65rem] font-semibold text-white">
                  {pendingRequestsCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t soft-border px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-[0.75rem] font-semibold tracking-tight text-white">
              {user?.name?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">{user?.name || 'User'}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-[0.7rem] text-slate-500">{user?.timezone || 'UTC'}</span>
            </div>
            <button onClick={logout} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <span className="iconify" data-icon="lucide:log-out" data-width="14" data-height="14" style={{ strokeWidth: '1.5' }}></span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 lg:hidden backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-full p-1.5 text-slate-600 hover:bg-slate-100">
            <span className="iconify" data-icon="lucide:menu" data-width="18" data-height="18" style={{ strokeWidth: '1.5' }}></span>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 flex items-center justify-center shadow-sm">
              <span className="text-[0.6rem] font-semibold tracking-tight text-white">SS</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-900">SkillSwap</span>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-slate-900/40"></div>
          <div className="absolute inset-y-0 left-0 w-64 max-w-[75%] bg-white shadow-2xl flex flex-col backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <span className="text-sm font-semibold tracking-tight text-slate-900">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100">
                <span className="iconify" data-icon="lucide:x" data-width="16" data-height="16" style={{ strokeWidth: '1.5' }}></span>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium ${isActive(item.path)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <span className="iconify" data-icon={item.icon} data-width="16" data-height="16" style={{ strokeWidth: '1.5' }}></span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.path === '/requests' && pendingRequestsCount > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[0.65rem] font-semibold text-white">
                      {pendingRequestsCount}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto section-shell">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
