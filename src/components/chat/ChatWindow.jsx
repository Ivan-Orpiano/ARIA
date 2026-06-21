import React, { useEffect, useRef } from 'react';
import WelcomeScreen   from './WelcomeScreen';
import MessageBubble   from './MessageBubble';
import TypingIndicator from './TypingIndicator';

/* ── Ambient background ─────────────────────────────────────────────── */
function Aurora() {
  const orbs = [
    { top: '-12%',   left: '-8%',   w: 620, h: 620, color: 'rgba(0,245,160,0.09)',  dur: '22s', delay: '0s',    dir: '' },
    { bottom: '-16%',right: '-10%', w: 700, h: 700, color: 'rgba(0,180,255,0.08)',  dur: '28s', delay: '-12s',  dir: 'reverse' },
    { top: '28%',    left: '20%',   w: 440, h: 440, color: 'rgba(90,40,220,0.06)',  dur: '34s', delay: '-18s',  dir: '' },
    { top: '8%',     right: '8%',   w: 360, h: 360, color: 'rgba(180,110,248,0.07)',dur: '20s', delay: '-9s',   dir: 'reverse' },
    { bottom: '18%', left: '4%',    w: 300, h: 300, color: 'rgba(0,245,160,0.055)', dur: '24s', delay: '-5s',   dir: '' },
    { top: '50%',    right: '20%',  w: 240, h: 240, color: 'rgba(0,212,255,0.05)',  dur: '16s', delay: '-7s',   dir: 'reverse' },
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