import React from "react";
import { CheckCircle, X } from "lucide-react";

const QRDisplay = ({ userQR, setUserQR }) => {
  return (
    <div className="max-w-md mx-auto text-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Registration Successful!
        </h2>
        <p className="text-gray-600 mb-6">
          Your QR code has been generated. Save this code for event check-in.
        </p>
        <div className="bg-gray-50 p-6 rounded-xl mb-6">
          <img
            src={userQR}
            alt="User QR Code"
            className="w-48 h-48 mx-auto object-contain"
          />
          <p className="text-sm text-gray-500 mt-4">
            Scan this QR code at the event entrance
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => window.print()}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Print QR Code
          </button>
          <button
            onClick={() => {
              const link = document.createElement("a");
              link.href = userQR;
              link.download = "event-qr-code.png";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-200"
          >
            Download QR Code
          </button>
          <button
            onClick={setUserQR}
            className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition duration-200 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Register Another Person
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRDisplay;