import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, GraduationCap, Calendar, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';

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

const ProfileSetup: React.FC = () => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    if (selectedInterests.length < 3) {
      setError('Please select at least 3 interests');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let profileImageUrl = '';
      
      // Upload profile image if selected
      if (profileImage) {
        const imageRef = ref(storage, `profile-images/${currentUser.uid}`);
        await uploadBytes(imageRef, profileImage);
        profileImageUrl = await getDownloadURL(imageRef);
      }

      // Save user profile to Firestore
      const userProfile = {
        uid: currentUser.uid,
        email: currentUser.email || '',
        name,
        department,
        year,
        interests: selectedInterests,
        profileImage: profileImageUrl,
        createdAt: new Date()
      };

      await setDoc(doc(db, 'users', currentUser.uid), userProfile);
      
      navigate('/');
    } catch {
      setError('Failed to save profile. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Help other students find you based on your interests</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <label
                htmlFor="profileImage"
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-1" />
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
              <GraduationCap className="inline w-4 h-4 mr-1" />
              Department
            </label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select your department</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Year of Study */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Year of Study
            </label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select your year</option>
              {YEARS.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              <Heart className="inline w-4 h-4 mr-1" />
              Interests (Select at least 3)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INTERESTS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedInterests.includes(interest)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Selected: {selectedInterests.length} interests
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || selectedInterests.length < 3}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving Profile...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
