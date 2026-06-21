import React from 'react';

/* ── Suggestion list ─────────────────────────────────────────────────── */
const SUGGESTIONS = [
  { icon: '📅', label: 'Schedule a meeting',   text: 'Schedule a meeting for tomorrow at 2 PM and draft the calendar invite.' },
  { icon: '✉️', label: 'Draft an email',        text: 'Draft a professional follow-up email to a client after a product demo.' },
  { icon: '📊', label: 'Summarize a document', text: 'Here is my document — please summarize the key points in bullet form.' },
  { icon: '🔍', label: 'Research a topic',     text: 'Research the latest trends in AI automation for small businesses in 2025.' },
  { icon: '✅', label: 'Create a task list',   text: 'Create a prioritized task list for launching a new product next month.' },
  { icon: '📝', label: 'Write a report',        text: 'Write a concise executive summary report on Q3 performance highlights.' },
];

const FEATURES = [
  { icon: '📎', label: 'File Attachments' },
  { icon: '⚡', label: 'n8n Automation' },
  { icon: '💬', label: 'Real-time Chat' },
  { icon: '🔒', label: 'Private & Secure' },
];

/* ── Animated logo ───────────────────────────────────────────────────── */
function LogoMark() {
  const particles = [
    { color: '#00F5A0', size: 5, dur: '7s',  angle: 0   },
    { color: '#00D4FF', size: 4, dur: '9s',  angle: 90  },
    { color: '#B46EF8', size: 4, dur: '11s', angle: 180 },
    { color: '#00F5A0', size: 3, dur: '8s',  angle: 270 },
  ];

  return (
    <div
      role="img"
      aria-label="ARIA logo"
      style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}
    >
      {/* Outermost diffuse halo */}
      <div style={{
        position:     'absolute',
        inset:        -16,
        borderRadius: '50%',
        background:   'radial-gradient(circle, rgba(0,245,160,0.07) 0%, rgba(0,212,255,0.04) 45%, transparent 70%)',
        animation:    'breathe 5s ease-in-out infinite',
      }} />

      {/* Outer conic ring */}
      <div style={{
        position:         'absolute',
        inset:             0,
        borderRadius:     '50%',
        border:           '1.5px solid transparent',
        backgroundImage:  'linear-gradient(#04060F, #04060F), conic-gradient(from 0deg, #00F5A0, #00D4FF, #B46EF8, #00F5A0)',
        backgroundOrigin: 'border-box',
        backgroundClip:   'padding-box, border-box',
        animation:        'ringRotate 9s linear infinite',
        opacity:           0.8,
      }} />

      {/* Second ring — counter-rotating dashed */}
      <div style={{
        position:     'absolute',
        inset:         11,
        borderRadius: '50%',
        border:       '1px dashed rgba(0,212,255,0.28)',
        animation:    'ringRotateRev 14s linear infinite',
      }} />

      {/* Third ring — solid slow */}
      <div style={{
        position:     'absolute',
        inset:         20,
        borderRadius: '50%',
        border:       '1px solid rgba(0,245,160,0.18)',
        animation:    'ringRotate 7s linear infinite',
      }} />

      {/* Fourth micro ring */}
      <div style={{
        position:     'absolute',
        inset:         28,
        borderRadius: '50%',
        border:       '1px dashed rgba(180,110,248,0.20)',
        animation:    'ringRotateRev 5s linear infinite',
      }} />

      {/* Orbiting particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position:     'absolute',
            top:          '50%',
            left:         '50%',
            width:         p.size,
            height:        p.size,
            marginTop:    -p.size / 2,
            marginLeft:   -p.size / 2,
            borderRadius: '50%',
            background:    p.color,
            boxShadow:    `0 0 8px ${p.color}`,
            animation:    `orb${(i % 3) + 1} ${p.dur} linear infinite`,
            animationDelay: `${i * -2.2}s`,
          }}
        />
      ))}

      {/* Glow halo */}
      <div style={{
        position:     'absolute',
        inset:         26,
        borderRadius: '50%',
        background:   'radial-gradient(circle, rgba(0,245,160,0.32) 0%, rgba(0,212,255,0.14) 50%, transparent 80%)',
        animation:    'glow 3.5s ease-in-out infinite',
      }} />

      {/* Core */}
      <div style={{
        position:       'absolute',
        inset:           28,
        borderRadius:   '50%',
        background:     'linear-gradient(135deg, #00F5A0 0%, #00D4FF 55%, #B46EF8 100%)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:        22,
        color:          '#04060F',
        fontWeight:      800,
        fontFamily:     "'Syne', sans-serif",
        userSelect:     'none',
        letterSpacing:  '-0.04em',
        boxShadow:      '0 0 32px rgba(0,245,160,0.40), inset 0 1px 0 rgba(255,255,255,0.22)',
      }}>
        A
      </div>
    </div>
  );
}

