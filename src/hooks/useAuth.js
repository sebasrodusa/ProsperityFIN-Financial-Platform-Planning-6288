import { useAuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useAuthContext();
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const {
    user,
    loading,
    isSignedIn,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAdmin,
    isManager,
    isFinancialProfessional,
    isClient,
    hasRole,
    hasAnyRole,
  } = context;

  return {
    user,
    loading,
    isSignedIn,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAdmin,
    isManager,
    isFinancialProfessional,
    isClient,
    hasRole,
    hasAnyRole,
    role: user?.role,
  };
};

export default useAuth;