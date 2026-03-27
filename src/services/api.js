/**
 * API service for communicating with the backend
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

console.log('[API] Base URL:', API_BASE);

/**
 * Start an interview session and get VAPI assistant config
 * @param {Object} params
 * @param {string} params.name - Candidate name
 * @param {string} params.phone - Phone number
 * @param {string} [params.category] - Knowledge category (when using module)
 * @param {string} [params.module] - Module (when using category/module)
 * @param {string} [params.jd_id] - Job description ID (optional; use JD-only or JD+module)
 * @returns {Promise<Object>} - VAPI assistant configuration
 */
export async function startInterview({ name, phone, category, module, jd_id }) {
  const body = { name, phone };
  if (category != null) body.category = category;
  if (module != null) body.module = module;
  if (jd_id) body.jd_id = jd_id;

  console.log('[API] Starting interview with params:', body);
  console.log('[API] POST', `${API_BASE}/interview/start`);

  const response = await fetch(`${API_BASE}/interview/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  console.log('[API] Response status:', response.status);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('[API] ERROR:', error);
    throw new Error(error.error || `HTTP ${response.status}: Failed to start interview`);
  }

  const data = await response.json();
  console.log('[API] Got assistant config:', {
    model: data.assistantConfig?.model?.model,
    voice: data.assistantConfig?.voice?.voiceId,
    hasSystemPrompt: !!data.assistantConfig?.model?.systemPrompt,
  });
  return data.assistantConfig;
}

/**
 * Start an embedded interview (skip login/setup) for the hosted WebView page.
 * Calls POST /interview/mobile/start with embedded-start token set: { sid, st, exp, sig }.
 * @param {Object} params
 * @param {string} params.sid
 * @param {string} params.st - Signed JWT token
 * @param {string|number} params.exp - Epoch seconds
 * @param {string} params.sig - HMAC signature
 * @returns {Promise<Object>} assistantConfig
 */
export async function startEmbeddedInterview({ sid, st, exp, sig }) {
  const response = await fetch(`${API_BASE}/interview/mobile/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sid, st, exp, sig }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = error.error || `HTTP ${response.status}: Failed to start embedded interview`;
    const err = new Error(message);
    err.code = error.code || 'EMBEDDED_START_FAILED';
    throw err;
  }

  const data = await response.json();
  return data.assistantConfig;
}

/**
 * Submit interview result when call ends (frontend-driven evaluation).
 * @param {Object} params
 * @param {string} params.callId - Client-generated UUID for this call
 * @param {string} params.name - Candidate name (from assistant metadata)
 * @param {string} params.phone - Phone number (from assistant metadata)
 * @param {string} [params.category] - Knowledge category
 * @param {string|number} [params.module] - Module identifier
 * @param {string} [params.jd_id] - Job description ID (when JD was used)
 * @param {string} [params.transcript] - Full transcript text
 * @param {string} [params.endedReason] - Why the call ended
 * @returns {Promise<{ score: number, summary: string }>}
 */
export async function submitInterviewResult({ callId, name, phone, category, module, jd_id, transcript, endedReason }) {
  const body = {
    callId,
    name: name || '',
    phone: phone || '',
    transcript: transcript || '',
    endedReason,
  };
  if (category != null) body.category = category;
  if (module != null) body.module = module;
  if (jd_id) body.jd_id = jd_id;

  const response = await fetch(`${API_BASE}/interview/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}: Failed to submit interview result`);
  }

  return response.json();
}

export default {
  startInterview,
  startEmbeddedInterview,
  submitInterviewResult,
};
