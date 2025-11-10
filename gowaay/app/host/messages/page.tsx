'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MessageSquare,
  User,
  Home,
  Send,
  Clock,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { useHostMessageThreads, useHostMessages, HostMessageThread, HostMessage } from '@/lib/hooks/useHostData';
import { HostChatModal } from '@/components/chat/HostChatModal';

// Safe date formatter
const formatDate = (dateString: any, formatString: string = 'MMM dd') => {
  if (!dateString) return 'N/A';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (isValid(date)) {
      return format(date, formatString);
    }
    return 'N/A';
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
};

export default function HostMessages() {
  const { threads, loading: threadsLoading, error: threadsError } = useHostMessageThreads();
  const [filteredThreads, setFilteredThreads] = useState<HostMessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<HostMessageThread | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const { messages, loading: messagesLoading, error: messagesError, sendMessage } = useHostMessages(selectedThread?._id || null);

  useEffect(() => {
    filterThreads();
  }, [threads, searchTerm]);

  const filterThreads = () => {
    let filtered = threads || [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(thread =>
        thread.roomId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.userId.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredThreads(filtered);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;

    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getSenderBadge = (role: string) => {
    const variants = {
      user: 'bg-blue-100 text-blue-800',
      host: 'bg-green-100 text-green-800',
      admin: 'bg-purple-100 text-purple-800',
    };
    return (
      <Badge className={variants[role as keyof typeof variants]}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (threadsLoading) {
    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">Communicate with your guests</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (threadsError) {
    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">Communicate with your guests</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error loading messages: {threadsError}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with your guests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threads List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Conversations</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredThreads.map((thread) => (
                  <div
                    key={thread._id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedThread?._id === thread._id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => {
                      setSelectedThread(thread);
                      setIsMobileModalOpen(true);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {thread.roomId.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {thread.userId.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {thread.lastMessage?.text || 'No messages yet'}
                        </p>
                      </div>
                      <div className="ml-2 flex flex-col items-end">
                        <Badge variant={thread.isActive ? 'default' : 'secondary'} className="text-xs">
                          {thread.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-xs text-gray-500 mt-1">
                          {formatDate(thread.lastMessageAt, 'MMM dd')}
                        </span>
                        <span className="text-xs text-gray-400">
                          {thread.messageCount} msgs
                        </span>
                      </div>
                    </div>
                    {thread.lastMessage?.blocked && (
                      <div className="flex items-center mt-2 text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Blocked: {thread.lastMessage.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedThread ? (
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedThread.roomId.title}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {selectedThread.userId.name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={selectedThread.isActive ? 'default' : 'secondary'}>
                      {selectedThread.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.senderRole === 'host' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderRole === 'host'
                            ? 'bg-primary text-white'
                            : message.senderRole === 'admin'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {getSenderBadge(message.senderRole)}
                          {message.blocked && (
                            <Badge variant="destructive" className="text-xs">
                              Blocked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatDate(message.timestamp, 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Messages are monitored for inappropriate content. Contact information will be blocked.
                </p>
              </div>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a conversation to view messages</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Mobile Chat Modal */}
      <HostChatModal
        thread={selectedThread}
        messages={messages}
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        onSendMessage={async (text) => {
          await sendMessage(text);
        }}
        sending={false}
      />
    </div>
  );
}
