import React, { useState } from 'react';

export default function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  onDelete,
  isDarkMode,
}) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className={`group relative rounded-lg transition-all duration-200 cursor-pointer ${
        isSelected
          ? isDarkMode
            ? 'bg-primary/10 border border-primary/20'
            : 'bg-blue-100 border border-blue-200'
          : isDarkMode
          ? 'hover:bg-white/5'
          : 'hover:bg-gray-100'
      }`}
      onClick={onSelect}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="px-3 py-3 flex items-center gap-2 min-w-0">
        <svg className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-primary/60' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${
            isDarkMode ? 'text-on-surface' : 'text-gray-900'
          }`}>
            {conversation.title}
          </p>
          <p className={`text-xs truncate ${
            isDarkMode ? 'text-on-surface-variant/60' : 'text-gray-500'
          }`}>
            {conversation.date}
          </p>
        </div>

        {(isHovering || isSelected) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className={`flex-shrink-0 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
              isDarkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-500'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}