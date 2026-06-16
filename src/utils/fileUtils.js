/**
 * fileUtils.js
 * Helpers for file type detection, metadata, and size formatting.
 */

/** Maximum attachment size — 10 MB. */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

/** Allowed MIME types. */
export const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'text/plain', 'text/csv', 'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/json',
]);

const FILE_META_MAP = [
  { test: (t) => t.startsWith('image/'),          icon: '🖼',  label: 'Image',       color: '#00C8FF' },
  { test: (t) => t === 'application/pdf',          icon: '📄',  label: 'PDF',         color: '#FF6B9D' },
  { test: (t) => t.includes('spreadsheet') || t.includes('excel') || t === 'text/csv',
                                                   icon: '📊',  label: 'Spreadsheet', color: '#00F5A0' },
  { test: (t) => t.includes('word') || t.includes('document'),
                                                   icon: '📝',  label: 'Document',    color: '#FFB800' },
  { test: (t) => t === 'application/json',         icon: '{ }', label: 'JSON',        color: '#A78BFA' },
  { test: (t) => t.startsWith('text/'),            icon: '📃',  label: 'Text',        color: '#8892A8' },
];

const DEFAULT_META = { icon: '📎', label: 'File', color: '#8892A8' };

/**
 * Returns display metadata for a file or file-preview object.
 * @param {{ type?: string, name?: string }} file
 * @returns {{ icon: string, label: string, color: string }}
 */
export function getFileMeta(file) {
  const mime = file?.type ?? '';
  return FILE_META_MAP.find((m) => m.test(mime)) ?? DEFAULT_META;
}

/**
 * Formats a byte count to a human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes == null || bytes < 0) return '—';
  if (bytes < 1024)          return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validates a File object. Returns an error string or null.
 * @param {File} file
 * @returns {string|null}
 */
export function validateFile(file) {
  if (file.size > MAX_FILE_BYTES) {
    return `"${file.name}" exceeds the 10 MB limit (${formatFileSize(file.size)}).`;
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return `"${file.name}" is not a supported file type.`;
  }
  return null;
}

/**
 * Builds a preview object from a File.
 * Image files get a data-URL preview; others get null.
 * @param {File} file
 * @returns {Promise<{ id: string, name: string, type: string, size: number, preview: string|null }>}
 */
export async function buildFilePreview(file) {
  const id      = `fp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const isImage = file.type.startsWith('image/');

  if (isImage) {
    const preview = await new Promise((resolve) => {
      const reader  = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
    return { id, name: file.name, type: file.type, size: file.size, preview };
  }

  return { id, name: file.name, type: file.type, size: file.size, preview: null };
}