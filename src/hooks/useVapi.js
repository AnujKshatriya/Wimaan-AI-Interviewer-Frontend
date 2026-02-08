/**
 * Custom hook for VAPI SDK integration
 * Manages call state, transcripts, and VAPI events.
 * When call ends, submits transcript to backend for evaluation (web-based agents have no webhook).
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { submitInterviewResult } from '../services/api.js';

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;

// Call status enum
export const CallStatus = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ENDED: 'ended',
  ERROR: 'error',
};

// Speaker enum for transcripts
export const Speaker = {
  USER: 'user',
  ASSISTANT: 'assistant',
};

/** Build a single transcript string from entries for backend evaluation. */
function buildTranscriptString(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return '';
  return entries
    .filter((e) => e?.text?.trim())
    .map((e) => (e.speaker === Speaker.ASSISTANT ? `Assistant: ${e.text}` : `User: ${e.text}`))
    .join('\n');
}

export function useVapi() {
  const vapiRef = useRef(null);
  const [status, setStatus] = useState(CallStatus.IDLE);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // AI is speaking
  const [transcript, setTranscript] = useState([]); // Array of { speaker, text, timestamp }
  const [error, setError] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [finalResult, setFinalResult] = useState(null); // Score and summary (from submit or legacy tool call)
  const [endReason, setEndReason] = useState(null); // Why the call ended
  const timerRef = useRef(null);
  const hasReceivedScoreRef = useRef(false); // Track if we got score before call-end (legacy)
  const callIdRef = useRef(null);
  const metadataRef = useRef({});
  const transcriptRef = useRef([]);
  const submittedRef = useRef(false);

  // Keep transcriptRef in sync so we read latest transcript when call ends
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // When call has ended, submit transcript to backend for evaluation (once per call)
  useEffect(() => {
    if (status !== CallStatus.ENDED || submittedRef.current) return;

    const timeoutId = setTimeout(async () => {
      const callId = callIdRef.current;
      const meta = metadataRef.current;
      if (!callId || !meta.phone) {
        return;
      }
      submittedRef.current = true;

      const transcriptText = buildTranscriptString(transcriptRef.current);
      try {
        const result = await submitInterviewResult({
          callId,
          name: meta.name ?? '',
          phone: meta.phone ?? '',
          category: meta.category ?? '',
          module: meta.module ?? '',
          jd_id: meta.jdId || undefined,
          transcript: transcriptText,
          endedReason: endReason || undefined,
        });
        setFinalResult({
          score: result.score ?? 0,
          summary: result.summary ?? 'Interview evaluated.',
          userId: meta.phone,
        });
      } catch (err) {
        console.error('[useVapi] Submit interview result failed:', err);
        setError(err.message || 'Evaluation failed');
        setFinalResult({
          score: 0,
          summary: 'Evaluation could not be completed. Please try again.',
          userId: meta.phone,
        });
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [status, endReason]);

  // Initialize VAPI client
  useEffect(() => {
    console.log('[useVapi] Initializing VAPI...');
    console.log('[useVapi] Public Key:', VAPI_PUBLIC_KEY ? `${VAPI_PUBLIC_KEY.substring(0, 10)}...` : 'NOT SET');
    
    if (!VAPI_PUBLIC_KEY) {
      console.error('[useVapi] ERROR: VAPI Public Key not found. Add VITE_VAPI_PUBLIC_KEY to .env');
      return;
    }

    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;
    console.log('[useVapi] VAPI client initialized successfully');

    // Event listeners
    vapi.on('call-start', () => {
      console.log('[useVapi] EVENT: call-start - Call connected!');
      setStatus(CallStatus.CONNECTED);
      setError(null);
      // Start duration timer
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    });

    vapi.on('call-end', (endData) => { 
      console.log('[useVapi] EVENT: call-end - Call ended', endData);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setEndReason(endData?.reason || 'unknown');
      setStatus(CallStatus.ENDED);
    });

    vapi.on('speech-start', () => {
      console.log('[useVapi] EVENT: speech-start - AI speaking');
      setIsSpeaking(true);
    });

    vapi.on('speech-end', () => {
      console.log('[useVapi] EVENT: speech-end - AI stopped speaking');
      setIsSpeaking(false);
    });

    vapi.on('message', (message) => {
      console.log('[useVapi] EVENT: message -', message.type, message);
      
      // Handle different message types
      if (message.type === 'transcript') {
        const newEntry = {
          speaker: message.role === 'user' ? Speaker.USER : Speaker.ASSISTANT,
          text: message.transcript,
          timestamp: Date.now(),
          isFinal: message.transcriptType === 'final',
        };

        setTranscript((prev) => {
          // If it's a partial transcript, update the last entry of same speaker
          if (!newEntry.isFinal && prev.length > 0) {
            const lastEntry = prev[prev.length - 1];
            if (lastEntry.speaker === newEntry.speaker && !lastEntry.isFinal) {
              return [...prev.slice(0, -1), newEntry];
            }
          }
          return [...prev, newEntry];
        });
      }

      // Handle function calls (submit_final_score or endCall)
      if (message.type === 'function-call') {
        const funcName = message.functionCall?.name || message.function?.name;
        const params = message.functionCall?.parameters || message.function?.arguments || {};
        
        console.log('[useVapi] Function call received:', funcName, params);
        
        if (funcName === 'submit_final_score' || funcName === 'endCall') {
          console.log('[useVapi] Got final score!', params);
          hasReceivedScoreRef.current = true;
          setFinalResult({
            score: params.score || 0,
            summary: params.summary || 'Interview completed.',
            userId: params.userId || '',
          });
        }
      }
      
      // Also check for tool-calls message type (alternative format)
      if (message.type === 'tool-calls') {
        console.log('[useVapi] Tool calls received:', message);
        const toolCall = message.toolCalls?.find(t => 
          t.function?.name === 'submit_final_score' || t.function?.name === 'endCall'
        );
        if (toolCall) {
          const params = typeof toolCall.function?.arguments === 'string' 
            ? JSON.parse(toolCall.function.arguments) 
            : toolCall.function?.arguments || {};
          console.log('[useVapi] Got score from tool-calls!', params);
          hasReceivedScoreRef.current = true;
          setFinalResult({
            score: params.score || 0,
            summary: params.summary || 'Interview completed.',
            userId: params.userId || '',
          });
        }
      }
    });

    vapi.on('error', (err) => {
      console.error('[useVapi] EVENT: error -', err);
      
      // Extract error message from nested VAPI error structure
      let errorMessage = 'An error occurred';
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.error?.message) {
        // VAPI error structure: { error: { message: string } }
        errorMessage = typeof err.error.message === 'string' 
          ? err.error.message 
          : err.error.message?.message || JSON.stringify(err.error.message);
      } else if (typeof err?.message === 'string') {
        errorMessage = err.message;
      } else if (err?.message?.message) {
        // Nested message object
        errorMessage = err.message.message;
      }
      
      console.error('[useVapi] Extracted error message:', errorMessage);
      setError(errorMessage);
      setStatus(CallStatus.ERROR);
    });

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      vapi.stop();
    };
  }, []);

  // Start call with assistant config
  const startCall = useCallback(async (assistantConfig) => {
    console.log('[useVapi] startCall() called');
    
    if (!vapiRef.current) {
      console.error('[useVapi] ERROR: VAPI not initialized');
      setError('VAPI not initialized. Check your API key.');
      return;
    }

    try {
      setStatus(CallStatus.CONNECTING);
      setTranscript([]);
      setCallDuration(0);
      setFinalResult(null);
      setError(null);
      setEndReason(null);
      hasReceivedScoreRef.current = false;
      submittedRef.current = false;

      callIdRef.current = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `call_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      metadataRef.current = assistantConfig?.metadata || {};

      console.log('[useVapi] Calling vapi.start() with config...');
      console.log('[useVapi] Assistant config preview:', {
        model: assistantConfig?.model?.model,
        provider: assistantConfig?.model?.provider,
        voice: assistantConfig?.voice?.voiceId,
        firstMessageLength: assistantConfig?.firstMessage?.length,
      });
      
      await vapiRef.current.start(assistantConfig);
      console.log('[useVapi] vapi.start() completed');
    } catch (err) {
      console.error('[useVapi] Failed to start call:', err);
      setError(err.message || 'Failed to start call');
      setStatus(CallStatus.ERROR);
    }
  }, []);

  // Stop call
  const stopCall = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (vapiRef.current) {
      const newMuted = !isMuted;
      vapiRef.current.setMuted(newMuted);
      setIsMuted(newMuted);
    }
  }, [isMuted]);

  // Format duration as MM:SS
  const formattedDuration = `${Math.floor(callDuration / 60)
    .toString()
    .padStart(2, '0')}:${(callDuration % 60).toString().padStart(2, '0')}`;

  return {
    status,
    isMuted,
    isSpeaking,
    transcript,
    error,
    callDuration,
    formattedDuration,
    finalResult,
    endReason,
    startCall,
    stopCall,
    toggleMute,
    isConnected: status === CallStatus.CONNECTED,
    isEnded: status === CallStatus.ENDED,
    isLoading: status === CallStatus.CONNECTING,
  };
}

export default useVapi;
