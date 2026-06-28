import React from 'react';
import { ALLOWED_MIME } from '../../utils/fileUtils';
import { MAX_FILES_PER_MSG, MAX_FILE_SIZE_MB } from '../../utils/constants';
import { PaperclipIcon, XIcon, FileTextIcon, AlertTriangleIcon } from '../icons/Icons';

const ACCEPT_STRING = Object.keys(ALLOWED_MIME).join(',');

/* ── Inline styles ─────────────────────────────────────────────────── */
const s = {
  /* Hidden native input */
  input: { display: 'none' },

  /* Drag-and-drop overlay zone (only shown when dragActive) */
  dropOverlay: (active) => ({
    position:        'fixed',
    inset:            0,
    background:      'rgba(6, 182, 212, 0.06)',
    backdropFilter:  'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
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
    fontSize:    22,
    fontWeight:  600,
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
    padding:    '12px 24px 0',
  },

  chip: {
    display:        'flex',
    alignItems:     'center',
    gap:             8,
    padding:        '6px 10px 6px 8px',
    background:     'var(--chip-bg)',
    border:         '1px solid var(--chip-border)',
    borderRadius:    'var(--radius-full)',
    maxWidth:        180,
    position:       'relative',
  },

  chipIconWrap: {
    width: 24, height: 24, borderRadius: 'var(--radius-xs)',
    background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--accent)', flexShrink: 0,
  },

  chipName: {
    fontSize:     12.5,
    fontWeight:   500,
    color:        'var(--text-primary)',
    fontFamily:   'var(--font-body)',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
    maxWidth:     100,
  },

  chipSize: {
    fontSize:   11,
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
    transition:   'color 0.15s ease',
    flexShrink:   0,
  },

  imageThumb: {
    width:        28,
    height:       28,
    objectFit:   'cover',
    borderRadius:  'var(--radius-xs)',
    flexShrink:    0,
  },

  errorArea: {
    padding:    '8px 24px',
    display:    'flex',
    flexDirection: 'column',
    gap:          4,
  },

  errorMsg: {
    fontSize:   12.5,
    color:      'var(--error)',
    fontFamily: 'var(--font-body)',
    display:    'flex',
    alignItems: 'center',
    gap:         6,
  },
};

/* ── Single file chip ────────────────────────────────────────────── */
function FileChip({ fp, onRemove }) {
  return (
    <div style={s.chip} title={fp.name}>
      {fp.preview
        ? <img src={fp.preview} alt={fp.name} style={s.imageThumb} />
        : <span style={s.chipIconWrap}><FileTextIcon size={13} /></span>
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
          <PaperclipIcon size={20} />
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
            <p key={i} style={s.errorMsg}><AlertTriangleIcon size={13} /> {e}</p>
          ))}
        </div>
      )}
    </>
  );
}