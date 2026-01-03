import { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { checkDuplicateScan, markAttendance } from '../services/Api';

export default function Scanner({ currentEvent, onQRScanned }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [stats, setStats] = useState({
    todayCount: 0,
    successCount: 0,
    duplicatesBlocked: 0
  });
  const [lastScanResult, setLastScanResult] = useState(null);
  const streamRef = useRef(null);

  // Initialize camera
  useEffect(() => {
    if (!scanning) return;

    let mountedRef = true;
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (mountedRef) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        }
      } catch (err) {
        if (mountedRef) {
          console.error('Camera access error:', err);
          setLastScanResult({
            type: 'error',
            message: 'Unable to access camera. Please allow camera permissions.'
          });
        }
      }
    };

    initCamera();

    return () => {
      mountedRef = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [scanning]);

  // Validate QR data structure
  const validateQRData = (qrData) => {
    const required = ['userId', 'rollno', 'name', 'faculty'];
    return required.every(field => Object.prototype.hasOwnProperty.call(qrData, field) && qrData[field]);
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Process scanned QR code
  const processScannedQR = useCallback(async (qrDataString) => {
    try {
      setLoading(true);

      // Parse QR data
      let qrData;
      try {
        qrData = JSON.parse(qrDataString);
      } catch {
        setLastScanResult({
          type: 'error',
          message: 'Invalid QR format. Please try again.'
        });
        setLoading(false);
        return;
      }

      // Validate QR contains required fields
      if (!validateQRData(qrData)) {
        setLastScanResult({
          type: 'error',
          message: 'Invalid QR data. Missing required user information.'
        });
        setLoading(false);
        return;
      }

      const scanDate = getTodayDate();

      // Check for duplicate scan
      const dupCheck = await checkDuplicateScan(qrData.userId, scanDate);

      if (dupCheck.alreadyScanned) {
        setStats(prev => ({
          ...prev,
          duplicatesBlocked: prev.duplicatesBlocked + 1
        }));
        setLastScanResult({
          type: 'warning',
          message: `⚠️ ${qrData.name} already scanned today at ${new Date(dupCheck.firstScanTime).toLocaleTimeString()}`,
          data: qrData
        });
        setLoading(false);
        // Continue scanning without stopping
        setTimeout(() => setScanning(true), 2000);
        return;
      }

      // Mark attendance
      const attendanceData = {
        userId: qrData.userId,
        rollno: qrData.rollno,
        name: qrData.name,
        faculty: qrData.faculty,
        semester: qrData.semester || null,
        year: qrData.year || null,
        scanDate: scanDate,
        scanTime: new Date().toISOString(),
        eventId: currentEvent?.eventId || 'default-event'
      };

      const result = await markAttendance(attendanceData);

      if (result.success) {
        setStats(prev => ({
          ...prev,
          todayCount: prev.todayCount + 1,
          successCount: prev.successCount + 1
        }));

        setLastScanResult({
          type: 'success',
          message: `✅ ${qrData.name} (${qrData.rollno}) marked present`,
          data: qrData
        });

        // Add to history
        setScanHistory(prev => [
          {
            id: Date.now(),
            name: qrData.name,
            rollno: qrData.rollno,
            faculty: qrData.faculty,
            scanTime: new Date().toLocaleTimeString(),
            status: 'present'
          },
          ...prev
        ]);

        // Callback to parent
        if (onQRScanned) {
          onQRScanned(qrData);
        }
      } else {
        setLastScanResult({
          type: 'error',
          message: result.message || 'Failed to mark attendance'
        });
      }
    } catch (error) {
      console.error('Scanner error:', error);
      setLastScanResult({
        type: 'error',
        message: 'Network error. Please check your connection.'
      });
    } finally {
      setLoading(false);
      // Continue scanning
      setTimeout(() => setScanning(true), 2000);
    }
  }, [currentEvent, onQRScanned]);

  // Scan QR codes - useEffect will call this when scanning starts
  useEffect(() => {
    if (!scanning || !videoRef.current) return;

    let isMounted = true;

    const scanInterval = setInterval(() => {
      if (
        isMounted &&
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
      ) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

        if (qrCode && qrCode.data) {
          clearInterval(scanInterval);
          processScannedQR(qrCode.data);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearInterval(scanInterval);
    };
  }, [scanning, processScannedQR]);

  // Demo mode - test without actual camera
  const handleDemoScan = async () => {
    const demoQRData = {
      userId: '507f1f77bcf86cd799439011',
      rollno: 'BCA001',
      name: 'Demo User',
      faculty: 'BCA',
      semester: 3,
      year: null
    };

    await processScannedQR(JSON.stringify(demoQRData));
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 rounded-lg p-4 md:p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">QR Code Scanner</h2>
        {currentEvent?.eventName && (
          <p className="text-sm text-gray-600">Event: {currentEvent.eventName}</p>
        )}
      </div>

      {/* Statistics Dashboard */}
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

      {/* Last Scan Result */}
      {lastScanResult && (
        <div
          className={`mb-4 p-4 rounded-lg border-l-4 ${
            lastScanResult.type === 'success'
              ? 'bg-green-50 border-green-500 text-green-800'
              : lastScanResult.type === 'warning'
              ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
              : 'bg-red-50 border-red-500 text-red-800'
          }`}
        >
          <p className="font-medium">{lastScanResult.message}</p>
          {lastScanResult.data && (
            <p className="text-xs mt-1 opacity-75">
              {lastScanResult.data.name} • {lastScanResult.data.rollno}
            </p>
          )}
        </div>
      )}

      {/* Scanner Container */}
      {scanning ? (
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="relative bg-black rounded-lg overflow-hidden flex-1 flex items-center justify-center">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
            {loading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Processing...</p>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setScanning(false)}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition"
            >
              Stop Scanning
            </button>
            <button
              onClick={handleDemoScan}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Test Scan'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
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
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
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
                  <p className="text-xs text-gray-500">{scan.rollno} • {scan.faculty}</p>
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
      )}
    </div>
  );
}
