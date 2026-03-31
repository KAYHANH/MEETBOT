import React from 'react';
import { Search } from 'lucide-react';

export const C = {
  bg: '#f7f9fb',
  bgAlt: '#eef3f7',
  sidebar: '#eff4f8',
  surface: '#ffffff',
  surfaceSoft: '#f3f6f9',
  surfaceStrong: '#e8eef4',
  text: '#2a3439',
  textMuted: '#566166',
  textDim: '#7b8a90',
  accent: '#0053dc',
  accentSoft: '#3e76fe',
  accentTint: '#e7efff',
  accentTintStrong: '#d8e6ff',
  success: '#1d8c5a',
  successTint: '#e8f6ef',
  warning: '#c67b27',
  warningTint: '#fff1e3',
  danger: '#9f403d',
  dangerTint: '#fde9e7',
  neutral: '#748088',
  neutralTint: '#eef2f4',
  shadow: '0 28px 60px rgba(42, 52, 57, 0.08)',
  softShadow: '0 18px 44px rgba(42, 52, 57, 0.06)',
  hairline: 'rgba(169, 180, 185, 0.18)',
  ghostBorder: 'rgba(169, 180, 185, 0.12)',
  inverse: '#0b1013',
  inverseSoft: '#121a20',
  white: '#ffffff',
};

export const DISPLAY_FONT = "'Manrope', 'Inter', sans-serif";
export const BODY_FONT = "'Inter', sans-serif";
export const MONO_FONT = "'JetBrains Mono', monospace";

const applyFieldFocus = (target, hasError = false) => {
  target.style.borderColor = hasError ? C.danger : C.accent;
  target.style.boxShadow = hasError
    ? `0 0 0 4px ${C.danger}16`
    : `0 0 0 4px rgba(62, 118, 254, 0.16)`;
};

const clearFieldFocus = (target, hasError = false) => {
  target.style.borderColor = hasError ? `${C.danger}55` : C.ghostBorder;
  target.style.boxShadow = 'none';
};

const getFieldStyle = (hasError = false, multiline = false) => ({
  width: '100%',
  border: `1px solid ${hasError ? `${C.danger}55` : C.ghostBorder}`,
  background: C.surface,
  color: C.text,
  borderRadius: '16px',
  padding: multiline ? '16px 18px' : '14px 16px',
  minHeight: multiline ? '132px' : 'auto',
  resize: multiline ? 'vertical' : 'none',
  outline: 'none',
  fontFamily: BODY_FONT,
  fontSize: '14px',
  lineHeight: multiline ? '1.6' : '1.4',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
  boxShadow: 'none',
});

const cardToneStyles = {
  default: {
    background: C.surface,
    color: C.text,
  },
  soft: {
    background: C.surfaceSoft,
    color: C.text,
  },
  accent: {
    background: `linear-gradient(145deg, ${C.accent} 0%, ${C.accentSoft} 100%)`,
    color: C.white,
  },
  dark: {
    background: `linear-gradient(180deg, ${C.inverse} 0%, ${C.inverseSoft} 100%)`,
    color: C.white,
  },
};

