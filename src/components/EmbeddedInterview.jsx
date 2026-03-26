/**
 * EmbeddedInterview
 * Auto-starts an interview for mobile WebView / skip-login flow.
 *
 * Mobile opens: /embed?st=<jwt>&sid=<sid>&exp=<epochSeconds>&sig=<hmac>
 * This page calls backend /interview/start with { sid, st, exp, sig } in embedded-start mode,
 * then immediately starts the Vapi call using the returned assistantConfig.
 */
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSearchParams, Navigate, useNavigate } from 'react-router-dom';
import { useVapi } from '../hooks/useVapi';
import { startEmbeddedInterview } from '../services/api';
import { InterviewRoom } from './InterviewRoom';

export function EmbeddedInterview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const st = searchParams.get('st') || '';
  const sid = searchParams.get('sid') || '';
  const exp = searchParams.get('exp') || '';
  const sig = searchParams.get('sig') || '';

  const { status, isMuted, isSpeaking, transcript, formattedDuration, finalResult, error, startCall, stopCall, toggleMute } =
    useVapi();

  const [candidateName, setCandidateName] = useState('Candidate');
  const [embedError, setEmbedError] = useState(null);
  const startedRef = useRef(false);

  const canStart = useMemo(() => {
    return !!st && !!sid && !!exp && !!sig;
  }, [st, sid, exp, sig]);

  const handleLeave = useCallback(() => {
    stopCall();
    navigate('/call-center', { replace: true });
  }, [stopCall]);

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
    return <Navigate to="/call-center" replace />;
  }

  if (embedError) {
    return (
      <div className="min-h-screen bg-[var(--wimaan-bg)] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--wimaan-text)] mb-3">Failed to start</h2>
            <p className="text-[var(--wimaan-muted)] mb-6">{embedError}</p>
            <a
              href="/call-center"
              className="inline-block px-6 py-3 bg-[var(--wimaan-accent)] hover:bg-[var(--wimaan-accent-hover)] text-white font-semibold rounded-lg shadow transition"
            >
              Go to Home
            </a>
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
      candidateName={candidateName}
    />
  );
}

export default EmbeddedInterview;

