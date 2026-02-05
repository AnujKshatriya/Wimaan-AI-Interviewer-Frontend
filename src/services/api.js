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
 * @param {string} params.category - Knowledge category (from route, e.g. "call_center")
 * @param {string} params.module - Module (default "1")
 * @returns {Promise<Object>} - VAPI assistant configuration
 */
export async function startInterview({ name, phone, category, module }) {
  console.log('[API] Starting interview with params:', { name, phone, category, module });
  console.log('[API] POST', `${API_BASE}/interview/start`);

  const response = await fetch(`${API_BASE}/interview/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, category, module }),
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
 * Submit interview result when call ends (frontend-driven evaluation).
 * @param {Object} params
 * @param {string} params.callId - Client-generated UUID for this call
 * @param {string} params.name - Candidate name (from assistant metadata)
 * @param {string} params.phone - Phone number (from assistant metadata)
 * @param {string} params.category - Knowledge category
 * @param {string|number} params.module - Module identifier
 * @param {string} [params.transcript] - Full transcript text
 * @param {string} [params.endedReason] - Why the call ended
 * @returns {Promise<{ score: number, summary: string }>}
 */
export async function submitInterviewResult({ callId, name, phone, category, module, transcript, endedReason }) {
  const response = await fetch(`${API_BASE}/interview/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callId,
      name: name || '',
      phone: phone || '',
      category,
      module,
      transcript: transcript || '',
      endedReason,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}: Failed to submit interview result`);
  }

  return response.json();
}

export default {
  startInterview,
  submitInterviewResult,
};
