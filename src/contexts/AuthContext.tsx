
"use client";

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth } from '@/lib/firebase/config';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import type { LoginFormData, SignupFormData } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginFormData) => Promise<User | null>;
  signup: (data: SignupFormData) => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (data: LoginFormData): Promise<User | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error; // Re-throw to be caught by the form
    }
  };

  const signup = async (data: SignupFormData): Promise<User | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: data.name });
        // Re-fetch user to get updated profile, or rely on onAuthStateChanged
        setUser({ ...userCredential.user, displayName: data.name }); 
      }
      return userCredential.user;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error; // Re-throw to be caught by the form
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/'); // Redirect to home after logout
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
