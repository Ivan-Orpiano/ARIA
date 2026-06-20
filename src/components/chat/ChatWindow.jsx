import React, { useEffect, useRef } from 'react';
import WelcomeScreen   from './WelcomeScreen';
import MessageBubble   from './MessageBubble';
import TypingIndicator from './TypingIndicator';

/* ── Ambient background ─────────────────────────────────────────────── */
function Aurora() {
  const orbs = [
    { top: '-10%',   left: '-6%',   w: 580, h: 580, color: 'rgba(0,245,160,0.08)',  dur: '20s', delay: '0s',    dir: '' },
    { bottom: '-14%',right: '-8%',  w: 660, h: 660, color: 'rgba(0,150,255,0.07)',  dur: '25s', delay: '-10s',  dir: 'reverse' },
    { top: '30%',    left: '22%',   w: 400, h: 400, color: 'rgba(90,50,210,0.05)',  dur: '30s', delay: '-16s',  dir: '' },
    { top: '10%',    right: '10%',  w: 320, h: 320, color: 'rgba(168,85,247,0.06)', dur: '18s', delay: '-8s',   dir: 'reverse' },
    { bottom: '20%', left: '5%',    w: 280, h: 280, color: 'rgba(0,245,160,0.05)',  dur: '22s', delay: '-4s',   dir: '' },
  ];

  return (
    <div className="aurora" aria-hidden="true">
      {orbs.map((o, i) => (
        <div
          key={i}
          className="aurora-orb"
          style={{
            width:  o.w,
            height: o.h,
            top:    o.top,    left:   o.left,
            bottom: o.bottom, right:  o.right,
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            filter:     'blur(80px)',
            animation:  `aurora ${o.dur} ease-in-out infinite ${o.dir}`,
            animationDelay: o.delay,
          }}
        />
      ))}
    </div>
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
