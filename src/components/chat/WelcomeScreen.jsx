import React from 'react';
import {
  TrendingUpIcon, CloudSunIcon, FileTextIcon, SearchIcon, TrophyIcon,
  BarChartIcon, ArrowRightIcon, AriaAvatar,
} from '../icons/Icons';

/* ── Suggestion data ─────────────────────────────────────────────── */
const SUGGESTIONS = [
  { icon: TrendingUpIcon, label: 'Show stock market update', text: "Show me today's stock market update." },
  { icon: CloudSunIcon,   label: "Today's forecast",         text: "What's today's weather forecast?" },
  { icon: FileTextIcon,   label: 'Summarize a document', text: 'Here is my document — please summarize the key points in bullet form.' },
  { icon: SearchIcon,     label: 'Research a topic',     text: 'Research the latest trends in AI automation for small businesses in 2025.' },
  { icon: TrophyIcon,     label: 'Sports update',            text: 'Give me the latest sports update.' },
  { icon: BarChartIcon,   label: 'News updates',         text: 'List top 3 latest news with brief summaries.' },
];

/* ── ARIA logo mark — hero size ────────────────────────────────── */
function LogoMark() {
  return (
    <div className="welcome-logo" role="img" aria-label="ARIA logo">
      <div className="welcome-logo-glow" aria-hidden="true" />
      <div className="welcome-logo-ring" aria-hidden="true" />
      <div className="welcome-logo-core">
        <AriaAvatar size={38} />
      </div>
    </div>
  );
}

/* ── Suggestion card ────────────────────────────────────────────── */
function SuggestionCard({ suggestion: s, delay, onClick }) {
  const Icon = s.icon;

  return (
    <button
      type="button"
      role="listitem"
      onClick={onClick}
      aria-label={`Use prompt: ${s.text}`}
      className="suggestion-card"
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="suggestion-icn" aria-hidden="true">
        <Icon size={18} />
      </span>

      <span className="suggestion-copy">
        <span className="suggestion-label">{s.label}</span>
        <span className="suggestion-text">{s.text}</span>
      </span>

      <span className="suggestion-arrow" aria-hidden="true">
        <ArrowRightIcon size={16} />
      </span>
    </button>
  );
}

/* ── WelcomeScreen ──────────────────────────────────────────────── */
export default function WelcomeScreen({ onSelectSuggestion }) {
  return (
    <div className="welcome">

      {/* ── Hero ─────────────────────────────────── */}
      <div className="welcome-hero">
        <LogoMark />

        <div className="welcome-heading">
          <h1 className="welcome-title">ARIA</h1>
          <p className="welcome-sub">
            Your intelligent AI Secretary — draft emails, research topics,
            schedule tasks, and automate your workflows.
          </p>
        </div>
      </div>

      {/* ── Suggestion grid ──────────────────────── */}
      <div className="suggestion-wrap">
        <p className="welcome-eyebrow">Try asking</p>

        <div
          role="list"
          aria-label="Suggested prompts"
          className="suggestion-grid"
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