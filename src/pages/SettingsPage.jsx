import React, { useState } from 'react';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { SettingsIcon } from '../components/icons/Icons';

const SETTINGS_GROUPS = [
  {
    label: 'Notifications',
    items: [
      { key: 'notifications', label: 'Desktop notifications',  desc: 'Receive alerts when ARIA replies', value: true },
      { key: 'sound',         label: 'Sound on new message',    desc: 'Play a tone when a response arrives', value: false },
    ],
  },
  {
    label: 'Interface',
    items: [
      { key: 'enterToSend', label: 'Send with Enter key',      desc: 'Use Shift+Enter to insert a new line', value: true },
      { key: 'compact',     label: 'Compact message bubbles',  desc: 'Reduce spacing between messages', value: false },
    ],
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState(
    SETTINGS_GROUPS.flatMap((g) => g.items)
  );

  const getValue = (key) => settings.find((s) => s.key === key)?.value ?? false;
  const update   = (key, value) =>
    setSettings((prev) => prev.map((item) => (item.key === key ? { ...item, value } : item)));

  return (
    <div className="page-container">
      <div style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Page heading */}
        <div style={{
          animation: 'fadeInUp 0.32s ease both',
          marginBottom: 4,
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24, fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            marginBottom: 6,
          }}>
            Preferences
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Manage how ARIA looks and behaves.
          </p>
        </div>

        {/* Settings groups */}
        {SETTINGS_GROUPS.map((group, gi) => (
          <div
            key={group.label}
            className="settings-panel"
            style={{ animationDelay: `${gi * 0.06}s` }}
          >
            {/* Group header */}
            <div className="settings-panel-header">
              <SettingsIcon size={18} />
              <h2>{group.label}</h2>
            </div>

            {/* Toggles */}
            <div className="settings-list">
              {group.items.map((item) => (
                <ToggleSwitch
                  key={item.key}
                  label={item.label}
                  desc={item.desc}
                  checked={getValue(item.key)}
                  onChange={(value) => update(item.key, value)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Session notice */}
        <p className="settings-hint" style={{
          fontSize: 13, color: 'var(--text-muted)',
          lineHeight: 1.65,
          padding: '12px 16px',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          animation: 'fadeInUp 0.36s ease 0.12s both',
        }}>
          These preferences are stored for this session only. Account-wide settings sync is coming soon.
        </p>
      </div>
    </div>
  );
}

