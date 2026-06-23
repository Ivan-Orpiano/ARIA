import React, { useState, useCallback } from 'react';
import Avatar         from '../ui/Avatar';
import { formatTime } from '../../utils/messageUtils';
import { getFileMeta, formatFileSize } from '../../utils/fileUtils';

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
            '<code style="background:rgba(0,245,160,0.07);border:1px solid rgba(0,245,160,0.18);border-radius:4px;padding:1px 6px;font-family:var(--font-mono);font-size:11.5px;color:var(--accent);letter-spacing:-0.01em">$1</code>'
          );

        const render = (raw) => applyCode(applyBold(raw));

        if (/^[•\-*]\s/.test(line)) {
          return (
            <div key={i} style={{ display: 'flex', gap: 10, marginTop: 2 }}>
              <span style={{
                color: 'var(--accent)', flexShrink: 0, marginTop: 4,
                fontSize: 8, opacity: 0.8,
              }}>◆</span>
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
                fontFamily: 'var(--font-mono)', fontSize: 11, marginTop: 2,
                opacity: 0.85,
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
          borderRadius: 9, border: '1px solid var(--border-mid)',
          display: 'block', boxShadow: '0 2px 10px rgba(0,0,0,0.40)',
        }}
      />
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 12px',
      background: `${meta.color}0C`,
      border: `1px solid ${meta.color}20`,
      borderRadius: 10,
    }}>
      <span style={{ fontSize: 15, lineHeight: 1 }}>{meta.icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{
          fontSize: 11.5, fontWeight: 500, color: 'var(--text-primary)',
          maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', fontFamily: 'var(--font-body)',
        }}>{fp.name}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {meta.label} · {formatFileSize(fp.size)}
        </span>
      </div>
    </div>
  );
}

/* ── Status icon ──────────────────────────────────────────────── */
function StatusIcon({ status }) {
  if (status === 'sending') {
    return <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1 }}>···</span>;
  }
  if (status === 'sent') {
    return <span style={{ fontSize: 10, color: 'var(--accent)', opacity: 0.75 }}>✓✓</span>;
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
        marginBottom: 20,
        animation: 'springUp 0.40s cubic-bezier(0.34,1.56,0.64,1) both',
        willChange: 'transform, opacity',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 11,
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
                top: -30,
                [isUser ? 'right' : 'left']: 0,
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'var(--bg-elevated)',
                border: `1px solid ${copied ? 'rgba(0,245,160,0.38)' : 'var(--border-mid)'}`,
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                color: copied ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 10, padding: '3px 10px',
                fontFamily: 'var(--font-mono)',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                opacity: hovered ? 1 : 0,
                pointerEvents: hovered ? 'auto' : 'none',
                transform: hovered ? 'translateY(0)' : 'translateY(4px)',
                boxShadow: copied
                  ? '0 0 12px rgba(0,245,160,0.18)'
                  : 'var(--shadow-sm)',
              }}
            >
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
          )}

          {/* Bubble */}
          <div style={{
            padding: isUser ? '12px 16px' : '14px 18px',
            borderRadius: isUser
              ? '18px 5px 18px 18px'
              : '5px 18px 18px 18px',
            background: isError
              ? 'rgba(255, 77, 106, 0.07)'
              : isUser
                ? 'linear-gradient(135deg, rgba(255,107,157,0.11) 0%, rgba(200,80,130,0.06) 100%)'
                : 'rgba(7,12,30,0.84)',
            backdropFilter: (!isUser && !isError) ? 'blur(18px)' : undefined,
            WebkitBackdropFilter: (!isUser && !isError) ? 'blur(18px)' : undefined,
            border: isError
              ? '1px solid rgba(255,77,106,0.28)'
              : isUser
                ? '1px solid rgba(255,107,157,0.18)'
                : '1px solid rgba(255,255,255,0.084)',
            boxShadow: isUser
              ? 'var(--shadow-user)'
              : isError
                ? '0 2px 12px rgba(255,77,106,0.14)'
                : '0 2px 20px rgba(0,0,0,0.45)',
            fontSize: 14, lineHeight: 1.65,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            position: 'relative',
            transition: 'box-shadow 0.20s ease',
          }}>

            {/* AI left accent bar */}
            {!isUser && !isError && (
              <div style={{
                position: 'absolute', left: 0,
                top: '14%', height: '72%', width: 2,
                borderRadius: '0 2px 2px 0',
                background: 'linear-gradient(180deg, var(--accent) 0%, var(--accent-blue) 100%)',
                opacity: 0.42,
              }} />
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
                display: 'flex', flexWrap: 'wrap', gap: 7,
                marginTop: 10, paddingTop: 10,
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}>
                {message.files.map((fp) => (
                  <FileChip key={fp.id} fp={fp} />
                ))}
              </div>
            )}

            {/* Timestamp + status */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              marginTop: 8, paddingTop: 7,
              borderTop: '1px solid rgba(255,255,255,0.035)',
              justifyContent: isUser ? 'flex-end' : 'flex-start',
            }}>
              <span style={{
                fontSize: 10, color: 'var(--text-hint)',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.03em',
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
