import React, { useState } from 'react';
import Avatar              from '../ui/Avatar';
import { formatTime }      from '../../utils/messageUtils';
import { getFileMeta, formatFileSize } from '../../utils/fileUtils';

/* ── Inline styles ─────────────────────────────────────────────────── */
const s = {
  row: (isUser) => ({
    display:        'flex',
    flexDirection:  isUser ? 'row-reverse' : 'row',
    alignItems:     'flex-end',
    gap:             10,
    padding:        '4px 0',
    animation:       isUser ? 'slideInRight 0.25s ease both' : 'slideInLeft 0.25s ease both',
  }),

  bubble: (isUser, isError) => ({
    maxWidth:       'min(72%, 600px)',
    borderRadius:    isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
    padding:        '12px 16px',
    background:      isError
      ? 'rgba(255,107,107,0.08)'
      : isUser
        ? 'linear-gradient(135deg, rgba(255,107,107,0.18) 0%, rgba(255,142,83,0.12) 100%)'
        : 'var(--bg-elevated)',
    border:          isError
      ? '1px solid rgba(255,107,107,0.3)'
      : isUser
        ? '1px solid rgba(255,107,107,0.25)'
        : '1px solid var(--border-mid)',
    boxShadow:       isUser
      ? 'var(--shadow-user)'
      : 'var(--shadow-sm)',
    backdropFilter: 'blur(8px)',
    transition:     'box-shadow 0.2s ease',
  }),

  text: (isUser) => ({
    fontSize:    14.5,
    lineHeight:   1.65,
    color:        isUser ? 'var(--text-primary)' : 'var(--text-primary)',
    fontFamily:  'var(--font-body)',
    whiteSpace:  'pre-wrap',
    wordBreak:   'break-word',
  }),

  meta: (isUser) => ({
    display:        'flex',
    alignItems:     'center',
    gap:             6,
    marginTop:       6,
    justifyContent: isUser ? 'flex-end' : 'flex-start',
  }),

  timestamp: {
    fontSize: 10.5,
    color:    'var(--text-muted)',
    fontFamily: 'var(--font-body)',
  },

  statusIcon: {
    fontSize: 10,
    color:    'var(--text-muted)',
  },

  filesArea: {
    marginTop:   10,
    display:    'flex',
    flexWrap:   'wrap',
    gap:         8,
  },

  fileChip: (meta) => ({
    display:        'flex',
    alignItems:     'center',
    gap:             6,
    padding:        '6px 10px',
    background:     `${meta.color}14`,
    border:         `1px solid ${meta.color}30`,
    borderRadius:    8,
    cursor:         'default',
  }),

  fileIcon: {
    fontSize: 16,
    lineHeight: 1,
  },

  fileInfo: {
    display:       'flex',
    flexDirection: 'column',
    gap:            1,
  },

  fileName: {
    fontSize:  12,
    fontWeight: 500,
    color:     'var(--text-primary)',
    maxWidth:   140,
    overflow:  'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-body)',
  },

  fileMeta: {
    fontSize: 10,
    color:    'var(--text-muted)',
    fontFamily: 'var(--font-body)',
  },

  imagePreview: {
    width:        120,
    height:        80,
    objectFit:   'cover',
    borderRadius:  8,
    border:       '1px solid var(--border-mid)',
    display:      'block',
  },
};

/* ── Status icon ─────────────────────────────────────────────────── */
function StatusIcon({ status }) {
  if (status === 'sending') return <span style={s.statusIcon}>⏳</span>;
  if (status === 'sent')    return <span style={{ ...s.statusIcon, color: 'var(--accent)' }}>✓</span>;
  return null;
}

/* ── File attachment chip ────────────────────────────────────────── */
function FileChip({ filePreview }) {
  const meta = getFileMeta(filePreview);

  if (filePreview.preview) {
    return (
      <img
        src={filePreview.preview}
        alt={filePreview.name}
        style={s.imagePreview}
      />
    );
  }

  return (
    <div style={s.fileChip(meta)}>
      <span style={s.fileIcon}>{meta.icon}</span>
      <div style={s.fileInfo}>
        <span style={s.fileName}>{filePreview.name}</span>
        <span style={s.fileMeta}>
          {meta.label} · {formatFileSize(filePreview.size)}
        </span>
      </div>
    </div>
  );
}

/* ── MessageBubble ───────────────────────────────────────────────── */
export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isError = !!message.isError;

  return (
    <div style={s.row(isUser)}>
      <Avatar role={isUser ? 'user' : 'assistant'} />

      <div style={s.bubble(isUser, isError)}>
        {/* Message text */}
        {message.text && (
          <p style={s.text(isUser)}>{message.text}</p>
        )}

        {/* File attachments */}
        {message.files && message.files.length > 0 && (
          <div style={s.filesArea}>
            {message.files.map((fp) => (
              <FileChip key={fp.id} filePreview={fp} />
            ))}
          </div>
        )}

        {/* Timestamp + status */}
        <div style={s.meta(isUser)}>
          <span style={s.timestamp}>{formatTime(message.timestamp)}</span>
          {isUser && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}