export const GlobalStyles = () => (
  <style>{`
    * {
      box-sizing: border-box;
    }

    html, body, #root {
      min-height: 100%;
    }

    body {
      margin: 0;
      color: ${C.text};
      background:
        radial-gradient(circle at top left, rgba(62, 118, 254, 0.12), transparent 28%),
        linear-gradient(180deg, ${C.bg} 0%, ${C.bgAlt} 100%);
      font-family: ${BODY_FONT};
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }

    h1, h2, h3, h4, h5, h6 {
      margin: 0;
      font-family: ${DISPLAY_FONT};
      color: ${C.text};
    }

    p {
      margin: 0;
      color: ${C.textMuted};
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    button, input, select, textarea {
      font: inherit;
    }

    ::selection {
      background: rgba(62, 118, 254, 0.18);
    }

    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(232, 238, 244, 0.5);
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(123, 138, 144, 0.35);
      border-radius: 999px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(86, 97, 102, 0.45);
    }

    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    textarea:-webkit-autofill,
    textarea:-webkit-autofill:hover,
    textarea:-webkit-autofill:focus {
      -webkit-text-fill-color: ${C.text};
      -webkit-box-shadow: 0 0 0px 1000px ${C.surface} inset;
      transition: background-color 5000s ease-in-out 0s;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .app-shell {
      min-height: 100vh;
      display: flex;
      background: transparent;
    }

    .app-sidebar {
      width: 248px;
      padding: 20px 16px;
      background: ${C.sidebar};
      display: flex;
      flex-direction: column;
      gap: 16px;
      flex-shrink: 0;
    }

    .app-workspace {
      min-width: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .app-topbar {
      position: sticky;
      top: 0;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 12px 24px;
      backdrop-filter: blur(22px);
      background: rgba(247, 249, 251, 0.74);
      border-bottom: 1px solid rgba(169, 180, 185, 0.1);
    }

    .app-main {
      flex: 1;
      padding: 32px clamp(18px, 4vw, 40px) 40px;
    }

    .auth-shell {
      min-height: 100vh;
      padding: 28px clamp(18px, 4vw, 36px) 40px;
      background:
        radial-gradient(circle at top right, rgba(62, 118, 254, 0.16), transparent 22%),
        linear-gradient(180deg, ${C.bg} 0%, ${C.bgAlt} 100%);
    }

    .auth-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(360px, 0.92fr);
      gap: 34px;
      align-items: center;
      margin-top: 40px;
    }

    .hero-card-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-top: 24px;
    }

    .page-grid {
      display: grid;
      gap: 24px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 16px;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.7fr) minmax(320px, 0.95fr);
      gap: 24px;
      align-items: start;
    }

    .composer-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.95fr);
      gap: 24px;
      align-items: start;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.95fr);
      gap: 24px;
      align-items: start;
    }

    .dual-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }

    .triple-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
    }

    @media (max-width: 1260px) {
      .kpi-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .dashboard-grid,
      .composer-grid,
      .settings-grid,
      .auth-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 980px) {
      .app-shell {
        flex-direction: column;
      }

      .app-sidebar {
        width: 100%;
        padding-bottom: 12px;
      }

      .app-topbar {
        padding-inline: 18px;
      }
    }

    @media (max-width: 760px) {
      .hero-card-grid,
      .dual-grid,
      .triple-grid,
      .kpi-grid {
        grid-template-columns: 1fr;
      }

      .app-main {
        padding-inline: 16px;
      }
    }
  `}</style>
);

export const Spinner = ({ size = 24, color = C.accent }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      border: `2px solid ${color}22`,
      borderTopColor: color,
      animation: 'spin 0.75s linear infinite',
    }}
  />
);

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  small,
  loading,
  disabled,
  leading,
  trailing,
  style,
  ...props
}) => {
  const resolvedSize = small ? 'sm' : size;

  const sizeStyles = {
    sm: { padding: '10px 14px', fontSize: '13px', borderRadius: '12px' },
    md: { padding: '12px 18px', fontSize: '14px', borderRadius: '14px' },
    lg: { padding: '14px 22px', fontSize: '15px', borderRadius: '16px' },
  };

  const variantStyles = {
    primary: {
      background: `linear-gradient(145deg, ${C.accent} 0%, ${C.accentSoft} 100%)`,
      color: C.white,
      boxShadow: '0 16px 32px rgba(0, 83, 220, 0.2)',
    },
    secondary: {
      background: C.surfaceSoft,
      color: C.text,
      boxShadow: 'none',
    },
    ghost: {
      background: 'transparent',
      color: C.textMuted,
      boxShadow: 'none',
    },
    dark: {
      background: C.inverse,
      color: C.white,
      boxShadow: C.softShadow,
    },
    danger: {
      background: `linear-gradient(145deg, ${C.danger} 0%, #c75a57 100%)`,
      color: C.white,
      boxShadow: '0 16px 30px rgba(159, 64, 61, 0.18)',
    },
  };

  const currentSize = sizeStyles[resolvedSize] || sizeStyles.md;
  const currentVariant = variantStyles[variant] || variantStyles.primary;

  return (
    <button
      disabled={disabled || loading}
      style={{
        border: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        fontWeight: 700,
        letterSpacing: '0.01em',
        transition: 'transform 0.2s ease, filter 0.2s ease, opacity 0.2s ease',
        opacity: disabled || loading ? 0.64 : 1,
        ...currentSize,
        ...currentVariant,
        ...style,
      }}
      onMouseEnter={(event) => {
        if (disabled || loading) return;
        event.currentTarget.style.filter = 'brightness(1.05)';
        event.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.filter = 'none';
        event.currentTarget.style.transform = 'translateY(0)';
      }}
      {...props}
    >
      {loading ? <Spinner size={16} color={currentVariant.color} /> : leading}
      <span>{children}</span>
      {!loading && trailing}
    </button>
  );
};

