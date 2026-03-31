import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Plus,
  ScrollText,
  Settings,
  Sparkles,
  UserCircle2,
  Video,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, C, SearchField } from '../ui';

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/meetings', label: 'Meetings', icon: Video },
  { to: '/compose', label: 'New Meeting', icon: Plus },
  { to: '/logs', label: 'Activity Logs', icon: ScrollText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const routeCopy = {
  '/dashboard': {
    search: 'Search meetings or transcripts',
  },
  '/meetings': {
    search: 'Search meetings, participants, or notes...',
  },
  '/compose': {
    search: 'Search invitees or templates...',
  },
  '/logs': {
    search: 'Quick search...',
  },
  '/settings': {
    search: 'Search settings...',
  },
};

const NavItem = ({ item }) => {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        borderRadius: '16px',
        background: isActive ? C.surface : 'transparent',
        color: isActive ? C.text : C.textMuted,
        fontSize: '14px',
        fontWeight: 700,
        boxShadow: isActive ? C.softShadow : 'none',
        transition: 'background 0.2s ease, transform 0.2s ease',
      })}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = 'translateX(2px)';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <Icon size={18} />
      <span>{item.label}</span>
    </NavLink>
  );
};

const actionButtonStyle = {
  width: '42px',
  height: '42px',
  borderRadius: '14px',
  border: 'none',
  background: C.surface,
  boxShadow: C.softShadow,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: C.textMuted,
  cursor: 'pointer',
};

export const AppLayout = () => {
  const { user, loading, logout, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!loading && !user && location.pathname !== '/auth') {
      navigate('/auth');
    }
  }, [user, loading, location.pathname, navigate]);

  if (loading) return null;
  if (!user && location.pathname !== '/auth') return null;

  const copy = routeCopy[location.pathname] || routeCopy['/dashboard'];

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '6px 8px 10px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '14px',
              background: `linear-gradient(145deg, ${C.accent} 0%, ${C.accentSoft} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.white,
              boxShadow: '0 16px 28px rgba(0, 83, 220, 0.22)',
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontFamily: "'Manrope', 'Inter', sans-serif", fontSize: '28px', fontWeight: 800, letterSpacing: '-0.04em' }}>
              MeetBot
            </div>
            <div style={{ marginTop: '2px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.textDim }}>
              Enterprise
            </div>
          </div>
        </div>

        <nav style={{ display: 'grid', gap: '8px', marginTop: '8px' }}>
          {navigationItems.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </nav>

        <Button
          variant="primary"
          size="lg"
          style={{ width: '100%', marginTop: '8px', justifyContent: 'flex-start' }}
          leading={<Plus size={16} />}
          onClick={() => navigate('/compose')}
        >
          New Meeting
        </Button>

        <div style={{ marginTop: 'auto', display: 'grid', gap: '10px' }}>
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '16px',
              border: 'none',
              background: 'transparent',
              color: C.textMuted,
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <CircleHelp size={18} />
            Support
          </button>

          <div
            style={{
              background: C.surface,
              borderRadius: '22px',
              padding: '16px',
              boxShadow: C.softShadow,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={user?.picture}
                alt={user?.name}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: C.surfaceSoft,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '12px', color: C.textDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '8px', marginTop: '14px' }}>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '14px',
                  border: 'none',
                  background: C.surfaceSoft,
                  color: C.textMuted,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <UserCircle2 size={16} />
                Account
              </button>

              <button
                type="button"
                onClick={logout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'transparent',
                  color: C.textMuted,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="app-workspace">
        <header className="app-topbar">
          <div style={{ flex: 1, maxWidth: '360px' }}>
            <SearchField placeholder={copy.search} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="button" style={actionButtonStyle}>
              <Bell size={18} />
            </button>
            <button type="button" style={actionButtonStyle}>
              <Settings size={18} />
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                paddingLeft: '10px',
                borderLeft: `1px solid ${C.hairline}`,
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 800 }}>{user?.name}</div>
                <div style={{ fontSize: '11px', color: C.textDim }}>
                  {isDemoMode ? 'Demo Workspace' : 'Connected Workspace'}
                </div>
              </div>
              <img
                src={user?.picture}
                alt={user?.name}
                style={{ width: '36px', height: '36px', borderRadius: '50%' }}
              />
            </div>
          </div>
        </header>

        <main className="app-main">
          {isDemoMode && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                padding: '14px 18px',
                borderRadius: '20px',
                background: C.accentTint,
                color: C.textMuted,
              }}
            >
              <Sparkles size={18} color={C.accent} />
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                Demo mode is active. This workspace is using local mock data so GitHub visitors can explore the full product without configuring Google OAuth or MongoDB.
              </div>
            </div>
          )}

          <Outlet />
        </main>
      </div>
    </div>
  );
};
