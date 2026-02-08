/**
 * Interview flow: context from URL (jdId and/or category).
 * Wimaan main platform redirects here with the appropriate path.
 */
import { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SetupForm } from './SetupForm';
import { InterviewRoom } from './InterviewRoom';
import PageNotFound from './PageNotFound';
import { useVapi, CallStatus } from '../hooks/useVapi';
import { startInterview } from '../services/api';

const CATEGORY_SLUG_MAP = {
  'call-center': 'call_center',
  sales: 'sales',
  support: 'support',
  retail: 'retail',
};

const Screen = { SETUP: 'setup', INTERVIEW: 'interview' };

/** Determine case from URL params */
function useInterviewContext() {
  const params = useParams();
  const { jdId, categorySlug } = params;
  const category = categorySlug ? CATEGORY_SLUG_MAP[categorySlug] : null;

  return useMemo(() => {
    const hasJd = !!jdId?.trim();
    const hasCategory = !!category?.trim();
    let caseNum;
    if (hasJd && hasCategory) caseNum = 3;
    else if (hasJd) caseNum = 2;
    else if (hasCategory) caseNum = 1;
    else caseNum = null;

    return { jdId: hasJd ? jdId : null, category, caseNum, categorySlug };
  }, [jdId, category, categorySlug]);
}

function InterviewFlow() {
  const { jdId, category, caseNum, categorySlug } = useInterviewContext();

  const [screen, setScreen] = useState(Screen.SETUP);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [candidateInfo, setCandidateInfo] = useState(null);

  const {
    status,
    isMuted,
    isSpeaking,
    transcript,
    formattedDuration,
    finalResult,
    error: vapiError,
    startCall,
    stopCall,
    toggleMute,
  } = useVapi();

  // Show 404 for invalid/unknown routes (avoids redirect which caused blank screen)
  if (!jdId && !category) {
    return <PageNotFound />;
  }
  if (categorySlug && !category) {
    return <PageNotFound />;
  }

  const handleStart = useCallback(
    async (formData) => {
      setIsLoading(true);
      setApiError(null);

      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      };
      if (jdId) payload.jd_id = jdId;
      if (category) {
        payload.category = category;
        payload.module = formData.module || '1';
      } else {
        payload.category = '';
        payload.module = '';
      }

      console.log('[FRONTEND] Start interview — Case', caseNum, {
        case: caseNum === 1 ? 'category+module only' : caseNum === 2 ? 'JD only' : 'JD + category+module',
        jd_id: jdId || '(none)',
        category: category || '(none)',
        module: payload.module || '(none)',
        name: payload.name,
      });

      try {
        const assistantConfig = await startInterview(payload);
        setCandidateInfo(payload);
        setScreen(Screen.INTERVIEW);
        await startCall(assistantConfig);
      } catch (err) {
        console.error('[FRONTEND] Failed to start interview:', err);
        setApiError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [jdId, category, caseNum, startCall]
  );

  const handleEndCall = useCallback(() => stopCall(), [stopCall]);

  const handleLeave = useCallback(() => {
    stopCall();
    setScreen(Screen.SETUP);
    setCandidateInfo(null);
    setApiError(null);
  }, [stopCall]);

  if (screen === Screen.INTERVIEW) {
    return (
      <InterviewRoom
        status={status}
        isMuted={isMuted}
        isSpeaking={isSpeaking}
        transcript={transcript}
        formattedDuration={formattedDuration}
        finalResult={finalResult}
        error={vapiError}
        onToggleMute={toggleMute}
        onEndCall={handleEndCall}
        onLeave={handleLeave}
        candidateName={candidateInfo?.name || 'Candidate'}
      />
    );
  }

  return (
    <div>
      <SetupForm
        jdId={jdId}
        category={category}
        onStart={handleStart}
        isLoading={isLoading}
      />
      {apiError && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
          <span>{apiError}</span>
          <button onClick={() => setApiError(null)} className="ml-2 hover:opacity-70" type="button">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default InterviewFlow;
