import React, { useEffect, useRef, useState, useCallback } from 'react';

/* ── Suggestion data ─────────────────────────────────────── */
export const SUGGESTIONS = [
  { icon: '📧', text: 'Draft a professional email to reschedule a meeting' },
  { icon: '📋', text: "Summarize a document's key points for me" },
  { icon: '📅', text: 'Create a structured weekly schedule template' },
  { icon: '✍️', text: 'Help me write a Q3 performance review' },
  { icon: '🔍', text: 'Research the latest AI agent frameworks' },
  { icon: '💡', text: 'Brainstorm SaaS growth strategies for 2025' },
];

/* ── Orbit logo ──────────────────────────────────────────── */
function OrbitLogo() {
  return (
    <div style={{ position: 'relative', width: 110, height: 110 }}>
      <div style={{
        position:'absolute', inset:-6,
        borderRadius:'50%', border:'1px dashed rgba(0,200,255,0.08)',
      }} />
      <div style={{
        position:'absolute', inset:8,
        borderRadius:'50%', border:'1px solid rgba(0,245,160,0.11)',
      }} />
      <div style={{
        position:'absolute', inset:0, borderRadius:'50%',
        background:'linear-gradient(135deg,#00F5A0,#00C8FF)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:34, animation:'glow 3s ease-in-out infinite',
        boxShadow:'0 0 40px var(--acc-glow)',
      }}>✦</div>
      {/* Orbiting particles */}
      {[
        { anim:'orb1 4.2s linear infinite', size:8, color:'#00F5A0', shadow:'rgba(0,245,160,0.9)' },
        { anim:'orb2 6.5s linear infinite', size:6, color:'#00C8FF', shadow:'rgba(0,200,255,0.9)' },
        { anim:'orb3 9s   linear infinite', size:5, color:'#FF6B9D', shadow:'rgba(255,107,157,0.9)' },
      ].map((p, i) => (
        <div key={i} style={{
          position:'absolute', top:'50%', left:'50%',
          marginTop:-p.size/2, marginLeft:-p.size/2,
          animation:p.anim,
        }}>
          <div style={{
            width:p.size, height:p.size, borderRadius:'50%',
            background:p.color, position:'absolute',
            transform:'translate(-50%,-50%)',
            boxShadow:`0 0 ${p.size}px ${p.shadow}`,
          }} />
        </div>
      ))}
    </div>
  );
}

