export interface User {
  uid: string;
  email: string;
  name: string;
  department: string;
  year: string;
  interests: string[];
  profileImage?: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: Date;
  participantNames: { [key: string]: string };
}