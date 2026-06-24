import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ChatIcon, FilesIcon, CalendarIcon,
  MailIcon, SettingsIcon, SparkleIcon, XIcon,
} from '../icons/Icons';

const NAV_ITEMS = [
  { to: '/',         label: 'Chat',     icon: ChatIcon,     end: true },
  { to: '/files',    label: 'Files',    icon: FilesIcon },
  { to: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { to: '/email',    label: 'Email',    icon: MailIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

/**
 * @param {{
 *   open:          boolean,
 *   mobileOpen:    boolean,
 *   onCloseMobile: () => void,
 * }} props
 */
export default function Sidebar({ open, mobileOpen, onCloseMobile }) {
  const className = [
    'sidebar',
    open ? '' : 'collapsed',
    mobileOpen ? 'mobile-open' : '',
  ].filter(Boolean).join(' ');

  return (
    <aside className={className} aria-label="Primary navigation">

      {/* ── Header ─────────────────────────────── */}
      <div className="sidebar-header">
        <div
          className="sidebar-logo"
          aria-hidden="true"
          style={{ boxShadow: '0 0 0 1.5px rgba(0,245,160,0.22), 0 0 22px rgba(0,245,160,0.20)' }}
        >
          <SparkleIcon size={16} />
        </div>

        <div className="sidebar-title-group">
          <div className="sidebar-title">ARIA</div>
          <div className="sidebar-subtitle">AI Secretary</div>
        </div>

        <button
          type="button"
          className="sidebar-close-btn"
          onClick={onCloseMobile}
          aria-label="Close navigation"
        >
          <XIcon size={16} />
        </button>
      </div>

      {/* ── Nav ────────────────────────────────── */}
      <nav className="sidebar-body" aria-label="Main menu">
        <div className="sidebar-section-label">Navigation</div>

        {NAV_ITEMS.map(({ to, label, icon: Icon, end }, idx) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onCloseMobile}
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            <span style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 22, height: 22, flexShrink: 0,
              opacity: 0,
              animation: `slideInLeft 0.32s ease ${0.05 + idx * 0.042}s both`,
            }}>
              <Icon size={17} />
            </span>
            <span style={{
              opacity: 0,
              animation: `slideInLeft 0.32s ease ${0.07 + idx * 0.042}s both`,
            }}>
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ─────────────────────────────── */}
      <div className="sidebar-footer">
        <div className="sidebar-pill">
          <span className="sidebar-pill-dot" aria-hidden="true" />
          Webhook active
        </div>

        <div className="sidebar-webhook-info">
          <div style={{
            color: 'var(--text-muted)', fontSize: 9,
            textTransform: 'uppercase', letterSpacing: '0.10em',
            marginBottom: 4,
          }}>
            n8n · GET endpoint
          </div>
          fee2e2ba-a3c1-4d…
        </div>
      </div>
    </aside>
  );
}
