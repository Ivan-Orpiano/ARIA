
import { fileToBase64, formatFileSize } from '../utils/fileUtils';

/** Base webhook URL */
const WEBHOOK_BASE_URL =
  'https://vanvanproject.app.n8n.cloud/webhook-test/fee2e2ba-dd83-4fe9-9757-cc9ea6ae4bb1';

/** Request timeout in milliseconds */
const REQUEST_TIMEOUT_MS = 30000;

/** App identifier sent with every request */
const APP_SOURCE = 'ai-secretary-assistant-v1';

// ─────────────────────────────────────────────
// Request Builder
// ─────────────────────────────────────────────

/**
 * Encodes all file metadata (including base64 content) into
 * a serializable array for URL parameter transmission.
 * @param {File[]} files
 * @returns {Promise<Object[]>}
 */
async function encodeFiles(files) {
  if (!files || files.length === 0) return [];

  const encoded = await Promise.all(
    files.map(async (file) => {
      let base64 = null;
      try {
        base64 = await fileToBase64(file);
      } catch {
        // Non-fatal: proceed without base64 if read fails
        base64 = null;
      }
      return {
        name:          file.name,
        type:          file.type,
        size:          file.size,
        sizeFormatted: formatFileSize(file.size),
        lastModified:  file.lastModified,
        base64,
      };
    })
  );

  return encoded;
}

/**
 * Builds the URLSearchParams object for the GET request.
 * @param {string} message
 * @param {File[]} files
 * @param {string} sessionId
 * @param {Object[]} encodedFiles
 * @returns {URLSearchParams}
 */
function buildParams(message, files, sessionId, encodedFiles) {
  return new URLSearchParams({
    message:       message.trim(),
    sessionId,
    timestamp:     new Date().toISOString(),
    source:        APP_SOURCE,
    fileCount:     files.length,
    fileNames:     files.map((f) => f.name).join(', '),
    fileTypes:     files.map((f) => f.type).join(', '),
    fileMetadata:  JSON.stringify(encodedFiles),
  });
}

// ─────────────────────────────────────────────
// Response Parser
// ─────────────────────────────────────────────

/**
 * Extracts the AI reply text from various possible n8n
 * response shapes. Tries multiple known field names before
 * falling back to a default success message.
 * @param {any} data - Parsed JSON or raw text from webhook
 * @returns {string}
 */
function extractReply(data) {
  if (!data) {
    return '✅ Your message was received successfully.';
  }

  // Common n8n response field names
  const candidates = [
    data?.output,
    data?.response,
    data?.message,
    data?.text,
    data?.reply,
    data?.answer,
    data?.result,
    data?.content,
    data?.data?.message,
    data?.data?.response,
    data?.data?.output,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  // If data itself is a non-empty string
  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  // Last resort: stringify a small object
  if (typeof data === 'object') {
    const str = JSON.stringify(data);
    if (str && str !== '{}' && str !== '[]') {
      return `✅ Webhook responded: ${str.slice(0, 200)}`;
    }
  }

  return '✅ Your message was received and processed successfully.';
}

/**
 * Parses the raw fetch Response into a structured reply string.
 * Handles JSON and plain-text responses gracefully.
 * @param {Response} response
 * @returns {Promise<string>}
 */
async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      const json = await response.json();
      return extractReply(json);
    } catch {
      return '✅ Message received (could not parse JSON response).';
    }
  }

  // Plain text or HTML fallback
  try {
    const text = await response.text();
    return extractReply(text);
  } catch {
    return '✅ Message received.';
  }
}

// ─────────────────────────────────────────────
// Error Normalizer
// ─────────────────────────────────────────────

/**
 * Converts any caught error into a user-friendly string.
 * @param {unknown} err
 * @returns {string}
 */
function normalizeError(err) {
  if (!err) return 'An unknown error occurred.';

  if (err.name === 'AbortError') {
    return 'Request timed out. Please check your connection and try again.';
  }

  if (err.message?.toLowerCase().includes('failed to fetch') ||
      err.message?.toLowerCase().includes('networkerror') ||
      err.message?.toLowerCase().includes('network request failed')) {
    return 'Network error — unable to reach the assistant. Check your internet connection.';
  }

  if (err.message) return err.message;

  return 'Something went wrong. Please try again.';
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Sends a message (and optional files) to the n8n webhook.
 *
 * @param {string}   message   - The user's text message
 * @param {File[]}   files     - Array of File objects (may be empty)
 * @param {string}   sessionId - Unique conversation/session identifier
 * @returns {Promise<string>}  - The AI's reply text
 * @throws {Error}             - On network failure or non-OK HTTP status
 */
export async function sendToWebhook(message, files = [], sessionId = 'default') {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // 1. Encode files (base64)
    const encodedFiles = await encodeFiles(files);

    // 2. Build query params
    const params = buildParams(message, files, sessionId, encodedFiles);
    const url    = `${WEBHOOK_BASE_URL}?${params.toString()}`;

    // 3. Fire GET request
    const response = await fetch(url, {
      method:  'GET',
      headers: { Accept: 'application/json, text/plain, */*' },
      signal:  controller.signal,
    });

    // 4. Check HTTP status
    if (!response.ok) {
      throw new Error(
        `Webhook returned HTTP ${response.status} (${response.statusText || 'error'}). ` +
        `Please check the n8n workflow is active.`
      );
    }

    // 5. Parse and return the reply
    return await parseResponse(response);

  } catch (err) {
    throw new Error(normalizeError(err));
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Health-checks the webhook with a minimal ping request.
 * Useful for testing connectivity on app load.
 * @returns {Promise<boolean>}
 */
export async function pingWebhook() {
  try {
    const params = new URLSearchParams({ message: 'ping', source: APP_SOURCE, sessionId: 'health-check' });
    const res    = await fetch(`${WEBHOOK_BASE_URL}?${params}`, {
      method:  'GET',
      signal:  AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}