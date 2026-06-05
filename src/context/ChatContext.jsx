/**
 * ChatContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Global state management for the AI Secretary Assistant.
 *
 * Uses React Context + useReducer (Redux-style) for predictable,
 * centralized state. Every state mutation is dispatched as an
 * explicit action — no prop-drilling needed anywhere in the tree.
 *
 * Shape of state:
 * {
 *   messages:  Message[]   — full conversation history
 *   files:     File[]      — currently staged attachments
 *   isTyping:  boolean     — true while waiting for AI reply
 *   error:     string|null — current error message to display
 *   sessionId: string      — unique ID for this conversation
 *   theme:     'light'|'dark'
 * }
 * ─────────────────────────────────────────────────────────────
 */

import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { nowISO } from '../utils/dateUtils';

// ─────────────────────────────────────────────
// Action Types (string constants prevent typos)
// ─────────────────────────────────────────────
export const Actions = {
  ADD_MESSAGE:   'ADD_MESSAGE',
  SET_FILES:     'SET_FILES',
  ADD_FILES:     'ADD_FILES',
  REMOVE_FILE:   'REMOVE_FILE',
  CLEAR_FILES:   'CLEAR_FILES',
  SET_TYPING:    'SET_TYPING',
  SET_ERROR:     'SET_ERROR',
  CLEAR_ERROR:   'CLEAR_ERROR',
  SET_THEME:     'SET_THEME',
  CLEAR_HISTORY: 'CLEAR_HISTORY',
};

// ─────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────
const initialState = {
  messages:  [],
  files:     [],
  isTyping:  false,
  error:     null,
  sessionId: `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  theme:     window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
};

// ─────────────────────────────────────────────
// Pure Reducer
// ─────────────────────────────────────────────
function chatReducer(state, action) {
  switch (action.type) {
    case Actions.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,              // clear any lingering error on new message
      };

    case Actions.SET_FILES:
      return { ...state, files: action.payload };

    case Actions.ADD_FILES:
      return {
        ...state,
        files: [...state.files, ...action.payload].slice(0, 5),
      };

    case Actions.REMOVE_FILE:
      return {
        ...state,
        files: state.files.filter((_, i) => i !== action.payload),
      };

    case Actions.CLEAR_FILES:
      return { ...state, files: [] };

    case Actions.SET_TYPING:
      return { ...state, isTyping: action.payload };

    case Actions.SET_ERROR:
      return { ...state, error: action.payload, isTyping: false };

    case Actions.CLEAR_ERROR:
      return { ...state, error: null };

    case Actions.SET_THEME:
      return { ...state, theme: action.payload };

    case Actions.CLEAR_HISTORY:
      return {
        ...state,
        messages: [],
        files: [],
        error: null,
        isTyping: false,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      };

    default:
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[ChatContext] Unknown action type: "${action.type}"`);
      }
      return state;
  }
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────
export const ChatContext = createContext(null);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

/**
 * Wraps the app tree and exposes chat state + action dispatchers.
 * Any component can call `useChatContext()` to consume this.
 */
export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // ── Action creators (memoized for stable references) ──────

  const addMessage = useCallback((role, content, files = []) => {
    dispatch({
      type: Actions.ADD_MESSAGE,
      payload: {
        id:        `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        role,       // 'user' | 'assistant'
        content,
        files,
        timestamp: nowISO(),
      },
    });
  }, []);

  const setFiles = useCallback((files) => {
    dispatch({ type: Actions.SET_FILES, payload: files });
  }, []);

  const addFiles = useCallback((files) => {
    dispatch({ type: Actions.ADD_FILES, payload: files });
  }, []);

  const removeFile = useCallback((index) => {
    dispatch({ type: Actions.REMOVE_FILE, payload: index });
  }, []);

  const clearFiles = useCallback(() => {
    dispatch({ type: Actions.CLEAR_FILES });
  }, []);

  const setTyping = useCallback((bool) => {
    dispatch({ type: Actions.SET_TYPING, payload: bool });
  }, []);

  const setError = useCallback((msg) => {
    dispatch({ type: Actions.SET_ERROR, payload: msg });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: Actions.CLEAR_ERROR });
  }, []);

  const setTheme = useCallback((theme) => {
    dispatch({ type: Actions.SET_THEME, payload: theme });
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  const clearHistory = useCallback(() => {
    dispatch({ type: Actions.CLEAR_HISTORY });
  }, []);

  // ── Memoized context value (prevents unnecessary re-renders) ─
  const value = useMemo(() => ({
    // State
    messages:  state.messages,
    files:     state.files,
    isTyping:  state.isTyping,
    error:     state.error,
    sessionId: state.sessionId,
    theme:     state.theme,

    // Action creators
    addMessage,
    setFiles,
    addFiles,
    removeFile,
    clearFiles,
    setTyping,
    setError,
    clearError,
    setTheme,
    clearHistory,

    // Raw dispatch (for advanced use)
    dispatch,
  }), [
    state,
    addMessage, setFiles, addFiles, removeFile, clearFiles,
    setTyping, setError, clearError, setTheme, clearHistory,
  ]);

  // Sync theme attribute to <html> on mount and changes
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', state.theme);
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// ─────────────────────────────────────────────
// Consumer Hook
// ─────────────────────────────────────────────

/**
 * Returns the full ChatContext value.
 * Must be used inside a <ChatProvider>.
 */
export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChatContext must be used within a <ChatProvider>');
  }
  return ctx;
}