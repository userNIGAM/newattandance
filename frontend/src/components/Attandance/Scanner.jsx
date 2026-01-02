import React from "react";
import { Camera } from "lucide-react";

const Scanner = ({
  scanning,
  setScanning,
  scannedData,
  setScannedData,
  videoRef,
  canvasRef,
  validateAndProcessQR,
}) => {
  const startScanner = async () => {
    setScanning(true);
    setScannedData(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      alert("Camera access denied. Please allow permissions.");
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const simulateScan = (type) => {
    const data =
      type === "valid"
        ? {
            type: "ATTENDANCE_USER",
            userId: "USER_12345",
            name: "John Doe",
            email: "john@example.com",
            signature: btoa("USER_12345_SECRET_KEY"),
          }
        : { type: "WIFI_QR", ssid: "MyWiFi" };

    validateAndProcessQR(JSON.stringify(data));
  };

  return (
    <div className="text-center space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        Scan Attendance QR Code
      </h2>

      {!scanning ? (
        <button
          onClick={startScanner}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 flex gap-2 mx-auto"
        >
          <Camera size={20} />
          Start Scanner
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-black rounded-xl overflow-hidden">
            <video ref={videoRef} className="w-full h-64 object-cover" />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <button
            onClick={stopScanner}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Stop Scanner
          </button>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">Demo Scanning</p>
            <div className="flex justify-center gap-2 mt-2">
              <button
                onClick={() => simulateScan("valid")}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm"
              >
                Scan Valid QR
              </button>
              <button
                onClick={() => simulateScan("invalid")}
                className="bg-orange-600 text-white px-4 py-2 rounded text-sm"
              >
                Scan WiFi QR
              </button>
            </div>
          </div>
        </div>
      )}

      {scannedData && (
        <div
          className={`p-4 rounded-lg ${
            scannedData.valid
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <p
            className={`font-semibold ${
              scannedData.valid ? "text-green-800" : "text-red-800"
            }`}
          >
            {scannedData.message}
          </p>

          {scannedData.data && (
            <div className="mt-2 text-left text-sm">
              <p>User ID: {scannedData.data.userId}</p>
              <p>Email: {scannedData.data.email}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Scanner;
