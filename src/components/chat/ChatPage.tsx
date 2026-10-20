import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { Send, MessageCircle } from 'lucide-react';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Message, Chat, User } from '../../types';
import Navbar from '../layout/Navbar';

const ChatPage: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [loading, setLoading] = useState(true);

  const { currentUser } = useAuth();
  const location = useLocation();
  const targetUserId = location.state?.userId;

  useEffect(() => {
    if (!currentUser) return;

    fetchUsers();
    fetchChats();
  }, [currentUser]);

  useEffect(() => {
    if (targetUserId && users[targetUserId]) {
      handleStartChat(targetUserId);
    }
  }, [targetUserId, users]);

  useEffect(() => {
    if (selectedChatId) {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('chatId', '==', selectedChatId),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        setMessages(messagesData);
      });

      return () => unsubscribe();
    }
  }, [selectedChatId]);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData: { [key: string]: User } = {};
      usersSnapshot.docs.forEach(doc => {
        usersData[doc.id] = doc.data() as User;
      });
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchChats = async () => {
    if (!currentUser) return;

    try {
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', currentUser.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const chatsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Chat[];
        setChats(chatsData);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching chats:', error);
      setLoading(false);
    }
  };

  const handleStartChat = async (userId: string) => {
    if (!currentUser) return;

    const participants = [currentUser.uid, userId].sort();
    const existingChat = chats.find(chat => 
      chat.participants.length === 2 &&
      chat.participants.includes(currentUser.uid) &&
      chat.participants.includes(userId)
    );

    if (existingChat) {
      setSelectedChatId(existingChat.id);
    } else {
      // Create new chat
      try {
        const chatData = {
          participants,
          participantNames: {
            [currentUser.uid]: users[currentUser.uid]?.name || 'User',
            [userId]: users[userId]?.name || 'User'
          },
          createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'chats'), chatData);
        setSelectedChatId(docRef.id);
      } catch (error) {
        console.error('Error creating chat:', error);
      }
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatId || !currentUser) return;

    try {
      const messageData = {
        chatId: selectedChatId,
        senderId: currentUser.uid,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        read: false
      };

      await addDoc(collection(db, 'messages'), messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find(id => id !== currentUser?.uid);
  };

  const formatTime = (timestamp: Date | { toDate: () => Date } | null | undefined) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your chats...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Chat List */}
            <div className="w-1/3 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              </div>
              
              <div className="overflow-y-auto h-full">
                {chats.length > 0 ? (
                  chats.map(chat => {
                    const otherParticipantId = getOtherParticipant(chat);
                    const otherUser = otherParticipantId ? users[otherParticipantId] : null;
                    
                    return (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChatId(chat.id)}
                        className={`flex items-center space-x-3 p-4 cursor-pointer hover:bg-gray-50 ${
                          selectedChatId === chat.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {otherUser?.profileImage ? (
                            <img 
                              src={otherUser.profileImage} 
                              alt={otherUser.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                              {otherUser?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {otherUser?.name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {chat.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-8">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No chats yet</p>
                    <p className="text-sm text-gray-500">Start a conversation from the Discover page</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 flex flex-col">
              {selectedChatId ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    {(() => {
                      const selectedChat = chats.find(chat => chat.id === selectedChatId);
                      const otherParticipantId = selectedChat ? getOtherParticipant(selectedChat) : null;
                      const otherUser = otherParticipantId ? users[otherParticipantId] : null;
                      
                      return (
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            {otherUser?.profileImage ? (
                              <img 
                                src={otherUser.profileImage} 
                                alt={otherUser.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                {otherUser?.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {otherUser?.name || 'Unknown User'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {otherUser?.department} • {otherUser?.year}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            message.senderId === currentUser?.uid
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === currentUser?.uid
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select a chat to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
