import React from 'react';
import Avatar from '../ui/Avatar';

const DOT_COLORS = ['#00F5A0', '#00C8FF', '#A855F7'];

export default function TypingIndicator() {
  return (
    <div
      role="status"
      aria-label="ARIA is typing"
      aria-live="polite"
      style={{
        display:    'flex',
        gap:        12,
        alignItems: 'flex-end',
        padding:    '4px 0 14px',
        animation:  'fadeSlideIn 0.22s ease-out both',
      }}
    >
      <Avatar role="assistant" size={32} />

      <div style={{
        background:          'rgba(11,16,32,0.80)',
        backdropFilter:      'blur(12px)',
        WebkitBackdropFilter:'blur(12px)',
        border:              '1px solid var(--border-glass)',
        borderLeft:          '2px solid rgba(0,245,160,0.28)',
        borderRadius:        '5px 18px 18px 18px',
        padding:             '13px 18px',
        display:             'flex',
        gap:                  5,
        alignItems:          'center',
        boxShadow:           'var(--shadow-ai)',
      }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{
              width:        8,
              height:       8,
              borderRadius: '50%',
              background:   DOT_COLORS[i],
              display:      'inline-block',
              boxShadow:    `0 0 8px ${DOT_COLORS[i]}88`,
              animation:    `waveFloat 1.5s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
