'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { useSessionUser } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { ChatModal } from '@/components/chat/ChatModal';

interface BookingDetails {
  _id: string;
  roomId: {
    _id: string;
    title: string;
    images: Array<{ url: string }>;
    locationName: string;
    baths?: number;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  amountTk: number;
  status: string;
}

export default function MessagesPage() {
  const { user } = useSessionUser();
  const router = useRouter();
  
  const [threads, setThreads] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Load threads directly from API (not Firebase)
  useEffect(() => {
    const loadThreads = async () => {
      if (!user) return;
      
      setChatLoading(true);
      try {
        const response = await api.chat.getThreads({ page: 1, limit: 100 });
        if (response.success && response.data) {
          const apiThreads = (response.data as any).threads || [];
          console.log('[MESSAGES_PAGE] Loaded threads from API:', apiThreads.length);
          
          // Transform API threads to match expected format
          const formattedThreads = apiThreads.map((t: any) => ({
            id: t._id,
            meta: {
              roomId: t.roomId?._id || '',
              userId: t.userId?._id || t.userId,
              hostId: t.hostId?._id || t.hostId,
              roomName: t.roomId?.title || 'Room',
              lastMessageAt: t.lastMessageAt
            },
            messages: [] // Messages will be loaded when thread is selected
          }));
          
          setThreads(formattedThreads);
        }
      } catch (error) {
        console.error('[MESSAGES_PAGE] Failed to load threads:', error);
      } finally {
        setChatLoading(false);
      }
    };
    
    loadThreads();
  }, [user]);


  const formatTime = (timestamp: string) => {
    const now = Date.now();
    const messageTime = new Date(timestamp).getTime();
    const diff = now - messageTime;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleThreadClick = async (thread: any) => {
    console.log('[MESSAGES_PAGE] Thread clicked:', thread.id);
    
    try {
      // Load messages for this thread
      const messagesResponse = await api.chat.getMessages(thread.id, { page: 1, limit: 100 });
      
      // Load booking for this room
      let bookingData: BookingDetails | null = null;
      if (thread.meta.roomId) {
        try {
          const bookingsResponse = await api.bookings.list<{ bookings: BookingDetails[] }>();
          if (bookingsResponse.success && bookingsResponse.data) {
            const booking = bookingsResponse.data.bookings.find(
              (b: BookingDetails) => b.roomId._id === thread.meta.roomId
            );
            if (booking) {
              bookingData = booking;
            }
          }
        } catch (err) {
          console.error('Failed to load booking:', err);
        }
      }
      
      if (messagesResponse.success && messagesResponse.data) {
        const messages = (messagesResponse.data as any).messages || [];
        console.log('[MESSAGES_PAGE] Loaded messages:', messages.length);
        
        // Update thread with messages
        const threadWithMessages = {
          ...thread,
          messages: messages.map((m: any) => ({
            id: m._id,
            senderRole: m.senderRole,
            text: m.text,
            createdAt: m.createdAt
          }))
        };
        
        setSelectedThread(threadWithMessages);
        setSelectedBooking(bookingData);
        setIsChatModalOpen(true);
      }
    } catch (error) {
      console.error('[MESSAGES_PAGE] Failed to load data:', error);
      setSelectedThread(thread);
      setSelectedBooking(null);
      setIsChatModalOpen(true);
    }
  };

  const handleSendMessageInModal = async (text: string) => {
    if (!selectedThread) return;

    try {
      await api.chat.sendMessage({ text, threadId: selectedThread.id });
      
      // Reload messages after sending
      const response = await api.chat.getMessages(selectedThread.id, { page: 1, limit: 100 });
      if (response.success && response.data) {
        const messages = (response.data as any).messages || [];
        setSelectedThread({
          ...selectedThread,
          messages: messages.map((m: any) => ({
            id: m._id,
            senderRole: m.senderRole,
            text: m.text,
            createdAt: m.createdAt
          }))
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  if (chatLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-4">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
              ))}
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto p-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-sm text-gray-600 mt-1">Chat with hosts about your bookings</p>
          </div>

          {/* Conversations List */}
          <div className="bg-white rounded-lg border shadow-sm">
            {threads.length === 0 ? (
              <div className="p-12 text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Start chatting with hosts about your bookings
                </p>
                <Button onClick={() => router.push('/')} className="bg-brand hover:bg-brand/90">
                  Browse Rooms
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {threads.map((thread) => {
                  const hasMessages = thread.messages && thread.messages.length > 0;
                  const lastMessageTime = thread.meta.lastMessageAt;
                  
                  return (
                    <div
                      key={thread.id}
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleThreadClick(thread)}
                    >
                      <div className="flex items-center gap-4">
                        {/* Host Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 rounded-full bg-brand flex items-center justify-center text-white text-xl font-bold">
                            {thread.meta.hostId?.charAt(0)?.toUpperCase() || 'H'}
                          </div>
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>

                        {/* Chat Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold text-lg truncate">
                              {thread.meta.roomName || 'Host'}
                            </h3>
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {lastMessageTime && formatTime(lastMessageTime)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600">
                            {hasMessages ? 'Tap to view conversation' : 'Start a conversation'}
                          </p>
                        </div>

                        {/* Message Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                            <MessageCircle className="h-5 w-5 text-brand" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Modal */}
        <ChatModal
          thread={selectedThread}
          booking={selectedBooking}
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          onSendMessage={handleSendMessageInModal}
          currentUserId={user?.id}
        />
      </Layout>
    </ProtectedRoute>
  );
}

