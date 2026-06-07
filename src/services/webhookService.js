const WEBHOOK_URL =
  'https://vanvanproject.app.n8n.cloud/webhook-test/fee2e2ba-dd83-4fe9-9757-cc9ea6ae4bb1';

/* ── Helper: read a File as base64 ───────────────────────────────── */
const readFileAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

/* ── Helper: safe JSON parse ─────────────────────────────────────── */
const tryParseJSON = (text) => {
  try   { return JSON.parse(text); }
  catch { return null; }
};

/* ── Main send function ──────────────────────────────────────────── */
/**
 * Sends message + optional file attachments to the n8n webhook.
 *
 * @param {Object} payload
 * @param {string}   payload.message   - The user's text message
 * @param {File[]}   payload.files     - Array of File objects (optional)
 * @param {string}   payload.sessionId - Unique session identifier
 * @returns {Promise<{ reply: string, raw: any }>}
 */
export const sendToWebhook = async ({ message = '', files = [], sessionId }) => {
  /* Build query params */
  const params = new URLSearchParams();

  params.append('message',    message.trim());
  params.append('sessionId',  sessionId || 'default');
  params.append('timestamp',  new Date().toISOString());
  params.append('source',     'aria-chatbot');

  /* Attach file metadata (and base64 for small files ≤ 1 MB) */
  if (files && files.length > 0) {
    params.append('fileCount', String(files.length));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      params.append(`file${i}_name`,    file.name);
      params.append(`file${i}_type`,    file.type || 'application/octet-stream');
      params.append(`file${i}_size`,    String(file.size));
      params.append(`file${i}_lastMod`, String(file.lastModified));

      /* Inline base64 only for small files to keep the URL manageable */
      if (file.size <= 1_048_576) {
        try {
          const b64 = await readFileAsBase64(file);
          params.append(`file${i}_data`, b64);
        } catch {
          params.append(`file${i}_data`, 'READ_ERROR');
        }
      } else {
        params.append(`file${i}_data`, 'FILE_TOO_LARGE_FOR_GET');
      }
    }
  }

  /* Perform the GET request */
  const url = `${WEBHOOK_URL}?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json, text/plain, */*' },
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'No response body');
    throw new WebhookError(
      `Webhook responded with ${response.status}: ${errText}`,
      response.status
    );
  }

  /* Parse response ------------------------------------------------- */
  const rawText = await response.text();
  const parsed  = tryParseJSON(rawText);

  /* Normalise the reply text from various n8n output shapes */
  const reply = extractReply(parsed, rawText);

  return { reply, raw: parsed ?? rawText };
};

/* ── Extract a human-readable reply from the webhook response ─────── */
const extractReply = (parsed, rawText) => {
  if (!parsed) {
    return rawText?.trim() || 'I received your message. How can I help you?';
  }

  /* Common n8n response shapes */
  if (typeof parsed === 'string') return parsed;
  if (parsed.reply)               return parsed.reply;
  if (parsed.message)             return parsed.message;
  if (parsed.response)            return parsed.response;
  if (parsed.output)              return parsed.output;
  if (parsed.text)                return parsed.text;
  if (parsed.answer)              return parsed.answer;

  /* Nested: { data: { reply } } */
  if (parsed.data) return extractReply(parsed.data, rawText);

  /* Array response */
  if (Array.isArray(parsed) && parsed.length > 0) {
    return extractReply(parsed[0], rawText);
  }

  return JSON.stringify(parsed);
};

/* ── Custom Error ────────────────────────────────────────────────── */
export class WebhookError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name       = 'WebhookError';
    this.statusCode = statusCode;
  }
}