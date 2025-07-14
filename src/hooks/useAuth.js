import { useContext } from 'react';
import { useAuth as useAuthContext } from '../contexts/AuthContext';

// Define role constants
const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  FINANCIAL_PROFESSIONAL: 'financial_professional',
  CLIENT: 'client'
};

export const useAuth = () => {
  const context = useAuthContext();
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, loading, isSignedIn } = context;

  const isAdmin = user?.role === ROLES.ADMIN;
  const isManager = user?.role === ROLES.MANAGER;
  const isFinancialProfessional = user?.role === ROLES.FINANCIAL_PROFESSIONAL;
  const isClient = user?.role === ROLES.CLIENT;

  const hasRole = (role) => user?.role === role;
  const hasAnyRole = (roles) => roles.includes(user?.role);

  return {
    user,
    loading,
    isSignedIn,
    isAdmin,
    isManager,
    isFinancialProfessional,
    isClient,
    hasRole,
    hasAnyRole,
    role: user?.role
  };
};

export default useAuth;