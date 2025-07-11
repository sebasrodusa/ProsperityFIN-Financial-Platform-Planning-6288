{/* Add this inside the Personal Information Card, after the status badges */}
<div className="flex items-center space-x-2 mt-2">
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${client.status === 'active' ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'}`}>
    {client.status}
  </span>
  <div className="flex items-center space-x-2">
    <span className="text-sm text-gray-600">Portal Access</span>
    <Toggle
      enabled={client.hasAccess}
      onChange={() => {
        updateClient(client.id, { hasAccess: !client.hasAccess });
      }}
      size="sm"
    />
  </div>
</div>