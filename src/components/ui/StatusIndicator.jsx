import React from 'react';

/** @param {{ status: 'online'|'typing'|'offline' }} props */
export default function StatusIndicator({ status = 'online' }) {
  const config = {
    online:  { color: '#10b981', label: 'Active · n8n Workflow' },
    typing:  { color: '#f59e0b', label: 'Thinking…' },
    offline: { color: '#ef4444', label: 'Offline' },
  }[status] ?? { color: '#10b981', label: 'Active' };

  return (
    <span
      aria-label={config.label}
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:         6,
        fontSize:    11,
        color:       config.color,
        fontFamily: 'var(--font-body)',
        letterSpacing: '0.01em',
      }}
    >
      {/* Dot with optional ping ring */}
      <span
        aria-hidden="true"
        style={{
          position:       'relative',
          width:           8,
          height:          8,
          flexShrink:      0,
          display:        'inline-flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}
      >
        {status === 'online' && (
          <span
            style={{
              position:     'absolute',
              inset:         -2,
              borderRadius: '50%',
              background:    config.color,
              opacity:       0.4,
              animation:    'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
        )}
        <span
          style={{
            width:        6,
            height:       6,
            borderRadius: '50%',
            background:    config.color,
            display:      'inline-block',
            boxShadow:    `0 0 7px ${config.color}`,
            animation:     status === 'typing' ? 'pulse 1.2s ease-in-out infinite' : 'none',
            position:     'relative',
            zIndex:        1,
          }}
        />
      </span>
      {config.label}
    </span>
  );
}