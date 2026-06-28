import React, { useState, useCallback } from 'react';
import Avatar         from '../ui/Avatar';
import { formatTime } from '../../utils/messageUtils';
import { getFileMeta, formatFileSize } from '../../utils/fileUtils';
import {
  CopyIcon, CheckIcon, CheckCheckIcon, FileTextIcon, AlertTriangleIcon,
} from '../icons/Icons';

/* ── Markdown-lite renderer ─────────────────────────────────────── */
function FormattedText({ text }) {
  const lines = text.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {lines.map((line, i) => {
        if (!line) return <div key={i} style={{ height: 4 }} />;

        const applyBold = (raw) =>
          raw.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary);font-weight:600">$1</strong>');

        const applyCode = (raw) =>
          raw.replace(/`([^`]+)`/g,
            '<code style="background:var(--accent-dim);border:1px solid var(--border-accent);border-radius:6px;padding:1px 6px;font-family:var(--font-mono);font-size:12px;color:var(--accent-strong)">$1</code>'
          );

        const render = (raw) => applyCode(applyBold(raw));

        if (/^[•\-*]\s/.test(line)) {
          return (
            <div key={i} style={{ display: 'flex', gap: 10, marginTop: 2 }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'var(--accent)', flexShrink: 0, marginTop: 8,
              }} />
              <span
                style={{ lineHeight: 1.65 }}
                dangerouslySetInnerHTML={{ __html: render(line.replace(/^[•\-*]\s/, '')) }}
              />
            </div>
          );
        }

        if (/^\d+\.\s/.test(line)) {
          const [num, ...rest] = line.split(/\.\s/);
          return (
            <div key={i} style={{ display: 'flex', gap: 10, marginTop: 2 }}>
              <span style={{
                color: 'var(--accent)', flexShrink: 0,
                fontWeight: 600, fontSize: 13, marginTop: 1,
              }}>
                {num}.
              </span>
              <span dangerouslySetInnerHTML={{ __html: render(rest.join('. ')) }} />
            </div>
          );
        }

        return (
          <div
            key={i}
            style={{ lineHeight: 1.65 }}
            dangerouslySetInnerHTML={{ __html: render(line) }}
          />
        );
      })}
    </div>
  );
}

/* ── File attachment chip ─────────────────────────────────────── */
function FileChip({ fp }) {
  const meta = getFileMeta(fp);

  if (fp.preview) {
    return (
      <img
        src={fp.preview}
        alt={fp.name}
        style={{
          width: 108, height: 72, objectFit: 'cover',
          borderRadius: 10, border: '1px solid var(--border-mid)',
          display: 'block', boxShadow: 'var(--shadow-sm)',
        }}
      />
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 12px',
      background: 'var(--chip-bg)',
      border: '1px solid var(--chip-border)',
      borderRadius: 10,
    }}>
      <span style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        color: 'var(--accent)',
      }}>
        <FileTextIcon size={15} />
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{
          fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)',
          maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', fontFamily: 'var(--font-body)',
        }}>{fp.name}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          {meta.label} · {formatFileSize(fp.size)}
        </span>
      </div>
    </div>
  );
}

/* ── Status icon ──────────────────────────────────────────────── */
function StatusIcon({ status }) {
  if (status === 'sending') {
    return (
      <span style={{ color: 'rgba(255,255,255,0.6)', display: 'inline-flex' }}>
        <CheckIcon size={13} strokeWidth={2.2} />
      </span>
    );
  }
  if (status === 'sent') {
    return (
      <span style={{ color: 'rgba(255,255,255,0.85)', display: 'inline-flex' }}>
        <CheckCheckIcon size={14} strokeWidth={2.2} />
      </span>
    );
  }
  return null;
}

/* ── MessageBubble ────────────────────────────────────────────── */
export default function MessageBubble({ message }) {
  const isUser  = message.role === 'user';
  const isError = Boolean(message.isError);
  const [copied,  setCopied]  = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = useCallback(() => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }, [message.content]);

  const time = formatTime(message.timestamp);

  return (
    <div
      aria-label={`${isUser ? 'You' : 'ARIA'} at ${time}: ${message.content}`}
      style={{
        marginBottom: 24,
        animation: 'fadeSlideIn 0.24s ease both',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 12,
      }}>
        <Avatar role={isUser ? 'user' : 'assistant'} size={32} />

        <div style={{ maxWidth: 'min(74%, 680px)', position: 'relative' }}>

          {/* Floating copy button */}
          {!isError && (
            <button
              onClick={handleCopy}
              aria-label="Copy message"
              style={{
                position: 'absolute',
                top: -32,
                [isUser ? 'right' : 'left']: 0,
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'var(--bg-surface)',
                border: `1px solid ${copied ? 'var(--border-accent)' : 'var(--border-mid)'}`,
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                color: copied ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 11, fontWeight: 500, padding: '4px 11px',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.18s ease',
                whiteSpace: 'nowrap',
                opacity: hovered ? 1 : 0,
                pointerEvents: hovered ? 'auto' : 'none',
                transform: hovered ? 'translateY(0)' : 'translateY(4px)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {copied
                ? <><CheckIcon size={12} strokeWidth={2.2} /> Copied</>
                : <><CopyIcon size={12} /> Copy</>}
            </button>
          )}

          {/* Bubble */}
          <div style={{
            padding: isUser ? '12px 16px' : '14px 18px',
            borderRadius: isUser
              ? '16px 6px 16px 16px'
              : '6px 16px 16px 16px',
            background: isError
              ? 'var(--error-bg)'
              : isUser
                ? 'var(--accent)'
                : 'var(--bg-surface)',
            border: isError
              ? '1px solid var(--error-border)'
              : isUser
                ? 'none'
                : '1px solid var(--border-subtle)',
            boxShadow: isUser
              ? 'var(--shadow-user)'
              : isError
                ? 'none'
                : 'var(--shadow-sm)',
            fontSize: 14, lineHeight: 1.65,
            color: isUser ? '#FFFFFF' : 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            position: 'relative',
            transition: 'box-shadow 0.18s ease',
          }}>

            {/* AI left accent rule */}
            {!isUser && !isError && (
              <div style={{
                position: 'absolute', left: 0,
                top: '16%', height: '68%', width: 3,
                borderRadius: '0 var(--radius-full) var(--radius-full) 0',
                background: 'var(--accent)',
                opacity: 0.9,
              }} />
            )}

            {/* Error icon */}
            {isError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: 'var(--error)', marginBottom: 4, fontWeight: 600,
              }}>
                <AlertTriangleIcon size={15} />
              </div>
            )}

            {/* Content */}
            {message.content && (
              isUser
                ? <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.content}</div>
                : <FormattedText text={message.content} />
            )}

            {/* Streaming cursor */}
            {message.streaming && (
              <span style={{
                display: 'inline-block', width: 2, height: 13,
                background: 'var(--accent)', marginLeft: 3,
                verticalAlign: 'text-bottom',
                animation: 'blink 0.75s ease-in-out infinite',
                borderRadius: 1,
              }} />
            )}

            {/* File attachments */}
            {message.files?.length > 0 && (
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 8,
                marginTop: 12, paddingTop: 12,
                borderTop: isUser
                  ? '1px solid rgba(255,255,255,0.18)'
                  : '1px solid var(--border-subtle)',
              }}>
                {message.files.map((fp) => (
                  <FileChip key={fp.id} fp={fp} />
                ))}
              </div>
            )}

            {/* Timestamp + status */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginTop: 8, paddingTop: 8,
              borderTop: isUser
                ? '1px solid rgba(255,255,255,0.16)'
                : '1px solid var(--border-subtle)',
              justifyContent: isUser ? 'flex-end' : 'flex-start',
            }}>
              <span style={{
                fontSize: 11,
                color: isUser ? 'rgba(255,255,255,0.72)' : 'var(--text-hint)',
                fontFamily: 'var(--font-body)', letterSpacing: '0.01em',
              }}>
                {time}
              </span>
              {isUser && <StatusIcon status={message.status} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}