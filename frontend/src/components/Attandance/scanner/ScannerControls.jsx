export default function ScannerControls({ scanning, setScanning, onDemo, loading }) {
  return scanning ? (
    <div className="flex gap-2 mt-4">
      <button
        onClick={() => setScanning(false)}
        disabled={loading}
        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Stop Scanning
      </button>

      <button
        onClick={onDemo}
        disabled={loading}
        className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Test Scan"}
      </button>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center mt-6">
      <div className="text-6xl mb-4">📱</div>
      <p className="text-gray-600 text-center mb-6">
        Click below to start scanning QR codes
      </p>

      <button
        onClick={() => setScanning(true)}
        className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition"
      >
        Start Scanner
      </button>
    </div>
  );
}
