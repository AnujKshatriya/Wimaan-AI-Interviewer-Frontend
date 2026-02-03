/**
 * TranscriptPanel Component
 * Displays live conversation transcript during the interview
 */
import { useEffect, useRef } from 'react';
import { Speaker } from '../hooks/useVapi';

export function TranscriptPanel({ transcript, isVisible = true }) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  if (!isVisible) return null;

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <span className="text-sm font-medium text-white">Live Transcript</span>
      </div>

      {/* Transcript Content */}
      <div ref={scrollRef} className="h-64 overflow-y-auto p-4 space-y-3">
        {transcript.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">
            Conversation will appear here...
          </p>
        ) : (
          transcript.map((entry, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                entry.speaker === Speaker.USER ? 'justify-end' : 'justify-start'
              }`}
            >
              {entry.speaker === Speaker.ASSISTANT && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                  </svg>
                </div>
              )}

              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  entry.speaker === Speaker.USER
                    ? 'bg-purple-600 text-white rounded-br-md'
                    : 'bg-white/10 text-gray-200 rounded-bl-md'
                } ${!entry.isFinal ? 'opacity-70' : ''}`}
              >
                <p className="text-sm">{entry.text}</p>
              </div>

              {entry.speaker === Speaker.USER && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TranscriptPanel;
