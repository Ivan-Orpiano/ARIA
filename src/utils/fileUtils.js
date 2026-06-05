
export const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

/** Maximum file size: 10 MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Maximum number of files per message */
export const MAX_FILE_COUNT = 5;

/**
 * Returns a human-readable file size string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Returns an emoji icon for a given MIME type.
 * @param {string} mimeType
 * @returns {string}
 */
export function getFileIcon(mimeType) {
  if (!mimeType) return '📎';
  if (mimeType.startsWith('image/'))       return '🖼️';
  if (mimeType === 'application/pdf')      return '📄';
  if (mimeType.includes('word'))           return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType === 'text/csv') return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📑';
  if (mimeType.startsWith('text/'))        return '📃';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '🗜️';
  return '📎';
}

/**
 * Returns a short, human-readable label for a MIME type.
 * @param {string} mimeType
 * @returns {string}
 */
export function getFileTypeLabel(mimeType) {
  if (!mimeType) return 'File';
  if (mimeType === 'image/jpeg')          return 'JPEG';
  if (mimeType === 'image/png')           return 'PNG';
  if (mimeType === 'image/gif')           return 'GIF';
  if (mimeType === 'image/webp')          return 'WebP';
  if (mimeType === 'application/pdf')     return 'PDF';
  if (mimeType === 'text/plain')          return 'TXT';
  if (mimeType === 'text/csv')            return 'CSV';
  if (mimeType.includes('word'))          return 'DOCX';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'XLSX';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PPTX';
  return mimeType.split('/')[1]?.toUpperCase() || 'FILE';
}

/**
 * Returns true if the file is an image type.
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isImageFile(mimeType) {
  return typeof mimeType === 'string' && mimeType.startsWith('image/');
}

/**
 * Validates a single File object.
 * Returns null if valid, or an error string if invalid.
 * @param {File} file
 * @returns {string|null}
 */
export function validateFile(file) {
  if (!file) return 'No file provided.';
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `"${file.name}" has an unsupported type (${file.type || 'unknown'}).`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `"${file.name}" exceeds the 10 MB size limit (${formatFileSize(file.size)}).`;
  }
  if (file.size === 0) {
    return `"${file.name}" is empty.`;
  }
  return null;
}

/**
 * Validates an array of new files against existing ones.
 * Returns { valid: File[], errors: string[] }.
 * @param {File[]} newFiles
 * @param {File[]} existingFiles
 * @returns {{ valid: File[], errors: string[] }}
 */
export function validateFiles(newFiles, existingFiles = []) {
  const errors = [];
  const valid = [];
  const remaining = MAX_FILE_COUNT - existingFiles.length;

  if (remaining <= 0) {
    return { valid: [], errors: [`Maximum of ${MAX_FILE_COUNT} files allowed.`] };
  }

  Array.from(newFiles).forEach((file, index) => {
    if (index >= remaining) {
      errors.push(`Only ${remaining} more file(s) can be added.`);
      return;
    }
    const error = validateFile(file);
    if (error) {
      errors.push(error);
    } else {
      valid.push(file);
    }
  });

  return { valid, errors };
}

/**
 * Converts a File to a base64-encoded data string (without prefix).
 * @param {File} file
 * @returns {Promise<string>}
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

/**
 * Creates a temporary object URL for a file preview.
 * Remember to call URL.revokeObjectURL(url) when done.
 * @param {File} file
 * @returns {string|null}
 */
export function createPreviewUrl(file) {
  if (!isImageFile(file.type)) return null;
  return URL.createObjectURL(file);
}