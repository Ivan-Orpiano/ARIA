export const ACCEPTED_TYPES = {
  // Documents
  'application/pdf':                                     { icon: '📄', label: 'PDF',  color: '#FF6B6B' },
  'application/msword':                                  { icon: '📝', label: 'DOC',  color: '#4A90E2' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                                                         { icon: '📝', label: 'DOCX', color: '#4A90E2' },
  'application/vnd.ms-excel':                            { icon: '📊', label: 'XLS',  color: '#27AE60' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                                                         { icon: '📊', label: 'XLSX', color: '#27AE60' },
  'application/vnd.ms-powerpoint':                       { icon: '📋', label: 'PPT',  color: '#E67E22' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                                                         { icon: '📋', label: 'PPTX', color: '#E67E22' },
  'text/plain':                                          { icon: '📃', label: 'TXT',  color: '#95A5A6' },
  'text/csv':                                            { icon: '📊', label: 'CSV',  color: '#27AE60' },
  // Images
  'image/jpeg':  { icon: '🖼️', label: 'JPG',  color: '#3DFFC0' },
  'image/png':   { icon: '🖼️', label: 'PNG',  color: '#3DFFC0' },
  'image/gif':   { icon: '🖼️', label: 'GIF',  color: '#3DFFC0' },
  'image/webp':  { icon: '🖼️', label: 'WEBP', color: '#3DFFC0' },
  'image/svg+xml': { icon: '🖼️', label: 'SVG', color: '#3DFFC0' },
  // Archives
  'application/zip':             { icon: '📦', label: 'ZIP', color: '#9B59B6' },
  'application/x-rar-compressed':{ icon: '📦', label: 'RAR', color: '#9B59B6' },
  // Code
  'application/json':     { icon: '⚙️', label: 'JSON', color: '#F39C12' },
  'text/javascript':      { icon: '⚙️', label: 'JS',   color: '#F39C12' },
  'text/html':            { icon: '⚙️', label: 'HTML', color: '#E74C3C' },
  'text/css':             { icon: '⚙️', label: 'CSS',  color: '#3498DB' },
};

export const MAX_FILE_SIZE       = 20 * 1024 * 1024; // 20 MB
export const MAX_FILES_PER_MSG   = 5;

/* ── Get file meta ────────────────────────────────────────────────── */
export const getFileMeta = (file) => {
  return ACCEPTED_TYPES[file.type] ?? { icon: '📎', label: 'FILE', color: '#8A94AA' };
};

/* ── Format file size ────────────────────────────────────────────── */
export const formatFileSize = (bytes) => {
  if (bytes === 0)           return '0 B';
  if (bytes < 1024)          return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* ── Validate a file ─────────────────────────────────────────────── */
export const validateFile = (file) => {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large (max ${formatFileSize(MAX_FILE_SIZE)})` };
  }
  return { valid: true };
};

/* ── Create a preview object from a File ────────────────────────── */
export const createFilePreview = (file) => ({
  id:       `${file.name}-${file.size}-${Date.now()}`,
  file,
  name:     file.name,
  size:     file.size,
  type:     file.type,
  meta:     getFileMeta(file),
  preview:  file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
  sizeStr:  formatFileSize(file.size),
});

/* ── Revoke preview URLs to avoid memory leaks ───────────────────── */
export const revokePreview = (filePreview) => {
  if (filePreview.preview) {
    URL.revokeObjectURL(filePreview.preview);
  }
};

/* ── Accept string for <input accept="..."> ─────────────────────── */
export const ACCEPT_STRING = Object.keys(ACCEPTED_TYPES).join(',');