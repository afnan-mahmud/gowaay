'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/lib/chat-context';
import { useSessionUser } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, User, Building2, ShieldAlert, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatDrawerProps {
  roomId: string;
  hostId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  roomId,
  hostId,
  isOpen,
  onClose
}) => {
  const { user, isAuthenticated } = useSessionUser();
  const { 
    threads, 
    activeThread, 
    setActiveThread, 
    sendMessage, 
    createThread, 
    loading, 
    error 
  } = useChat();
  
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Validation function to prevent sharing contact info
  const containsContactInfo = (text: string): { isValid: boolean; reason?: string } => {
    const lowerText = text.toLowerCase();
    
    // Phone number patterns (Bangladesh format)
    const phonePatterns = [
      /\b0?1[3-9]\d{8,9}\b/g, // 01XXXXXXXXX or 1XXXXXXXXX
      /\b(\+880|880)\s?\d{10}\b/g, // +880 or 880 format
      /\b0\d{10,11}\b/g, // General 11-digit numbers starting with 0
      /\d{4}[\s-]?\d{3}[\s-]?\d{3,4}/g, // Formatted phone numbers
    ];
    
    // Email pattern
    const emailPattern = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
    
    // URL patterns
    const urlPatterns = [
      /https?:\/\/[^\s]+/g,
      /www\.[^\s]+/g,
      /\b[a-z0-9]+\.(com|net|org|bd|io|app|co)[^\s]*/gi,
    ];
    
    // Social media handles
    const socialPattern = /@[a-zA-Z0-9_]+/g;
    
    // Check for "call me" type phrases
    const callPhrases = [
      'call me',
      'phone me',
      'whatsapp me',
      'text me',
      'email me',
      'contact me at',
      'reach me at',
      'my number',
      'my phone',
      'my email',
      'my whatsapp',
    ];
    
    // Check phone numbers
    for (const pattern of phonePatterns) {
      if (pattern.test(text)) {
        return { isValid: false, reason: 'Phone numbers are not allowed in messages' };
      }
    }
    
    // Check email
    if (emailPattern.test(text)) {
      return { isValid: false, reason: 'Email addresses are not allowed in messages' };
    }
    
    // Check URLs
    for (const pattern of urlPatterns) {
      if (pattern.test(text)) {
        return { isValid: false, reason: 'URLs and website links are not allowed in messages' };
      }
    }
    
    // Check social media handles
    if (socialPattern.test(text)) {
      return { isValid: false, reason: 'Social media handles are not allowed in messages' };
    }
    
    // Check phrases
    for (const phrase of callPhrases) {
      if (lowerText.includes(phrase)) {
        return { isValid: false, reason: 'Please do not share contact information in messages' };
      }
    }
    
    return { isValid: true };
  };

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeThread?.messages]);

  // Find or create thread for this room
  useEffect(() => {
    if (!isAuthenticated || !user || !isOpen) return;

    const existingThread = threads.find(thread => 
      thread.meta.roomId === roomId && 
      thread.meta.userId === user.id && 
      thread.meta.hostId === hostId
    );

    if (existingThread) {
      setActiveThread(existingThread);
    } else {
      // Create new thread
      createThread(roomId, user.id, hostId).then(thread => {
        if (thread) {
          setActiveThread(thread);
        }
      });
    }
  }, [isAuthenticated, user, roomId, hostId, threads, isOpen, createThread, setActiveThread]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeThread || sending || !user) return;

    // Validate message for contact information
    const validation = containsContactInfo(messageText.trim());
    if (!validation.isValid) {
      setValidationError(validation.reason || 'This message contains prohibited content');
      return;
    }

    setSending(true);
    setValidationError(null);
    
    const messageToSend = messageText.trim();
    const tempMessageId = `temp-${Date.now()}`;
    
    // Optimistically add message to UI immediately
    const optimisticMessage = {
      id: tempMessageId,
      senderRole: user.role as 'guest' | 'host' | 'admin',
      text: messageToSend,
      createdAt: new Date().toISOString()
    };

    // Update activeThread with the optimistic message
    setActiveThread({
      ...activeThread,
      messages: [...activeThread.messages, optimisticMessage]
    });

    // Clear input immediately
    setMessageText('');
    
    try {
      await sendMessage(activeThread.id, messageToSend);
    } catch (err) {
      console.error('Failed to send message:', err);
      // Remove optimistic message on error
      setActiveThread({
        ...activeThread,
        messages: activeThread.messages.filter(m => m.id !== tempMessageId)
      });
      setMessageText(messageToSend); // Restore message text
    } finally {
      setSending(false);
    }
  };

  // Clear validation error when user types
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    if (validationError) {
      setValidationError(null);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-black/50 transition-opacity",
      isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className={cn(
        "fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Chat</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat Content */}
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading chat...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-destructive mb-2">{error}</p>
                <Button size="sm" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </div>
          ) : activeThread ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeThread.messages.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {activeThread.messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-2",
                          message.senderRole === user.role ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className={cn(
                          "max-w-[80%] rounded-lg px-3 py-2",
                          message.senderRole === user.role
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}>
                          <div className="flex items-center gap-1 mb-1">
                            {message.senderRole === 'host' ? (
                              <Building2 className="h-3 w-3" />
                            ) : (
                              <User className="h-3 w-3" />
                            )}
                            <span className="text-xs font-medium capitalize">
                              {message.senderRole}
                            </span>
                          </div>
                          <p className="text-sm">{message.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Safety Notice */}
              <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
                <div className="flex gap-2 items-start">
                  <ShieldAlert className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-blue-900 font-medium mb-1">Safety First</p>
                    <p className="text-xs text-blue-700">
                      Keep communication on GoWaay. Do not share phone numbers, emails, or external links for your safety.
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                {/* Validation Error */}
                {validationError && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start">
                    <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900 mb-1">Message Blocked</p>
                      <p className="text-xs text-red-700">{validationError}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Input
                    value={messageText}
                    onChange={handleMessageChange}
                    placeholder="Type your message..."
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!messageText.trim() || sending}
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Setting up chat...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
