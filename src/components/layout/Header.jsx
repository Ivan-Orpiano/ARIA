import React from 'react';
import { MenuIcon, SparkleIcon, XIcon } from '../icons/Icons';
import { useChat } from '../../hooks/useChats';

export default function Header({ onToggleSidebar }) {
  const { messages, clearChat } = useChat();
  const hasMessages = messages.length > 0;

  return (
    <header className="app-header">

      {/* Left: menu + branding */}
      <div className="app-header-left">
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <MenuIcon size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          {/* Logo icon */}
          <div
            aria-hidden="true"
            style={{
              width: 26, height: 26, borderRadius: 7,
              background: 'var(--gradient-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#05080F', flexShrink: 0,
              boxShadow: '0 0 14px var(--accent-glow)',
            }}
          >
            <SparkleIcon size={13} />
          </div>

          {/* Brand text */}
          <span className="app-header-title">ARIA</span>
          <span style={{
            fontSize: 10.5, color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)', letterSpacing: '0.03em',
            marginLeft: -2,
          }}>
            AI Secretary
          </span>

          {/* Separator */}
          <span style={{
            width: 1, height: 14,
            background: 'var(--border-mid)',
            display: 'inline-block', flexShrink: 0,
          }} />

          {/* Model badge */}
          <span style={{
            fontSize: 10, color: 'var(--text-hint)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.02em',
          }}>
            claude-sonnet
          </span>
        </div>
      </div>

      {/* Right: status + clear */}
      <div className="app-header-right">

        {/* Online status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 11px',
          background: 'var(--accent-dim)',
          border: '1px solid rgba(0,245,160,0.18)',
          borderRadius: 'var(--radius-full)',
          fontSize: 10.5, color: 'var(--accent)',
          fontFamily: 'var(--font-mono)', flexShrink: 0,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: 'var(--accent)', flexShrink: 0,
            boxShadow: '0 0 6px rgba(0,245,160,0.70)',
            animation: 'pulse 2.2s ease-in-out infinite',
          }} />
          Online
        </div>

        {/* Clear button — appears when messages exist */}
        {hasMessages && (
          <button
            type="button"
            className="ghost-btn ghost-btn-danger"
            onClick={clearChat}
            aria-label="Clear conversation"
            style={{ animation: 'scaleIn 0.20s ease both' }}
          >
            <XIcon size={12} />
            Clear
          </button>
        )}
      </div>
    </header>
  );
}
