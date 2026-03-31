export const Logs = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logs & Monitoring</h1>
          <p className="text-gray-600 mt-1">
            Real-time system logs and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300">
            Pause
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300">
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="font-mono text-sm space-y-1">
          <div className="flex gap-2">
            <span className="text-success">●</span>
            <span className="text-gray-500">08:15:23</span>
            <span className="text-blue-600">[INFO]</span>
            <span>System online</span>
          </div>
          <div className="flex gap-2">
            <span className="text-success">●</span>
            <span className="text-gray-500">08:15:25</span>
            <span className="text-blue-600">[INFO]</span>
            <span>Scraping job #1234 started</span>
          </div>
          <div className="flex gap-2">
            <span className="text-warning">●</span>
            <span className="text-gray-500">08:15:30</span>
            <span className="text-warning">[WARN]</span>
            <span>Rate limit approaching</span>
          </div>
        </div>
      </div>
    </div>
  );
};
