import React, { useState, useRef, useCallback, useEffect } from 'react';
import FileUpload        from './FileUpload';
import { useFileUpload }  from '../../hooks/useFileUpload';
import { MAX_FILES_PER_MSG } from '../../utils/constants';
import { PaperclipIcon, SendIcon, SpinnerIcon } from '../icons/Icons';

const isEmpty = (text, files) => !text?.trim() && (!files || files.length === 0);

/* ── Inline styles ─────────────────────────────────────────────────── */
const s = {
  outer: {
    background:  'var(--bg-surface)',
    borderTop:   '1px solid var(--border-subtle)',
    padding:     '0 0 16px',
    flexShrink:   0,
  },

  bar: {
    display:      'flex',
    alignItems:   'flex-end',
    gap:           10,
    margin:       '12px 16px 0',
    background:   'var(--bg-elevated)',
    border:       '1px solid var(--border-mid)',
    borderRadius: 'var(--radius-xl)',
    padding:      '10px 12px 10px 16px',
    transition:   'border-color 0.2s ease, box-shadow 0.2s ease',
  },

  barFocused: {
    borderColor: 'rgba(0,245,160,0.35)',
    boxShadow:   '0 0 0 3px var(--accent-glow)',
  },

  textarea: {
    flex:             1,
    background:       'none',
    border:           'none',
    outline:          'none',
    resize:           'none',
    color:            'var(--text-primary)',
    fontFamily:       'var(--font-body)',
    fontSize:          14.5,
    lineHeight:        1.6,
    padding:           0,
    minHeight:         22,
    maxHeight:         160,
    overflowY:        'auto',
    caretColor:       'var(--accent)',
  },

  actions: {
    display:      'flex',
    alignItems:   'flex-end',
    gap:           6,
    paddingBottom: 2,
  },

  iconBtn: (active) => ({
    width:       36,
    height:       36,
    borderRadius: 'var(--radius-full)',
    background:   active ? 'var(--accent-dim)' : 'none',
    border:       active ? '1px solid var(--accent)' : '1px solid transparent',
    cursor:      'pointer',
    display:     'flex',
    alignItems:  'center',
    justifyContent: 'center',
    color:        active ? 'var(--accent)' : 'var(--text-muted)',
    transition:  'all 0.15s ease',
    flexShrink:   0,
  }),

  sendBtn: (canSend, isLoading) => ({
    width:           38,
    height:           38,
    borderRadius:    'var(--radius-full)',
    background:       canSend && !isLoading
      ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-blue) 100%)'
      : 'var(--bg-hover)',
    border:          'none',
    cursor:           canSend && !isLoading ? 'pointer' : 'default',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    color:            canSend && !isLoading ? '#0A0E1A' : 'var(--text-muted)',
    transition:      'all 0.18s ease',
    flexShrink:       0,
    boxShadow:        canSend && !isLoading ? '0 4px 16px var(--accent-glow)' : 'none',
    transform:        canSend && !isLoading ? 'scale(1.02)' : 'scale(1)',
  }),

  hint: {
    fontSize:  11,
    color:     'var(--text-muted)',
    fontFamily:'var(--font-body)',
    padding:   '6px 20px 0',
    display:   'flex',
    justifyContent: 'space-between',
  },
};

/* ── ChatInput ─────────────────────────────────────────────────────── */
export default function ChatInput({ onSend, isLoading, prefillText = '' }) {
  const [text, setText]         = useState('');
  const [focused, setFocused]   = useState(false);
  const textareaRef             = useRef(null);

  const {
    files, fileErrors, dragActive,
    inputRef, removeFile, clearFiles,
    openPicker, onDragEnter, onDragLeave, onDragOver, onDrop, onInputChange,
    hasFiles,
  } = useFileUpload();

  /* Auto-resize textarea */
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  useEffect(() => { resizeTextarea(); }, [text, resizeTextarea]);

  /* Handle prefill from suggestion chips */
  useEffect(() => {
    if (prefillText) {
      setText(prefillText);
      textareaRef.current?.focus();
    }
  }, [prefillText]);

  /* Send message */
  const handleSend = useCallback(() => {
    if (isLoading || isEmpty(text, files)) return;
    onSend(text, files);
    setText('');
    clearFiles();
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [text, files, isLoading, onSend, clearFiles]);

  /* Keyboard shortcut: Enter to send, Shift+Enter for newline */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const canSend = !isEmpty(text, files) && !isLoading;

  return (
    <div
      style={s.outer}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
    >
      {/* File previews & drag overlay */}
      <FileUpload
        files={files}
        fileErrors={fileErrors}
        dragActive={dragActive}
        inputRef={inputRef}
        onInputChange={onInputChange}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        removeFile={removeFile}
      />

      {/* Input bar */}
      <div className="chat-input-bar" style={{ ...s.bar, ...(focused ? s.barFocused : {}) }}>
        <textarea
          ref={textareaRef}
          style={s.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Ask ARIA anything…"
          rows={1}
          aria-label="Message input"
          disabled={isLoading}
        />

        <div style={s.actions}>
          {/* Attach file button */}
          <button
            type="button"
            style={s.iconBtn(hasFiles)}
            onClick={openPicker}
            title={`Attach files (${files.length}/${MAX_FILES_PER_MSG})`}
            aria-label="Attach files"
            disabled={isLoading}
          >
            <PaperclipIcon size={16} />
          </button>

          {/* Send button */}
          <button
            type="button"
            style={s.sendBtn(canSend, isLoading)}
            onClick={handleSend}
            title="Send message (Enter)"
            aria-label="Send message"
            disabled={!canSend}
          >
            {isLoading
              ? <SpinnerIcon size={16} className="icon-spin" />
              : <SendIcon size={16} />}
          </button>
        </div>
      </div>

      {/* Hint bar */}
      <div style={s.hint} className="chat-input-hint">
        <span>Enter to send · Shift+Enter for new line</span>
        {hasFiles && <span>{files.length}/{MAX_FILES_PER_MSG} file(s)</span>}
      </div>
    </div>
  );
}