/**
 * Interview flow for a given category (from URL). Renders SetupForm or InterviewRoom.
 */
import { useState, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { SetupForm } from './SetupForm';
import { InterviewRoom } from './InterviewRoom';
import { useVapi, CallStatus } from '../hooks/useVapi';
import { startInterview } from '../services/api';

/**
 * Category URL slugs → backend category IDs.
 * - To add a category: add a new key (URL path, e.g. 'retail') and value (backend id, e.g. 'retail').
 * - To remove: delete the line; invalid slugs redirect to /call-center.
 * Current: /call-center, /sales, /support
 */
const CATEGORY_SLUG_MAP = {
  'call-center': 'call_center',
  sales: 'sales',
  support: 'support',
  retail: 'retail',
};

const Screen = { SETUP: 'setup', INTERVIEW: 'interview' };

function InterviewFlow() {
  const { categorySlug } = useParams();
  const category = categorySlug ? CATEGORY_SLUG_MAP[categorySlug] : null;
  console.log('category', category);

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

  if (categorySlug && !category) {
    return <Navigate to="/call-center" replace />;
  }

  const handleStart = useCallback(
    async (formData) => {
      setIsLoading(true);
      setApiError(null);
      try {
        const assistantConfig = await startInterview(formData);
        setCandidateInfo(formData);
        setScreen(Screen.INTERVIEW);
        await startCall(assistantConfig);
      } catch (err) {
        console.error('Failed to start interview:', err);
        setApiError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [startCall]
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
        category={category || 'call_center'}
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
