import React, { useState, useRef } from "react";
import { QrCode, UserPlus, ScanLine, Users } from "lucide-react";

import EventQR from "./Attandance/EventQR";
import RegisterForm from "./Attandance/RegisterForm";
import Scanner from "./Attandance/Scanner";
import AttendeesList from "./Attandance/AttendeesList";

const AttendanceApp = () => {
  const [activeTab, setActiveTab] = useState("generate");
  const [eventQR, setEventQR] = useState(null);
  const [eventId, setEventId] = useState(null);
  const [userQR, setUserQR] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [attendees, setAttendees] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
  });

  // Generate Event QR
  const generateEventQR = async () => {
    const newEventId = "EVT_" + Date.now();

    const eventData = {
      type: "ATTENDANCE_EVENT",
      eventId: newEventId,
      timestamp: new Date().toISOString(),
      signature: btoa(newEventId + "_SECRET_KEY"),
    };

    const qrData = JSON.stringify(eventData);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      qrData
    )}`;

    setEventQR(qrUrl);
    setEventId(newEventId);
  };

  // Handle Registration
  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill in all required fields");
      return;
    }

    const userId = "USER_" + Date.now();

    const userData = {
      type: "ATTENDANCE_USER",
      userId,
      eventId: eventId || "DEFAULT_EVENT",
      ...formData,
      registeredAt: new Date().toISOString(),
      signature: btoa(userId + "_SECRET_KEY"),
    };

    const qrData = JSON.stringify(userData);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      qrData
    )}`;

    setUserQR(qrUrl);
    setFormData({ name: "", email: "", phone: "", organization: "" });
  };

  // Scanner helpers
  const validateAndProcessQR = (qrData) => {
    try {
      const data = JSON.parse(qrData);

      if (data.type !== "ATTENDANCE_USER" && data.type !== "ATTENDANCE_EVENT") {
        setScannedData({
          valid: false,
          message: "Invalid QR Code. Only attendance QR codes are accepted.",
        });
        return;
      }

      const expectedSig = btoa((data.userId || data.eventId) + "_SECRET_KEY");

      if (data.signature !== expectedSig) {
        setScannedData({
          valid: false,
          message: "QR Code signature verification failed.",
        });
        return;
      }

      if (data.type === "ATTENDANCE_USER") {
        setAttendees((prev) => [
          ...prev,
          { ...data, scannedAt: new Date().toISOString() },
        ]);

        setScannedData({
          valid: true,
          message: `Attendance marked for ${data.name}`,
          data,
        });
      }
    } catch {
      setScannedData({
        valid: false,
        message: "Invalid QR Code format.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <QrCode size={36} />
              Attendance QR System
            </h1>
            <p className="text-blue-100 mt-2">
              Secure QR-based attendance tracking
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            {[
              { key: "generate", label: "Event QR", icon: QrCode },
              { key: "register", label: "Register", icon: UserPlus },
              { key: "scan", label: "Scanner", icon: ScanLine },
              {
                key: "attendees",
                label: `Attendees (${attendees.length})`,
                icon: Users,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "generate" && (
              <EventQR
                eventQR={eventQR}
                eventId={eventId}
                generateEventQR={generateEventQR}
              />
            )}

            {activeTab === "register" && (
              <RegisterForm
                formData={formData}
                setFormData={setFormData}
                userQR={userQR}
                setUserQR={setUserQR}
                handleRegister={handleRegister}
              />
            )}

            {activeTab === "scan" && (
              <Scanner
                scanning={scanning}
                setScanning={setScanning}
                scannedData={scannedData}
                setScannedData={setScannedData}
                videoRef={videoRef}
                canvasRef={canvasRef}
                validateAndProcessQR={validateAndProcessQR}
              />
            )}

            {activeTab === "attendees" && (
              <AttendeesList attendees={attendees} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceApp;
