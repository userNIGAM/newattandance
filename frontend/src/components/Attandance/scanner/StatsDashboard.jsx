export default function StatsDashboard({ stats }) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <p className="text-xs text-gray-600 uppercase tracking-wide">Total Scans</p>
        <p className="text-2xl font-bold text-blue-600">{stats.todayCount}</p>
      </div>

      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
        <p className="text-xs text-gray-600 uppercase tracking-wide">Marked Present</p>
        <p className="text-2xl font-bold text-green-600">{stats.successCount}</p>
      </div>

      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
        <p className="text-xs text-gray-600 uppercase tracking-wide">Duplicates</p>
        <p className="text-2xl font-bold text-yellow-600">{stats.duplicatesBlocked}</p>
      </div>
    </div>
  );
}
