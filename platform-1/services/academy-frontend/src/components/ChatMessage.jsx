import React, { useState } from 'react';
import { formatTime } from '../utils/dateFormatter';
import { parseMarkdown } from '../utils/messageParser';

export default function ChatMessage({
  message,
  isDarkMode,
  onCopy,
  onRegenerate,
  onDelete,
}) {
  const [isHovering, setIsHovering] = useState(false);

  const isUser = message.role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3 animate-fade-in`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {!isUser && (
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
          isDarkMode ? 'bg-primary/10' : 'bg-blue-100'
        }`}>
          <svg className={`w-5 h-5 ${isDarkMode ? 'text-primary' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5.36 6.364l-.707.707M9 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-2xl`}>
        <div
          className={`px-4 py-3 rounded-2xl transition-all duration-200 ${
            isUser
              ? isDarkMode
                ? 'bg-primary/20 border border-primary/30 text-white'
                : 'bg-blue-100 border border-blue-200 text-gray-900'
              : isDarkMode
              ? 'bg-surface-container border border-white/10 text-on-surface'
              : 'bg-gray-100 border border-gray-200 text-gray-900'
          }`}
        >
          <div className="prose prose-invert max-w-none">
            {parseMarkdown(message.content)}
          </div>
        </div>

        {/* Message Actions */}
        {isHovering && (
          <div className={`flex items-center gap-2 mt-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {!isUser && (
              <>
                <button
                  onClick={onCopy}
                  className={`p-1.5 rounded transition-all duration-200 ${
                    isDarkMode
                      ? 'hover:bg-white/10 text-on-surface-variant/60 hover:text-primary'
                      : 'hover:bg-gray-200 text-gray-500 hover:text-blue-500'
                  }`}
                  title="Copy message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={onRegenerate}
                  className={`p-1.5 rounded transition-all duration-200 ${
                    isDarkMode
                      ? 'hover:bg-white/10 text-on-surface-variant/60 hover:text-primary'
                      : 'hover:bg-gray-200 text-gray-500 hover:text-blue-500'
                  }`}
                  title="Regenerate response"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </>
            )}
            <button
              onClick={onDelete}
              className={`p-1.5 rounded transition-all duration-200 ${
                isDarkMode
                  ? 'hover:bg-red-500/20 text-red-400/60 hover:text-red-400'
                  : 'hover:bg-red-100 text-red-500/60 hover:text-red-600'
              }`}
              title="Delete message"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}

        {/* Timestamp */}
        <span className={`text-xs mt-1 ${
          isDarkMode ? 'text-on-surface-variant/40' : 'text-gray-400'
        }`}>
          {formatTime(message.timestamp)}
        </span>
      </div>

      {isUser && (
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
          isDarkMode ? 'bg-primary/15' : 'bg-blue-200'
        }`}>
          <span className={`text-xs font-bold ${isDarkMode ? 'text-primary' : 'text-blue-600'}`}>
            U
          </span>
        </div>
      )}
    </div>
  );
}