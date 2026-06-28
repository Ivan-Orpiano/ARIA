import React from 'react';

/* ── AI glyph: mirrors the AriaLogo brand mark (geometric A + neural nodes) ── */
function AssistantGlyph({ size }) {
  const s = size * 0.54;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.5 21.5 L12 3"   stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M20.5 21.5 L12 3"  stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M7 14 L17 14"       stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      <circle cx="12" cy="3"  r="2.5" fill="currentColor" />
      <circle cx="7"  cy="14" r="1.8" fill="currentColor" />
      <circle cx="17" cy="14" r="1.8" fill="currentColor" />
    </svg>
  );
}

/* ── User glyph: connected-node human — "AI level" network-identity motif ── */
function UserGlyph({ size }) {
  const s = size * 0.58;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Head node */}
      <circle cx="12" cy="6.5" r="3.0" fill="currentColor" />
      {/* Shoulder stems */}
      <line x1="12" y1="9.5"  x2="6.5"  y2="16.5" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round" />
      <line x1="12" y1="9.5"  x2="17.5" y2="16.5" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round" />
      {/* Shoulder nodes */}
      <circle cx="6.5"  cy="16.5" r="2.0" fill="currentColor" />
      <circle cx="17.5" cy="16.5" r="2.0" fill="currentColor" />
      {/* Cross-link — data connection between shoulders */}
      <line x1="6.5" y1="16.5" x2="17.5" y2="16.5"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.55" />
    </svg>
  );
}

const STYLES = {
  assistant: {
    background: 'linear-gradient(135deg, #0E7490 0%, #06B6D4 55%, #38BDF8 100%)',
    boxShadow:  '0 0 0 1.5px rgba(6,182,212,0.42), 0 0 16px rgba(6,182,212,0.30)',
    color:      '#FFFFFF',
  },
  user: {
    background: 'linear-gradient(135deg, #3730A3 0%, #7C3AED 58%, #A855F7 100%)',
    boxShadow:  '0 0 0 1.5px rgba(124,58,237,0.42), 0 0 14px rgba(124,58,237,0.28)',
    color:      '#FFFFFF',
  },
};

export default function Avatar({ role = 'user', size = 32 }) {
  const isAssistant = role === 'assistant';
  const style       = STYLES[isAssistant ? 'assistant' : 'user'];
  const label       = isAssistant ? 'ARIA AI' : 'You';

  return (
    <div
      role="img"
      aria-label={label}
      style={{
        width:          size,
        height:         size,
        borderRadius:   '50%',
        flexShrink:      0,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        userSelect:     'none',
        transition:     'box-shadow var(--transition-base), transform var(--transition-spring)',
        ...style,
      }}
    >
      {isAssistant ? <AssistantGlyph size={size} /> : <UserGlyph size={size} />}
    </div>
  );
}
