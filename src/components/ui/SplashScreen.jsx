import React, { useEffect, useState } from 'react';
import { AriaAvatar } from '../icons/Icons';

/* ── Splash screen ──────────────────────────────────────────────────
   Shown once on app boot, above the layout while it mounts beneath.
   A vault door guards the brand: the combination wheel spins, the
   locking bolts retract, the door swings open and ARIA rises out of
   the lit chamber — a 3s choreography over an ambient animated
   backdrop (drifting glow, panning grid, rising motes).
   Timeline: vault choreography (HOLD_MS) → fade-out → onDone().
   Motion styles live in globals.css ("SPLASH SCREEN" section) and are
   silenced by the global prefers-reduced-motion rule.                 */

const HOLD_MS = 3000;   // full vault sequence: dial → unlock → open → reveal
const EXIT_MS = 600;    // covers splashOut duration in globals.css

const WORDMARK = 'ARIA';

// Eight locking bolts around the door edge; each gets its position
// angle and stagger index as CSS custom props.
const BOLTS = Array.from({ length: 8 }, (_, i) => i);

// Ambient motes: [left %, negative delay s, duration s, size px].
// Negative delays scatter them mid-flight so the field is alive at once.
const PARTICLES = [
  [6,  -0.4, 7.5, 3], [14, -2.1, 9.0, 2], [23, -4.4, 8.0, 3],
  [31, -1.2, 10.5, 2], [40, -3.6, 7.0, 2], [49, -0.8, 9.5, 3],
  [58, -2.8, 8.5, 2], [66, -5.0, 7.5, 3], [75, -1.8, 10.0, 2],
  [83, -3.2, 8.0, 3], [91, -0.6, 9.0, 2], [96, -4.1, 7.0, 2],
];

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
      {/* Ambient backdrop — drifting glow blobs, panning grid, motes */}
      <div className="splash-bg" aria-hidden="true">
        <div className="splash-bg-glow splash-bg-glow-a" />
        <div className="splash-bg-glow splash-bg-glow-b" />
        <div className="splash-bg-gridwrap">
          <div className="splash-bg-grid" />
        </div>
        {PARTICLES.map(([x, delay, duration, size], i) => (
          <span
            key={i}
            className="splash-bg-particle"
            style={{
              left: `${x}%`,
              width: size,
              height: size,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        ))}
      </div>

      {/* Light burst the moment the door swings open */}
      <div className="splash-flash" aria-hidden="true" />

      <div className="splash-body" aria-hidden="true">

        {/* Vault — frame + lit chamber beneath, door on top.
            The door carries the rim rivets, tick dial, locking bolts
            and the combination wheel; it swings open on its hinge. */}
        <div className="splash-vault">
          <div className="splash-vault-glow" />
          <div className="splash-vault-frame" />

          <div className="splash-vault-chamber">
            <div className="splash-vault-logo">
              <AriaAvatar size={42} />
            </div>
          </div>

          <div className="splash-vault-ripple" />
          <div className="splash-vault-ripple splash-vault-ripple-late" />

          <div className="splash-vault-door">
            <div className="splash-vault-rim" />
            <div className="splash-vault-dial" />
            {BOLTS.map((i) => (
              <span
                key={i}
                className="splash-vault-bolt"
                style={{ '--bolt-angle': `${i * 45}deg`, '--bolt-i': i }}
              />
            ))}
            <div className="splash-vault-wheel">
              <span className="splash-vault-spoke" />
              <span className="splash-vault-spoke" />
              <span className="splash-vault-spoke" />
              <span className="splash-vault-hub" />
            </div>
          </div>
        </div>

        {/* Wordmark — letters stamp in once the door is open */}
        <div className="splash-wordmark">
          {WORDMARK.split('').map((letter, i) => (
            <span key={i} style={{ animationDelay: `${2.08 + i * 0.07}s` }}>
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
