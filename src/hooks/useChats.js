/**
 * useChat.js
 * ─────────────────────────────────────────────────────────────
 * Orchestrates the full send-message flow:
 *   1. Validates input
 *   2. Appends user message to history
 *   3. Clears staged files
 *   4. Calls WebhookService
 *   5. Appends AI reply (or sets error)
 *   6. Manages loading state throughout
 * ─────────────────────────────────────────────────────────────
 */

import { useCallback } from 'react';
import { useChatContext } from '../context/ChatContext';
import { sendToWebhook }  from '../services/webhookService';
import { createPreviewUrl } from '../utils/fileUtils';

/**
 * Hook that exposes the `sendMessage` function and all
 * relevant chat state for components to consume.
 *
 * @returns {{
 *   messages:     import('../context/ChatContext').Message[],
 *   isTyping:     boolean,
 *   error:        string|null,
 *   sessionId:    string,
 *   sendMessage:  (text: string, files: File[]) => Promise<void>,
 *   clearError:   () => void,
 *   clearHistory: () => void,
 * }}
 */
export function useChat() {
  const {
    messages,
    isTyping,
    error,
    sessionId,
    addMessage,
    clearFiles,
    setTyping,
    setError,
    clearError,
    clearHistory,
  } = useChatContext();

  /**
   * Sends a message + optional files to the webhook and
   * appends both the user message and AI reply to history.
   *
   * @param {string} text
   * @param {File[]} files
   */
  const sendMessage = useCallback(async (text, files = []) => {
    const trimmed = text?.trim() ?? '';
    if (!trimmed && files.length === 0) return;
    if (isTyping) return; // prevent double-send

    // Build lightweight file metadata for the message record
    // (we store only what's needed for display, not the raw File objects)
    const filePreviews = files.map((f) => ({
      name:    f.name,
      type:    f.type,
      size:    f.size,
      preview: createPreviewUrl(f),   // object URL for images; null otherwise
    }));

    // 1. Append user message immediately (optimistic UI)
    addMessage('user', trimmed, filePreviews);

    // 2. Clear staged files
    clearFiles();

    // 3. Show typing indicator
    setTyping(true);
    clearError();

    try {
      // 4. Call webhook service (passes raw File objects for base64 encoding)
      const reply = await sendToWebhook(trimmed, files, sessionId);

      // 5. Append AI reply
      addMessage('assistant', reply, []);

    } catch (err) {
      setError(
        err?.message ||
        'Failed to reach the assistant. Please check your connection and try again.'
      );
    } finally {
      // 6. Always stop typing indicator
      setTyping(false);
    }
  }, [
    isTyping, sessionId,
    addMessage, clearFiles, setTyping, setError, clearError,
  ]);

  return {
    messages,
    isTyping,
    error,
    sessionId,
    sendMessage,
    clearError,
    clearHistory,
  };
}