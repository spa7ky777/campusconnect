import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Search, Users as UsersIcon } from 'lucide-react';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import UserCard from './UserCard';
import Navbar from '../layout/Navbar';

const DiscoverPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userProfile) {
      navigate('/profile-setup');
      return;
    }

    fetchUsers();
  }, [userProfile, navigate]);

  const fetchUsers = async () => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('uid', '!=', currentUser?.uid || '')
      );
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => doc.data() as User);
      
      // Sort by shared interests
      const sortedUsers = usersData.sort((a, b) => {
        const sharedA = getSharedInterests(a.interests).length;
        const sharedB = getSharedInterests(b.interests).length;
        return sharedB - sharedA;
      });
      
      setUsers(sortedUsers);
      setFilteredUsers(sortedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSharedInterests = (otherUserInterests: string[]) => {
    if (!userProfile) return [];
    return userProfile.interests.filter(interest => 
      otherUserInterests.includes(interest)
    );
  };

  const handleStartChat = (userId: string) => {
    navigate('/chat', { state: { userId } });
  };

  const applyFilters = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.interests.some(interest => 
          interest.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedDepartment) {
      filtered = filtered.filter(user => user.department === selectedDepartment);
    }

    if (selectedYear) {
      filtered = filtered.filter(user => user.year === selectedYear);
    }

    setFilteredUsers(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedDepartment, selectedYear, users]);

  const departments = Array.from(new Set(users.map(user => user.department)));
  const years = Array.from(new Set(users.map(user => user.year)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Finding amazing people for you...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Students</h1>
          <p className="text-gray-600">Find students who share your interests</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, department, or interests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <UsersIcon className="w-4 h-4" />
              <span>{filteredUsers.length} students found</span>
            </div>
          </div>
        </div>

        {/* User Cards */}
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(user => (
              <UserCard
                key={user.uid}
                user={user}
                sharedInterests={getSharedInterests(user.interests)}
                onStartChat={handleStartChat}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-600">
              Try adjusting your search filters or check back later for new students
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