/* ── Welcome screen ──────────────────────────────────────── */
function WelcomeScreen({ onSuggestionClick }) {
  return (
    <div style={{
      flex:1, display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      gap:36, padding:'32px 20px',
      animation:'fadeIn 0.5s ease both',
    }}>
      {/* Logo + heading */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
        <OrbitLogo />
        <h1 style={{
          fontFamily:'var(--font-display)', fontSize:28, fontWeight:800,
          color:'var(--tx1)', letterSpacing:'-0.5px', textAlign:'center',
        }}>
          ARIA
        </h1>
        <p style={{
          fontSize:13, color:'var(--tx2)',
          textAlign:'center', maxWidth:320, lineHeight:1.65,
        }}>
          Your intelligent AI Secretary — draft, research, schedule, and analyze with ease.
        </p>
        <div style={{ display:'flex', gap:7, flexWrap:'wrap', justifyContent:'center' }}>
          {['✦ Online','⚡ Fast','🔒 Private'].map((s, i) => (
            <div key={s} style={{
              fontSize:10, color:'var(--tx3)', background:'var(--bg-el)',
              border:'1px solid var(--brd-mid)', borderRadius:'var(--r-full)',
              padding:'3px 10px', fontFamily:'var(--font-mono)',
              animation:`fadeIn ${0.5+i*0.1}s ease both`,
            }}>{s}</div>
          ))}
        </div>
      </div>

      {/* Suggestion chips */}
      <div style={{ width:'100%', maxWidth:580 }}>
        <p style={{
          fontSize:9, fontWeight:600, color:'var(--tx3)',
          fontFamily:'var(--font-display)', textTransform:'uppercase',
          letterSpacing:'0.1em', textAlign:'center', marginBottom:10,
        }}>
          Try asking
        </p>
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:7,
        }}>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={s.text}
              onClick={() => onSuggestionClick(s.text)}
              style={{
                padding:'10px 13px', background:'var(--bg-el)',
                border:'1px solid var(--brd-mid)', borderRadius:'var(--r-md)',
                cursor:'pointer', fontSize:12, color:'var(--tx2)',
                fontFamily:'var(--font-body)', textAlign:'left', lineHeight:1.4,
                display:'flex', alignItems:'flex-start', gap:9,
                transition:'all 0.18s ease',
                animation:'popIn 0.4s ease both',
                animationDelay:`${i * 0.06}s`, opacity:0,
                animationFillMode:'forwards',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--acc)';
                e.currentTarget.style.color = 'var(--tx1)';
                e.currentTarget.style.background = 'var(--acc-dim)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 14px var(--acc-glow)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--brd-mid)';
                e.currentTarget.style.color = 'var(--tx2)';
                e.currentTarget.style.background = 'var(--bg-el)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize:15, flexShrink:0, marginTop:1 }}>{s.icon}</span>
              <span>{s.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Typing indicator ────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:8,
      animation:'fadeInUp 0.3s ease both', marginBottom:12 }}>
      <div style={{
        width:26, height:26, borderRadius:'50%',
        background:'linear-gradient(135deg,#00F5A0,#00C8FF)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:11, flexShrink:0,
        boxShadow:'0 0 10px var(--acc-glow)',
      }}>✦</div>
      <div style={{
        padding:'12px 15px', background:'var(--bg-card)',
        border:'1px solid var(--brd-mid)',
        borderRadius:'4px 16px 16px 16px',
        display:'flex', gap:5, alignItems:'center',
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width:6, height:6, borderRadius:'50%',
            background:'var(--acc)',
            animation:`typingDot 1.4s ease-in-out infinite`,
            animationDelay:`${i * 0.18}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

/* ── Markdown-lite text renderer ─────────────────────────── */
function FormattedText({ text }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
      {text.split('\n').map((line, i) => {
        if (!line) return <div key={i} style={{ height:7 }} />;
        const bold = (s) => s.replace(/\*\*(.*?)\*\*/g, (_, m) =>
          `<span style="color:var(--tx1);font-weight:600">${m}</span>`
        );
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return (
            <div key={i} style={{ display:'flex', gap:7, marginTop:2 }}>
              <span style={{ color:'var(--acc)', flexShrink:0 }}>•</span>
              <span dangerouslySetInnerHTML={{ __html: bold(line.replace(/^[•\-] /,'')) }} />
            </div>
          );
        }
        return <div key={i} dangerouslySetInnerHTML={{ __html: bold(line) }} />;
      })}
    </div>
  );
}

/* ── Message bubble ──────────────────────────────────────── */
function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  return (
    <div
      style={{ marginBottom:12, animation:'fadeInUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        display:'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems:'flex-end', gap:8, position:'relative',
      }}>
        {/* AI avatar */}
        {!isUser && (
          <div style={{
            width:26, height:26, borderRadius:'50%',
            background:'linear-gradient(135deg,#00F5A0,#00C8FF)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:11, flexShrink:0, alignSelf:'flex-end',
            boxShadow:'0 0 10px var(--acc-glow)',
          }}>✦</div>
        )}

        {/* Bubble */}
        <div style={{ maxWidth:'70%', position:'relative' }}>
          <div style={{
            padding:'10px 15px',
            borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
            background: isUser
              ? 'linear-gradient(135deg,rgba(255,107,157,0.14),rgba(255,107,157,0.07))'
              : 'var(--bg-card)',
            border: isUser
              ? '1px solid rgba(255,107,157,0.22)'
              : '1px solid var(--brd-mid)',
            boxShadow: isUser
              ? '0 2px 12px var(--usr-glow)'
              : '0 2px 8px rgba(0,0,0,0.4)',
            fontSize:13, lineHeight:1.65,
            fontFamily:'var(--font-body)', color:'var(--tx1)',
          }}>
            {isUser
              ? <div>{message.content}</div>
              : <FormattedText text={message.content} />
            }
            {message.streaming && (
              <span style={{
                display:'inline-block', width:2, height:13,
                background:'var(--acc)', marginLeft:2,
                verticalAlign:'text-bottom',
                animation:'blink 0.75s ease-in-out infinite',
              }} />
            )}
            {/* File attachments */}
            {message.files?.length > 0 && (
              <div style={{
                display:'flex', flexWrap:'wrap', gap:5,
                marginTop:6, paddingTop:6,
                borderTop:'1px solid var(--brd-sub)',
              }}>
                {message.files.map((f, i) => (
                  <div key={i} style={{
                    display:'inline-flex', alignItems:'center', gap:4,
                    padding:'2px 8px', background:'var(--bg-el)',
                    border:'1px solid var(--brd-mid)', borderRadius:5,
                    fontSize:10, color:'var(--tx2)', fontFamily:'var(--font-mono)',
                  }}>
                    📎 {f.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hover actions */}
          <div style={{
            position:'absolute', bottom:-22,
            [isUser ? 'right' : 'left']:0,
            display:'flex', gap:3, zIndex:5,
            opacity: hovered ? 1 : 0,
            transition:'opacity 0.15s ease',
          }}>
            <button
              onClick={handleCopy}
              style={{
                background:'var(--bg-surf)', border:'1px solid var(--brd-mid)',
                borderRadius:4, cursor:'pointer', color:'var(--tx3)',
                fontSize:10, padding:'2px 7px', fontFamily:'var(--font-mono)',
                transition:'all 0.12s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--bg-el)'; e.currentTarget.style.color='var(--tx1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='var(--bg-surf)'; e.currentTarget.style.color='var(--tx3)'; }}
            >
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
          </div>
        </div>

        {/* Timestamp on hover */}
        <div style={{
          fontSize:9, color:'var(--tx3)', fontFamily:'var(--font-mono)',
          alignSelf:'flex-end', flexShrink:0,
          opacity: hovered ? 1 : 0, transition:'opacity 0.2s ease',
        }}>
          {new Intl.DateTimeFormat('en',{ hour:'2-digit', minute:'2-digit' }).format(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

/* ── Aurora background ───────────────────────────────────── */
function Aurora() {
  const orbs = [
    { top:'-8%', left:'-4%', w:520, h:520, color:'rgba(0,245,160,0.07)', dur:'18s', delay:'0s', dir:'' },
    { bottom:'-12%', right:'-6%', w:600, h:600, color:'rgba(0,150,255,0.06)', dur:'22s', delay:'-9s', dir:'reverse' },
    { top:'35%', left:'25%', w:360, h:360, color:'rgba(90,60,200,0.04)', dur:'28s', delay:'-14s', dir:'' },
  ];
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
      {orbs.map((o, i) => (
        <div key={i} style={{
          position:'absolute', borderRadius:'50%',
          width:o.w, height:o.h, filter:'blur(50px)',
          top:o.top, left:o.left, bottom:o.bottom, right:o.right,
          background:`radial-gradient(circle,${o.color} 0%,transparent 70%)`,
          animation:`aurora ${o.dur} ease-in-out infinite ${o.dir}`,
          animationDelay:o.delay,
        }} />
      ))}
    </div>
  );
}

/* ── Chat window (default export) ───────────────────────── */
const ChatWindow = ({ messages, isLoading, onSuggestionClick }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0;

  return (
    <>
      <Aurora />
      <div style={{
        flex:1, overflowY:'auto', overflowX:'hidden',
        padding:'20px 16px 28px',
        display:'flex', flexDirection:'column',
        scrollBehavior:'smooth', position:'relative', zIndex:1,
      }}>
        {isEmpty ? (
          <WelcomeScreen onSuggestionClick={onSuggestionClick} />
        ) : (
          <>
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={endRef} style={{ height:0 }} />
          </>
        )}
      </div>
    </>
  );
};

export default ChatWindow;