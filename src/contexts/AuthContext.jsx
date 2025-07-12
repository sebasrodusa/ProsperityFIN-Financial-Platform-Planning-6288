import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('prosperityFin_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock user data based on email
    let mockUser;
    if (email === 'admin@prosperityfin.com') {
      mockUser = {
        id: '1',
        email: 'admin@prosperityfin.com',
        name: 'Admin User',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      };
    } else if (email === 'manager@prosperityfin.com') {
      mockUser = {
        id: '2',
        email: 'manager@prosperityfin.com',
        name: 'Sarah Johnson',
        role: 'manager',
        teamId: 'team-1',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
      };
    } else if (email === 'advisor@prosperityfin.com') {
      mockUser = {
        id: '3',
        email: 'advisor@prosperityfin.com',
        name: 'Michael Chen',
        role: 'financial_professional',
        teamId: 'team-1',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      };
    } else if (email === 'client@prosperityfin.com') {
      mockUser = {
        id: '4',
        email: 'client@prosperityfin.com',
        name: 'John Smith',
        role: 'client',
        advisorId: '3',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
      };
    } else {
      throw new Error('Invalid credentials');
    }

    setUser(mockUser);
    localStorage.setItem('prosperityFin_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('prosperityFin_user');
    
    // If using Supabase auth, would also sign out there
    try {
      if (supabase) {
        supabase.auth.signOut();
      }
    } catch (error) {
      console.error("Error signing out from Supabase:", error);
    }
  };

  const updateUserProfile = async (updates) => {
    // Update the local user state
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('prosperityFin_user', JSON.stringify(updatedUser));
    
    // If using Supabase, would also update the user profile there
    try {
      if (supabase) {
        // Update profile in user_profiles table
        await supabase
          .from('user_profiles')
          .upsert({ 
            id: user.id,
            ...updates,
            updated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error("Error updating Supabase profile:", error);
      // Still return success since local update worked
    }
    
    return updatedUser;
  };

  const value = {
    user,
    login,
    logout,
    loading,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};