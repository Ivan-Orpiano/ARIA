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
          <MenuIcon size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Logo icon */}
          <div
            aria-hidden="true"
            style={{
              width: 30, height: 30, borderRadius: 'var(--radius-sm)',
              background: 'var(--gradient-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', flexShrink: 0,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <SparkleIcon size={15} />
          </div>

          {/* Brand text */}
          <span className="app-header-title">ARIA</span>
          <span style={{
            fontSize: 12, color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)', letterSpacing: '0.01em',
            fontWeight: 500,
          }}>
            AI Secretary
          </span>

          {/* Separator */}
          <span style={{
            width: 1, height: 16,
            background: 'var(--border-mid)',
            display: 'inline-block', flexShrink: 0,
            margin: '0 2px',
          }} />

          {/* Model badge */}
          <span style={{
            fontSize: 11, color: 'var(--text-hint)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.01em',
          }}>
            
          </span>
        </div>
      </div>

      {/* Right: status + clear */}
      <div className="app-header-right">

        {/* Online status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 12px',
          background: 'rgba(22, 163, 74, 0.08)',
          border: '1px solid rgba(22, 163, 74, 0.20)',
          borderRadius: 'var(--radius-full)',
          fontSize: 12, fontWeight: 500, color: 'var(--success)',
          fontFamily: 'var(--font-body)', flexShrink: 0,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--success)', flexShrink: 0,
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
            style={{ animation: 'scaleIn 0.2s ease both' }}
          >
            <XIcon size={14} />
            Clear
          </button>
        )}
      </div>
    </header>
  );
}