import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

export const ChatPanel = ({
  messages,
  onSendMessage,
  currentParticipantId,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    scrollToBottom();

  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedMessage = inputValue.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    try {
      setIsSending(true);

      await onSendMessage(trimmedMessage);

      setInputValue('');
    } catch (error) {
      console.error(
        '[Chat] Failed to send message:',
        error
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-canvas-black overflow-hidden ">

      {/* Header */}
      <div className="h-16 px-5 border-b border-surface-border flex items-center justify-between bg-surface-elevated">

        <div className="flex items-center gap-2">

          <div className="w-2 h-2 rounded-full bg-brand-mint" />

          <div>
            <h3 className="text-mono text-text-primary text-sm">
              ROOM CHAT
            </h3>

            <p className="text-xs text-text-muted mt-0.5">
              End-to-end encrypted
            </p>
          </div>

        </div>

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

        {messages.map((msg) => {

          const isOwn =
            msg.participantId === currentParticipantId;

          return (
            <div
              key={msg.messageId}
              className={`flex w-full ${isOwn
                ? 'justify-end'
                : 'justify-start'
                }`}
            >

              <div
                className={`max-w-[85%] flex flex-col ${isOwn
                  ? 'items-end'
                  : 'items-start'
                  }`}
              >

                {!isOwn && (
                  <span className="text-xs text-brand-mint font-mono mb-1">
                    {msg.displayName}
                  </span>
                )}

                {isOwn && (
                  <span className="text-xs text-text-muted font-mono mb-1">
                    You
                  </span>
                )}

                <div
                  className={`p-3 text-sm leading-relaxed ${isOwn
                    ? 'bg-brand-mint text-canvas-black rounded-[16px_16px_4px_16px]'
                    : 'bg-surface-elevated text-text-primary border border-surface-border rounded-[16px_16px_16px_4px]'
                    }`}
                >
                  {msg.message}
                </div>

                <span className="text-[10px] text-text-muted mt-1">
                  {new Date(
                    msg.timestamp
                  ).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>

              </div>

            </div>
          );
        })}

        <div ref={messagesEndRef} />

      </div>

      {/* Message Input */}
      <div className="border-t border-surface-border bg-surface-elevated">
        {/* Temporary chat warning */}
        <div className="px-4 pt-2 pb-1 text-center">
          <p className="text-[10px] text-text-muted">
            ⚠ Chat history will be cleared if you refresh or leave this room.
          </p>
        </div>

        {/* Message input */}
        <div className="px-4 pb-4">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) =>
                setInputValue(e.target.value)
              }
              placeholder="Message your team..."
              disabled={isSending}
              className="w-full bg-canvas-black border border-surface-border rounded-button py-3 pl-4 pr-12 text-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint transition-colors disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className="absolute right-2 p-2 text-text-secondary hover:text-brand-mint disabled:opacity-30 disabled:hover:text-text-secondary transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};