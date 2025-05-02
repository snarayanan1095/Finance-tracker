import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user?.email);
      setCurrentUser(user);
      setLoading(false);
    }, (error) => {
      console.error("Auth state change error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 