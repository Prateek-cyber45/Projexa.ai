import React from 'react';

export default function TypingIndicator({ isDarkMode }) {
  return (
    <div className="flex gap-3 items-center animate-fade-in">
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
        isDarkMode ? 'bg-primary/10' : 'bg-blue-100'
      }`}>
        <svg className={`w-5 h-5 ${isDarkMode ? 'text-primary' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5.36 6.364l-.707.707M9 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>

      <div className={`px-4 py-3 rounded-2xl flex gap-1 ${
        isDarkMode ? 'bg-surface-container border border-white/10' : 'bg-gray-100 border border-gray-200'
      }`}>
        <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-primary/60' : 'bg-blue-400'} animate-bounce`} style={{ animationDelay: '0s' }} />
        <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-primary/60' : 'bg-blue-400'} animate-bounce`} style={{ animationDelay: '0.15s' }} />
        <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-primary/60' : 'bg-blue-400'} animate-bounce`} style={{ animationDelay: '0.3s' }} />
      </div>
    </div>
  );
}