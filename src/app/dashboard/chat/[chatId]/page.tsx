"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, Loader2, MessageSquarePlus, ChevronDown, ChevronUp, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
  step?: string;
  searchResults?: string;
}

export default function ChatView() {
  const { chatId } = useParams() as { chatId: string };
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId !== 'new') {
      fetchMessages();
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStep]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages/${chatId}`);
      if (response.ok) {
        const fetchedMessages = await response.json();
        setMessages(fetchedMessages);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Error fetching messages');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);
    setCurrentStep(null);

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message: input }),
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                handleServerSentEvent(data);
              } catch (error) {
                console.error('Error parsing SSE data:', error);
              }
            }
          }
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error sending message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleServerSentEvent = (data: any) => {
    switch (data.type) {
      case 'step':
        setCurrentStep(`Step ${data.step}/${data.total}: ${data.description}`);
        break;
      case 'message':
        setMessages(prevMessages => [...prevMessages, {
          id: data.id,
          content: data.content,
          role: 'assistant',
          createdAt: new Date().toISOString(),
          step: data.step,
          searchResults: data.searchResults,
        }]);
        break;
      case 'error':
        setError(data.message);
        break;
      case 'end':
        setCurrentStep(null);
        break;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatMessageContent = (message: Message) => {
    if (message.step === 'Web search') {
      const matches = message.content.match(/\[\[(.*?)\]\]/);
      if (matches) {
        const searchQuery = matches[1];
        return (
          <>
            <ReactMarkdown>{message.content}</ReactMarkdown>
            <br />
            <strong>Searching for:</strong> <span className="font-semibold text-primary">{searchQuery.toLowerCase().replace('search', '').replace('query', '')}</span>
          </>
        );
      }
    }
    return <ReactMarkdown >{message.content}</ReactMarkdown>;
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 mt-16 lg:mt-0">
        {error && (
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'}`}>
            <div className={`chat-bubble ${message.role === 'user' ? 'chat-bubble' : 'chat-bubble-secondary bg-neutral-900'}`}>
              {formatMessageContent(message)}
              {message.searchResults && (
                <details className="mt-2">
                  <summary className="cursor-pointer p-2 bg-base-300 rounded-lg flex items-center justify-between">
                    <span className="font-semibold flex items-center">
                      <Search className="w-4 h-4 mx-2" />
                      View Search Results
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </summary>
                  <div className="p-2 mt-2 bg-base-200 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">
                      {message.searchResults}
                    </pre>
                  </div>
                </details>
              )}
            </div>
            <div className="chat-footer opacity-50 text-xs">
              {formatDate(message.createdAt)}
              {message.step && <span className="ml-2">({message.step})</span>}
            </div>
          </div>
        ))}
        {currentStep && (
          <div className="alert alert-info">
            <Loader2 className="animate-spin mr-2" />
            <span>{currentStep}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 bg-base-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="input input-bordered flex-1"
            disabled={isLoading}
          />
          <button type="submit" className="btn btn-outline" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
          </button>
        </div>
      </form>
    </div>
  );
}
