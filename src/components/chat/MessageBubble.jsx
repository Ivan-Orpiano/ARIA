import React, { useState, useCallback } from 'react';
import Avatar         from '../ui/Avatar';
import { formatTime } from '../../utils/messageUtils';
import { getFileMeta, formatFileSize } from '../../utils/fileUtils';

/* ── Markdown-lite renderer ─────────────────────────────── */
function FormattedText({ text }) {
  const lines = text.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {lines.map((line, i) => {
        if (!line) return <div key={i} style={{ height: 6 }} />;

        // Apply **bold** inline
        const applyBold = (raw) =>
          raw.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary);font-weight:600">$1</strong>');

        // Apply `code` spans
        const applyCode = (raw) =>
          raw.replace(/`([^`]+)`/g, '<code style="background:var(--bg-elevated);border:1px solid var(--border-mid);border-radius:4px;padding:1px 5px;font-family:var(--font-mono);font-size:11px;color:var(--accent)">$1</code>');

        const render = (raw) => applyCode(applyBold(raw));

        // Bullet points
        if (/^[•\-*]\s/.test(line)) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, marginTop: 1 }}>
              <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}>•</span>
              <span
                style={{ lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: render(line.replace(/^[•\-*]\s/, '')) }}
              />
            </div>
          );
        }

        // Numbered list
        if (/^\d+\.\s/.test(line)) {
          const [num, ...rest] = line.split(/\.\s/);
          return (
            <div key={i} style={{ display: 'flex', gap: 8, marginTop: 1 }}>
              <span style={{ color: 'var(--accent)', flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
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

/* ── File attachment chip ───────────────────────────────── */
function FileChip({ fp }) {
  const meta = getFileMeta(fp);

  if (fp.preview) {
    return (
      <img
        src={fp.preview}
        alt={fp.name}
        style={{
          width:        110,
          height:       74,
          objectFit:   'cover',
          borderRadius: 8,
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
      gap:         6,
      padding:    '5px 10px',
      background: `${meta.color}12`,
      border:     `1px solid ${meta.color}28`,
      borderRadius: 8,
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

/* ── Status icon ────────────────────────────────────────── */
function StatusIcon({ status }) {
  if (status === 'sending') {
    return (
      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
        ···
      </span>
    );
  }
  if (status === 'sent') {
    return (
      <span style={{ fontSize: 10, color: 'var(--accent)' }}>✓</span>
    );
  }
  return null;
}

/* ── MessageBubble ──────────────────────────────────────── */
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
        marginBottom: 16,
        animation:    isUser
          ? 'slideInRight 0.25s cubic-bezier(0.34,1.56,0.64,1) both'
          : 'slideInLeft  0.25s cubic-bezier(0.34,1.56,0.64,1) both',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        display:       'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems:    'flex-end',
        gap:           10,
      }}>
        <Avatar role={isUser ? 'user' : 'assistant'} size={28} />

        {/* Bubble */}
        <div style={{ maxWidth: 'min(72%, 640px)', position: 'relative' }}>
          <div style={{
            padding:      '11px 15px',
            borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
            background:   isError
              ? 'rgba(255, 77, 106, 0.07)'
              : isUser
                ? 'linear-gradient(135deg, rgba(255,107,157,0.16) 0%, rgba(255,142,83,0.10) 100%)'
                : 'var(--bg-card)',
            border: isError
              ? '1px solid rgba(255, 77, 106, 0.28)'
              : isUser
                ? '1px solid rgba(255, 107, 157, 0.24)'
                : '1px solid var(--border-mid)',
            boxShadow: isUser ? 'var(--shadow-user)' : 'var(--shadow-sm)',
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
                display:        'inline-block',
                width:           2,
                height:         13,
                background:     'var(--accent)',
                marginLeft:      3,
                verticalAlign:  'text-bottom',
                animation:      'blink 0.75s ease-in-out infinite',
              }} />
            )}

            {/* File attachments */}
            {message.files?.length > 0 && (
              <div style={{
                display:    'flex',
                flexWrap:   'wrap',
                gap:         7,
                marginTop:   8,
                paddingTop:  8,
                borderTop:  '1px solid var(--border-subtle)',
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
              marginTop:       6,
              justifyContent: isUser ? 'flex-end' : 'flex-start',
            }}>
              <span style={{
                fontSize:   10.5,
                color:      'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}>
                {time}
              </span>
              {isUser && <StatusIcon status={message.status} />}
            </div>
          </div>

          {/* Copy action — visible on hover */}
          {!isError && (
            <div style={{
              position:   'absolute',
              bottom:     -24,
              [isUser ? 'right' : 'left']: 0,
              display:    'flex',
              gap:         3,
              zIndex:      5,
              opacity:    hovered ? 1 : 0,
              transition: 'opacity var(--transition-base)',
              pointerEvents: hovered ? 'auto' : 'none',
            }}>
              <button
                onClick={handleCopy}
                aria-label="Copy message"
                style={{
                  background:   'var(--bg-surface)',
                  border:       '1px solid var(--border-mid)',
                  borderRadius:  4,
                  cursor:       'pointer',
                  color:        'var(--text-muted)',
                  fontSize:      10.5,
                  padding:      '2px 8px',
                  fontFamily:   'var(--font-mono)',
                  transition:   'all var(--transition-fast)',
                  whiteSpace:   'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                  e.currentTarget.style.color = copied ? 'var(--success)' : 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-surface)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                {copied ? '✓ Copied' : '⎘ Copy'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}