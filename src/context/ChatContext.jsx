import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import { sendToWebhook } from '../services/webhookService';
import { generateMessageId } from '../utils/messageUtils';

/* ── Context ────────────────────────────────────────────── */
const ChatContext = createContext(null);

/* ── Provider ───────────────────────────────────────────── */
export function ChatProvider({ children }) {
  const [messages,  setMessages]  = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);
  const sessionId = useRef(`sess_${Date.now()}`).current;
  const abortRef  = useRef(null);

  /** Send a user message to the n8n webhook and display the reply. */
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
    abortRef.current = new AbortController();

    /* 3 — Trigger the n8n webhook */
    try {
      const { reply } = await sendToWebhook({ message: trimmed, files, sessionId });

      const aiMsg = {
        id:        generateMessageId('assistant'),
        role:      'assistant',
        content:   reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

    } catch (err) {
      if (err.name === 'AbortError') return;

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
  }, [sessionId]);

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
