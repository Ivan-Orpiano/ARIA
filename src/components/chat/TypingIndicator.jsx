
import React from 'react';
import Avatar from '../ui/Avatar';

export default function TypingIndicator() {
  return (
    <div
      role="status"
      aria-label="ARIA is typing"
      aria-live="polite"
      style={{
        display:    'flex',
        gap:        10,
        alignItems: 'flex-end',
        padding:    '4px 0 12px',
        animation:  'fadeSlideIn 0.22s ease-out both',
      }}
    >
      <Avatar role="assistant" size={28} />

      <div
        style={{
          background:   'var(--bg-card)',
          border:       '1px solid var(--border-mid)',
          borderRadius: '4px 18px 18px 18px',
          padding:      '13px 18px',
          display:      'flex',
          gap:          5,
          alignItems:   'center',
          boxShadow:    'var(--shadow-sm)',
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{
              width:        7,
              height:       7,
              borderRadius: '50%',
              background:   'var(--accent)',
              display:      'inline-block',
              animation:    `typingDot 1.4s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}