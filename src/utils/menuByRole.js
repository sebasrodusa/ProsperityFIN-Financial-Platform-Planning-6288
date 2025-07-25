// Utility to generate navigation menu items based on a user's role.
//
// Expected role values:
// - 'admin'
// - 'manager'
// - 'advisor'
// - 'client'
// Any other value will be treated as a basic user.

import * as FiIcons from 'react-icons/fi';

const { FiHome, FiUsers, FiFileText, FiSettings } = FiIcons;

export default function menuByRole(role = '') {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome }
  ];

  if (role !== 'client') {
    navItems.push(
      { path: '/clients', label: 'Clients', icon: FiUsers },
      { path: '/financial-analysis', label: 'Financial Analysis', icon: FiFileText },
      { path: '/proposals', label: 'Proposals', icon: FiFileText }
    );
  }

  if (role === 'admin' || role === 'manager') {
    navItems.push({ path: '/users', label: 'Users', icon: FiUsers });
  }

  if (role === 'admin') {
    navItems.push({ path: '/projections-settings', label: 'Projections', icon: FiSettings });
  }

  return navItems;
}
