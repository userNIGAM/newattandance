export default function ScanHistory({ scanHistory }) {
  if (!scanHistory.length) return null;

  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
        Recent Scans ({scanHistory.length})
      </h3>

      <div className="max-h-32 overflow-y-auto space-y-2">
        {scanHistory.map(scan => (
          <div
            key={scan.id}
            className="flex justify-between items-center text-sm p-2 bg-white rounded border border-gray-200 hover:bg-gray-50"
          >
            <div>
              <p className="font-medium text-gray-800">{scan.name}</p>
              <p className="text-xs text-gray-500">
                {scan.rollno} • {scan.faculty}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-600">{scan.scanTime}</p>
              <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded mt-1">
                Present
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
