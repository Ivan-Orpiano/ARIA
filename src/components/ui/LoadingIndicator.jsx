import React from 'react';

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 18px',
    animation: 'fadeInUp 0.25s ease both',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3DFFC0 0%, #00B4D8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    flexShrink: 0,
    boxShadow: '0 0 12px rgba(61,255,192,0.3)',
  },
  bubble: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-mid)',
    borderRadius: '18px 18px 18px 4px',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  dot: (delay) => ({
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--accent)',
    animation: `typingDot 1.2s ${delay}s ease-in-out infinite`,
  }),
  label: {
    fontSize: 11,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-body)',
    marginLeft: 2,
  },
};

export default function LoadingIndicator() {
  return (
    <div style={styles.wrapper} aria-label="ARIA is typing">
      <div style={styles.avatar}>✦</div>
      <div style={styles.bubble}>
        <span style={styles.dot(0)}   aria-hidden="true" />
        <span style={styles.dot(0.2)} aria-hidden="true" />
        <span style={styles.dot(0.4)} aria-hidden="true" />
        <span style={styles.label}>thinking…</span>
      </div>
    </div>
  );
}