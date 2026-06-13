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
