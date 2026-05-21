import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import Footer from '../Footer/Footer';
import { requestService } from '../../services/requestService';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('light');
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

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const initial = saved === 'dark' ? 'dark' : 'light';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row text-sm section-shell">
      {/* Desktop Sidebar */}
      {sidebarOpen && (
        <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col border-r soft-border glass-panel shadow-[0_0_40px_rgba(8,21,39,0.08)]">
          {/* Logo */}
          <div className="flex items-center gap-2 border-b soft-border px-6 py-5">
            <div className="h-9 w-9 rounded-2xl brand-gradient shadow-lg shadow-[rgba(255,107,74,0.2)] flex items-center justify-center">
              <span className="text-xs font-semibold tracking-tight text-white">SS</span>
            </div>
            <div className="flex flex-col">
              <span className="app-section-title text-base font-semibold text-strong">SkillSwap</span>
              <span className="text-[0.7rem] text-soft">Exchange what you know</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-medium hover-lift ${isActive(item.path)
                  ? 'surface-accent shadow-lg shadow-[rgba(255,107,74,0.16)]'
                  : 'text-strong hover:bg-white/70'
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
            <div className="flex items-center gap-3 rounded-2xl bg-white/70 px-3 py-2.5 border border-white/70 shadow-sm">
              <div className="h-9 w-9 rounded-full brand-gradient flex items-center justify-center text-[0.75rem] font-semibold tracking-tight text-white">
                {user?.name?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-strong">{user?.name || 'User'}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <span className="text-[0.7rem] text-soft">{user?.timezone || 'UTC'}</span>
              </div>
              <button onClick={logout} className="rounded-full p-1 text-soft hover:bg-white hover:text-strong focus-ring">
                <span className="iconify" data-icon="lucide:log-out" data-width="14" data-height="14" style={{ strokeWidth: '1.5' }}></span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile Header */}
      <header className="flex items-center justify-between border-b soft-border bg-white/85 px-4 py-3 lg:hidden glass-panel">
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-full p-1.5 text-strong hover:bg-white/80 focus-ring">
            <span className="iconify" data-icon="lucide:menu" data-width="18" data-height="18" style={{ strokeWidth: '1.5' }}></span>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-2xl brand-gradient flex items-center justify-center shadow-sm">
              <span className="text-[0.6rem] font-semibold tracking-tight text-white">SS</span>
            </div>
            <span className="app-section-title text-sm font-semibold text-strong">SkillSwap</span>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-slate-950/45"></div>
          <div className="absolute inset-y-0 left-0 w-64 max-w-[75%] glass-panel shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b soft-border px-4 py-3">
              <span className="app-section-title text-sm font-semibold text-strong">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="rounded-full p-1.5 text-soft hover:bg-white/80 focus-ring">
                <span className="iconify" data-icon="lucide:x" data-width="16" data-height="16" style={{ strokeWidth: '1.5' }}></span>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-medium hover-lift ${isActive(item.path)
                    ? 'surface-accent shadow-lg shadow-[rgba(255,107,74,0.16)]'
                    : 'text-strong hover:bg-white/70'
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
          <div className={`mx-auto flex w-full flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 ${sidebarOpen ? 'max-w-6xl' : 'max-w-[96rem]'}`}>
              {/* slim vertical toggle centered between sidebar and content (desktop only) */}
              <button
                type="button"
                onClick={() => setSidebarOpen((current) => !current)}
                className="hidden lg:flex items-center justify-center z-40 focus-ring"
                aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                style={{
                  position: 'absolute',
                  left: sidebarOpen ? '16rem' : '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '56px',
                  width: '36px',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%)',
                  boxShadow: '0 8px 20px rgba(15,23,42,0.12)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  transition: 'left 220ms ease, transform 160ms ease',
                  cursor: 'pointer',
                }}
              >
                <span
                  className="iconify text-white"
                  data-icon={sidebarOpen ? 'lucide:chevron-left' : 'lucide:chevron-right'}
                  data-width="18"
                  data-height="18"
                  style={{ transform: sidebarOpen ? 'translateX(0)' : 'translateX(0)' }}
                />
              </button>
              {/* Theme toggle button (top-right of content area) */}
              <button
                type="button"
                onClick={toggleTheme}
                className="absolute z-50 hidden sm:flex items-center justify-center focus-ring"
                style={{
                  right: '1rem',
                  top: '1rem',
                  height: '38px',
                  width: '38px',
                  borderRadius: '999px',
                  background: theme === 'dark' ? 'linear-gradient(135deg,#0f172a,#1d4ed8)' : 'white',
                  color: theme === 'dark' ? 'white' : 'var(--text-strong)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 6px 18px rgba(15,23,42,0.08)',
                }}
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              >
                <span
                  className="iconify"
                  data-icon={theme === 'dark' ? 'lucide:sun' : 'lucide:moon'}
                  data-width="18"
                  data-height="18"
                />
              </button>
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
