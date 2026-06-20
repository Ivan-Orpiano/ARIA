import React, { useState, useCallback } from 'react';
import Avatar         from '../ui/Avatar';
import { formatTime } from '../../utils/messageUtils';
import { getFileMeta, formatFileSize } from '../../utils/fileUtils';

/* ── Markdown-lite renderer ─────────────────────────────────────────── */
function FormattedText({ text }) {
  const lines = text.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {lines.map((line, i) => {
        if (!line) return <div key={i} style={{ height: 5 }} />;

        const applyBold = (raw) =>
          raw.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary);font-weight:600">$1</strong>');

        const applyCode = (raw) =>
          raw.replace(/`([^`]+)`/g, '<code style="background:rgba(0,245,160,0.08);border:1px solid rgba(0,245,160,0.20);border-radius:4px;padding:1px 6px;font-family:var(--font-mono);font-size:11.5px;color:var(--accent)">$1</code>');

        const render = (raw) => applyCode(applyBold(raw));

        if (/^[•\-*]\s/.test(line)) {
          return (
            <div key={i} style={{ display: 'flex', gap: 9, marginTop: 2 }}>
              <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2, fontSize: 10 }}>◆</span>
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
            <div key={i} style={{ display: 'flex', gap: 9, marginTop: 2 }}>
              <span style={{
                color: 'var(--accent)', flexShrink: 0,
                fontFamily: 'var(--font-mono)', fontSize: 11,
                marginTop: 2,
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

/* ── File attachment chip ───────────────────────────────────────────── */
function FileChip({ fp }) {
  const meta = getFileMeta(fp);

  if (fp.preview) {
    return (
      <img
        src={fp.preview}
        alt={fp.name}
        style={{
          width:        110,
          height:        74,
          objectFit:   'cover',
          borderRadius:  8,
          border:       '1px solid var(--border-mid)',
          display:      'block',
        }}
      />
    );
  }

  return (
    <div style={{
      display:    'flex',
      alignItems: 'center',
      gap:         7,
      padding:    '6px 11px',
      background: `${meta.color}10`,
      border:     `1px solid ${meta.color}22`,
      borderRadius: 9,
    }}>
      <span style={{ fontSize: 15, lineHeight: 1 }}>{meta.icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{
          fontSize:     11.5,
          fontWeight:   500,
          color:        'var(--text-primary)',
          maxWidth:     130,
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:   'nowrap',
          fontFamily:   'var(--font-body)',
        }}>{fp.name}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {meta.label} · {formatFileSize(fp.size)}
        </span>
      </div>
    </div>
  );
}

/* ── Status icon ────────────────────────────────────────────────────── */
function StatusIcon({ status }) {
  if (status === 'sending') {
    return <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1 }}>···</span>;
  }
  if (status === 'sent') {
    return <span style={{ fontSize: 10, color: 'var(--accent)' }}>✓</span>;
  }
  return null;
}

/* ── MessageBubble ──────────────────────────────────────────────────── */
export default function MessageBubble({ message }) {
  const isUser  = message.role === 'user';
  const isError = Boolean(message.isError);
  const [copied,  setCopied]  = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = useCallback(() => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [message.content]);

  const time = formatTime(message.timestamp);

  return (
    <div
      aria-label={`${isUser ? 'You' : 'ARIA'} at ${time}: ${message.content}`}
      style={{
        marginBottom: 18,
        animation: isUser
          ? 'springUp 0.40s cubic-bezier(0.34,1.56,0.64,1) both'
          : 'springUp 0.40s cubic-bezier(0.34,1.56,0.64,1) both',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        display:       'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems:    'flex-end',
        gap:            12,
      }}>
        <Avatar role={isUser ? 'user' : 'assistant'} size={32} />

        {/* Bubble */}
        <div style={{ maxWidth: 'min(72%, 640px)', position: 'relative' }}>
          <div style={{
            padding:       '12px 16px',
            borderRadius:  isUser ? '18px 5px 18px 18px' : '5px 18px 18px 18px',
            background:    isError
              ? 'rgba(255, 77, 106, 0.07)'
              : isUser
                ? 'rgba(255,107,157,0.10)'
                : 'rgba(11,16,32,0.80)',
            backdropFilter: isUser ? undefined : 'blur(12px)',
            WebkitBackdropFilter: isUser ? undefined : 'blur(12px)',
            border:        isError
              ? '1px solid rgba(255,77,106,0.30)'
              : isUser
                ? '1px solid rgba(255,107,157,0.22)'
                : '1px solid var(--border-glass)',
            borderLeft:    (!isUser && !isError)
              ? '2px solid rgba(0,245,160,0.28)'
              : undefined,
            boxShadow:     isUser
              ? 'var(--shadow-user)'
              : isError
                ? '0 2px 10px rgba(255,77,106,0.12)'
                : 'var(--shadow-ai)',
            fontSize:   13.5,
            lineHeight:  1.65,
            color:      'var(--text-primary)',
            fontFamily: 'var(--font-body)',
          }}>
            {/* Content */}
            {message.content && (
              isUser
                ? <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.content}</div>
                : <FormattedText text={message.content} />
            )}

            {/* Streaming cursor */}
            {message.streaming && (
              <span style={{
                display:       'inline-block',
                width:          2,
                height:         13,
                background:    'var(--accent)',
                marginLeft:     3,
                verticalAlign: 'text-bottom',
                animation:     'blink 0.75s ease-in-out infinite',
              }} />
            )}

            {/* File attachments */}
            {message.files?.length > 0 && (
              <div style={{
                display:   'flex',
                flexWrap:  'wrap',
                gap:        7,
                marginTop:  10,
                paddingTop: 10,
                borderTop: '1px solid var(--border-subtle)',
              }}>
                {message.files.map((fp) => (
                  <FileChip key={fp.id} fp={fp} />
                ))}
              </div>
            )}

            {/* Timestamp + status */}
            <div style={{
              display:        'flex',
              alignItems:     'center',
              gap:             5,
              marginTop:       8,
              paddingTop:      6,
              borderTop:      '1px solid var(--border-subtle)',
              justifyContent: isUser ? 'flex-end' : 'flex-start',
            }}>
              <span style={{
                fontSize:   10,
                color:      'var(--text-hint)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.02em',
              }}>
                {time}
              </span>
              {isUser && <StatusIcon status={message.status} />}
            </div>
          </div>

          {/* Floating copy pill */}
          {!isError && (
            <button
              onClick={handleCopy}
              aria-label="Copy message"
              style={{
                position:     'absolute',
                top:          -28,
                [isUser ? 'right' : 'left']: 0,
                display:      'flex',
                alignItems:   'center',
                gap:           4,
                background:   'var(--bg-elevated)',
                border:       '1px solid var(--border-mid)',
                borderRadius: 'var(--radius-full)',
                cursor:       'pointer',
                color:        copied ? 'var(--accent)' : 'var(--text-muted)',
                fontSize:      10,
                padding:      '3px 10px',
                fontFamily:   'var(--font-mono)',
                transition:   'all var(--transition-base)',
                whiteSpace:   'nowrap',
                opacity:       hovered ? 1 : 0,
                pointerEvents: hovered ? 'auto' : 'none',
                boxShadow:    'var(--shadow-sm)',
              }}
            >
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
