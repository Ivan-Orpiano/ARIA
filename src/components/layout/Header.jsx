import React from 'react';
import { MenuIcon, XIcon, AriaAvatar } from '../icons/Icons';
import { useChat } from '../../hooks/useChats';

/**
 * @param {{
 *   onToggleSidebar: () => void,
 *   mobileNavOpen?:  boolean,
 * }} props
 *
 * The burger is the single, always-visible sidebar control:
 *   · desktop / tablet → collapses ⇄ expands the rail
 *   · mobile (≤768px)  → opens the off-canvas drawer
 * (App.jsx decides which, based on viewport width.)
 */
export default function Header({ onToggleSidebar, mobileNavOpen = false }) {
  const { messages, clearChat } = useChat();
  const hasMessages = messages.length > 0;

  return (
    <header className="app-header">

      {/* Left: burger + mobile brand */}
      <div className="app-header-left">
        <button
          type="button"
          className="burger-btn"
          onClick={onToggleSidebar}
          aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-controls="app-sidebar"
          aria-expanded={mobileNavOpen}
        >
          <MenuIcon size={20} />
        </button>

        {/* Brand — shown only on mobile (CSS), where the
            sidebar and its logo are hidden off-canvas.   */}
        <div className="app-header-brand">
          <span className="app-header-brand-mark" aria-hidden="true">
            <AriaAvatar size={16} />
          </span>
          <span className="app-header-brand-name">ARIA</span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="app-header-right">
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