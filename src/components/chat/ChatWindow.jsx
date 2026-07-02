import React, { useEffect, useRef } from 'react';
import WelcomeScreen   from './WelcomeScreen';
import MessageBubble   from './MessageBubble';
import TypingIndicator from './TypingIndicator';


function Aurora() {
  return <div className="aurora" aria-hidden="true" />;
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