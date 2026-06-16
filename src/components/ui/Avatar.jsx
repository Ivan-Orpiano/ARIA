/**
 * Avatar.jsx
 *
 * Renders a small, accessible avatar for either the user or the AI assistant.
 *
 * Props:
 *   role  — 'user' | 'assistant'  (required)
 *   size  — pixel dimension        (default 28)
 */

import React from 'react';

const STYLES = {
  assistant: {
    background: 'linear-gradient(135deg, #00F5A0 0%, #00C8FF 100%)',
    boxShadow:  '0 0 12px rgba(0, 245, 160, 0.30)',
    color:      '#060A14',
  },
  user: {
    background: 'linear-gradient(135deg, #FF6B9D 0%, #FF8E53 100%)',
    boxShadow:  '0 0 10px rgba(255, 107, 157, 0.25)',
    color:      '#fff',
  },
};

export default function Avatar({ role = 'user', size = 28 }) {
  const isAssistant = role === 'assistant';
  const style = STYLES[isAssistant ? 'assistant' : 'user'];
  const label = isAssistant ? 'ARIA AI' : 'You';
  const glyph = isAssistant ? '✦' : 'U';

  return (
    <div
      role="img"
      aria-label={label}
      style={{
        width:          size,
        height:         size,
        borderRadius:   '50%',
        flexShrink:     0,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       size * 0.40,
        fontFamily:     'var(--font-body)',
        fontWeight:     700,
        userSelect:     'none',
        transition:     'box-shadow var(--transition-base)',
        ...style,
      }}
    >
      {glyph}
    </div>
  );
}