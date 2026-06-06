import React, { useState, useEffect } from 'react';
import { getFileIcon, isImageFile, formatFileSize, getFileTypeLabel } from '../../utils/fileUtils';

/**
 * @param {{
 *   file:     File,
 *   index:    number,
 *   onRemove: (index: number) => void,
 * }} props
 */
export default function FilePreviewChip({ file, index, onRemove }) {
  const [previewUrl, setPreviewUrl] = useState(null);

  // Create and revoke object URLs for image previews
  useEffect(() => {
    if (!isImageFile(file.type)) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div
      role="listitem"
      aria-label={`Attached file: ${file.name}, ${formatFileSize(file.size)}`}
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          6,
        background:   'var(--chip-bg)',
        border:       '1px solid var(--chip-border)',
        borderRadius: 'var(--radius-md)',
        padding:      '5px 7px 5px 6px',
        maxWidth:     180,
        flexShrink:   0,
        animation:    'fadeSlideIn 0.18s ease-out',
      }}
    >
      {/* Thumbnail or emoji icon */}
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={file.name}
          style={{
            width:        26,
            height:       26,
            objectFit:    'cover',
            borderRadius: 5,
            flexShrink:   0,
          }}
        />
      ) : (
        <span
          aria-hidden="true"
          style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}
        >
          {getFileIcon(file.type)}
        </span>
      )}

      {/* File name + size */}
      <div style={{ overflow: 'hidden', flex: 1 }}>
        <div
          style={{
            fontWeight:    500,
            fontSize:      12,
            overflow:      'hidden',
            textOverflow:  'ellipsis',
            whiteSpace:    'nowrap',
            color:         'var(--text-primary)',
            lineHeight:    1.3,
          }}
          title={file.name}
        >
          {file.name}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.2 }}>
          {getFileTypeLabel(file.type)} · {formatFileSize(file.size)}
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(index)}
        aria-label={`Remove ${file.name}`}
        style={{
          background:   'none',
          border:       'none',
          cursor:       'pointer',
          color:        'var(--text-muted)',
          fontSize:     16,
          lineHeight:   1,
          padding:      '2px 3px',
          borderRadius: '50%',
          flexShrink:   0,
          transition:   'all var(--transition-fast)',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color      = 'var(--error)';
          e.currentTarget.style.background = 'var(--error-bg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color      = 'var(--text-muted)';
          e.currentTarget.style.background = 'none';
        }}
      >
        ×
      </button>
    </div>
  );
}