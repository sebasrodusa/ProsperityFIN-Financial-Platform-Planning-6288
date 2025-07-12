```jsx
// Update the UserProfile section in Navbar.jsx
// Find this section in the existing Navbar code:

{/* Profile Dropdown */}
<div className="relative">
  <button
    onClick={() => setIsProfileOpen(!isProfileOpen)}
    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
  >
    <div className="relative group">
      <img
        src={user?.avatar}
        alt={user?.name}
        className="w-8 h-8 rounded-full object-cover"
      />
      <div className="absolute bottom-0 right-0 bg-primary-600 text-white p-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">
        <SafeIcon icon={FiEdit} className="w-3 h-3" />
      </div>
    </div>
    <div className="hidden md:block text-left">
      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
      <p className="text-xs text-gray-500">{getRoleDisplayName(user?.role)}</p>
      {user?.agentCode && (
        <p className="text-xs text-primary-600">Agent: {user?.agentCode}</p>
      )}
    </div>
    <SafeIcon icon={FiChevronDown} className="w-4 h-4 text-gray-400" />
  </button>
  {isProfileOpen && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-medium border border-gray-100 py-1 z-50"
    >
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
        <p className="text-xs text-gray-500">{user?.email}</p>
        {user?.agentCode && (
          <p className="text-xs text-primary-600">Agent Code: {user?.agentCode}</p>
        )}
        {user?.teamId && (
          <p className="text-xs text-secondary-600">
            Team: {TEAM_IDS.find(team => team.id === user?.teamId)?.name}
          </p>
        )}
      </div>
      {/* Rest of the dropdown menu items */}
    </motion.div>
  )}
</div>
```