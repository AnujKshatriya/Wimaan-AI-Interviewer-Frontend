/**
 * EmbeddedInterview
 * Auto-starts an interview for mobile WebView / skip-login flow.
 *
 * Mobile opens: /embed?st=<jwt>&sid=<sid>&exp=<epochSeconds>&sig=<hmac>
 * This page calls backend /interview/mobile/start with { sid, st, exp, sig } in embedded-start mode,
 * then immediately starts the Vapi call using the returned assistantConfig.
 */
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useVapi } from '../hooks/useVapi';
import { startEmbeddedInterview } from '../services/api';
import { InterviewRoom } from './InterviewRoom';

export function EmbeddedInterview() {
  const [searchParams] = useSearchParams();
  const st = searchParams.get('st') || '';
  const sid = searchParams.get('sid') || '';
  const exp = searchParams.get('exp') || '';
  const sig = searchParams.get('sig') || '';

  const postToNative = useCallback((type, payload = {}) => {
    const bridge = window?.ReactNativeWebView;
    if (!bridge || typeof bridge.postMessage !== 'function') return;
    try {
      bridge.postMessage(
        JSON.stringify({
          source: 'wimaan-interview-web',
          type,
          payload,
        })
      );
    } catch (e) {
      console.error('[EmbeddedInterview] Failed to post message to RN bridge:', e?.message || e);
    }
  }, []);

  const { status, isMuted, isSpeaking, transcript, formattedDuration, finalResult, error, startCall, stopCall, toggleMute } =
    useVapi({
      onInterviewEnded: ({ callId, endedReason, score, summary }) => {
        if (!callId || !endedReason) return;
        const payload = { callId, endedReason };
        if (score != null) payload.score = score;
        if (summary) payload.summary = summary;
        postToNative('interview_ended', payload);
      },
    });

  const [candidateName, setCandidateName] = useState('Candidate');
  const [embedError, setEmbedError] = useState(null);
  const startedRef = useRef(false);

  const canStart = useMemo(() => {
    return !!st && !!sid && !!exp && !!sig;
  }, [st, sid, exp, sig]);

  const handleLeave = useCallback(() => {
    stopCall();
  }, [stopCall]);

  const handleStartNewInterview = useCallback(() => {
    postToNative('start_new_interview_clicked', {});
  }, [postToNative]);

  useEffect(() => {
    if (!canStart || startedRef.current) return;
    startedRef.current = true;

    const run = async () => {
      try {
        setEmbedError(null);
        const assistantConfig = await startEmbeddedInterview({ sid, st, exp, sig });

        // assistantConfig.metadata is created by agent.service.js
        const metaName = assistantConfig?.metadata?.name;
        if (metaName) setCandidateName(metaName);

        await startCall(assistantConfig);
      } catch (e) {
        console.error('[EmbeddedInterview] Failed to start embedded interview:', e);
        setEmbedError(e.message || 'Failed to start interview');
      }
    };

    run();
  }, [canStart, sid, st, exp, sig, startCall]);

  if (!canStart) {
    return (
      <div className="min-h-screen bg-[var(--wimaan-bg)] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--wimaan-text)] mb-3">Invalid interview link</h2>
            <p className="text-[var(--wimaan-muted)]">Missing required session parameters. Please restart from the app.</p>
          </div>
        </div>
      </div>
    );
  }

  if (embedError) {
    return (
      <div className="min-h-screen bg-[var(--wimaan-bg)] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--wimaan-text)] mb-3">Failed to start</h2>
            <p className="text-[var(--wimaan-muted)] mb-6">{embedError}</p>
            <button
              type="button"
              onClick={handleStartNewInterview}
              className="inline-block px-6 py-3 bg-[var(--wimaan-accent)] hover:bg-[var(--wimaan-accent-hover)] text-white font-semibold rounded-lg shadow transition"
            >
              Back to App
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <InterviewRoom
      status={status}
      isMuted={isMuted}
      isSpeaking={isSpeaking}
      transcript={transcript}
      formattedDuration={formattedDuration}
      finalResult={finalResult}
      error={error}
      onToggleMute={toggleMute}
      onEndCall={() => stopCall()}
      onLeave={handleLeave}
      onStartNewInterview={handleStartNewInterview}
      candidateName={candidateName}
    />
  );
}

export default EmbeddedInterview;

