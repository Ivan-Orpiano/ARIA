import React, { useEffect, useRef } from 'react';
import WelcomeScreen   from './WelcomeScreen';
import MessageBubble   from './MessageBubble';
import TypingIndicator from './TypingIndicator';

/* ── Ambient background ─────────────────────────────────────────────
   Minimal, static wash — a single soft accent tint anchored top-left
   plus a neutral base, so content reads cleanly on a quiet canvas.    */
function Aurora() {
  return (
    <div
      className="aurora"
      aria-hidden="true"
      style={{
        background:
          'radial-gradient(900px 600px at 0% -10%, rgba(79,70,229,0.05) 0%, transparent 60%),' +
          'radial-gradient(700px 500px at 100% 110%, rgba(99,102,241,0.04) 0%, transparent 60%)',
      }}
    />
  );
}

/**
 * @param {{
 *   messages: Array,
 *   isLoading: boolean,
 *   onSuggestionSelect: (text: string) => void,
 * }} props
 */

export default function ChatWindow({ messages, isLoading, onSuggestionSelect }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0;

  return (
    <>
      <Aurora />
      <div className="chat-scroll">
        {isEmpty ? (
          <WelcomeScreen onSelectSuggestion={onSuggestionSelect} />
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={endRef} style={{ height: 0 }} />
          </>
        )}
      </div>
    </>
  );
}