export const Eyebrow = ({ children, tone = 'accent', style }) => {
  const tones = {
    accent: { background: C.accentTint, color: C.accent },
    neutral: { background: C.surfaceSoft, color: C.textMuted },
    success: { background: C.successTint, color: C.success },
    dark: { background: `${C.white}14`, color: C.white },
  };

  const toneStyles = tones[tone] || tones.accent;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        borderRadius: '999px',
        fontSize: '10px',
        fontWeight: 800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        ...toneStyles,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export const SearchField = ({ style, inputStyle, ...props }) => (
  <div style={{ position: 'relative', ...style }}>
    <Search
      size={16}
      color={C.textDim}
      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
    />
    <input
      style={{
        ...getFieldStyle(false),
        paddingLeft: '42px',
        background: `${C.surface}cc`,
        ...inputStyle,
      }}
      placeholder="Search..."
      {...props}
    />
  </div>
);

export const Card = ({
  title,
  subtitle,
  actions,
  children,
  tone = 'default',
  padding = '24px',
  style,
}) => {
  const toneStyle = cardToneStyles[tone] || cardToneStyles.default;

  return (
    <section
      style={{
        borderRadius: '24px',
        boxShadow: tone === 'accent' || tone === 'dark' ? C.shadow : C.softShadow,
        padding,
        ...toneStyle,
        ...style,
      }}
    >
      {(title || subtitle || actions) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '18px',
            marginBottom: '18px',
          }}
        >
          <div>
            {title && (
              <div style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.01em' }}>
                {title}
              </div>
            )}
            {subtitle && (
              <div style={{ marginTop: '6px', fontSize: '13px', color: tone === 'accent' || tone === 'dark' ? 'rgba(255,255,255,0.76)' : C.textMuted }}>
                {subtitle}
              </div>
            )}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
};

export const StatCard = ({ label, value, icon, sub, trend, tone = 'default' }) => (
  <Card
    tone={tone}
    padding="18px"
    style={{
      minHeight: '138px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '14px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: tone === 'accent' ? 'rgba(255,255,255,0.14)' : C.surfaceSoft,
          color: tone === 'accent' ? C.white : C.accent,
        }}
      >
        {icon}
      </div>
      {trend && (
        <span
          style={{
            padding: '5px 8px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 800,
            color: tone === 'accent' ? C.white : C.success,
            background: tone === 'accent' ? 'rgba(255,255,255,0.14)' : C.successTint,
          }}
        >
          {trend}
        </span>
      )}
    </div>

    <div>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '0.11em',
          textTransform: 'uppercase',
          color: tone === 'accent' ? 'rgba(255,255,255,0.76)' : C.textDim,
          marginBottom: '10px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 800,
          fontSize: '2rem',
          letterSpacing: '-0.03em',
          color: tone === 'accent' ? C.white : C.text,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ marginTop: '8px', fontSize: '13px', color: tone === 'accent' ? 'rgba(255,255,255,0.76)' : C.textMuted }}>
          {sub}
        </div>
      )}
    </div>
  </Card>
);

export const Badge = ({ status, style }) => {
  const config = {
    scheduled: { label: 'Scheduled', background: C.accentTint, color: C.accent },
    email_sent: { label: 'Invited', background: '#ebeff5', color: '#6e7a83' },
    reminders_sent: { label: 'Reminded', background: C.dangerTint, color: C.danger },
    completed: { label: 'Completed', background: C.successTint, color: C.success },
    failed: { label: 'Failed', background: C.dangerTint, color: C.danger },
    cancelled: { label: 'Cancelled', background: C.neutralTint, color: C.neutral },
  }[status] || { label: status, background: C.surfaceSoft, color: C.textMuted };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 800,
        letterSpacing: '0.02em',
        background: config.background,
        color: config.color,
        ...style,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: config.color,
        }}
      />
      {config.label}
    </span>
  );
};

export const Input = ({ label, error, hint, style, inputStyle, ...props }) => (
  <div style={{ width: '100%', ...style }}>
    {label && (
      <label
        style={{
          display: 'block',
          marginBottom: '10px',
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.textDim,
        }}
      >
        {label}
      </label>
    )}
    <input
      style={{
        ...getFieldStyle(Boolean(error)),
        ...inputStyle,
      }}
      onFocus={(event) => applyFieldFocus(event.target, Boolean(error))}
      onBlur={(event) => clearFieldFocus(event.target, Boolean(error))}
      {...props}
    />
    {hint && <div style={{ marginTop: '8px', fontSize: '12px', color: C.textDim }}>{hint}</div>}
    {error && <div style={{ marginTop: '8px', fontSize: '12px', color: C.danger }}>{error}</div>}
  </div>
);

