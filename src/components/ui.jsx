import React from 'react';

export const C = {
  accent: '#f5c518',
  accentDark: '#c9a00f',
  bg: '#09090f',
  surface: '#111119',
  border: '#1f1f30',
  borderLight: '#2a2a40',
  text: '#e8e8f0',
  textMuted: '#7070a0',
  textDim: '#4a4a70',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

export const GlobalStyles = () => (
  <style>{`
    * { box-sizing: border-box; }
    body { 
      margin: 0; 
      padding: 0; 
      background-color: ${C.bg}; 
      color: ${C.text}; 
      font-family: 'Inter', sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    a { color: ${C.accent}; text-decoration: none; }
    a:hover { text-decoration: underline; }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: ${C.bg}; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: ${C.borderLight}; }

    input:-webkit-autofill,
    input:-webkit-autofill:hover, 
    input:-webkit-autofill:focus {
      -webkit-text-fill-color: ${C.text};
      -webkit-box-shadow: 0 0 0px 1000px ${C.surface} inset;
      transition: background-color 5000s ease-in-out 0s;
    }
  `}</style>
);

export const Spinner = ({ size = 24, color = C.accent }) => (
  <div style={{
    width: size,
    height: size,
    border: `2px solid ${color}33`,
    borderTop: `2px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  }} />
);

export const Button = ({ children, variant = 'primary', loading, disabled, small, style, ...props }) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: small ? '6px 12px' : '10px 20px',
    fontSize: small ? '13px' : '14px',
    fontWeight: '600',
    borderRadius: '6px',
    cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    gap: '8px',
    opacity: (disabled || loading) ? 0.6 : 1,
    ...style
  };

  const variants = {
    primary: { background: C.accent, color: '#000' },
    secondary: { background: 'transparent', color: C.text, border: `1px solid ${C.borderLight}` },
    danger: { background: C.danger, color: '#fff' },
    ghost: { background: 'transparent', color: C.textMuted },
  };

  const currentVariant = variants[variant] || variants.primary;

  return (
    <button 
      disabled={disabled || loading} 
      style={{ ...baseStyle, ...currentVariant }}
      {...props}
    >
      {loading ? <Spinner size={16} color={currentVariant.color} /> : children}
    </button>
  );
};

export const Badge = ({ status }) => {
  const colors = {
    scheduled: { bg: C.info + '22', text: C.info },
    email_sent: { bg: C.success + '22', text: C.success },
    reminders_sent: { bg: C.warning + '22', text: C.warning },
    completed: { bg: C.textMuted + '22', text: C.textMuted },
    failed: { bg: C.danger + '22', text: C.danger },
    cancelled: { bg: C.danger + '22', text: C.danger },
  };

  const config = colors[status] || { bg: C.border, text: C.textMuted };

  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      backgroundColor: config.bg,
      color: config.text,
      letterSpacing: '0.5px'
    }}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const Input = ({ label, error, hint, style, ...props }) => (
  <div style={{ marginBottom: '16px', width: '100%', ...style }}>
    {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: C.textMuted }}>{label}</label>}
    <input 
      style={{
        width: '100%',
        padding: '10px 12px',
        background: C.surface,
        border: `1px solid ${error ? C.danger : C.border}`,
        borderRadius: '6px',
        color: C.text,
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s'
      }}
      onFocus={(e) => e.target.style.borderColor = C.accent}
      onBlur={(e) => e.target.style.borderColor = error ? C.danger : C.border}
      {...props}
    />
    {hint && <div style={{ marginTop: '4px', fontSize: '12px', color: C.textDim }}>{hint}</div>}
    {error && <div style={{ marginTop: '4px', fontSize: '12px', color: C.danger }}>{error}</div>}
  </div>
);

export const Select = ({ label, children, ...props }) => (
  <div style={{ marginBottom: '16px', width: '100%' }}>
    {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: C.textMuted }}>{label}</label>}
    <select 
      style={{
        width: '100%',
        padding: '10px 12px',
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: '6px',
        color: C.text,
        fontSize: '14px',
        outline: 'none'
      }}
      {...props}
    >
      {children}
    </select>
  </div>
);

export const Textarea = ({ label, hint, ...props }) => (
  <div style={{ marginBottom: '16px', width: '100%' }}>
    {label && <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: C.textMuted }}>{label}</label>}
    <textarea 
      style={{
        width: '100%',
        padding: '10px 12px',
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: '6px',
        color: C.text,
        fontSize: '14px',
        outline: 'none',
        minHeight: '100px',
        resize: 'vertical'
      }}
      onFocus={(e) => e.target.style.borderColor = C.accent}
      onBlur={(e) => e.target.style.borderColor = C.border}
      {...props}
    />
    {hint && <div style={{ marginTop: '4px', fontSize: '12px', color: C.textDim }}>{hint}</div>}
  </div>
);

export const Card = ({ title, children, style }) => (
  <div style={{
    background: C.surface,
    borderRadius: '12px',
    border: `1px solid ${C.border}`,
    padding: '24px',
    marginBottom: '24px',
    ...style
  }}>
    {title && <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700' }}>{title}</h3>}
    {children}
  </div>
);

export const StatCard = ({ label, value, icon, color = C.accent, sub }) => (
  <div style={{
    background: C.surface,
    borderRadius: '12px',
    border: `1px solid ${C.border}`,
    padding: '20px',
    flex: 1,
    minWidth: '180px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <span style={{ fontSize: '13px', fontWeight: '600', color: C.textMuted }}>{label}</span>
      <span style={{ fontSize: '20px' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '28px', fontWeight: '800', color }}>{value}</div>
    {sub && <div style={{ fontSize: '12px', color: C.textDim, marginTop: '4px' }}>{sub}</div>}
  </div>
);

export const EmptyState = ({ icon, title, sub }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
    <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>{title}</h3>
    <p style={{ margin: 0, color: C.textMuted, fontSize: '14px' }}>{sub}</p>
  </div>
);

export const Toggle = ({ checked, onChange, label }) => (
  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '12px' }}>
    <div style={{
      width: '40px',
      height: '20px',
      background: checked ? C.accent : C.borderLight,
      borderRadius: '10px',
      position: 'relative',
      transition: 'background 0.2s'
    }}>
      <div style={{
        width: '16px',
        height: '16px',
        background: checked ? '#000' : C.textMuted,
        borderRadius: '50%',
        position: 'absolute',
        top: '2px',
        left: checked ? '22px' : '2px',
        transition: 'all 0.2s'
      }} />
    </div>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
    {label && <span style={{ fontSize: '14px', fontWeight: '500' }}>{label}</span>}
  </label>
);
