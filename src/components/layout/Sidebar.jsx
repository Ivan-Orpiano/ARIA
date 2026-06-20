import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ChatIcon,
  FilesIcon,
  CalendarIcon,
  MailIcon,
  SettingsIcon,
  SparkleIcon,
  XIcon,
} from '../icons/Icons';

const NAV_ITEMS = [
  { to: '/',         label: 'Chat',     icon: ChatIcon,     end: true },
  { to: '/files',     label: 'Files',    icon: FilesIcon },
  { to: '/calendar',  label: 'Calendar', icon: CalendarIcon },
  { to: '/email',     label: 'Email',    icon: MailIcon },
  { to: '/settings',  label: 'Settings', icon: SettingsIcon },
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
      <div className="sidebar-header">
        <div className="sidebar-logo" aria-hidden="true">
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

      <nav className="sidebar-body" aria-label="Main menu">
        <div className="sidebar-section-label">Navigation</div>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onCloseMobile}
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-pill">
          <span className="sidebar-pill-dot" aria-hidden="true" />
          Webhook active
        </div>
        <div className="sidebar-webhook-info">n8n · GET · fee2e2ba…</div>
      </div>
    </aside>
  );
}
