import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email?: string;
  profileImage?: string;
  [key: string]: any;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on app start
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUserState(JSON.parse(storedUser));
      } else {
        // Create a default guest user if none exists
        const defaultUser: User = {
          id: '1756612920173',
          name: 'Guest User',
          email: 'guest@poolup.com'
        };
        setUserState(defaultUser);
        await AsyncStorage.setItem('user', JSON.stringify(defaultUser));
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
      // Fallback to default user
      const defaultUser: User = {
        id: '1756612920173',
        name: 'Guest User',
        email: 'guest@poolup.com'
      };
      setUserState(defaultUser);
    } finally {
      setLoading(false);
    }
  };

  const setUser = async (newUser: User | null) => {
    setUserState(newUser);
    try {
      if (newUser) {
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
      } else {
        await AsyncStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Failed to save user to storage:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
