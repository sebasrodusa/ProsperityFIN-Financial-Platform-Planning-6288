import { useContext } from 'react';
import { useAuth as useAuthContext } from '../contexts/AuthContext';

// Define role constants
const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  FINANCIAL_PRO: 'financial_pro',
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
  const isFinancialPro = user?.role === ROLES.FINANCIAL_PRO;
  const isClient = user?.role === ROLES.CLIENT;

  const hasRole = (role) => user?.role === role;
  const hasAnyRole = (roles) => roles.includes(user?.role);

  return {
    user,
    loading,
    isSignedIn,
    isAdmin,
    isManager,
    isFinancialPro,
    isClient,
    hasRole,
    hasAnyRole,
    role: user?.role
  };
};

export default useAuth;