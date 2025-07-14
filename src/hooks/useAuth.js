import { useUser } from '@clerk/clerk-react';
import { ROLES } from '../config/routes';

export const useAuth = () => {
  const { user, isLoaded, isSignedIn } = useUser();

  const isAdmin = user?.publicMetadata?.role === ROLES.ADMIN;
  const isManager = user?.publicMetadata?.role === ROLES.MANAGER;
  const isFinancialPro = user?.publicMetadata?.role === ROLES.FINANCIAL_PRO;
  const isClient = user?.publicMetadata?.role === ROLES.CLIENT;

  const hasRole = (role) => user?.publicMetadata?.role === role;
  const hasAnyRole = (roles) => roles.includes(user?.publicMetadata?.role);

  return {
    user,
    isLoaded,
    isSignedIn,
    isAdmin,
    isManager,
    isFinancialPro,
    isClient,
    hasRole,
    hasAnyRole,
    role: user?.publicMetadata?.role
  };
};

export default useAuth;