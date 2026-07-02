import React from 'react';
import Avatar from '../ui/Avatar';

export default function TypingIndicator() {
  return (
    <div
      className="typing-row"
      role="status"
      aria-label="ARIA is thinking"
      aria-live="polite"
    >
      <Avatar role="assistant" size={32} />

      <div className="typing-bubble">
        <span className="msg-accent-rule" aria-hidden="true" />

        <span className="typing-dot" aria-hidden="true" />
        <span className="typing-dot" aria-hidden="true" />
        <span className="typing-dot" aria-hidden="true" />

        <span className="typing-text">thinking…</span>
      </div>
    </div>
  );
}