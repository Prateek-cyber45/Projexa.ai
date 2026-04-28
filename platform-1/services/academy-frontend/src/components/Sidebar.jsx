import React, { useState } from 'react';
import ConversationItem from './ConversationItem';

export default function Sidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isDarkMode,
  setIsDarkMode,
}) {
  const [isOpen, setIsOpen] = useState(true);

  // Group conversations by date
  const groupedConversations = conversations.reduce((groups, conv) => {
    const date = conv.date || 'Other';
    if (!groups[date]) groups[date] = [];
    groups[date].push(conv);
    return groups;
  }, {});

  const dateOrder = ['Today', 'Yesterday', 'Previous 7 days', 'Previous 30 days'];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 left-4 z-50 md:hidden p-2 rounded-lg hover:bg-white/10 text-primary"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative md:translate-x-0 z-40 w-64 h-screen flex flex-col transition-transform duration-300 ${
          isDarkMode ? 'bg-surface-container-low border-r border-white/5' : 'bg-gray-50 border-r border-gray-200'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <button
            onClick={onNewChat}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
              isDarkMode
                ? 'bg-gradient-to-r from-primary to-primary-container text-on-primary-container hover:shadow-[0_0_20px_rgba(74,142,255,0.2)]'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {dateOrder.map(dateLabel => (
            groupedConversations[dateLabel] && (
              <div key={dateLabel} className="mb-6">
                <p className={`text-xs font-semibold uppercase tracking-widest px-2 mb-2 ${
                  isDarkMode ? 'text-on-surface-variant/60' : 'text-gray-500'
                }`}>
                  {dateLabel}
                </p>
                <div className="space-y-1">
                  {groupedConversations[dateLabel].map(conv => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isSelected={selectedConversation === conv.id}
                      onSelect={() => {
                        onSelectConversation(conv.id);
                        setIsOpen(false); // Close sidebar on mobile after selection
                      }}
                      onDelete={() => onDeleteConversation(conv.id)}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              </div>
            )
          ))}

          {conversations.length === 0 && (
            <div className="text-center py-12">
              <p className={`text-sm ${isDarkMode ? 'text-on-surface-variant/50' : 'text-gray-400'}`}>
                No conversations yet
              </p>
            </div>
          )}
        </div>

        {/* Footer with Profile & Settings */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}>
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg mb-3 transition-all duration-200 ${
              isDarkMode
                ? 'bg-surface-container-highest hover:bg-surface-container-highest/80 text-on-surface-variant'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {isDarkMode ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 18a6 6 0 100-12 6 6 0 000 12zM12 2v4m0 12v4M4.22 4.22l2.83 2.83m7.07 7.07l2.83 2.83M2 12h4m12 0h4M4.22 19.78l2.83-2.83m7.07-7.07l2.83-2.83" />
                </svg>
                Light Mode
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
                Dark Mode
              </>
            )}
          </button>

          {/* User Profile */}
          <div className={`flex items-center gap-3 p-3 rounded-lg ${
            isDarkMode ? 'bg-surface-container-highest/50' : 'bg-gray-100'
          }`}>
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center flex-shrink-0`}>
              <span className={`text-xs font-bold ${isDarkMode ? 'text-on-primary-container' : 'text-white'}`}>U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                You
              </p>
              <p className={`text-xs truncate ${isDarkMode ? 'text-on-surface-variant/60' : 'text-gray-500'}`}>
                user@example.com
              </p>
            </div>
            <button className={`p-1 rounded hover:bg-white/10 ${isDarkMode ? 'text-on-surface-variant' : 'text-gray-600'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}