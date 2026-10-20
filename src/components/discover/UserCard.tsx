import React from 'react';
import { MessageCircle, Heart, GraduationCap, Calendar } from 'lucide-react';
import { User } from '../../types';

interface UserCardProps {
  user: User;
  sharedInterests: string[];
  onStartChat: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, sharedInterests, onStartChat }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {user.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{user.name}</h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <GraduationCap className="w-4 h-4 mr-1" />
              <span className="truncate">{user.department}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{user.year}</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-700 mb-2">
            <Heart className="w-4 h-4 mr-1 text-red-500" />
            <span className="font-medium">
              {sharedInterests.length} shared interest{sharedInterests.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {sharedInterests.slice(0, 3).map(interest => (
              <span
                key={interest}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {interest}
              </span>
            ))}
            {sharedInterests.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{sharedInterests.length - 3} more
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onStartChat(user.uid)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Start Chat</span>
        </button>
      </div>
    </div>
  );
};

export default UserCard;