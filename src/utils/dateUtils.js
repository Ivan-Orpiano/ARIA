/**
 * Returns the current moment as an ISO-8601 string.
 * @returns {string}
 */
export function nowISO() {
  return new Date().toISOString();
}

/**
 * Formats a Date (or ISO string) to a short "HH:MM" display string.
 * @param {Date|string} value
 * @returns {string}  e.g. "14:07"
 */
export function formatTime(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en', {
    hour:   '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Returns a human-readable relative label:
 *   - "Today" / "Yesterday" / "Mon, 12 Jun" for older dates.
 * @param {Date|string} value
 * @returns {string}
 */
export function formatRelativeDay(value) {
  const d     = value instanceof Date ? value : new Date(value);
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day   = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff  = Math.round((today - day) / 86_400_000);

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    day:     'numeric',
    month:   'short',
  }).format(d);
}