import React from 'react';

/**
 * @param {{ checked: boolean, onChange: (v:boolean)=>void, label: string, desc?: string }} props
 */
export default function ToggleSwitch({ checked, onChange, label, desc }) {
  return (
    <label className="toggle-row">
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className="toggle-label">{label}</span>
        {desc && (
          <span style={{
            fontSize: 11, color: 'var(--text-hint)',
            fontFamily: 'var(--font-body)', lineHeight: 1.4,
          }}>
            {desc}
          </span>
        )}
      </span>
      <span className={`toggle-switch${checked ? ' on' : ''}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={label}
        />
        <span className="toggle-knob" aria-hidden="true" />
      </span>
    </label>
  );
}
