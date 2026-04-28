import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import InputBox from './InputBox';
import TypingIndicator from './TypingIndicator';
import { useChat } from '../hooks/useChat';

export default function ChatArea({ conversationId, isDarkMode }) {
  const {
    messages,
    isLoading,
    sendMessage,
    regenerateMessage,
    deleteMessage,
  } = useChat(conversationId);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (content) => {
    await sendMessage(content);
  };

  return (
    <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-background' : 'bg-white'}`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${
        isDarkMode ? 'border-white/5 bg-surface-container-low/50' : 'border-gray-200 bg-gray-50/50'
      }`}>
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          AI Training Assistant
        </h2>
        <p className={`text-sm ${isDarkMode ? 'text-on-surface-variant/60' : 'text-gray-500'}`}>
          Ask questions about cybersecurity training
        </p>
      </div>

      {/* Messages Container */}
      <div className={`flex-1 overflow-y-auto px-4 md:px-6 py-8 space-y-6`}>
        {messages.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full">
            <div className={`w-16 h-16 rounded-full ${
              isDarkMode ? 'bg-primary/10' : 'bg-blue-100'
            } flex items-center justify-center mb-4`}>
              <svg className={`w-8 h-8 ${isDarkMode ? 'text-primary' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5.36 6.364l-.707.707M9 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Start a conversation
            </h3>
            <p className={`text-center max-w-md ${isDarkMode ? 'text-on-surface-variant/60' : 'text-gray-500'}`}>
              Ask me anything about SOC operations, incident response, malware analysis, or any cybersecurity topic.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                isDarkMode={isDarkMode}
                onCopy={() => {
                  navigator.clipboard.writeText(message.content);
                }}
                onRegenerate={() => {
                  if (message.role === 'assistant') {
                    regenerateMessage(index);
                  }
                }}
                onDelete={() => deleteMessage(index)}
              />
            ))}

            {isLoading && <TypingIndicator isDarkMode={isDarkMode} />}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Box */}
      <div className={`border-t px-4 md:px-6 py-6 ${
        isDarkMode ? 'border-white/5 bg-surface-container-low/50' : 'border-gray-200 bg-gray-50/50'
      }`}>
        <div className="max-w-3xl mx-auto">
          <InputBox
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isDarkMode={isDarkMode}
          />
          <p className={`text-xs text-center mt-4 ${
            isDarkMode ? 'text-on-surface-variant/40' : 'text-gray-400'
          }`}>
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}