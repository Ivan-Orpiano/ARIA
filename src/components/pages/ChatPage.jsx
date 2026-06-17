import React, {useCallback, useState }  from 'react';
import {useChat} from '../hooks/useChats';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/input/ChatInput';

export default function ChatPage() {
    const {messages, isLoading, sendMessage } = useChat ();
    const [prefill, setPrefill] = useState ('');

    const handleSuggestionSelect = useCallback((text) => {
        
    })


}