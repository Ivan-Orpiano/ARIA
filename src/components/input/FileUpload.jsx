import React from 'react';
import { ALLOWED_MIME } from '../../utils/fileUtils';
import { MAX_FILES_PER_MSG, MAX_FILE_SIZE_MB } from '../../utils/constants';
import { PaperclipIcon, XIcon } from '../icons/Icons';

const ACCEPT_STRING = Object.keys(ALLOWED_MIME).join(',');

/* ── Inline styles ─────────────────────────────────────────────────── */
const s = {
  /* Hidden native input */
  input: { display: 'none' },

  /* Drag-and-drop overlay zone (only shown when dragActive) */
  dropOverlay: (active) => ({
    position:        'fixed',
    inset:            0,
    background:      'rgba(0,245,160,0.06)',
    backdropFilter:  'blur(4px)',
    border:          '2px dashed var(--accent)',
    zIndex:           100,
    display:          active ? 'flex' : 'none',
    alignItems:       'center',
    justifyContent:   'center',
    flexDirection:    'column',
    gap:               12,
    pointerEvents:    active ? 'all' : 'none',
    transition:       'opacity 0.2s ease',
  }),

  dropLabel: {
    fontFamily: 'var(--font-display)',
    fontSize:    24,
    fontWeight:  700,
    color:       'var(--accent)',
    display:     'flex',
    alignItems:  'center',
    gap:          10,
  },

  dropSub: {
    fontSize: 14,
    color:    'var(--text-secondary)',
    fontFamily: 'var(--font-body)',
  },

  /* File previews strip */
  strip: {
    display:    'flex',
    flexWrap:   'wrap',
    gap:         8,
    padding:    '10px 16px 0',
  },

  chip: (meta) => ({
    display:        'flex',
    alignItems:     'center',
    gap:             6,
    padding:        '6px 10px 6px 8px',
    background:     `${meta.color}18`,
    border:         `1px solid ${meta.color}35`,
    borderRadius:    20,
    maxWidth:        180,
    position:       'relative',
  }),

  chipIcon: { fontSize: 16, lineHeight: 1 },

  chipName: {
    fontSize:     12,
    fontWeight:   500,
    color:        'var(--text-primary)',
    fontFamily:   'var(--font-body)',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
    maxWidth:     100,
  },

  chipSize: {
    fontSize:   10,
    color:      'var(--text-muted)',
    fontFamily: 'var(--font-body)',
    flexShrink: 0,
  },

  removeBtn: {
    background:  'none',
    border:      'none',
    cursor:      'pointer',
    color:       'var(--text-muted)',
    lineHeight:   1,
    padding:      3,
    display:      'flex',
    alignItems:   'center',
    borderRadius: '50%',
    transition:   'color 0.15s',
    flexShrink:   0,
  },

  imageThumb: {
    width:        32,
    height:       32,
    objectFit:   'cover',
    borderRadius:  6,
    flexShrink:    0,
  },

  errorArea: {
    padding:    '6px 16px',
    display:    'flex',
    flexDirection: 'column',
    gap:          3,
  },

  errorMsg: {
    fontSize:   11.5,
    color:      'var(--error)',
    fontFamily: 'var(--font-body)',
  },
};

/* ── Single file chip ────────────────────────────────────────────── */
function FileChip({ fp, onRemove }) {
  return (
    <div style={s.chip(fp.meta)} title={fp.name}>
      {fp.preview
        ? <img src={fp.preview} alt={fp.name} style={s.imageThumb} />
        : <span style={s.chipIcon}>{fp.meta.icon}</span>
      }
      <span style={s.chipName}>{fp.name}</span>
      <span style={s.chipSize}>{fp.sizeStr}</span>
      <button
        type="button"
        style={s.removeBtn}
        onClick={() => onRemove(fp.id)}
        title="Remove file"
        aria-label={`Remove ${fp.name}`}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <XIcon size={13} />
      </button>
    </div>
  );
}

/* ── FileUpload ──────────────────────────────────────────────────── */
export default function FileUpload({
  files,
  fileErrors,
  dragActive,
  inputRef,
  onInputChange,
  onDragLeave,
  onDrop,
  removeFile,
}) {
  return (
    <>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT_STRING}
        style={s.input}
        onChange={onInputChange}
        aria-hidden="true"
      />

      {/* Full-screen drop overlay */}
      <div
        style={s.dropOverlay(dragActive)}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div style={s.dropLabel}>
          <PaperclipIcon size={22} />
          Drop files here
        </div>
        <div style={s.dropSub}>
          Up to {MAX_FILES_PER_MSG} files · {MAX_FILE_SIZE_MB} MB each
        </div>
      </div>

      {/* File preview chips */}
      {files.length > 0 && (
        <div style={s.strip}>
          {files.map((fp) => (
            <FileChip key={fp.id} fp={fp} onRemove={removeFile} />
          ))}
        </div>
      )}

      {/* Validation errors */}
      {fileErrors.length > 0 && (
        <div style={s.errorArea}>
          {fileErrors.map((e, i) => (
            <p key={i} style={s.errorMsg}>⚠ {e}</p>
          ))}
        </div>
      )}
    </>
  );
}