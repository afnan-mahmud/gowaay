'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle, 
  Send, 
  ArrowLeft, 
  Phone,
  Calendar,
  Users as UsersIcon,
  Bath
} from 'lucide-react';
import Image from 'next/image';
import { useChat } from '@/lib/chat-context';
import { useSessionUser } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { format } from 'date-fns';

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
  const { threads, loading: chatLoading, sendMessage } = useChat();
  const router = useRouter();
  
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [bookings, setBookings] = useState<{ [key: string]: BookingDetails }>({});

  // Load booking details for threads
  useEffect(() => {
    const loadBookingDetails = async () => {
      for (const thread of threads) {
        if (thread.meta.roomId && !bookings[thread.id]) {
          try {
            const response = await api.bookings.list<{ bookings: BookingDetails[] }>();
            if (response.success && response.data) {
              const booking = response.data.bookings.find(
                (b: BookingDetails) => b.roomId._id === thread.meta.roomId
              );
              if (booking) {
                setBookings(prev => ({ ...prev, [thread.id]: booking }));
              }
            }
          } catch (error) {
            console.error('Failed to load booking:', error);
          }
        }
      }
    };
    
    if (threads.length > 0) {
      loadBookingDetails();
    }
  }, [threads]);

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

  const formatMessageTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'hh:mm a');
    } catch {
      return '';
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return date;
    }
  };

  const handleThreadClick = (thread: any) => {
    setSelectedThread(thread);
    setShowChatOnMobile(true);
  };

  const handleBackClick = () => {
    setShowChatOnMobile(false);
    setSelectedThread(null);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedThread || sending) return;

    setSending(true);
    try {
      await sendMessage(selectedThread.id, messageText.trim());
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const getNights = (checkIn: string, checkOut: string) => {
    try {
      return Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    } catch {
      return 1;
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

  const booking = selectedThread ? bookings[selectedThread.id] : null;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row">
          {/* Conversations List */}
          <div className={`${showChatOnMobile ? 'hidden md:block' : 'block'} w-full md:w-96 border-r border-gray-200 bg-white flex flex-col`}>
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold mb-1">Messages</h1>
              <p className="text-sm text-gray-600">Chat with hosts about your bookings</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {threads.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                  <p className="text-sm text-gray-600 mb-4">Start chatting with hosts</p>
                  <Button onClick={() => router.push('/')} className="bg-brand hover:bg-brand/90">
                    Browse Rooms
                  </Button>
                </div>
              ) : (
                threads.map((thread) => {
                  const lastMessage = thread.messages[thread.messages.length - 1];
                  const threadBooking = bookings[thread.id];
                  const isActive = selectedThread?.id === thread.id;
                  
                  return (
                    <div
                      key={thread.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        isActive ? 'bg-blue-50 border-l-4 border-l-brand' : ''
                      }`}
                      onClick={() => handleThreadClick(thread)}
                    >
                      <div className="flex gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-white text-lg font-semibold">
                            {thread.meta.hostId?.charAt(0)?.toUpperCase() || 'H'}
                          </div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-1">
                            <h3 className="font-semibold truncate">{thread.meta.roomName || 'Host'}</h3>
                            <span className="text-xs text-gray-500">{lastMessage && formatTime(lastMessage.createdAt)}</span>
                          </div>

                          {threadBooking && (
                            <p className="text-xs text-gray-600 mb-1">
                              {formatDate(threadBooking.checkIn)} - {formatDate(threadBooking.checkOut)}
                            </p>
                          )}

                          {lastMessage && (
                            <p className="text-sm text-gray-700 truncate">
                              {lastMessage.senderRole === 'guest' ? 'You: ' : ''}
                              {lastMessage.text}
                            </p>
                          )}

                          {threadBooking && (
                            <Badge className="mt-2" variant={threadBooking.status === 'confirmed' ? 'default' : 'secondary'}>
                              {threadBooking.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${showChatOnMobile ? 'block' : 'hidden md:block'} flex-1 flex flex-col bg-gray-50`}>
            {selectedThread ? (
              <>
                <div className="bg-white border-b p-4">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={handleBackClick}>
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-semibold">
                      {selectedThread.meta.hostId?.charAt(0)?.toUpperCase() || 'H'}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-semibold">{selectedThread.meta.roomName || 'Host'}</h2>
                      <p className="text-xs text-gray-500">Usually responds in a few hours</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Phone className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {booking && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                      <div className="flex gap-3">
                        {booking.roomId.images[0] && (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src={booking.roomId.images[0].url} alt={booking.roomId.title} fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-sm mb-1">{booking.roomId.title}</h3>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Calendar className="h-3 w-3" />
                                {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)} ({getNights(booking.checkIn, booking.checkOut)} Night{getNights(booking.checkIn, booking.checkOut) > 1 ? 's' : ''})
                              </div>
                              <div className="flex gap-3 mt-1 text-xs text-gray-600">
                                <span className="flex items-center gap-1"><UsersIcon className="h-3 w-3" />{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</span>
                                {booking.roomId.baths && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{booking.roomId.baths} Bath{booking.roomId.baths > 1 ? 's' : ''}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">৳{booking.amountTk.toLocaleString()}</div>
                              <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>{booking.status}</Badge>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => router.push(`/room/${booking.roomId._id}`)}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedThread.messages.map((message: any) => {
                    const isUser = message.senderRole === 'user';
                    return (
                      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[75%]">
                          {!isUser && (
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-white text-xs">H</div>
                              <span className="text-xs text-gray-600">Host</span>
                            </div>
                          )}
                          <div className={`rounded-2xl px-4 py-2 ${isUser ? 'bg-brand text-white rounded-tr-sm' : 'bg-white text-gray-900 rounded-tl-sm border'}`}>
                            <p className="text-sm">{message.text}</p>
                            <p className={`text-xs mt-1 ${isUser ? 'text-white/70' : 'text-gray-500'}`}>{formatMessageTime(message.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={sending}
                    />
                    <Button onClick={handleSendMessage} disabled={!messageText.trim() || sending} className="bg-brand hover:bg-brand/90">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Keep communication on GoWaay for your safety</p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm">Choose a message to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

