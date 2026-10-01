import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

export const ChatPanel = () => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // Temporary messages.
  // Later these will come from Socket.io.
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Rahul',
      message: 'I added the DATABASE_URL variable.',
      time: '12:01 PM',
      isOwn: false,
    },
    {
      id: 2,
      sender: 'Laxman',
      message: 'Great. I will add the JWT secret.',
      time: '12:02 PM',
      isOwn: true,
    },
    {
      id: 3,
      sender: 'Aditya',
      message: 'Should we also add REDIS_URL?',
      time: '12:03 PM',
      isOwn: false,
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedMessage = inputValue.trim();

    if (!trimmedMessage) return;

    const newMessage = {
      id: Date.now(),
      sender: 'Laxman',
      message: trimmedMessage,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isOwn: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full bg-canvas-black overflow-hidden">

      {/* Chat Header */}
      <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-elevated">

        <div className="flex items-center gap-2">

          <div className="w-2 h-2 rounded-full bg-brand-mint" />

          <div>
            <h3 className="text-mono text-text-primary text-sm">
              ROOM CHAT
            </h3>

            <p className="text-xs text-text-muted mt-0.5">
              Team conversation
            </p>
          </div>

        </div>

        <span className="text-xs text-brand-mint font-mono">
          3 online
        </span>

      </div>


      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-center px-4">

            <div>
              <p className="text-sm text-text-primary mb-1">
                No messages yet
              </p>

              <p className="text-xs text-text-muted">
                Start a conversation with your team.
              </p>
            </div>

          </div>
        )}


        {messages.map((msg) => (

          <div
            key={msg.id}
            className={`flex w-full ${
              msg.isOwn
                ? 'justify-end'
                : 'justify-start'
            }`}
          >

            <div
              className={`max-w-[85%] flex flex-col ${
                msg.isOwn
                  ? 'items-end'
                  : 'items-start'
              }`}
            >

              {/* Sender */}
              {!msg.isOwn && (
                <span className="text-xs text-brand-mint font-mono mb-1">
                  {msg.sender}
                </span>
              )}

              {msg.isOwn && (
                <span className="text-xs text-text-muted font-mono mb-1">
                  You
                </span>
              )}


              {/* Message */}
              <div
                className={`p-3 text-sm leading-relaxed ${
                  msg.isOwn
                    ? 'bg-brand-mint text-canvas-black rounded-[16px_16px_4px_16px]'
                    : 'bg-surface-elevated text-text-primary border border-surface-border rounded-[16px_16px_16px_4px]'
                }`}
              >
                {msg.message}
              </div>


              {/* Time */}
              <span className="text-[10px] text-text-muted mt-1">
                {msg.time}
              </span>

            </div>

          </div>

        ))}

        <div ref={messagesEndRef} />

      </div>


      {/* Encryption status */}
      <div className="px-4 py-2 border-t border-surface-border bg-canvas-black">

        <div className="flex items-center justify-center gap-2">

          <div className="w-1.5 h-1.5 rounded-full bg-brand-mint" />

          <span className="text-[10px] text-text-muted font-mono">
            ROOM CHAT
          </span>

        </div>

      </div>


      {/* Message Input */}
      <div className="p-4 border-t border-surface-border bg-surface-elevated">

        <form
          onSubmit={handleSubmit}
          className="relative flex items-center"
        >

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Message your team..."
            className="w-full bg-canvas-black border border-surface-border rounded-button py-3 pl-4 pr-12 text-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint transition-colors"
          />

          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 p-2 text-text-secondary hover:text-brand-mint disabled:opacity-30 disabled:hover:text-text-secondary transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>

        </form>

      </div>

    </div>
  );
};

