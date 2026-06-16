import React, { useState, useCallback } from 'react';
import './styles/globals.css';
import { ChatProvider } from './context/ChatContext';
import { useChat }      from './hooks/useChats';
import ChatWindow       from './components/chat/ChatWindow';
import ChatInput        from './components/input/ChatInput';


const s = {
  appShell: {
    display:       'flex',
    width:         '100%',
    height:        '100dvh',
    overflow:      'hidden',
    background:    'var(--bg-base)',
  },

  /* ── Sidebar ─────────────────────────────────────────────────── */
  sidebar: (open) => ({
    width:          open ? 'var(--sidebar-w)' : '0',
    minWidth:       open ? 'var(--sidebar-w)' : '0',
    background:    'var(--bg-surface)',
    borderRight:   '1px solid var(--border-subtle)',
    display:       'flex',
    flexDirection: 'column',
    overflow:      'hidden',
    transition:    'width 0.3s cubic-bezier(0.4,0,0.2,1)',
    flexShrink:     0,
  }),

  sidebarHeader: {
    padding:       '20px 16px 14px',
    borderBottom:  '1px solid var(--border-subtle)',
    display:       'flex',
    alignItems:    'center',
    gap:            10,
  },

  sidebarLogo: {
    width:          32,
    height:          32,
    borderRadius:   '50%',
    background:     'linear-gradient(135deg, #3DFFC0, #00B4D8)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:        16,
    flexShrink:      0,
  },

  sidebarTitle: {
    fontFamily: 'var(--font-display)',
    fontSize:    16,
    fontWeight:  800,
    color:       'var(--text-primary)',
    letterSpacing: '-0.3px',
    whiteSpace:  'nowrap',
  },

  sidebarSub: {
    fontSize:   10,
    color:      'var(--text-muted)',
    fontFamily: 'var(--font-body)',
    marginTop:   1,
    whiteSpace: 'nowrap',
  },

  sidebarBody: {
    flex:    1,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap:      12,
  },

  sidebarSection: {
    fontSize:   11,
    fontWeight:  600,
    color:      'var(--text-muted)',
    fontFamily: 'var(--font-display)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding:    '0 4px',
  },

  sidebarItem: (active) => ({
    padding:       '9px 12px',
    borderRadius:  'var(--radius-md)',
    cursor:        'pointer',
    background:     active ? 'var(--accent-dim)' : 'none',
    border:        `1px solid ${active ? 'rgba(61,255,192,0.2)' : 'transparent'}`,
    color:          active ? 'var(--accent)' : 'var(--text-secondary)',
    fontSize:        13,
    fontFamily:     'var(--font-body)',
    display:        'flex',
    alignItems:     'center',
    gap:             10,
    transition:     'all 0.15s ease',
    whiteSpace:     'nowrap',
    overflow:       'hidden',
  }),

  sidebarFooter: {
    padding:    '12px 16px',
    borderTop:  '1px solid var(--border-subtle)',
    display:    'flex',
    flexDirection: 'column',
    gap:          8,
  },

  pill: {
    display:        'inline-flex',
    alignItems:     'center',
    gap:             6,
    padding:        '4px 10px',
    borderRadius:   'var(--radius-full)',
    background:     'var(--accent-dim)',
    border:         '1px solid rgba(61,255,192,0.2)',
    fontSize:        11,
    color:          'var(--accent)',
    fontFamily:     'var(--font-body)',
    fontWeight:      500,
  },

  pillDot: {
    width:        6,
    height:        6,
    borderRadius: '50%',
    background:   'var(--accent)',
    animation:    'pulse 2s ease-in-out infinite',
  },

  webhookInfo: {
    fontSize:   10.5,
    color:      'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    wordBreak:  'break-all',
    lineHeight:  1.5,
  },

  /* ── Main area ───────────────────────────────────────────────── */
  main: {
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    overflow:      'hidden',
    minWidth:       0,
  },

  /* ── Top header bar ──────────────────────────────────────────── */
  header: {
    height:        56,
    borderBottom:  '1px solid var(--border-subtle)',
    display:       'flex',
    alignItems:    'center',
    justifyContent:'space-between',
    padding:       '0 16px',
    background:    'var(--bg-surface)',
    flexShrink:     0,
  },

  headerLeft: {
    display:    'flex',
    alignItems: 'center',
    gap:         10,
  },

  menuBtn: {
    background: 'none',
    border:      '1px solid var(--border-mid)',
    borderRadius:'var(--radius-sm)',
    cursor:      'pointer',
    color:       'var(--text-secondary)',
    fontSize:     16,
    width:        32,
    height:       32,
    display:     'flex',
    alignItems:  'center',
    justifyContent: 'center',
    transition:  'all 0.15s ease',
  },

  headerTitle: {
    fontFamily:   'var(--font-display)',
    fontSize:      16,
    fontWeight:    700,
    color:         'var(--text-primary)',
    letterSpacing: '-0.3px',
  },

  headerRight: {
    display:    'flex',
    alignItems: 'center',
    gap:         8,
  },

  clearBtn: {
    background:   'none',
    border:       '1px solid var(--border-mid)',
    borderRadius: 'var(--radius-md)',
    cursor:       'pointer',
    color:        'var(--text-secondary)',
    fontSize:      12,
    fontFamily:   'var(--font-body)',
    padding:      '5px 12px',
    transition:   'all 0.15s ease',
    display:      'flex',
    alignItems:   'center',
    gap:           6,
  },
};

