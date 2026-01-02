import React from "react";
import { Download, QrCode } from "lucide-react";

const EventQR = ({ eventQR, eventId, generateEventQR }) => {
  const downloadQR = (qrUrl, filename) => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = filename;
    link.click();
  };

  return (
    <div className="text-center space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        Generate Event QR Code
      </h2>
      <p className="text-gray-600">
        Create a QR code that redirects users to the registration form
      </p>

      <button
        onClick={generateEventQR}
        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Generate Event QR
      </button>

      {eventQR && (
        <div className="mt-6 space-y-4">
          <div className="bg-gray-50 p-6 rounded-xl inline-block">
            <img src={eventQR} alt="Event QR Code" className="w-64 h-64" />
          </div>
          <p className="text-sm text-gray-600">Event ID: {eventId}</p>

          <button
            onClick={() => downloadQR(eventQR, `event-qr-${eventId}.png`)}
            className="flex items-center gap-2 mx-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            Download QR Code
          </button>
        </div>
      )}
    </div>
  );
};

export default EventQR;
