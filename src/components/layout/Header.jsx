import React from 'react';
import { AriaAvatar, XIcon } from '../icons/Icons';
import { useChat } from '../../hooks/useChats';

export default function Header({ onToggleSidebar }) {
  const { messages, clearChat } = useChat();
  const hasMessages = messages.length > 0;

  return (
    <header className="app-header">



      {/* Right: status + clear */}
      <div className="app-header-right">

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
