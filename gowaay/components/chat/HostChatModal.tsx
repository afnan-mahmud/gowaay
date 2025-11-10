'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Phone } from 'lucide-react';
import { format, parseISO, isValid, isSameDay } from 'date-fns';

interface HostChatModalProps {
  thread: any;
  messages: any[];
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => Promise<void>;
  sending?: boolean;
}

export const HostChatModal: React.FC<HostChatModalProps> = ({
  thread,
  messages,
  isOpen,
  onClose,
  onSendMessage,
  sending = false
}) => {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!messageText.trim() || sending) return;

    const text = messageText.trim();
    setMessageText('');

    try {
      await onSendMessage(text);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessageText(text);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      const date = parseISO(timestamp);
      if (isValid(date)) {
        return format(date, 'hh:mm a');
      }
      return '';
    } catch {
      return '';
    }
  };

  const formatDateSeparator = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (isSameDay(date, today)) return 'Today';
        if (isSameDay(date, yesterday)) return 'Yesterday';
        return format(date, 'MMM dd, yyyy');
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Group messages by date
  const groupMessagesByDate = (msgs: any[]) => {
    const groups: { date: string; messages: any[] }[] = [];
    let currentDate = '';

    msgs.forEach((message) => {
      try {
        const messageDate = formatDateSeparator(message.createdAt);
        if (messageDate !== currentDate) {
          currentDate = messageDate;
          groups.push({ date: messageDate, messages: [message] });
        } else {
          groups[groups.length - 1].messages.push(message);
        }
      } catch {
        if (groups.length === 0 || groups[groups.length - 1].date !== 'Today') {
          groups.push({ date: 'Today', messages: [message] });
        } else {
          groups[groups.length - 1].messages.push(message);
        }
      }
    });
    return groups;
  };

  if (!isOpen) return null;

  const messageGroups = groupMessagesByDate(messages);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal - Full screen on mobile, centered on desktop */}
      <div className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-gray-50 md:rounded-2xl md:shadow-2xl md:w-full md:max-w-md md:h-[90vh] md:max-h-[700px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
              {thread?.userId?.name?.charAt(0)?.toUpperCase() || 'G'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{thread?.userId?.name || 'Guest'}</h3>
              <p className="text-xs text-gray-500">{thread?.roomId?.title}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-100"
          >
            <Phone className="h-5 w-5 text-gray-600" />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Send className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 font-medium">No messages yet</p>
              <p className="text-xs text-gray-500 mt-1">Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messageGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {/* Date Separator */}
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-200 px-3 py-1 rounded-full">
                      <p className="text-xs font-medium text-gray-600">{group.date}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="space-y-3">
                    {group.messages.map((message: any) => {
                      const isHost = message.senderRole === 'host';
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isHost ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[75%] ${isHost ? 'order-2' : 'order-1'}`}>
                            {!isHost && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-700">Guest</span>
                              </div>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-2.5 ${
                                isHost
                                  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-tr-sm shadow-sm'
                                  : 'bg-white text-gray-900 rounded-tl-sm border shadow-sm'
                              }`}
                            >
                              <p className="text-sm leading-relaxed break-words">{message.text}</p>
                              <p
                                className={`text-xs mt-1.5 ${
                                  isHost ? 'text-white/80' : 'text-gray-500'
                                }`}
                              >
                                {formatMessageTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-4 py-3 bg-white border-t">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Write your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
              className="flex-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
            <Button
              onClick={handleSend}
              disabled={!messageText.trim() || sending}
              size="icon"
              className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full shadow-md"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Messages are monitored for inappropriate content
          </p>
        </div>
      </div>
    </>
  );
};

