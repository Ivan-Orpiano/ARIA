import React from 'react';
import { AriaAvatar, XIcon } from '../icons/Icons';
import { useChat } from '../../hooks/useChats';

export default function Header({ onToggleSidebar }) {
  const { messages, clearChat } = useChat();
  const hasMessages = messages.length > 0;

  return (
    <header className="app-header">



      {/* Right: status + clear */}
      <div className="app-header-right">

      </div>
    </header>
  );
}