export const Select = ({ label, error, style, selectStyle, children, ...props }) => (
  <div style={{ width: '100%', ...style }}>
    {label && (
      <label
        style={{
          display: 'block',
          marginBottom: '10px',
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.textDim,
        }}
      >
        {label}
      </label>
    )}
    <select
      style={{
        ...getFieldStyle(Boolean(error)),
        appearance: 'none',
        backgroundImage:
          "linear-gradient(45deg, transparent 50%, #7b8a90 50%), linear-gradient(135deg, #7b8a90 50%, transparent 50%)",
        backgroundPosition: 'calc(100% - 22px) calc(50% - 2px), calc(100% - 16px) calc(50% - 2px)',
        backgroundSize: '6px 6px, 6px 6px',
        backgroundRepeat: 'no-repeat',
        ...selectStyle,
      }}
      onFocus={(event) => applyFieldFocus(event.target, Boolean(error))}
      onBlur={(event) => clearFieldFocus(event.target, Boolean(error))}
      {...props}
    >
      {children}
    </select>
    {error && <div style={{ marginTop: '8px', fontSize: '12px', color: C.danger }}>{error}</div>}
  </div>
);

export const Textarea = ({ label, error, hint, style, textareaStyle, ...props }) => (
  <div style={{ width: '100%', ...style }}>
    {label && (
      <label
        style={{
          display: 'block',
          marginBottom: '10px',
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.textDim,
        }}
      >
        {label}
      </label>
    )}
    <textarea
      style={{
        ...getFieldStyle(Boolean(error), true),
        ...textareaStyle,
      }}
      onFocus={(event) => applyFieldFocus(event.target, Boolean(error))}
      onBlur={(event) => clearFieldFocus(event.target, Boolean(error))}
      {...props}
    />
    {hint && <div style={{ marginTop: '8px', fontSize: '12px', color: C.textDim }}>{hint}</div>}
    {error && <div style={{ marginTop: '8px', fontSize: '12px', color: C.danger }}>{error}</div>}
  </div>
);

export const EmptyState = ({ icon, title, sub, actions }) => (
  <Card
    style={{
      textAlign: 'center',
      padding: '52px 24px',
      background: `linear-gradient(180deg, ${C.surface} 0%, ${C.surfaceSoft} 100%)`,
    }}
  >
    <div
      style={{
        width: '64px',
        height: '64px',
        margin: '0 auto 18px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: C.accentTint,
        color: C.accent,
      }}
    >
      {icon}
    </div>
    <h3 style={{ fontSize: '28px', marginBottom: '12px' }}>{title}</h3>
    <p style={{ maxWidth: '480px', margin: '0 auto', fontSize: '15px', lineHeight: '1.7' }}>{sub}</p>
    {actions && <div style={{ marginTop: '24px' }}>{actions}</div>}
  </Card>
);

export const Toggle = ({ checked, onChange, label, sublabel }) => (
  <label
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '14px',
      padding: '14px 16px',
      borderRadius: '18px',
      background: C.surface,
      boxShadow: `inset 0 0 0 1px ${C.ghostBorder}`,
      cursor: 'pointer',
    }}
  >
    <div>
      <div style={{ fontSize: '14px', fontWeight: 700 }}>{label}</div>
      {sublabel && <div style={{ marginTop: '4px', fontSize: '12px', color: C.textDim }}>{sublabel}</div>}
    </div>
    <div
      style={{
        width: '42px',
        height: '24px',
        borderRadius: '999px',
        background: checked ? C.accent : C.surfaceStrong,
        padding: '3px',
        transition: 'background 0.2s ease',
      }}
    >
      <div
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: C.white,
          transform: checked ? 'translateX(18px)' : 'translateX(0)',
          transition: 'transform 0.2s ease',
          boxShadow: '0 4px 10px rgba(42, 52, 57, 0.15)',
        }}
      />
    </div>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
  </label>
);

export const AvatarStack = ({ items = [], max = 4, style }) => {
  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;

  return (
    <div style={{ display: 'flex', alignItems: 'center', ...style }}>
      {visible.map((item, index) => {
        const label = typeof item === 'string' ? item : item?.label || item?.name || 'User';
        const initials = label
          .split(' ')
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();

        return (
          <div
            key={`${label}-${index}`}
            title={label}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              marginLeft: index === 0 ? 0 : '-8px',
              border: `2px solid ${C.surface}`,
              background: index % 2 === 0 ? C.accentTint : C.surfaceStrong,
              color: index % 2 === 0 ? C.accent : C.textMuted,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 800,
            }}
          >
            {initials}
          </div>
        );
      })}

      {overflow > 0 && (
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            marginLeft: visible.length === 0 ? 0 : '-8px',
            border: `2px solid ${C.surface}`,
            background: C.surfaceSoft,
            color: C.textMuted,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 800,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};
