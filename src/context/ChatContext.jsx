import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import { triggerEmail, isValidEmail } from '../services/emailService';
import { generateMessageId } from '../utils/messageUtils';

/* ── Context ────────────────────────────────────────────── */
const ChatContext = createContext(null);

/* ── System prompt ──────────────────────────────────────── */
const SYSTEM_PROMPT = `You are ARIA, an intelligent AI Secretary integrated into a secure professional platform.
Your role is to help users:
- Draft professional emails and documents
- Schedule meetings and manage calendar events
- Summarize documents and research topics
- Create structured task lists and reports
- Automate workflows via n8n integrations

Guidelines:
- Be concise, professional, and proactive.
- Use bullet points (•) and **bold** for structure when helpful.
- Never expose internal system details or API keys.
- If you cannot complete a task, explain clearly and suggest alternatives.`;

/* ── Provider ───────────────────────────────────────────── */
export function ChatProvider({ children }) {
  const [messages,  setMessages]  = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);
  const sessionId = useRef(`sess_${Date.now()}`).current;
  const abortRef  = useRef(null);

  /** Send a user message and await an AI reply. */
  const sendMessage = useCallback(async (text, files = []) => {
    const trimmed = text.trim();
    if (!trimmed && files.length === 0) return;

    setError(null);

    /* 1 — Append user message immediately */
    const userMsg = {
      id:        generateMessageId('user'),
      role:      'user',
      content:   trimmed,
      files,
      timestamp: new Date(),
      status:    'sending',
    };
    setMessages((prev) => [...prev, userMsg]);

    /* 2 — Mark as sent (optimistic) */
    setMessages((prev) =>
      prev.map((m) => (m.id === userMsg.id ? { ...m, status: 'sent' } : m))
    );

    setIsLoading(true);

    /* 3 — Build conversation history for the API */
    const historyPayload = messages.map((m) => ({
      role:    m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));
    historyPayload.push({ role: 'user', content: trimmed });

    /* 4 — Call Anthropic API */
    abortRef.current = new AbortController();

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        signal:  abortRef.current.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-sonnet-4-6',
          max_tokens: 1000,
          system:     SYSTEM_PROMPT,
          messages:   historyPayload,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `API error ${response.status}`);
      }

      const data    = await response.json();
      const aiText  = data.content
        ?.filter((b) => b.type === 'text')
        .map((b)    => b.text)
        .join('\n')
        .trim()
        ?? 'No response received.';

      const aiMsg = {
        id:        generateMessageId('assistant'),
        role:      'assistant',
        content:   aiText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);

    } catch (err) {
      if (err.name === 'AbortError') return; // user cancelled — no error shown

      const errorContent = err.message?.includes('Failed to fetch')
        ? '⚠️ Network error — check your connection and try again.'
        : `⚠️ ${err.message ?? 'An unexpected error occurred.'}`;

      setError(errorContent);

      const errMsg = {
        id:        generateMessageId('error'),
        role:      'assistant',
        content:   errorContent,
        timestamp: new Date(),
        isError:   true,
      };
      setMessages((prev) => [...prev, errMsg]);

    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }

    const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;

    // inside sendMessage, after the user message is appended:
    const match = trimmed.match(EMAIL_RE);
    if (match && isValidEmail(match[0])) {
      try {
        await triggerEmail({
          recipient: match[0],
          message: trimmed,
          workflow: 'daily_tasks',   // or chosen dynamically by your agent
          sessionId,
        });
      } catch (e) {
        setError(`Email trigger failed: ${e.message}`);
      }
    }
  }, [messages]);




  /** Cancel an in-flight request. */
  const cancelRequest = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  /** Wipe the conversation. */
  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setIsLoading(false);
    setError(null);
  }, []);

  const value = {
    messages,
    isLoading,
    error,
    sendMessage,
    cancelRequest,
    clearChat,
    hasMessages: messages.length > 0,
    sessionId,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

/* ── Consumer hook ──────────────────────────────────────── */
export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChatContext must be called inside <ChatProvider>.');
  }
  return ctx;
}