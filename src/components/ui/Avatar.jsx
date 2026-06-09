import React from 'react';

const base = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  flexShrink: 0,
  userSelect: 'none',
};

const variants = {
  assistant: {
    background: 'linear-gradient(135deg, #3DFFC0 0%, #00B4D8 100%)',
    color: '#0A0E1A',
    boxShadow: '0 0 12px rgba(61,255,192,0.3)',
  },
  user: {
    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
    color: '#fff',
    boxShadow: '0 0 12px rgba(255,107,107,0.3)',
  },
};

export default function Avatar({ role = 'assistant', initials }) {
  const v = variants[role] ?? variants.assistant;
  return (
    <div style={{ ...base, ...v }} aria-hidden="true">
      {role === 'assistant' ? '✦' : (initials || 'U')}
    </div>
  );
}