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
        gap:        5,
        fontSize:   11,
        color:      config.color,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width:        6,
          height:       6,
          borderRadius: '50%',
          background:   config.color,
          display:      'inline-block',
          animation:    status === 'typing' ? 'pulse 1.2s ease-in-out infinite' : 'none',
        }}
      />
      {config.label}
    </span>
  );
}