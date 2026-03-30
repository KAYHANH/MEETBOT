import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { C, GlobalStyles } from '../ui';

const NavItem = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    style={({ isActive }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      color: isActive ? C.accent : C.textMuted,
      background: isActive ? `${C.accent}11` : 'transparent',
      marginBottom: '4px',
      transition: 'all 0.2s'
    })}
  >
    <span style={{ fontSize: '18px' }}>{icon}</span>
    {label}
  </NavLink>
);

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <GlobalStyles />
      
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: C.surface,
        borderRight: `1px solid ${C.border}`,
        position: 'fixed',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: C.accent, 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#000',
            fontWeight: '900',
            fontSize: '18px'
          }}>⬡</div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '18px', letterSpacing: '-0.5px' }}>MeetBot</div>
            <div style={{ fontSize: '10px', color: C.textDim, textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' }}>Automation</div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <NavItem to="/compose" icon="✦" label="New Meeting" />
          <NavItem to="/dashboard" icon="◈" label="Dashboard" />
          <NavItem to="/meetings" icon="◉" label="All Meetings" />
          <NavItem to="/logs" icon="⋮⋮" label="Activity Logs" />
          <NavItem to="/settings" icon="◎" label="Settings" />
        </nav>

        <div style={{ 
          marginTop: 'auto', 
          padding: '16px', 
          background: `${C.bg}88`, 
          borderRadius: '12px',
          border: `1px solid ${C.border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <img 
              src={user?.picture} 
              alt={user?.name} 
              style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1px solid ${C.borderLight}` }} 
            />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '11px', color: C.textDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
          </div>
          <button 
            onClick={logout}
            style={{
              width: '100%',
              padding: '8px',
              background: 'transparent',
              border: `1px solid ${C.borderLight}`,
              borderRadius: '6px',
              color: C.textMuted,
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '40px' }}>
        {isDemoMode && (
          <div style={{
            marginBottom: '24px',
            padding: '14px 18px',
            borderRadius: '12px',
            background: `${C.info}11`,
            border: `1px solid ${C.info}33`,
            color: C.textMuted,
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            Demo mode is on. The app is using local mock data instead of Google and MongoDB, so GitHub users can explore the full interface without external setup.
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
};
