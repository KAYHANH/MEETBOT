import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, C, Spinner } from '../ui';

export const LoginPage = () => {
  const { login, loginDemo, user, isDemoMode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div style={{ 
        fontSize: '64px', 
        color: C.accent, 
        marginBottom: '16px',
        background: `${C.accent}11`,
        width: '100px',
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '24px'
      }}>⬡</div>
      <h1 style={{ fontSize: '48px', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '-1px' }}>MeetBot</h1>
      <p style={{ fontSize: '18px', color: C.textMuted, maxWidth: '400px', marginBottom: '40px' }}>
        Professional meeting automation. Schedule, invite, and remind — all for free using your Google account.
      </p>

      <Button onClick={login} style={{ padding: '14px 32px', fontSize: '16px', borderRadius: '12px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </Button>

      {isDemoMode && (
        <>
          <div style={{ margin: '18px 0 12px', fontSize: '12px', color: C.textDim, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
            or explore locally
          </div>
          <Button variant="secondary" onClick={loginDemo} style={{ padding: '12px 28px', fontSize: '15px', borderRadius: '12px' }}>
            Enter Demo Mode
          </Button>
          <p style={{ maxWidth: '460px', marginTop: '14px', color: C.textDim, fontSize: '13px', lineHeight: '1.6' }}>
            Demo mode skips Google sign-in and uses local mock meetings, logs, and settings so anyone can explore the product right after cloning the repo.
          </p>
        </>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '24px', 
        maxWidth: '800px', 
        marginTop: '80px',
        textAlign: 'left'
      }}>
        {[
          { icon: '✉️', title: 'Auto Invites', sub: 'Sends professional HTML invites from your Gmail.' },
          { icon: '📅', title: 'Calendar Sync', sub: 'Creates events and Meet links automatically.' },
          { icon: '⏰', title: 'Reminders', sub: '24h and 1h email alerts for all participants.' },
          { icon: '🔔', title: 'Starting Now', sub: 'Instant "Join Now" links at meeting time.' },
          { icon: '📊', title: 'Dashboard', sub: 'Track all your meetings and reminder history.' },
          { icon: '🛡️', title: 'Secure', sub: 'Tokens are encrypted. Your data stays yours.' }
        ].map((f, i) => (
          <div key={i} style={{ padding: '20px', background: C.surface, borderRadius: '16px', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>{f.icon}</div>
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>{f.title}</div>
            <div style={{ fontSize: '13px', color: C.textMuted }}>{f.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '60px', fontSize: '12px', color: C.textDim }}>
        100% Free &bull; Uses only your Google Account &bull; No credit card required
      </div>
    </div>
  );
};

export const AuthCallback = () => {
  const { handleCallback } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const err = params.get('error');

    if (token) {
      handleCallback(token);
      navigate('/dashboard');
    } else if (err) {
      setError(err);
    }
  }, [location, handleCallback, navigate]);

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <h2 style={{ color: C.danger }}>Authentication Failed</h2>
        <p style={{ color: C.textMuted, marginBottom: '24px' }}>{error}</p>
        <Button onClick={() => navigate('/auth')}>Try Again</Button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size={48} />
      <p style={{ marginTop: '20px', color: C.textMuted }}>Finalizing authentication...</p>
    </div>
  );
};
