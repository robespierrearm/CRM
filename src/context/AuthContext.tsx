import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Конвертация Supabase User в наш User тип
const convertSupabaseUser = (supabaseUser: SupabaseUser): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email!,
  user_metadata: supabaseUser.user_metadata,
  created_at: supabaseUser.created_at,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Initializing with Supabase Auth...');
    
    // Проверяем текущую сессию
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log('AuthContext: Found active session:', session.user.email);
        setUser(convertSupabaseUser(session.user));
      }
      setIsLoading(false);
    });

    // Подписываемся на изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('AuthContext: Auth state changed:', _event);
      if (session?.user) {
        setUser(convertSupabaseUser(session.user));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      if (data.user) {
        console.log('AuthContext: Login successful');
        setUser(convertSupabaseUser(data.user));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login exception:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, fullName?: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Attempting signup for:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'user', // По умолчанию роль user
          }
        }
      });

      if (error) {
        console.error('Signup error:', error.message);
        return false;
      }

      if (data.user) {
        console.log('AuthContext: Signup successful');
        // Не устанавливаем user здесь, т.к. может потребоваться подтверждение email
        return true;
      }

      return false;
    } catch (error) {
      console.error('Signup exception:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('AuthContext: Logging out');
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        signup,
        logout, 
        isAuthenticated: !!user, 
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
