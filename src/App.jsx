/**
 * Main App Component
 * Manages interview state and routing between Setup and Interview screens
 */
import { useState, useCallback } from 'react';
import { SetupForm } from './components/SetupForm';
import { InterviewRoom } from './components/InterviewRoom';
import { useVapi, CallStatus } from './hooks/useVapi';
import { startInterview } from './services/api';

// App screens
const Screen = {
  SETUP: 'setup',
  INTERVIEW: 'interview',
};

function App() {
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

  // Handle form submission and start interview
  const handleStart = useCallback(async (formData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      // Get assistant config from backend
      const assistantConfig = await startInterview(formData);
      
      // Store candidate info
      setCandidateInfo(formData);
      
      // Switch to interview screen
      setScreen(Screen.INTERVIEW);
      
      // Start VAPI call with the config
      await startCall(assistantConfig);
    } catch (err) {
      console.error('Failed to start interview:', err);
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [startCall]);

  // Handle end call
  const handleEndCall = useCallback(() => {
    stopCall();
  }, [stopCall]);

  // Handle leave (return to setup)
  const handleLeave = useCallback(() => {
    stopCall();
    setScreen(Screen.SETUP);
    setCandidateInfo(null);
    setApiError(null);
  }, [stopCall]);

  // Render based on current screen
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

  // Setup screen
  return (
    <div>
      <SetupForm onStart={handleStart} isLoading={isLoading} />
      
      {/* API Error Toast */}
      {apiError && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{apiError}</span>
          <button onClick={() => setApiError(null)} className="ml-2 hover:opacity-70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
