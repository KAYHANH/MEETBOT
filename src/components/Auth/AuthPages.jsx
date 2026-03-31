import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Brain,
  FileText,
  Play,
  Settings2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, C, Card, Eyebrow, Spinner } from '../ui';

const featureCards = [
  {
    icon: <FileText size={20} />,
    title: 'Automated Transcripts',
    copy:
      'Capture decisions, follow-ups, and summaries without manual note-taking after every session.',
  },
  {
    icon: <Sparkles size={20} />,
    title: 'Smart Automations',
    copy:
      'Sync meeting context into your workflow and keep reminders, invites, and recaps moving automatically.',
  },
  {
    icon: <Zap size={20} />,
    title: '20+ Platform Actions',
    copy:
      'Coordinate invites, scheduling, and reminders from one workflow instead of juggling separate tools.',
  },
  {
    icon: <Brain size={20} />,
    title: 'Executive Analytics',
    copy:
      'Review timing, follow-up health, and activity signals in a calm workspace built for operations teams.',
  },
];

const trustedBy = ['VELO', 'CYPHER', 'NEXUS', 'AETHER', 'ORBIT'];

export const LoginPage = () => {
  const { login, loginDemo, user, isDemoMode, canUseDemo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  return (
    <div className="auth-shell">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '14px',
              background: `linear-gradient(145deg, ${C.accent} 0%, ${C.accentSoft} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.white,
              boxShadow: '0 18px 32px rgba(0, 83, 220, 0.22)',
            }}
          >
            <Sparkles size={18} />
          </div>
          <div style={{ fontFamily: "'Manrope', 'Inter', sans-serif", fontSize: '22px', fontWeight: 800, letterSpacing: '-0.04em' }}>
            MeetBot
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '26px',
            flexWrap: 'wrap',
            color: C.textMuted,
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <span style={{ color: C.accent }}>Platform</span>
          <span>Solutions</span>
          <span>Pricing</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '14px',
              border: 'none',
              background: C.surface,
              boxShadow: C.softShadow,
              color: C.textMuted,
            }}
          >
            <Bell size={16} />
          </button>
          <button
            type="button"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '14px',
              border: 'none',
              background: C.surface,
              boxShadow: C.softShadow,
              color: C.textMuted,
            }}
          >
            <Settings2 size={16} />
          </button>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: C.inverse,
              color: C.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              boxShadow: C.softShadow,
            }}
          >
            M
          </div>
        </div>
      </div>

      <div className="auth-grid">
        <div>
          <Eyebrow>Automated intelligence</Eyebrow>
          <h1
            style={{
              marginTop: '22px',
              maxWidth: '620px',
              fontSize: 'clamp(3rem, 7vw, 5.25rem)',
              lineHeight: '0.96',
              letterSpacing: '-0.055em',
            }}
          >
            Your meetings,
            <br />
            <span style={{ color: C.accent }}>perfectly</span>
            <br />
            synthesized.
          </h1>

          <p
            style={{
              marginTop: '22px',
              maxWidth: '540px',
              fontSize: '18px',
              lineHeight: '1.7',
              color: C.textMuted,
            }}
          >
            MeetBot transforms every video call into organized action. Schedule,
            invite, and follow through from one polished workspace with live
            transcripts, reminders, and AI summaries.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '28px' }}>
            <Button
              size="lg"
              leading={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path fill="currentColor" d="M21.8 12.2c0-.7-.06-1.36-.18-2H12v3.8h5.5a4.7 4.7 0 0 1-2.04 3.1v2.58h3.3c1.92-1.77 3.04-4.38 3.04-7.48Z" />
                  <path fill="currentColor" d="M12 22c2.75 0 5.06-.9 6.75-2.46l-3.3-2.58c-.91.6-2.06.97-3.45.97-2.65 0-4.91-1.79-5.73-4.2H2.9v2.66A10 10 0 0 0 12 22Z" />
                  <path fill="currentColor" d="M6.27 13.73A6 6 0 0 1 5.95 12c0-.6.1-1.18.32-1.73V7.61H2.9A10 10 0 0 0 2 12c0 1.61.38 3.14 1.06 4.39l3.21-2.66Z" />
                  <path fill="currentColor" d="M12 6.07c1.5 0 2.85.52 3.92 1.53l2.94-2.94C17.06 2.99 14.75 2 12 2a10 10 0 0 0-9.1 5.61l3.37 2.66c.82-2.41 3.08-4.2 5.73-4.2Z" />
                </svg>
              }
              onClick={login}
            >
              Continue with Google
            </Button>

            {canUseDemo && (
              <Button
                variant="secondary"
                size="lg"
                leading={<Play size={16} />}
                onClick={loginDemo}
              >
                View Demo
              </Button>
            )}
          </div>

          {canUseDemo && (
            <div style={{ marginTop: '14px', fontSize: '14px', lineHeight: '1.7', color: C.textDim }}>
              {isDemoMode
                ? 'You are currently browsing the local sample workspace.'
                : 'View Demo opens the same interface with local sample meetings, so you can explore without touching your live Google-connected data.'}
            </div>
          )}

          <div className="hero-card-grid">
            {featureCards.map((feature, index) => (
              <Card
                key={feature.title}
                style={{
                  minHeight: index === 0 ? '200px' : 'unset',
                  background: index === 2
                    ? `linear-gradient(145deg, ${C.accent} 0%, ${C.accentSoft} 100%)`
                    : C.surface,
                  color: index === 2 ? C.white : C.text,
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: index === 2 ? 'rgba(255,255,255,0.14)' : C.surfaceSoft,
                    color: index === 2 ? C.white : C.accent,
                    marginBottom: '18px',
                  }}
                >
                  {feature.icon}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px' }}>
                  {feature.title}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.7',
                    color: index === 2 ? 'rgba(255,255,255,0.78)' : C.textMuted,
                  }}
                >
                  {feature.copy}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            padding: '34px',
            borderRadius: '36px',
            background: `linear-gradient(145deg, #0e5269 0%, #154d82 100%)`,
            boxShadow: '0 36px 72px rgba(17, 54, 89, 0.24)',
            minHeight: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '340px',
              borderRadius: '28px',
              background: C.surface,
              boxShadow: '0 32px 60px rgba(10, 24, 40, 0.18)',
              padding: '20px',
              transform: 'rotate(1.6deg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: C.textDim, textTransform: 'uppercase' }}>
                Base
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[C.surfaceStrong, C.surfaceStrong, C.text].map((color, index) => (
                  <span
                    key={index}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: color,
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 800, marginBottom: '18px' }}>MeetBot</div>

            <div style={{ display: 'grid', gap: '10px' }}>
              {['Dashboard', 'Meetings', 'Transcripts', 'Automations', 'Analytics'].map((item, index) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '16px',
                    background: index === 1 ? C.accentTint : C.surfaceSoft,
                    color: index === 1 ? C.accent : C.textMuted,
                    fontWeight: 700,
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '10px',
                      background: index === 1 ? C.white : C.surface,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {index + 1}
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Card
            style={{
              position: 'absolute',
              left: '18px',
              bottom: '34px',
              width: '220px',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <Eyebrow>Real-time sync</Eyebrow>
            <div style={{ marginTop: '16px', fontSize: '16px', fontWeight: 800 }}>
              Automated transcripts
            </div>
            <div style={{ marginTop: '6px', fontSize: '13px', lineHeight: '1.6' }}>
              98.4% accuracy achieved on live calls with searchable highlights and follow-up actions.
            </div>
          </Card>
        </div>
      </div>

      <div style={{ marginTop: '70px', textAlign: 'center' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: C.textDim, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          Trusted by teams at
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '34px',
            flexWrap: 'wrap',
            marginTop: '20px',
            color: '#9aa5ab',
            fontWeight: 800,
            letterSpacing: '0.08em',
          }}
        >
          {trustedBy.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '20px',
          marginTop: '74px',
          paddingTop: '34px',
          borderTop: `1px solid ${C.hairline}`,
        }}
      >
        <div>
          <div style={{ fontFamily: "'Manrope', 'Inter', sans-serif", fontSize: '22px', fontWeight: 800, letterSpacing: '-0.04em' }}>
            MeetBot
          </div>
          <p style={{ marginTop: '14px', maxWidth: '280px', fontSize: '14px', lineHeight: '1.7' }}>
            Building a quieter, more useful operating system for meetings, summaries,
            and follow-through.
          </p>
        </div>

        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', color: C.textDim, textTransform: 'uppercase' }}>
            Product
          </div>
          <div style={{ display: 'grid', gap: '10px', marginTop: '16px', fontSize: '14px' }}>
            <span>Transcription</span>
            <span>Summaries</span>
            <span>Security</span>
            <span>Integrations</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', color: C.textDim, textTransform: 'uppercase' }}>
            Support
          </div>
          <div style={{ display: 'grid', gap: '10px', marginTop: '16px', fontSize: '14px' }}>
            <span>Documentation</span>
            <span>Help Center</span>
            <span>API Status</span>
            <span>Contact</span>
          </div>
        </div>
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
      <div className="auth-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ maxWidth: '460px', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 18px',
              borderRadius: '20px',
              background: C.dangerTint,
              color: C.danger,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 800,
            }}
          >
            !
          </div>
          <h2 style={{ fontSize: '34px', marginBottom: '12px' }}>Authentication failed</h2>
          <p style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '22px' }}>{error}</p>
          <Button onClick={() => navigate('/auth')}>Return to login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ maxWidth: '460px', textAlign: 'center' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 18px',
            borderRadius: '20px',
            background: C.accentTint,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spinner size={28} />
        </div>
        <h2 style={{ fontSize: '34px', marginBottom: '12px' }}>Finalizing your workspace</h2>
        <p style={{ fontSize: '15px', lineHeight: '1.7' }}>
          MeetBot is connecting your account and preparing the dashboard.
        </p>
      </Card>
    </div>
  );
};
