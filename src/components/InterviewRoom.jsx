/**
 * InterviewRoom Component
 * Voice interview UI with Wimaan theme (dark/light).
 */
import { CallStatus } from '../hooks/useVapi';
import TranscriptPanel from './TranscriptPanel';
import { AppHeader } from './AppHeader';

export function InterviewRoom({
  status,
  isMuted,
  isSpeaking,
  transcript,
  formattedDuration,
  finalResult,
  error,
  onToggleMute,
  onEndCall,
  onLeave,
  candidateName,
}) {
  const isConnected = status === CallStatus.CONNECTED;
  const isEnded = status === CallStatus.ENDED;
  const isConnecting = status === CallStatus.CONNECTING;

  if (isEnded && finalResult) {
    return (
      <div className="min-h-screen bg-[var(--wimaan-bg)] flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--wimaan-bg-card)] backdrop-blur-lg rounded-2xl p-8 border border-[var(--wimaan-border)]">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--wimaan-accent)] flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[var(--wimaan-text)] mb-2">Interview Complete!</h2>
              <p className="text-[var(--wimaan-muted)]">Thank you for participating, {candidateName}</p>
            </div>

            <div className="bg-[var(--wimaan-bg)] rounded-xl p-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-[var(--wimaan-muted)] mb-2">Your Score</p>
                <div className="text-5xl font-bold text-[var(--wimaan-accent)]">{finalResult.score}</div>
                <p className="text-sm text-[var(--wimaan-muted)] mt-1">out of 100</p>
              </div>
              <div className="mt-4 h-3 bg-[var(--wimaan-border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--wimaan-accent)] rounded-full transition-all duration-1000"
                  style={{ width: `${finalResult.score}%` }}
                />
              </div>
            </div>

            <div className="bg-[var(--wimaan-bg)] rounded-xl p-6 mb-6">
              <h3 className="text-sm font-medium text-[var(--wimaan-muted)] mb-2">Feedback</h3>
              <p className="text-[var(--wimaan-text)] text-sm leading-relaxed opacity-90">{finalResult.summary}</p>
            </div>

            <button
              onClick={onLeave}
              className="w-full py-4 bg-[var(--wimaan-accent)] hover:bg-[var(--wimaan-accent-hover)] text-white font-semibold rounded-lg transition"
            >
              Start New Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isEnded) {
    return (
      <div className="min-h-screen bg-[var(--wimaan-bg)] flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--wimaan-text)] mb-4">Interview Ended</h2>
            <p className="text-[var(--wimaan-muted)] mb-6">The call has been disconnected.</p>
            <button
              onClick={onLeave}
              className="px-8 py-3 bg-[var(--wimaan-accent)] hover:bg-[var(--wimaan-accent-hover)] text-white rounded-lg transition"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--wimaan-bg)] flex flex-col">
      <AppHeader />
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--wimaan-border)]">
        <div className="flex items-center gap-3">
          <div className="font-semibold text-[var(--wimaan-text)]">Wimaan AI Interview</div>
          {isConnected && (
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live
            </span>
          )}
        </div>
        <div className="font-mono text-lg text-[var(--wimaan-text)]">{formattedDuration}</div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6">
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            <div
              className={`w-64 h-64 rounded-full bg-[var(--wimaan-accent)] flex items-center justify-center shadow-2xl ${
                isSpeaking ? 'animate-pulse ring-4 ring-[var(--wimaan-accent)]/50' : ''
              }`}
            >
              {isConnecting ? (
                <div className="text-center">
                  <svg className="w-16 h-16 text-white/70 animate-spin mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-white/70 text-sm">Connecting...</p>
                </div>
              ) : (
                <svg className="w-32 h-32 text-white/90" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            {isSpeaking && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[var(--wimaan-accent)] px-4 py-1 rounded-full">
                <span className="text-white text-sm flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  Speaking
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-96">
          <TranscriptPanel transcript={transcript} />
        </div>
      </div>

      {error && (
        <div className="mx-6 mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="border-t border-[var(--wimaan-border)] px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onToggleMute}
            disabled={!isConnected}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-[var(--wimaan-bg-card)] hover:opacity-90 border border-[var(--wimaan-border)]'
            } disabled:opacity-50 disabled:cursor-not-allowed text-[var(--wimaan-text)]`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
          <button
            onClick={onEndCall}
            disabled={!isConnected}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed text-white"
            title="End Call"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.28 3H5z" />
            </svg>
          </button>
          <button
            onClick={onLeave}
            className="w-14 h-14 rounded-full bg-[var(--wimaan-bg-card)] hover:opacity-90 border border-[var(--wimaan-border)] flex items-center justify-center transition text-[var(--wimaan-text)]"
            title="Leave"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[var(--wimaan-muted)] text-sm mt-4">
          Interviewing: <span className="text-[var(--wimaan-text)]">{candidateName}</span>
        </p>
      </div>
    </div>
  );
}

export default InterviewRoom;
