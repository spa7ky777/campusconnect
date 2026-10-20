import React, { useState } from 'react';
import { User, Edit, GraduationCap, Calendar, Heart, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import Navbar from '../layout/Navbar';

const DEPARTMENTS = [
  'Computer Science', 'Engineering', 'Business', 'Medicine', 'Arts', 'Science',
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Psychology', 'Economics',
  'Literature', 'History', 'Philosophy', 'Law', 'Architecture', 'Design'
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'PhD'];

const INTERESTS = [
  'Programming', 'Sports', 'Music', 'Art', 'Reading', 'Gaming', 'Photography',
  'Travel', 'Cooking', 'Dancing', 'Movies', 'Fitness', 'Volunteering',
  'Science', 'Technology', 'Fashion', 'Writing', 'Hiking', 'Swimming',
  'Theater', 'Debate', 'Chess', 'Yoga', 'Meditation', 'Entrepreneurship'
];

const ProfilePage: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(userProfile || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    setLoading(true);
    try {
      const imageRef = ref(storage, `profile-images/${userProfile.uid}`);
      await uploadBytes(imageRef, file);
      const profileImageUrl = await getDownloadURL(imageRef);
      
      await updateUserProfile({ profileImage: profileImageUrl });
      setEditedProfile(prev => ({ ...prev, profileImage: profileImageUrl }));
    } catch {
      setError('Failed to update profile image');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userProfile) return;

    setLoading(true);
    setError('');

    try {
      await updateUserProfile(editedProfile);
      setIsEditing(false);
    } catch {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    const currentInterests = editedProfile.interests || [];
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    
    setEditedProfile(prev => ({ ...prev, interests: newInterests }));
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            {!isEditing ? (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditedProfile(userProfile);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-8">
            {/* Profile Image */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {userProfile.profileImage ? (
                    <img 
                      src={userProfile.profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <label
                    htmlFor="profileImage"
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      id="profileImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{userProfile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <p className="text-lg text-gray-900">{userProfile.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <GraduationCap className="inline w-4 h-4 mr-1" />
                  Department
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.department || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-lg text-gray-900">{userProfile.department}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Year of Study
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.year || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {YEARS.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-lg text-gray-900">{userProfile.year}</p>
                )}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                <Heart className="inline w-4 h-4 mr-1" />
                Interests
              </label>
              {isEditing ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {INTERESTS.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        (editedProfile.interests || []).includes(interest)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userProfile.interests.map(interest => (
                    <span
                      key={interest}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
