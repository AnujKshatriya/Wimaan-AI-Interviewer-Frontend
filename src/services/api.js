/**
 * API service for communicating with the backend
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

console.log('[API] Base URL:', API_BASE);

/**
 * Start an interview session and get VAPI assistant config
 * @param {Object} params
 * @param {string} params.userId - Unique user identifier
 * @param {string} params.name - Candidate name
 * @param {string} params.category - Knowledge category (e.g., "call_center")
 * @param {string} params.module - Module number/identifier
 * @returns {Promise<Object>} - VAPI assistant configuration
 */
export async function startInterview({ userId, name, category, module }) {
  console.log('[API] Starting interview with params:', { userId, name, category, module });
  console.log('[API] POST', `${API_BASE}/interview/start`);
  
  const response = await fetch(`${API_BASE}/interview/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, name, category, module }),
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
 * Generate a unique user ID
 * @returns {string}
 */
export function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default {
  startInterview,
  generateUserId,
};
