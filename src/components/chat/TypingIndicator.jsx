import React from 'react';
import Avatar from '../ui/Avatar';

const DOTS = [
  { delay: '0s'    },
  { delay: '0.18s' },
  { delay: '0.36s' },
];

export default function TypingIndicator() {
  return (
    <div
      role="status"
      aria-label="ARIA is thinking"
      aria-live="polite"
      style={{
        display: 'flex', gap: 12, alignItems: 'flex-end',
        padding: '2px 0 22px',
        animation: 'fadeSlideIn 0.24s ease-out both',
      }}
    >
      <Avatar role="assistant" size={32} />

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px 16px 16px 16px',
        padding: '14px 18px',
        display: 'flex', gap: 7, alignItems: 'center',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
      }}>
        {/* Left accent rule */}
        <div style={{
          position: 'absolute', left: 0,
          top: '16%', height: '68%', width: 3,
          borderRadius: '0 var(--radius-full) var(--radius-full) 0',
          background: 'var(--accent)',
          opacity: 0.9,
        }} />

        {DOTS.map((d, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--accent)', display: 'inline-block',
              animation: `dotPop 1.4s ease-in-out ${d.delay} infinite`,
              flexShrink: 0,
            }}
          />
        ))}

        <span style={{
          fontSize: 12, color: 'var(--text-muted)',
          fontFamily: 'var(--font-body)', marginLeft: 4,
          letterSpacing: '0.01em',
        }}>
          thinking…
        </span>
      </div>
    </div>
  );
}