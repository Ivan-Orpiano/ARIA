import React from 'react';

const DOT_COLORS  = ['#00F5A0', '#00C8FF', '#A855F7'];
const DOT_DELAYS  = [0, 0.18, 0.36];

const styles = {
  wrapper: {
    display:    'flex',
    alignItems: 'center',
    gap:         10,
    padding:    '14px 18px',
    animation:  'fadeInUp 0.25s ease both',
  },
  avatar: {
    width:          32,
    height:         32,
    borderRadius:   '50%',
    background:     'linear-gradient(135deg, #00F5A0 0%, #00C8FF 55%, #A855F7 100%)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:        14,
    flexShrink:      0,
    color:          '#04060F',
    boxShadow:      '0 0 0 1.5px rgba(0,245,160,0.38), 0 0 18px rgba(0,245,160,0.30)',
    animation:      'softGlow 3s ease-in-out infinite',
    position:       'relative',
  },
  avatarShine: {
    position:      'absolute',
    inset:          0,
    borderRadius:  '50%',
    background:    'linear-gradient(135deg, rgba(255,255,255,0.24) 0%, transparent 55%)',
    pointerEvents: 'none',
  },
  bubble: {
    background:          'rgba(11,16,32,0.82)',
    backdropFilter:      'blur(12px)',
    WebkitBackdropFilter:'blur(12px)',
    border:              '1px solid var(--border-glass)',
    borderLeft:          '2px solid rgba(0,245,160,0.32)',
    borderRadius:        '5px 18px 18px 18px',
    padding:             '12px 16px',
    display:             'flex',
    alignItems:          'center',
    gap:                  6,
    boxShadow:           'var(--shadow-ai)',
  },
  dot: (delay, color) => ({
    width:        7,
    height:       7,
    borderRadius: '50%',
    background:    color,
    animation:    `typingDot 1.4s ${delay}s ease-in-out infinite`,
    boxShadow:    `0 0 6px ${color}99`,
  }),
  label: {
    fontSize:   11,
    color:      'var(--text-muted)',
    fontFamily: 'var(--font-body)',
    marginLeft:  2,
    letterSpacing: '0.01em',
  },
};

export default function LoadingIndicator() {
  return (
    <div style={styles.wrapper} aria-label="ARIA is typing" role="status">
      <div style={styles.avatar}>
        <span aria-hidden="true" style={styles.avatarShine} />
        <span style={{ position: 'relative', zIndex: 1 }}>✦</span>
      </div>
      <div style={styles.bubble}>
        {DOT_COLORS.map((color, i) => (
          <span key={i} style={styles.dot(DOT_DELAYS[i], color)} aria-hidden="true" />
        ))}
        <span style={styles.label}>thinking…</span>
      </div>
    </div>
  );
}