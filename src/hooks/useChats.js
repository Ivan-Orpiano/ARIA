import { useChatContext } from '../context/ChatContext';

/**
 * useChat – convenience hook that exposes the full chat API.
 * Components can import this instead of reaching for the context directly.
 */
export function useChat() {
  const {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    clearChat,
  } = useChatContext();

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    clearChat,
    hasMessages: messages.length > 0,
  };
}