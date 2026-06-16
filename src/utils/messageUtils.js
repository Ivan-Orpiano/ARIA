let _seq = 0;

/**
 * Generates a unique, sequential message ID.
 * @param {'user'|'assistant'|'error'} role
 * @returns {string}
 */
export function generateMessageId(role = 'msg') {
  return `${role}_${Date.now()}_${++_seq}`;
}

/**
 * Formats a timestamp for the message meta bar.
 * Delegates to Intl for locale-aware output.
 * @param {Date|string} value
 * @returns {string}
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
 * Strips leading markdown heading characters for display purposes.
 * @param {string} text
 * @returns {string}
 */
export function stripHeadings(text) {
  return text.replace(/^#{1,6}\s+/gm, '');
}

/**
 * Counts words in a string.
 * @param {string} text
 * @returns {number}
 */
export function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}