import React, { useEffect, useState } from 'react';
import { AriaAvatar } from '../icons/Icons';

/* ── Splash screen ──────────────────────────────────────────────────
   Shown once on app boot, above the layout while it mounts beneath.
   Timeline: intro/hold → fade-out → onDone() unmounts it.
   Motion styles live in globals.css ("SPLASH SCREEN" section) and are
   silenced by the global prefers-reduced-motion rule.                 */

const HOLD_MS = 2000;   // logo + wordmark intro, then a short hold
const EXIT_MS = 600;    // matches splashOut duration in globals.css

const WORDMARK = 'ARIA';

export default function SplashScreen({ onDone }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const hold = setTimeout(() => setExiting(true), HOLD_MS);
    return () => clearTimeout(hold);
  }, []);

  useEffect(() => {
    if (!exiting) return undefined;
    const exit = setTimeout(() => onDone?.(), EXIT_MS);
    return () => clearTimeout(exit);
  }, [exiting, onDone]);

  return (
    <div
      className={`splash${exiting ? ' splash-exit' : ''}`}
      role="status"
      aria-label="ARIA is starting"
    >
      <div className="splash-body" aria-hidden="true">

        {/* Logo mark — same glow / ring / core trio as the welcome hero */}
        <div className="splash-logo">
          <div className="splash-logo-glow" />
          <div className="splash-orbit" />
          <div className="splash-logo-ring" />
          <div className="splash-logo-core">
            <AriaAvatar size={40} />
          </div>
        </div>

        {/* Wordmark — staggered letter rise */}
        <div className="splash-wordmark">
          {WORDMARK.split('').map((letter, i) => (
            <span key={i} style={{ animationDelay: `${0.42 + i * 0.07}s` }}>
              {letter}
            </span>
          ))}
        </div>

        <p className="splash-tagline">AI Secretary</p>

        {/* Indeterminate progress sweep */}
        <div className="splash-progress">
          <div className="splash-progress-fill" />
        </div>

      </div>
    </div>
  );
}
