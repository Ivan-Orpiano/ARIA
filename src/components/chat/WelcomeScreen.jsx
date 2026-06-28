import React, { useState } from 'react';
import {
  CalendarIcon, MailIcon, FileTextIcon, SearchIcon, ListChecksIcon, BarChartIcon,
  PaperclipIcon, ZapIcon, MessageSquareIcon, LockIcon, ArrowRightIcon, AriaAvatar,
} from '../icons/Icons';

/* ── Suggestion data ─────────────────────────────────────────────── */
const SUGGESTIONS = [
  { icon: CalendarIcon,   label: 'Schedule a meeting',  text: 'Schedule a meeting for tomorrow and draft the calendar invite.' },
  { icon: MailIcon,       label: 'Draft an email',       text: 'Draft a professional follow-up email to a client after a product demo.' },
  { icon: FileTextIcon,   label: 'Summarize a document', text: 'Here is my document — please summarize the key points in bullet form.' },
  { icon: SearchIcon,     label: 'Research a topic',     text: 'Research the latest trends in AI automation for small businesses in 2025.' },
  { icon: ListChecksIcon, label: 'Create a task list',   text: 'Create a prioritized task list for launching a new product next month.' },
  { icon: BarChartIcon,   label: 'News Updates',         text:  'List top 3 latest news with brief summaries.' },
];





/* ── ARIA logo mark — hero size ────────────────────────────────── */
function LogoMark() {
  return (
    <div
      role="img"
      aria-label="ARIA logo"
      style={{
        position: 'relative', width: 92, height: 92, flexShrink: 0,
        animation: 'scaleIn 0.45s cubic-bezier(0.34,1.2,0.64,1) both',
      }}
    >
      {/* Outer ambient glow ring */}
      <div style={{
        position: 'absolute', inset: -14,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, rgba(56,189,248,0.08) 45%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Mid ring — border + surface */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: 'var(--radius-2xl)',
        border: '1px solid var(--border-accent)',
        background: 'var(--bg-surface)',
        boxShadow: '0 0 0 5px var(--accent-dim), var(--shadow-sm)',
      }} />

      {/* Inner gradient badge */}
      <div style={{
        position: 'absolute', inset: 11,
        borderRadius: 'var(--radius-xl)',
        background: 'var(--gradient-brand)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#FFFFFF',
        boxShadow: '0 6px 22px rgba(6,182,212,0.42), inset 0 1px 0 rgba(255,255,255,0.24)',
      }}>
        <AriaAvatar size={38} />
      </div>
    </div>
  );
}

/* ── Suggestion card ────────────────────────────────────────────── */
function SuggestionCard({ suggestion: s, delay, onClick }) {
  const [hovered, setHovered] = useState(false);
  const Icon = s.icon;

  return (
    <button
      role="listitem"
      onClick={onClick}
      aria-label={`Use prompt: ${s.text}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${hovered ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        fontFamily: 'var(--font-body)',
        transition: 'all 0.18s ease',
        animation: `popIn 0.4s ease ${delay}s both`,
        opacity: 0,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      }}
    >
      {/* Icon container */}
      <div style={{
        width: 38, height: 38, borderRadius: 'var(--radius-sm)',
        background: hovered ? 'var(--accent)' : 'var(--accent-dim)',
        color: hovered ? '#FFFFFF' : 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.18s ease',
      }}>
        <Icon size={18} />
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: 14, fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 2, lineHeight: 1.3,
        }}>
          {s.label}
        </div>
        <div style={{
          fontSize: 12.5, color: 'var(--text-muted)',
          lineHeight: 1.45, overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {s.text}
        </div>
      </div>

      {/* Arrow indicator */}
      <div style={{
        color: 'var(--accent)',
        display: 'flex', alignItems: 'center',
        opacity: hovered ? 1 : 0,
        transform: hovered ? 'translateX(0)' : 'translateX(-4px)',
        transition: 'all 0.18s ease',
        flexShrink: 0,
      }}>
        <ArrowRightIcon size={16} />
      </div>
    </button>
  );
}

/* ── WelcomeScreen ──────────────────────────────────────────────── */
export default function WelcomeScreen({ onSelectSuggestion }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
      gap: 40, textAlign: 'center',
      animation: 'fadeIn 0.4s ease-out both',
    }}>

      {/* ── Hero ─────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <LogoMark />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <h1 style={{
            fontSize: 44, fontWeight: 700, margin: 0,
            letterSpacing: '-0.03em',
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
            lineHeight: 1.0,
          }}>
            ARIA
          </h1>

          <p style={{
            fontSize: 15, color: 'var(--text-secondary)',
            margin: 0, maxWidth: 380,
            lineHeight: 1.65,
          }}>
            Your intelligent AI Secretary — draft emails, research topics,
            schedule tasks, and automate your workflows.
          </p>
        </div>


      </div>

      {/* ── Suggestion grid ──────────────────────── */}
      <div style={{ width: '100%', maxWidth: 620 }}>
        <p style={{
          fontSize: 11, fontWeight: 600,
          color: 'var(--text-hint)',
          fontFamily: 'var(--font-body)',
          textTransform: 'uppercase', letterSpacing: '0.10em',
          marginBottom: 16,
        }}>
          Try asking
        </p>

        <div
          role="list"
          aria-label="Suggested prompts"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(252px, 1fr))',
            gap: 12,
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

    </div>
  );
}