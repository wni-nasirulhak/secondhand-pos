export const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure authentication, rate limits, and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <nav className="space-y-1">
            <a href="#auth" className="block px-3 py-2 bg-blue-50 text-blue-700 rounded-md font-medium">
              🔐 Authentication
            </a>
            <a href="#rate" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              ⚡ Rate Limiting
            </a>
            <a href="#proxy" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              🌐 Proxy
            </a>
            <a href="#api" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              🔑 API Keys
            </a>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          <p className="text-gray-600">
            Settings content will appear here
          </p>
        </div>
      </div>
    </div>
  );
};
