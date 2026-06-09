import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from 'react';
import { sendToWebhook }   from '../services/webhookService';
import {
  createUserMessage,
  createAssistantMessage,
  createErrorMessage,
  genSessionId,
} from '../utils/messageUtils';

/* ─────────────────────────────────────────────────────────────────── */
/*  State shape                                                         */
/* ─────────────────────────────────────────────────────────────────── */
const initialState = {
  messages:    [],   // { id, role, text, files, timestamp, status }
  isLoading:   false,
  error:       null,
  sessionId:   genSessionId(),
};

/* ─────────────────────────────────────────────────────────────────── */
/*  Reducer                                                             */
/* ─────────────────────────────────────────────────────────────────── */
const ADD_MSG      = 'ADD_MSG';
const UPDATE_MSG   = 'UPDATE_MSG';
const SET_LOADING  = 'SET_LOADING';
const SET_ERROR    = 'SET_ERROR';
const CLEAR_CHAT   = 'CLEAR_CHAT';

function chatReducer(state, action) {
  switch (action.type) {
    case ADD_MSG:
      return { ...state, messages: [...state.messages, action.payload] };

    case UPDATE_MSG:
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id ? { ...m, ...action.payload } : m
        ),
      };

    case SET_LOADING:
      return { ...state, isLoading: action.payload };

    case SET_ERROR:
      return { ...state, error: action.payload };

    case CLEAR_CHAT:
      return { ...initialState, sessionId: state.sessionId };

    default:
      return state;
  }
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Context                                                             */
/* ─────────────────────────────────────────────────────────────────── */
const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  /* ── sendMessage ─────────────────────────────────────────────── */
  const sendMessage = useCallback(
    async (text, files = []) => {
      if (!text.trim() && files.length === 0) return;

      /* 1. Add user message optimistically */
      const userMsg = createUserMessage(text, files);
      dispatch({ type: ADD_MSG, payload: userMsg });
      dispatch({ type: SET_LOADING, payload: true });
      dispatch({ type: SET_ERROR,   payload: null });

      /* 2. Mark user message as sent */
      dispatch({ type: UPDATE_MSG, payload: { id: userMsg.id, status: 'sent' } });

      try {
        /* 3. Call webhook */
        const { reply } = await sendToWebhook({
          message:   text,
          files:     files.map((fp) => fp.file),
          sessionId: state.sessionId,
        });

        /* 4. Add assistant reply */
        const assistantMsg = createAssistantMessage(reply);
        dispatch({ type: ADD_MSG, payload: assistantMsg });
      } catch (err) {
        const errText =
          err?.statusCode === 404
            ? '⚠️ Webhook not found. Please check the endpoint URL.'
            : err?.statusCode >= 500
            ? '⚠️ The server encountered an error. Please try again later.'
            : `⚠️ Could not reach the assistant: ${err.message}`;

        dispatch({ type: ADD_MSG, payload: createErrorMessage(errText) });
        dispatch({ type: SET_ERROR, payload: err.message });
      } finally {
        dispatch({ type: SET_LOADING, payload: false });
      }
    },
    [state.sessionId]
  );

  /* ── clearChat ───────────────────────────────────────────────── */
  const clearChat = useCallback(() => {
    dispatch({ type: CLEAR_CHAT });
  }, []);

  /* ── context value ───────────────────────────────────────────── */
  const value = useMemo(
    () => ({
      messages:    state.messages,
      isLoading:   state.isLoading,
      error:       state.error,
      sessionId:   state.sessionId,
      sendMessage,
      clearChat,
    }),
    [state, sendMessage, clearChat]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

/* ── Custom hook ──────────────────────────────────────────────────── */
export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used inside <ChatProvider>');
  return ctx;
}