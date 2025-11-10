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
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api';

interface ChatThread {
  _id: string;
  roomId: {
    _id: string;
    title: string;
    images: string[];
  };
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  hostId: {
    _id: string;
    displayName: string;
  };
  lastMessageAt: string;
  messageCount: number;
  isActive: boolean;
  lastMessage?: {
    text: string;
    senderRole: 'user' | 'host' | 'admin';
    timestamp: string;
    blocked?: boolean;
    reason?: string;
  };
}

interface Message {
  _id: string;
  text: string;
  senderRole: 'user' | 'host' | 'admin';
  createdAt: string;
  blocked?: boolean;
  reason?: string;
}

export default function AdminChat() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [filteredThreads, setFilteredThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    filterThreads();
  }, [threads, searchTerm]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread._id);
    }
  }, [selectedThread]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.chat.getThreads({ page: 1, limit: 50 });
      
      if (response.success && response.data && Array.isArray((response.data as any).threads)) {
        setThreads((response.data as any).threads || []);
      } else {
        setError(response.message || 'Failed to fetch threads');
      }
    } catch (error) {
      console.error('Failed to fetch threads:', error);
      setError('Failed to fetch threads');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      setError(null);
      const response = await api.chat.getMessages(threadId, { page: 1, limit: 100 });
      
      if (response.success && response.data && Array.isArray((response.data as any).messages)) {
        setMessages((response.data as any).messages || []);
      } else {
        setError(response.message || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError('Failed to fetch messages');
    }
  };

  const filterThreads = () => {
    let filtered = threads;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(thread => 
        thread.roomId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.hostId.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredThreads(filtered);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;

    try {
      const response = await api.chat.sendMessage({
        threadId: selectedThread._id,
        text: newMessage,
        senderRole: 'admin'
      });

      if (response.success) {
        // Refresh messages after sending
        await fetchMessages(selectedThread._id);
        setNewMessage('');
      } else {
        setError(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chat Monitoring</h1>
          <p className="text-gray-600">Monitor and manage customer conversations</p>
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
              {loading ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600">Loading conversations...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <p className="text-red-600 mb-4">Error: {error}</p>
                  <Button onClick={fetchThreads} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredThreads.map((thread) => (
                  <div
                    key={thread._id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedThread?._id === thread._id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedThread(thread)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {thread.roomId.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {thread.userId.name} ↔ {thread.hostId.displayName}
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
                          {format(new Date(thread.lastMessageAt), 'MMM dd')}
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
              )}
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
                      {selectedThread.userId.name} ↔ {selectedThread.hostId.displayName}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={selectedThread.isActive ? 'default' : 'secondary'}>
                      {selectedThread.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Room
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4">
                {error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">Error loading messages: {error}</p>
                    <Button onClick={() => selectedThread && fetchMessages(selectedThread._id)} variant="outline">
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.senderRole === 'admin' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderRole === 'admin'
                            ? 'bg-blue-600 text-white'
                            : message.senderRole === 'host'
                            ? 'bg-gray-200 text-gray-900'
                            : 'bg-gray-100 text-gray-900'
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
                          {format(new Date(message.createdAt), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </CardContent>
              
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message as admin..."
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
                  Messages sent as admin will be visible to both user and host
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
    </div>
  );
}
