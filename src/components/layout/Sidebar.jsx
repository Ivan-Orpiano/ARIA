import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ChatIcon, FilesIcon, CalendarIcon,
  MailIcon, SettingsIcon, AriaAvatar, XIcon,
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
 *   onToggle:      () => void,
 *   onCloseMobile: () => void,
 * }} props
 *
 * The logo is the single sidebar toggle control:
 *   · desktop / tablet → collapses ⇄ expands the rail
 *   · mobile (≤768px)  → closes the off-canvas drawer
 * (App.jsx decides which, based on viewport width.)
 */
export default function Sidebar({ open, mobileOpen, onToggle, onCloseMobile }) {
  const className = [
    'sidebar',
    open ? '' : 'collapsed',
    mobileOpen ? 'mobile-open' : '',
  ].filter(Boolean).join(' ');

  return (
    <aside id="app-sidebar" className={className} aria-label="Primary navigation">

      {/* ── Header ─────────────────────────────── */}
      <div className="sidebar-header">
        <button
          type="button"
          className="sidebar-logo"
          onClick={onToggle}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Toggle navigation menu'}
          aria-controls="app-sidebar"
          aria-expanded={mobileOpen}
          title="Toggle navigation"
        >
          <AriaAvatar size={20} />
        </button>

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
          <XIcon size={18} />
        </button>
      </div>

      {/* ── Nav ────────────────────────────────── */}
      <nav className="sidebar-body" aria-label="Main menu">
        <div className="sidebar-section-label">Services</div>

        {NAV_ITEMS.map(({ to, label, icon: Icon, end }, idx) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onCloseMobile}
            title={label}
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            <span
              aria-hidden="true"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 22, height: 22, flexShrink: 0,
                opacity: 0,
                animation: `slideInLeft 0.3s ease ${0.05 + idx * 0.042}s both`,
              }}
            >
              <Icon size={18} />
            </span>
            <span
              className="sidebar-item-label"
              style={{
                opacity: 0,
                animation: `slideInLeft 0.3s ease ${0.07 + idx * 0.042}s both`,
              }}
            >
              {label}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}