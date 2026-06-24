import React from 'react';

/**
 * @param {{
 *   icon:        React.ReactNode,
 *   title:       string,
 *   description: string,
 *   actionLabel?: string,
 *   onAction?:    () => void,
 * }} props
 */
export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-description">{description}</p>
      {actionLabel && (
        <button
          type="button"
          className="primary-btn"
          onClick={onAction}
          style={{ marginTop: 4 }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
