import React from 'react';
import { XIcon } from '../icons/Icons';
import { useChat } from '../../hooks/useChats';

/**
 * The sidebar toggle now lives on the sidebar's own logo, so the
 * header only carries page-level actions on the right.
 */
export default function Header() {
  const { messages, clearChat } = useChat();
  const hasMessages = messages.length > 0;

  return (
    <header className="app-header">

      {/* Left slot kept so `space-between` pins actions to the right. */}
      <div className="app-header-left" />

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