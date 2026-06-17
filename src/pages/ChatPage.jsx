import React, { useCallback, useState } from 'react';
import { useChat } from '../hooks/useChats';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput   from '../components/input/ChatInput';

export default function ChatPage() {
  const { messages, isLoading, sendMessage } = useChat();
  const [prefill, setPrefill] = useState('');

  const handleSuggestionSelect = useCallback((text) => {
    setPrefill(text);
    setTimeout(() => setPrefill(''), 100);
  }, []);

  const handleSend = useCallback((text, files) => {
    setPrefill('');
    sendMessage(text, files);
  }, [sendMessage]);

  return (
    <div className="chat-page">
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onSuggestionSelect={handleSuggestionSelect}
      />
      <ChatInput
        onSend={handleSend}
        isLoading={isLoading}
        prefillText={prefill}
      />
    </div>
  );
}