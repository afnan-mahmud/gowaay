'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ref, onValue, off, push, set, DataSnapshot } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

interface Message {
  id: string;
  senderRole: 'guest' | 'host' | 'admin';
  text: string;
  createdAt: string;
}

interface ThreadMeta {
  roomId: string;
  userId: string;
  hostId: string;
  roomName?: string;
  lastMessageAt: string;
}

interface Thread {
  id: string;
  meta: ThreadMeta;
  messages: Message[];
}

interface ChatContextType {
  threads: Thread[];
  activeThread: Thread | null;
  setActiveThread: (thread: Thread | null) => void;
  sendMessage: (threadId: string, text: string) => Promise<void>;
  createThread: (roomId: string, userId: string, hostId: string) => Promise<Thread | null>;
  refreshThreads: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadSubscriptions, setThreadSubscriptions] = useState<{ [key: string]: any }>({});

  // Get thread IDs that user is allowed to access
  const fetchThreadIds = useCallback(async () => {
    if (!isAuthenticated || !user) return [];

    try {
      const response = await api.chat.getThreadIds();
      return (response.data as any).threadIds;
    } catch (err) {
      console.error('Failed to fetch thread IDs:', err);
      setError('Failed to load chat threads');
      return [];
    }
  }, [isAuthenticated, user]);

  // Subscribe to Firebase threads
  const subscribeToThreads = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError(null);

    try {
      const threadIds = await fetchThreadIds();
      console.log('[CHAT_FRONTEND] Fetched thread IDs:', threadIds);
      
      if (threadIds.length === 0) {
        console.log('[CHAT_FRONTEND] No threads found');
        setThreads([]);
        setLoading(false);
        return;
      }

      const newSubscriptions: { [key: string]: any } = {};

      // Subscribe to each thread
      threadIds.forEach((threadId: string) => {
        if (!database) {
          console.warn('[CHAT_FRONTEND] Firebase database not available');
          return;
        }
        
        console.log('[CHAT_FRONTEND] Subscribing to thread:', threadId);
        const threadRef = ref(database, `threads/${threadId}`);
        
        const unsubscribe = onValue(threadRef, (snapshot: DataSnapshot) => {
          const threadData = snapshot.val();
          console.log(`[CHAT_FRONTEND] Firebase data received for thread ${threadId}:`, threadData);
          console.log(`[CHAT_FRONTEND] Snapshot exists: ${snapshot.exists()}, has data: ${!!threadData}`);
          
          // If no Firebase data, check if thread exists in MongoDB
          if (!threadData && snapshot.exists() === false) {
            console.log(`[CHAT_FRONTEND] No Firebase data for thread ${threadId}, loading from API`);
            // Load thread details from API
            api.chat.getThreads({ page: 1, limit: 100 }).then(response => {
              if (response.success && response.data) {
                const threads = (response.data as any).threads || [];
                const thread = threads.find((t: any) => t._id === threadId);
                if (thread) {
                  const frontendThread: Thread = {
                    id: threadId,
                    meta: {
                      roomId: thread.roomId?._id?.toString() || '',
                      userId: thread.userId?._id?.toString() || thread.userId || '',
                      hostId: thread.hostId?._id?.toString() || thread.hostId || '',
                      roomName: thread.roomId?.title || '',
                      lastMessageAt: thread.lastMessageAt || new Date().toISOString()
                    },
                    messages: []
                  };
                  setThreads(prev => {
                    const filtered = prev.filter(t => t.id !== threadId);
                    const updated = [...filtered, frontendThread].sort((a, b) => 
                      new Date(b.meta.lastMessageAt).getTime() - new Date(a.meta.lastMessageAt).getTime()
                    );
                    console.log('[CHAT_FRONTEND] Updated threads array with API data:', updated.length, 'threads');
                    return updated;
                  });
                }
              }
            }).catch(err => console.error('Failed to load thread from API:', err));
            return;
          }
          
          if (threadData) {
            const thread: Thread = {
              id: threadId,
              meta: threadData.meta || {},
              messages: threadData.messages ? Object.entries(threadData.messages).map(([id, message]: [string, any]) => ({
                id,
                ...message
              })) : []
            };

            setThreads(prev => {
              const filtered = prev.filter(t => t.id !== threadId);
              const updated = [...filtered, thread].sort((a, b) => 
                new Date(b.meta.lastMessageAt).getTime() - new Date(a.meta.lastMessageAt).getTime()
              );
              console.log('[CHAT_FRONTEND] Updated threads array:', updated.length, 'threads');
              return updated;
            });
          }
        });

        newSubscriptions[threadId] = unsubscribe;
      });

      setThreadSubscriptions(newSubscriptions);

      // Cleanup function
      return () => {
        Object.values(newSubscriptions).forEach(unsubscribe => unsubscribe());
      };
    } catch (err) {
      console.error('Failed to subscribe to threads:', err);
      setError('Failed to load chat threads');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchThreadIds]);

  // Force refresh threads
  const refreshThreads = useCallback(async () => {
    // Unsubscribe from existing threads
    Object.values(threadSubscriptions).forEach(unsubscribe => unsubscribe());
    setThreadSubscriptions({});
    
    // Re-subscribe to all threads
    await subscribeToThreads();
  }, [threadSubscriptions, subscribeToThreads]);

  // Send message
  const sendMessage = useCallback(async (threadId: string, text: string) => {
    if (!isAuthenticated || !user) return;

    try {
      await api.chat.sendMessage({
        text,
        threadId
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    }
  }, [isAuthenticated, user]);

  // Create new thread
  const createThread = useCallback(async (roomId: string, userId: string, hostId: string): Promise<Thread | null> => {
    if (!isAuthenticated || !user || !database) return null;

    try {
      const response = await api.chat.createThread({
        roomId,
        userId,
        hostId
      });

      const data = response.data as any;
      const threadId = data.id;
      
      // Subscribe to the new thread immediately
      const threadRef = ref(database, `threads/${threadId}`);
      
      onValue(threadRef, (snapshot: DataSnapshot) => {
        const threadData = snapshot.val();
        
        if (threadData) {
          const thread: Thread = {
            id: threadId,
            meta: threadData.meta || {
              roomId: data.roomId,
              userId: data.userId,
              hostId: data.hostId,
              lastMessageAt: data.lastMessageAt
            },
            messages: threadData.messages ? Object.entries(threadData.messages).map(([id, message]: [string, any]) => ({
              id,
              ...message
            })) : []
          };

          setThreads(prev => {
            const filtered = prev.filter(t => t.id !== threadId);
            return [...filtered, thread].sort((a, b) => 
              new Date(b.meta.lastMessageAt).getTime() - new Date(a.meta.lastMessageAt).getTime()
            );
          });
        }
      });

      const thread: Thread = {
        id: threadId,
        meta: {
          roomId: data.roomId,
          userId: data.userId,
          hostId: data.hostId,
          lastMessageAt: data.lastMessageAt
        },
        messages: []
      };

      return thread;
    } catch (err) {
      console.error('Failed to create thread:', err);
      setError('Failed to create chat thread');
      return null;
    }
  }, [isAuthenticated, user]);

  // Subscribe to threads when user changes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setThreads([]);
      setActiveThread(null);
      return;
    }

    const cleanup = subscribeToThreads();
    return () => {
      if (cleanup) {
        cleanup.then(cleanupFn => cleanupFn?.());
      }
    };
  }, [isAuthenticated, user, subscribeToThreads]);

  // Keep activeThread in sync with threads array
  useEffect(() => {
    if (activeThread) {
      const updatedThread = threads.find(t => t.id === activeThread.id);
      if (updatedThread && JSON.stringify(updatedThread) !== JSON.stringify(activeThread)) {
        setActiveThread(updatedThread);
      }
    }
  }, [threads, activeThread]);

  const value: ChatContextType = {
    threads,
    activeThread,
    setActiveThread,
    sendMessage,
    createThread,
    refreshThreads,
    loading,
    error
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
