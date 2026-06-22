import React from 'react';
import { MenuIcon, SparkleIcon, XIcon } from '../icons/Icons';
import { useChat } from '../../hooks/useChats';

export default function Header({ onToggleSidebar }) {
  const { messages, clearChat } = useChat();
  const hasMessages = messages.length > 0;

  return (
    <header className="app-header">
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
          <div
            aria-hidden="true"
            style={{
              width:          26,
              height:         26,
              borderRadius:    7,
              background:     'var(--gradient-brand)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              color:          '#05080F',
              flexShrink:      0,
              boxShadow:      '0 0 14px var(--accent-glow)',
            }}
          >
            <SparkleIcon size={13} />
          </div>
          <span className="app-header-title">ARIA</span>
          <span style={{
            fontSize:      11,
            color:         'var(--text-muted)',
            fontFamily:   'var(--font-body)',
            letterSpacing: '0.01em',
            marginLeft:    -2,
          }}>
            AI Secretary
          </span>
        </div>
      </div>

      <div className="app-header-right">
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:           5,
          padding:      '3px 10px',
          background:   'var(--accent-dim)',
          border:       '1px solid rgba(0,245,160,0.20)',
          borderRadius: 'var(--radius-full)',
          fontSize:      11,
          color:        'var(--accent)',
          fontFamily:   'var(--font-mono)',
          flexShrink:    0,
        }}>
          <span style={{
            width:        5,
            height:       5,
            borderRadius: '50%',
            background:   'var(--accent)',
            flexShrink:    0,
            boxShadow:    '0 0 6px rgba(0,245,160,0.7)',
            animation:    'pulse 2.2s ease-in-out infinite',
          }} />
          Online
        </div>

        {hasMessages && (
          <button
            type="button"
            className="ghost-btn ghost-btn-danger"
            onClick={clearChat}
            aria-label="Clear conversation"
            style={{ animation: 'scaleIn 0.22s ease both' }}
          >
            <XIcon size={12} />
            Clear
          </button>
        )}
      </div>
    </header>
  );
}
