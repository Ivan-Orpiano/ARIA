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
  return (
    <div
      role="img"
      aria-label="ARIA logo"
      style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}
    >
      {/* Outer rotating conic ring */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        border: '1.5px solid transparent',
        backgroundImage: 'linear-gradient(#050810, #050810), conic-gradient(from 0deg, #00F5A0, #00C8FF, #A855F7, #00F5A0)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        animation: 'ringRotate 8s linear infinite',
        opacity: 0.75,
      }} />

      {/* Middle counter-rotating dashed ring */}
      <div style={{
        position: 'absolute',
        inset: 10,
        borderRadius: '50%',
        border: '1px dashed rgba(0,200,255,0.25)',
        animation: 'ringRotateRev 12s linear infinite',
      }} />

      {/* Inner slow ring */}
      <div style={{
        position: 'absolute',
        inset: 20,
        borderRadius: '50%',
        border: '1px solid rgba(0,245,160,0.18)',
        animation: 'ringRotate 6s linear infinite',
      }} />

      {/* Glow halo */}
      <div style={{
        position: 'absolute',
        inset: 24,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,245,160,0.28) 0%, rgba(0,200,255,0.12) 50%, transparent 80%)',
        animation: 'glow 3s ease-in-out infinite',
      }} />

      {/* Core */}
      <div style={{
        position: 'absolute',
        inset: 26,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #00F5A0 0%, #00C8FF 55%, #A855F7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        color: '#05080F',
        fontWeight: 800,
        fontFamily: "'Syne', sans-serif",
        userSelect: 'none',
        letterSpacing: '-0.04em',
        boxShadow: '0 0 32px rgba(0,245,160,0.35), inset 0 1px 0 rgba(255,255,255,0.20)',
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
        background:   hovered ? 'var(--accent-dim)' : 'var(--bg-elevated)',
        border:       `1px solid ${hovered ? 'rgba(0,245,160,0.28)' : 'var(--border-mid)'}`,
        borderRadius: 'var(--radius-md)',
        padding:      '11px 14px',
        cursor:       'pointer',
        textAlign:    'left',
        display:      'flex',
        gap:           11,
        alignItems:   'flex-start',
        fontFamily:   'var(--font-body)',
        transition:   'all var(--transition-base)',
        animation:    `popIn 0.42s ease ${delay}s both`,
        opacity:       0,
        transform:    hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow:    hovered ? '0 4px 20px var(--accent-glow)' : 'none',
      }}
    >
      <span style={{
        fontSize:   18,
        flexShrink:  0,
        marginTop:   1,
        filter:      hovered ? 'none' : 'saturate(0.75)',
        transition: 'filter var(--transition-base)',
      }}>
        {s.icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize:   13,
          fontWeight:  600,
          color:       hovered ? 'var(--accent)' : 'var(--text-primary)',
          marginBottom: 2,
          transition: 'color var(--transition-base)',
          lineHeight:  1.3,
        }}>
          {s.label}
        </div>
        <div style={{
          fontSize:     11.5,
          color:        'var(--text-muted)',
          lineHeight:   1.45,
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:   'nowrap',
        }}>
          {s.text}
        </div>
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
        gap:             36,
        textAlign:      'center',
        animation:      'fadeIn 0.45s ease-out both',
      }}
    >
      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <LogoMark />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <h1 style={{
            fontSize:            42,
            fontWeight:          800,
            margin:               0,
            letterSpacing:       '-0.05em',
            fontFamily:          "'Syne', sans-serif",
            background:          'linear-gradient(135deg, #00F5A0 0%, #00C8FF 45%, #A855F7 100%)',
            WebkitBackgroundClip:'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip:      'text',
            backgroundSize:      '200% auto',
            animation:           'shimmerText 4s linear infinite',
            lineHeight:           1.1,
          }}>
            ARIA
          </h1>

          <p style={{
            fontSize:   14.5,
            color:      'var(--text-secondary)',
            margin:      0,
            maxWidth:    360,
            lineHeight:  1.65,
          }}>
            Your intelligent AI Secretary — draft emails, research topics,
            schedule tasks, and automate your workflows.
          </p>
        </div>

        {/* Status pill bar */}
        <div
          style={{
            display:      'flex',
            alignItems:   'center',
            background:   'var(--bg-elevated)',
            border:       '1px solid var(--border-mid)',
            borderRadius: 'var(--radius-full)',
            padding:      '4px 6px',
            animation:    'popIn 0.4s ease 0.2s both',
            opacity:       0,
          }}
        >
          {[
            { color: 'var(--accent)',      label: 'Online',  pulse: true },
            { color: 'var(--accent-blue)', label: 'Fast',    pulse: false },
            { color: '#A855F7',            label: 'Private', pulse: false },
          ].map(({ color, label, pulse }, i) => (
            <React.Fragment key={label}>
              {i > 0 && (
                <span style={{
                  width:      1,
                  height:     12,
                  background: 'var(--border-mid)',
                  margin:     '0 2px',
                  display:    'inline-block',
                }} />
              )}
              <span style={{
                display:    'flex',
                alignItems: 'center',
                gap:         5,
                padding:    '2px 10px',
                fontSize:    11,
                color:      'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
              }}>
                <span style={{
                  width:        6,
                  height:       6,
                  borderRadius: '50%',
                  background:   color,
                  flexShrink:   0,
                  boxShadow:    `0 0 6px ${color}`,
                  animation:    pulse ? 'pulse 2s ease-in-out infinite' : undefined,
                }} />
                {label}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Suggestion grid */}
      <div style={{ width: '100%', maxWidth: 600 }}>
        <p style={{
          fontSize:      10,
          fontWeight:    700,
          color:         'var(--text-hint)',
          fontFamily:    'var(--font-display)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom:   12,
        }}>
          Try asking
        </p>

        <div
          role="list"
          aria-label="Suggested prompts"
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap:                  8,
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
        animation:      'popIn 0.4s ease 0.55s both',
        opacity:         0,
      }}>
        {FEATURES.map((f, i) => (
          <React.Fragment key={f.label}>
            {i > 0 && (
              <span style={{
                width:      1,
                height:     14,
                background: 'var(--border-mid)',
                margin:     '0 2px',
              }} />
            )}
            <span style={{
              display:    'flex',
              alignItems: 'center',
              gap:         5,
              padding:    '4px 12px',
              fontSize:    11.5,
              color:      'var(--text-muted)',
              fontFamily: 'var(--font-body)',
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
