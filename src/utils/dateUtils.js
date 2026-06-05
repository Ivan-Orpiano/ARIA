/**
 * dateUtils.js
 * ─────────────────────────────────────────────────────────────
 * Date and time formatting helpers for message timestamps.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Formats a date as "HH:MM AM/PM".
 * @param {string|Date} date
 * @returns {string}
 */
export function formatTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats a date as "Mon DD, YYYY".
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Returns a relative time string:
 *   < 1 min  → "just now"
 *   < 1 hr   → "Xm ago"
 *   same day → "HH:MM AM/PM"
 *   older    → "Mon DD"
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const d   = new Date(date);
  const diffMs  = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr  = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMs  < 0)      return formatTime(date);          // future timestamp
  if (diffMs  < 60000)  return 'just now';                // < 1 minute
  if (diffMin < 60)     return `${diffMin}m ago`;         // < 1 hour
  if (diffHr  < 24)     return formatTime(date);          // same day
  if (diffDay < 7)      return `${diffDay}d ago`;         // within a week
  return formatDate(date);                                  // older
}

/**
 * Returns an ISO 8601 string for right now.
 * @returns {string}
 */
export function nowISO() {
  return new Date().toISOString();
}

/**
 * Returns a short "Today", "Yesterday", or date label
 * for use as chat day separators.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDayLabel(date) {
  const d   = new Date(date);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === now.toDateString())       return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return formatDate(date);
}