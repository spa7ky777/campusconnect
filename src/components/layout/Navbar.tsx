import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, MessageCircle, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { logout, userProfile } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const navItems = [
    { path: '/', icon: Users, label: 'Discover' },
    { path: '/chat', icon: MessageCircle, label: 'Chats' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
            <Users className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-gray-900">CampusConnect</span>
        </Link>

        <div className="flex items-center space-x-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === path
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}

          <div className="h-6 w-px bg-gray-300 mx-2" />

          <div className="flex items-center space-x-3">
            {userProfile?.profileImage && (
              <img 
                src={userProfile.profileImage} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;