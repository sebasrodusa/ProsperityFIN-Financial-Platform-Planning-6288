import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the auth context
const AuthContext = createContext();

// Custom hook for using the auth context
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

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user data based on email
      let mockUser;
      if (email === 'admin@prosperityfin.com') {
        mockUser = {
          id: '1',
          email: 'admin@prosperityfin.com',
          name: 'Admin User',
          role: 'admin',
          agentCode: 'ADM001',
          teamId: 'emd_rodriguez',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
        };
      } else if (email === 'manager@prosperityfin.com') {
        mockUser = {
          id: '2',
          email: 'manager@prosperityfin.com',
          name: 'Sarah Johnson',
          role: 'manager',
          agentCode: 'MGR001',
          teamId: 'md_garcia',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face'
        };
      } else if (email === 'advisor@prosperityfin.com') {
        mockUser = {
          id: '3',
          email: 'advisor@prosperityfin.com',
          name: 'Michael Chen',
          role: 'financial_professional',
          agentCode: 'FP001',
          teamId: 'md_samaniego',
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

      // Check password (simple mock)
      if (password !== 'admin123' && password !== 'manager123' && password !== 'advisor123' && password !== 'client123') {
        throw new Error('Invalid credentials');
      }

      // Set the user in state
      setUser(mockUser);

      // Store the user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(mockUser));

      return mockUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Check for existing session on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Provide the auth context value
  const value = {
    user,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;