/* ── Suggestion card ─────────────────────────────────────────────────── */
function SuggestionCard({ suggestion: s, delay, onClick }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      role="listitem"
      onClick={onClick}
      aria-label={`Use prompt: ${s.text}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   hovered
          ? 'linear-gradient(135deg, rgba(0,245,160,0.09) 0%, rgba(0,212,255,0.04) 100%)'
          : 'var(--bg-elevated)',
        border:       `1px solid ${hovered ? 'rgba(0,245,160,0.32)' : 'var(--border-mid)'}`,
        borderRadius: 'var(--radius-md)',
        padding:      '12px 15px',
        cursor:       'pointer',
        textAlign:    'left',
        display:      'flex',
        gap:           11,
        alignItems:   'flex-start',
        fontFamily:   'var(--font-body)',
        transition:   'all 0.20s ease',
        animation:    `popIn 0.42s ease ${delay}s both`,
        opacity:       0,
        transform:    hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow:    hovered
          ? '0 8px 28px rgba(0,245,160,0.12), 0 0 0 1px rgba(0,245,160,0.18)'
          : 'var(--shadow-sm)',
      }}
    >
      {/* Icon container */}
      <div style={{
        width:          36,
        height:         36,
        borderRadius:   10,
        background:      hovered ? 'rgba(0,245,160,0.10)' : 'rgba(255,255,255,0.04)',
        border:         `1px solid ${hovered ? 'rgba(0,245,160,0.22)' : 'var(--border-subtle)'}`,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:        18,
        flexShrink:      0,
        transition:     'all 0.20s ease',
      }}>
        {s.icon}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize:     13,
          fontWeight:    600,
          color:         hovered ? 'var(--accent)' : 'var(--text-primary)',
          marginBottom:  3,
          transition:   'color 0.18s ease',
          lineHeight:    1.3,
        }}>
          {s.label}
        </div>
        <div style={{
          fontSize:     11.5,
          color:        'var(--text-muted)',
          lineHeight:    1.45,
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:   'nowrap',
        }}>
          {s.text}
        </div>
      </div>

      {/* Arrow indicator on hover */}
      <div style={{
        color:      'var(--accent)',
        fontSize:    14,
        opacity:     hovered ? 0.7 : 0,
        transform:   hovered ? 'translateX(0)' : 'translateX(-6px)',
        transition: 'all 0.20s ease',
        flexShrink:  0,
        alignSelf:  'center',
      }}>
        →
      </div>
    </button>
  );
}

/* ── WelcomeScreen ───────────────────────────────────────────────────── */
export default function WelcomeScreen({ onSelectSuggestion }) {
  return (
    <div
      style={{
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '32px 24px 28px',
        gap:             38,
        textAlign:      'center',
        animation:      'fadeIn 0.50s ease-out both',
      }}
    >
      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        <LogoMark />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <h1 style={{
            fontSize:             46,
            fontWeight:           800,
            margin:                0,
            letterSpacing:        '-0.05em',
            fontFamily:           "'Syne', sans-serif",
            background:           'linear-gradient(135deg, #00F5A0 0%, #00D4FF 45%, #B46EF8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip:       'text',
            backgroundSize:       '200% auto',
            animation:            'shimmerText 4.5s linear infinite',
            lineHeight:            1.0,
          }}>
            ARIA
          </h1>

          <p style={{
            fontSize:   15,
            color:      'var(--text-secondary)',
            margin:      0,
            maxWidth:    380,
            lineHeight:  1.65,
            letterSpacing: '0.005em',
          }}>
            Your intelligent AI Secretary — draft emails, research topics,
            schedule tasks, and automate your workflows.
          </p>
        </div>

        {/* Status pill bar */}
        <div style={{
          display:      'flex',
          alignItems:   'center',
          background:   'rgba(16,22,38,0.80)',
          border:       '1px solid var(--border-mid)',
          borderRadius: 'var(--radius-full)',
          padding:      '5px 6px',
          animation:    'popIn 0.4s ease 0.2s both',
          opacity:       0,
          gap:           2,
          backdropFilter: 'blur(12px)',
        }}>
          {[
            { color: 'var(--accent)',        label: 'Online',  glow: 'rgba(0,245,160,0.6)',   pulse: true },
            { color: 'var(--accent-blue)',   label: 'Fast',    glow: 'rgba(0,212,255,0.5)',   pulse: false },
            { color: 'var(--accent-purple)', label: 'Private', glow: 'rgba(180,110,248,0.5)', pulse: false },
          ].map(({ color, label, glow, pulse }, i) => (
            <React.Fragment key={label}>
              {i > 0 && (
                <span style={{ width: 1, height: 12, background: 'var(--border-mid)', display: 'inline-block', flexShrink: 0 }} />
              )}
              <span style={{
                display:    'flex',
                alignItems: 'center',
                gap:         5,
                padding:    '3px 11px',
                fontSize:    11,
                color:      'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap',
              }}>
                <span style={{
                  width:        6,
                  height:       6,
                  borderRadius: '50%',
                  background:    color,
                  flexShrink:    0,
                  boxShadow:    `0 0 7px ${glow}`,
                  animation:     pulse ? 'pulse 2.2s ease-in-out infinite' : undefined,
                }} />
                {label}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Suggestion grid */}
      <div style={{ width: '100%', maxWidth: 620 }}>
        <p style={{
          fontSize:      10,
          fontWeight:    700,
          color:         'var(--text-hint)',
          fontFamily:    'var(--font-display)',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          marginBottom:   14,
        }}>
          Try asking
        </p>

        <div
          role="list"
          aria-label="Suggested prompts"
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(248px, 1fr))',
            gap:                  9,
          }}
        >
          {SUGGESTIONS.map((s, i) => (
            <SuggestionCard
              key={s.label}
              suggestion={s}
              delay={0.08 + i * 0.055}
              onClick={() => onSelectSuggestion(s.text)}
            />
          ))}
        </div>
      </div>

      {/* Feature row */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        flexWrap:       'wrap',
        justifyContent: 'center',
        gap:             2,
        animation:      'popIn 0.4s ease 0.55s both',
        opacity:         0,
        background:     'rgba(255,255,255,0.02)',
        border:         '1px solid var(--border-subtle)',
        borderRadius:   'var(--radius-full)',
        padding:        '4px 8px',
      }}>
        {FEATURES.map((f, i) => (
          <React.Fragment key={f.label}>
            {i > 0 && (
              <span style={{ width: 1, height: 14, background: 'var(--border-mid)', display: 'inline-block', flexShrink: 0 }} />
            )}
            <span style={{
              display:    'flex',
              alignItems: 'center',
              gap:         5,
              padding:    '4px 12px',
              fontSize:    11.5,
              color:      'var(--text-muted)',
              fontFamily: 'var(--font-body)',
              whiteSpace: 'nowrap',
            }}>
              <span style={{ fontSize: 12 }}>{f.icon}</span>
              {f.label}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
