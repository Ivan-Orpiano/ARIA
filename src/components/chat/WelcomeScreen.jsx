/**
 * WelcomeScreen.jsx
 *
 * Displayed when the conversation is empty.
 * Shows the animated ARIA orbit logo, a brief description,
 * clickable suggestion chips, and capability badges.
 *
 * Props:
 *   onSelectSuggestion(text: string) — called when user taps a chip
 */

import React from 'react';

/* ── Suggestion list ──────────────────────────────────────── */
const SUGGESTIONS = [
  { icon: '📅', label: 'Schedule a meeting',   text: 'Schedule a meeting for tomorrow at 2 PM and draft the calendar invite.' },
  { icon: '✉️', label: 'Draft an email',        text: 'Draft a professional follow-up email to a client after a product demo.' },
  { icon: '📊', label: 'Summarize a document', text: 'Here is my document — please summarize the key points in bullet form.' },
  { icon: '🔍', label: 'Research a topic',     text: 'Research the latest trends in AI automation for small businesses in 2025.' },
  { icon: '✅', label: 'Create a task list',   text: 'Create a prioritized task list for launching a new product next month.' },
  { icon: '📝', label: 'Write a report',        text: 'Write a concise executive summary report on Q3 performance highlights.' },
];

const CAPABILITIES = [
  'File Attachments',
  'n8n Automation',
  'Real-time Responses',
  'Conversation History',
];

/* ── Orbit logo (animated) ───────────────────────────────── */
function OrbitLogo() {
  const particles = [
    { anim: 'orb1 4.2s linear infinite',  size: 8, color: '#00F5A0', glow: 'rgba(0,245,160,0.9)'  },
    { anim: 'orb2 6.5s linear infinite',  size: 6, color: '#00C8FF', glow: 'rgba(0,200,255,0.9)'  },
    { anim: 'orb3 9.0s linear infinite',  size: 5, color: '#FF6B9D', glow: 'rgba(255,107,157,0.9)' },
  ];

  return (
    <div
      role="img"
      aria-label="ARIA logo"
      style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}
    >
      {/* Outer dashed ring */}
      <div style={{
        position: 'absolute', inset: -6,
        borderRadius: '50%',
        border: '1px dashed rgba(0,200,255,0.10)',
      }} />

      {/* Inner ring */}
      <div style={{
        position: 'absolute', inset: 8,
        borderRadius: '50%',
        border: '1px solid rgba(0,245,160,0.12)',
      }} />

      {/* Core */}
      <div style={{
        position:       'absolute',
        inset:          0,
        borderRadius:   '50%',
        background:     'linear-gradient(135deg, #00F5A0 0%, #00C8FF 100%)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       32,
        animation:      'glow 3s ease-in-out infinite',
        boxShadow:      '0 0 40px rgba(0,245,160,0.25)',
        color:          '#060A14',
        userSelect:     'none',
      }}>
        ✦
      </div>

      {/* Orbiting particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position:  'absolute',
            top:       '50%',
            left:      '50%',
            marginTop: -p.size / 2,
            marginLeft:-p.size / 2,
            animation: p.anim,
          }}
        >
          <div style={{
            width:        p.size,
            height:       p.size,
            borderRadius: '50%',
            background:   p.color,
            position:     'absolute',
            transform:    'translate(-50%, -50%)',
            boxShadow:    `0 0 ${p.size * 2}px ${p.glow}`,
          }} />
        </div>
      ))}
    </div>
  );
}

/* ── WelcomeScreen ──────────────────────────────────────── */
export default function WelcomeScreen({ onSelectSuggestion }) {
  return (
    <div
      style={{
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '40px 24px 32px',
        gap:            32,
        textAlign:      'center',
        animation:      'fadeIn 0.40s ease-out both',
      }}
    >
      {/* Logo + headline */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <OrbitLogo />

        <div>
          <h1 style={{
            fontSize:      28,
            fontWeight:    800,
            color:         'var(--text-primary)',
            margin:        0,
            letterSpacing: '-0.04em',
            fontFamily:    'var(--font-display)',
          }}>
            ARIA
          </h1>
          <p style={{
            fontSize:   13.5,
            color:      'var(--text-secondary)',
            marginTop:  8,
            maxWidth:   340,
            lineHeight: 1.65,
          }}>
            Your intelligent AI Secretary — draft emails, research topics,
            schedule tasks, and automate your workflows.
          </p>
        </div>

        {/* Status pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { glyph: '✦', label: 'Online',  color: 'var(--accent)' },
            { glyph: '⚡', label: 'Fast',    color: 'var(--accent-blue)' },
            { glyph: '🔒', label: 'Private', color: 'var(--text-secondary)' },
          ].map(({ glyph, label, color }, i) => (
            <div
              key={label}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          4,
                fontSize:     10.5,
                color:        'var(--text-muted)',
                background:   'var(--bg-elevated)',
                border:       '1px solid var(--border-mid)',
                borderRadius: 'var(--radius-full)',
                padding:      '3px 10px',
                fontFamily:   'var(--font-mono)',
                animation:    `popIn 0.4s ease ${0.1 + i * 0.08}s both`,
              }}
            >
              <span style={{ color, fontSize: 9 }}>{glyph}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Suggestion chips */}
      <div style={{ width: '100%', maxWidth: 580 }}>
        <p style={{
          fontSize:      10,
          fontWeight:    600,
          color:         'var(--text-muted)',
          fontFamily:    'var(--font-display)',
          textTransform: 'uppercase',
          letterSpacing: '0.10em',
          marginBottom:  10,
        }}>
          Try asking
        </p>

        <div
          role="list"
          aria-label="Suggested prompts"
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap:                 7,
          }}
        >
          {SUGGESTIONS.map((s, i) => (
            <button
              key={s.label}
              role="listitem"
              onClick={() => onSelectSuggestion(s.text)}
              aria-label={`Use prompt: ${s.text}`}
              style={{
                background:   'var(--bg-elevated)',
                border:       '1px solid var(--border-mid)',
                borderRadius: 'var(--radius-md)',
                padding:      '10px 13px',
                cursor:       'pointer',
                textAlign:    'left',
                display:      'flex',
                gap:          9,
                alignItems:   'flex-start',
                fontSize:     12.5,
                color:        'var(--text-secondary)',
                lineHeight:   1.45,
                fontFamily:   'var(--font-body)',
                transition:   'all var(--transition-base)',
                animation:    `popIn 0.4s ease ${0.08 + i * 0.06}s both`,
                opacity:      0,
              }}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, {
                  borderColor: 'var(--accent)',
                  background:  'var(--accent-dim)',
                  color:       'var(--text-primary)',
                  transform:   'translateY(-2px)',
                  boxShadow:   '0 4px 14px var(--accent-glow)',
                });
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, {
                  borderColor: 'var(--border-mid)',
                  background:  'var(--bg-elevated)',
                  color:       'var(--text-secondary)',
                  transform:   'translateY(0)',
                  boxShadow:   'none',
                });
              }}
            >
              <span aria-hidden="true" style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>
                {s.icon}
              </span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Capability tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
        {CAPABILITIES.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize:     10.5,
              color:        'var(--text-muted)',
              background:   'var(--bg-surface)',
              border:       '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding:      '3px 10px',
              fontFamily:   'var(--font-mono)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}