import React from 'react';

/* ── Base wrapper: keeps every icon visually consistent ─────────────
   24x24 viewBox, currentColor stroke, rounded caps/joins.            */
function IconBase({ size = 18, strokeWidth = 1.8, className, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function MenuIcon(props) {
  return (
    <IconBase {...props}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </IconBase>
  );
}

export function ChatIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </IconBase>
  );
}

export function FilesIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </IconBase>
  );
}

export function CalendarIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </IconBase>
  );
}

export function MailIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </IconBase>
  );
}

export function SettingsIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </IconBase>
  );
}

export function SparkleIcon(props) {
  return (
    <IconBase {...props} fill="currentColor" stroke="none">
      <path d="M12 2l1.8 5.6L19.4 9l-5.6 1.8L12 16.4l-1.8-5.6L4.6 9l5.6-1.4z" />
    </IconBase>
  );
}

/* ── ARIA girl-robot avatar ───────────────────────────────────────────
   Scales cleanly from 14 px (header) to 36 px (welcome hero).
   Uses currentColor so it is white on the gradient buttons and cyan on
   light surfaces.                                                       */
export function AriaAvatar({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Antenna stem */}
      <line x1="12" y1="5" x2="12" y2="2.8"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />

      {/* Bow — left wing */}
      <path d="M12 2.5 L9 1 L9 4 Z" fill="currentColor" />
      {/* Bow — right wing */}
      <path d="M12 2.5 L15 1 L15 4 Z" fill="currentColor" />
      {/* Bow — center knot */}
      <circle cx="12" cy="2.5" r="1.1" fill="currentColor" />

      {/* Head */}
      <rect x="3.5" y="5" width="17" height="14.5" rx="4"
        stroke="currentColor" strokeWidth="1.8" />

      {/* Left ear panel */}
      <rect x="1.5" y="8.5" width="2" height="5" rx="1"
        stroke="currentColor" strokeWidth="1.6" />
      {/* Right ear panel */}
      <rect x="20.5" y="8.5" width="2" height="5" rx="1"
        stroke="currentColor" strokeWidth="1.6" />

      {/* Left eye */}
      <circle cx="8.5" cy="10.5" r="2"
        stroke="currentColor" strokeWidth="1.6" />
      {/* Left pupil */}
      <circle cx="8.5" cy="10.5" r="0.85" fill="currentColor" />

      {/* Right eye */}
      <circle cx="15.5" cy="10.5" r="2"
        stroke="currentColor" strokeWidth="1.6" />
      {/* Right pupil */}
      <circle cx="15.5" cy="10.5" r="0.85" fill="currentColor" />

      {/* Blush cheeks */}
      <circle cx="5.5"  cy="13.5" r="1.3" fill="currentColor" fillOpacity="0.28" />
      <circle cx="18.5" cy="13.5" r="1.3" fill="currentColor" fillOpacity="0.28" />

      {/* Smile */}
      <path d="M9 14 Q12 16.8 15 14"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ── ARIA brand mark — geometric "A" with three neural nodes ──────────
   Scales cleanly from 14 px (header chip) to 36 px (welcome hero).
   Use currentColor so it adapts to any colored background.             */
export function AriaLogo({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Left leg */}
      <path d="M3.5 21.5 L12 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {/* Right leg */}
      <path d="M20.5 21.5 L12 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {/* Crossbar */}
      <path d="M7 14 L17 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {/* Apex node — the "mind" of ARIA */}
      <circle cx="12" cy="3" r="2.4" fill="currentColor" />
      {/* Crossbar end nodes — neural connections */}
      <circle cx="7"  cy="14" r="1.7" fill="currentColor" />
      <circle cx="17" cy="14" r="1.7" fill="currentColor" />
    </svg>
  );
}

export function XIcon(props) {
  return (
    <IconBase {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </IconBase>
  );
}

export function TrashIcon(props) {
  return (
    <IconBase {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </IconBase>
  );
}

export function PaperclipIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </IconBase>
  );
}

export function SendIcon(props) {
  return (
    <IconBase {...props}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </IconBase>
  );
}

export function SpinnerIcon(props) {
  return (
    <IconBase {...props} strokeWidth={2.4}>
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </IconBase>
  );
}

/* ── Added icons — replace former emoji glyphs ─────────────────────── */

export function FileTextIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </IconBase>
  );
}

export function SearchIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </IconBase>
  );
}

export function ListChecksIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M3 6l2 2 3-3" />
      <path d="M3 14l2 2 3-3" />
      <line x1="12" y1="5" x2="21" y2="5" />
      <line x1="12" y1="13" x2="21" y2="13" />
      <line x1="12" y1="20" x2="21" y2="20" />
    </IconBase>
  );
}

export function BarChartIcon(props) {
  return (
    <IconBase {...props}>
      <line x1="6" y1="20" x2="6" y2="12" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="18" y1="20" x2="18" y2="14" />
    </IconBase>
  );
}

export function ZapIcon(props) {
  return (
    <IconBase {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </IconBase>
  );
}

export function MessageSquareIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </IconBase>
  );
}

export function LockIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </IconBase>
  );
}

export function CopyIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </IconBase>
  );
}

export function CheckIcon(props) {
  return (
    <IconBase {...props}>
      <polyline points="20 6 9 17 4 12" />
    </IconBase>
  );
}

export function CheckCheckIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M2 12l5 5L17 7" />
      <path d="M12 16l1 1 9-9" />
    </IconBase>
  );
}

export function ArrowRightIcon(props) {
  return (
    <IconBase {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </IconBase>
  );
}

export function AlertTriangleIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </IconBase>
  );
}

export function MoonIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </IconBase>
  );
}

export function SunIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </IconBase>
  );
}