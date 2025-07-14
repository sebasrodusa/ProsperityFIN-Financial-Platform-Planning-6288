import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ROLES } from '../config/routes';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
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