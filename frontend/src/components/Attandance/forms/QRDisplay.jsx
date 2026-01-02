import React from "react";
import { Download } from "lucide-react";

const QRDisplay = ({ userQR, setUserQR }) => {
  const downloadQR = (qrUrl, filename) => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = filename;
    link.click();
  };

  return (
    <div className="max-w-md mx-auto text-center space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 font-semibold">✓ Registration Successful!</p>
      </div>

      <h3 className="text-xl font-bold text-gray-800">Your Attendance QR Code</h3>
      <p className="text-gray-600">Save this QR code to mark attendance</p>

      <div className="bg-gray-50 p-6 rounded-xl inline-block">
        <img src={userQR} alt="User QR" className="w-64 h-64" />
      </div>

      <button
        onClick={() => downloadQR(userQR, "my-attendance-qr.png")}
        className="flex items-center gap-2 mx-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        <Download size={20} />
        Download My QR Code
      </button>

      <button
        onClick={() => setUserQR(null)}
        className="text-blue-600 hover:underline"
      >
        Register Another Person
      </button>
    </div>
  );
};

export default QRDisplay;