function AppLayout() {
  const { messages, isLoading, sendMessage, clearChat, hasMessages, sessionId } =
    useChat();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [prefill, setPrefill]         = useState('');

  const handleSuggestionClick = useCallback((text) => {
    setPrefill(text);
    setTimeout(() => setPrefill(''), 100); // reset after pickup
  }, []);

  const handleSend = useCallback(
    (text, files) => {
      setPrefill('');
      sendMessage(text, files);
    },
    [sendMessage]
  );

  return (
    <div style={s.appShell}>
      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside style={s.sidebar(sidebarOpen)}>
        <div style={s.sidebarHeader}>
          <div style={s.sidebarLogo}>✦</div>
          <div>
            <div style={s.sidebarTitle}>ARIA</div>
            <div style={s.sidebarSub}>AI Secretary</div>
          </div>
        </div>

        <div style={s.sidebarBody}>
          <div style={s.sidebarSection}>Navigation</div>

          {[
            { icon: '💬', label: 'Chat',      active: true  },
            { icon: '📁', label: 'Files',     active: false },
            { icon: '📅', label: 'Calendar',  active: false },
            { icon: '✉️', label: 'Email',      active: false },
            { icon: '⚙️', label: 'Settings',  active: false },
          ].map(({ icon, label, active }) => (
            <div key={label} style={s.sidebarItem(active)}>
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div style={s.sidebarFooter}>
          <div style={s.pill}>
            <span style={s.pillDot} />
            Webhook active
          </div>
          <div style={s.webhookInfo}>
            n8n · GET · fee2e2ba…
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main style={s.main}>
        {/* Header */}
        <header style={s.header}>
          <div style={s.headerLeft}>
            <button
              style={s.menuBtn}
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-mid)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              ☰
            </button>
            <span style={s.headerTitle}>Assistant Chat</span>
          </div>

          <div style={s.headerRight}>
            {hasMessages && (
              <button
                style={s.clearBtn}
                onClick={clearChat}
                title="Clear conversation"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--error)';
                  e.currentTarget.style.color = 'var(--error)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-mid)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                🗑 Clear
              </button>
            )}
          </div>
        </header>

        {/* Chat messages */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSuggestionClick={handleSuggestionClick}
        />

        {/* Input area */}
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          prefillText={prefill}
        />
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Root App with Provider                                              */
/* ─────────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <ChatProvider>
      <AppLayout />
    </ChatProvider>
  );
}

