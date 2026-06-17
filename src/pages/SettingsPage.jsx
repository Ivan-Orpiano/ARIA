import React, { useState } from 'react';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { SettingsIcon } from '../components/icons/Icons';

const DEFAULT_SETTINGS = [
  { key: 'notifications', label: 'Desktop notifications',  value: true },
  { key: 'sound',         label: 'Sound on new message',    value: false },
  { key: 'enterToSend',   label: 'Send with Enter key',      value: true },
  { key: 'compact',       label: 'Compact message bubbles',  value: false },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const update = (key, value) =>
    setSettings((prev) => prev.map((item) => (item.key === key ? { ...item, value } : item)));

  return (
    <div className="page-container">
      <div className="settings-panel">
        <div className="settings-panel-header">
          <SettingsIcon size={19} />
          <h2>Preferences</h2>
        </div>

        <div className="settings-list">
          {settings.map((item) => (
            <ToggleSwitch
              key={item.key}
              label={item.label}
              checked={item.value}
              onChange={(value) => update(item.key, value)}
            />
          ))}
        </div>

        <p className="settings-hint">
          These preferences are stored for this session only. Account-wide settings sync is coming soon.
        </p>
      </div>
    </div>
  );
}