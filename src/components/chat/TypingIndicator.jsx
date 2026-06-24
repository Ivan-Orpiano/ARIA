import React from 'react';
import Avatar from '../ui/Avatar';

const DOTS = [
  { color: '#00F5A0', delay: '0s'    },
  { color: '#00D4FF', delay: '0.18s' },
  { color: '#B46EF8', delay: '0.36s' },
];

export default function TypingIndicator() {
  return (
    <div
      role="status"
      aria-label="ARIA is thinking"
      aria-live="polite"
      style={{
        display: 'flex', gap: 11, alignItems: 'flex-end',
        padding: '2px 0 18px',
        animation: 'fadeSlideIn 0.24s ease-out both',
      }}
    >
      <Avatar role="assistant" size={32} />

      <div style={{
        background: 'rgba(7,12,30,0.84)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.082)',
        borderRadius: '5px 18px 18px 18px',
        padding: '13px 18px',
        display: 'flex', gap: 6, alignItems: 'center',
        boxShadow: '0 2px 20px rgba(0,0,0,0.45)',
        position: 'relative',
      }}>
        {/* Left accent bar */}
        <div style={{
          position: 'absolute', left: 0,
          top: '14%', height: '72%', width: 2,
          borderRadius: '0 2px 2px 0',
          background: 'linear-gradient(180deg, var(--accent) 0%, var(--accent-blue) 100%)',
          opacity: 0.42,
        }} />

        {DOTS.map((d, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: d.color, display: 'inline-block',
              boxShadow: `0 0 9px ${d.color}AA`,
              animation: `dotPop 1.55s ease-in-out ${d.delay} infinite`,
              flexShrink: 0,
            }}
          />
        ))}

        <span style={{
          fontSize: 11, color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)', marginLeft: 4,
          letterSpacing: '0.03em',
        }}>
          thinking…
        </span>
      </div>
    </div>
  );
}
