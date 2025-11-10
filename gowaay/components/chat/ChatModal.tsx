'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Phone, Calendar, Users, MapPin } from 'lucide-react';
import { format, parseISO, isValid, isSameDay } from 'date-fns';
import Image from 'next/image';

interface ChatModalProps {
  thread: any;
  booking?: any;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => Promise<void>;
  currentUserId?: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  thread,
  booking,
  isOpen,
  onClose,
  onSendMessage,
  currentUserId
}) => {
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [thread?.messages, isOpen]);

  const handleSend = async () => {
    if (!messageText.trim() || sending) return;

    const text = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      await onSendMessage(text);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessageText(text);
    } finally {
      setSending(false);
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

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'MMM dd, yyyy');
      }
      return dateString;
    } catch {
      return dateString;
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

  const getNights = (checkIn: string, checkOut: string) => {
    try {
      return Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    } catch {
      return 1;
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: any[]) => {
    const groups: { date: string; messages: any[] }[] = [];
    let currentDate = '';

    messages.forEach((message) => {
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

  const messageGroups = groupMessagesByDate(thread?.messages || []);

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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-semibold text-lg">
              {booking?.roomId?.hostProfile?.displayName?.charAt(0)?.toUpperCase() || 'H'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{booking?.roomId?.hostProfile?.displayName || 'Host'}</h3>
              <p className="text-xs text-gray-500">Usually responds quickly</p>
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
          {/* Booking Card */}
          {booking && (
            <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border">
              <div className="flex gap-3">
                {booking.roomId?.images?.[0] && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={booking.roomId.images[0].url}
                      alt={booking.roomId.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1 truncate">{booking.roomId?.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)} ({getNights(booking.checkIn, booking.checkOut)} Night{getNights(booking.checkIn, booking.checkOut) > 1 ? 's' : ''})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Users className="h-3 w-3" />
                    <span>{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</span>
                    {booking.roomId?.baths && (
                      <>
                        <span>•</span>
                        <span>{booking.roomId.baths} Bath{booking.roomId.baths > 1 ? 's' : ''}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-brand text-lg">৳{booking.amountTk?.toLocaleString()}</div>
                  <Badge 
                    variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                    className={`text-xs mt-1 ${booking.status === 'pending' ? 'bg-brand text-white hover:bg-brand/90' : ''}`}
                  >
                    {booking.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Messages grouped by date */}
          {thread?.messages?.length === 0 ? (
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
                      const isUser = message.senderRole === 'guest';
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[75%] ${isUser ? 'order-2' : 'order-1'}`}>
                            {!isUser && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-700">Host</span>
                              </div>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-2.5 ${
                                isUser
                                  ? 'bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-tr-sm shadow-sm'
                                  : 'bg-white text-gray-900 rounded-tl-sm border shadow-sm'
                              }`}
                            >
                              <p className="text-sm leading-relaxed break-words">{message.text}</p>
                              <p
                                className={`text-xs mt-1.5 ${
                                  isUser ? 'text-white/80' : 'text-gray-500'
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
              className="flex-1 border-gray-300 focus:border-pink-500 focus:ring-pink-500"
            />
            <Button
              onClick={handleSend}
              disabled={!messageText.trim() || sending}
              size="icon"
              className="bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 rounded-full shadow-md"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Keep communication on GoWaay for your safety
          </p>
        </div>
      </div>
    </>
  );
};
