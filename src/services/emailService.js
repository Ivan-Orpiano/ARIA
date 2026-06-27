/**
 * emailService.js
 * Talks to the Python (FastAPI) backend, which in turn triggers the
 * correct n8n webhook. The frontend never calls n8n directly — the
 * backend owns the webhook URL + secret.
 */

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

/* ── Basic email check (UX only; backend re-validates) ───────────── */
export const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());

/* ── Custom error ────────────────────────────────────────────────── */
export class EmailServiceError extends Error {
  constructor(message, statusCode, body) {
    super(message);
    this.name = 'EmailServiceError';
    this.statusCode = statusCode;
    this.body = body;
  }
}

/**
 * Trigger an email workflow via the backend.
 *
 * @param {Object} args
 * @param {string}   args.recipient  - Email entered by the user in the chatbox
 * @param {string=}  args.subject
 * @param {string=}  args.message
 * @param {('daily_tasks'|'reminder'|'default')=} args.workflow
 * @param {Array<{title:string,due?:string,done?:boolean}>=} args.tasks
 * @param {string=}  args.sessionId
 * @returns {Promise<{ status:string, workflow:string, detail:string, n8n_response:any }>}
 */
export const triggerEmail = async ({
  recipient,
  subject,
  message,
  workflow = 'daily_tasks',
  tasks = [],
  sessionId,
}) => {
  if (!isValidEmail(recipient)) {
    throw new EmailServiceError('Please enter a valid email address.', 400);
  }

  let response;
  try {
    response = await fetch(`${API_BASE}/api/email/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: recipient.trim(),
        subject,
        message,
        workflow,
        tasks,
        session_id: sessionId,
      }),
    });
  } catch (networkErr) {
    throw new EmailServiceError(
      'Network error — could not reach the backend.',
      0,
      String(networkErr)
    );
  }

  const raw = await response.text();
  let body = null;
  try { body = raw ? JSON.parse(raw) : null; } catch { body = raw; }

  if (!response.ok) {
    const detail =
      body?.detail?.message ||
      (Array.isArray(body?.detail) ? body.detail[0]?.msg : null) ||
      body?.detail ||
      `Request failed (${response.status}).`;
    throw new EmailServiceError(detail, response.status, body);
  }

  return body;
};