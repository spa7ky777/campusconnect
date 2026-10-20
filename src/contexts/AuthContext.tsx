import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUserProfile: (profile: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const register = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result;
  };

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const updateUserProfile = async (profile: Partial<User>) => {
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, profile, { merge: true });
      
      // Update local state
      const updatedProfile = { ...userProfile, ...profile } as User;
      setUserProfile(updatedProfile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const profileData = userDoc.data() as User;
          setUserProfile(profileData);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    login,
    register,
    logout,
    loading,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};