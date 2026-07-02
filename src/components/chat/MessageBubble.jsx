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
                color: 'var(--accent-strong)', flexShrink: 0,
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
    return <img src={fp.preview} alt={fp.name} className="file-thumb" />;
  }

  return (
    <div className="file-chip">
      <span className="file-chip-icn">
        <FileTextIcon size={15} />
      </span>
      <div className="file-chip-body">
        <span className="file-chip-name">{fp.name}</span>
        <span className="file-chip-meta">
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
      <span className="msg-status sending" aria-label="Sending">
        <CheckIcon size={13} strokeWidth={2.2} />
      </span>
    );
  }
  if (status === 'sent') {
    return (
      <span className="msg-status sent" aria-label="Sent">
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
  const [copied, setCopied] = useState(false);

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
      className={`msg-row${isUser ? ' user' : ''}`}
      aria-label={`${isUser ? 'You' : 'ARIA'} at ${time}: ${message.content}`}
    >
      <span className="msg-avatar">
        <Avatar role={isUser ? 'user' : 'assistant'} size={32} />
      </span>

      <div className="msg-col">

        {/* Copy — hover/keyboard reveal on desktop,
            always visible below the bubble on touch (CSS) */}
        {!isError && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? 'Copied to clipboard' : 'Copy message'}
            className={`msg-copy-btn${copied ? ' copied' : ''}`}
          >
            {copied
              ? <><CheckIcon size={12} strokeWidth={2.2} /> Copied</>
              : <><CopyIcon size={12} /> Copy</>}
          </button>
        )}

        {/* Bubble */}
        <div className={`msg-bubble${isError ? ' error' : ''}`}>

          {/* AI left accent rule */}
          {!isUser && !isError && (
            <span className="msg-accent-rule" aria-hidden="true" />
          )}

          {/* Error icon */}
          {isError && (
            <div className="msg-error-icn">
              <AlertTriangleIcon size={15} />
            </div>
          )}

          {/* Content */}
          {message.content && (
            isUser
              ? <div className="msg-plain">{message.content}</div>
              : <FormattedText text={message.content} />
          )}

          {/* Streaming cursor */}
          {message.streaming && (
            <span className="msg-cursor" aria-hidden="true" />
          )}

          {/* File attachments */}
          {message.files?.length > 0 && (
            <div className="msg-files">
              {message.files.map((fp) => (
                <FileChip key={fp.id} fp={fp} />
              ))}
            </div>
          )}

          {/* Timestamp + status — divider dropped for a lighter read */}
          <div className="msg-meta">
            <span>{time}</span>
            {isUser && <StatusIcon status={message.status} />}
          </div>
        </div>
      </div>
    </div>
  );
}