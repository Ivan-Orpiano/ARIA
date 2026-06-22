import React from 'react';

/**
 * @param {{
 *   message:   string | null,
 *   onDismiss: () => void,
 * }} props
 */
export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        background:          'var(--error-bg)',
        border:              '1px solid var(--error-border)',
        borderLeft:          '3px solid var(--error)',
        borderRadius:        'var(--radius-md)',
        padding:             '9px 12px',
        marginBottom:        'var(--space-2)',
        display:             'flex',
        alignItems:          'flex-start',
        gap:                  8,
        fontSize:             13,
        color:               'var(--error-text)',
        lineHeight:           1.45,
        animation:           'slideDown 0.20s ease-out',
        backdropFilter:      'blur(8px)',
        WebkitBackdropFilter:'blur(8px)',
        boxShadow:           '0 2px 12px rgba(255,77,106,0.08)',
      }}
    >
      {/* Warning icon */}
      <span
        aria-hidden="true"
        style={{
          fontSize:  15,
          flexShrink: 0,
          marginTop:  1,
          filter:    'drop-shadow(0 0 4px rgba(255,77,106,0.5))',
        }}
      >
        ⚠️
      </span>

      {/* Message text */}
      <span style={{ flex: 1 }}>{message}</span>

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        aria-label="Dismiss error"
        style={{
          background:   'none',
          border:       'none',
          cursor:       'pointer',
          color:        'var(--error-text)',
          fontSize:      18,
          lineHeight:    1,
          padding:      '1px 4px',
          flexShrink:    0,
          opacity:       0.65,
          transition:   'all var(--transition-fast)',
          borderRadius: 'var(--radius-sm)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity    = '1';
          e.currentTarget.style.background = 'rgba(255,77,106,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity    = '0.65';
          e.currentTarget.style.background = 'none';
        }}
      >
        ×
      </button>
    </div>
  );
}