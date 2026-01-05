import React, { useState, useEffect } from "react";
import { QrCode, UserPlus, ScanLine, Users, Download, Upload } from "lucide-react";

import EventQR from "./Attandance/EventQR";
import RegisterForm from "./RegisterForm/RegisterForm";
import Scanner from "./Attandance/scanner/Scanner"; // Production-ready Scanner
import AttendeesList from "./Attendees/AttendeesList";

const AttendanceApp = () => {
  // Initialize state from localStorage
  const [activeTab, setActiveTab] = useState("generate");
  const [eventQR, setEventQR] = useState(() => {
    try {
      const saved = localStorage.getItem("currentEvent");
      return saved ? JSON.parse(saved).qrUrl : null;
    } catch { 
      return null;
    }
  });
  const [eventId, setEventId] = useState(() => {
    try {
      const saved = localStorage.getItem("currentEvent");
      return saved ? JSON.parse(saved).eventId : null;
    } catch {
      return null;
    }
  });
  const [scannedData, setScannedData] = useState(null);
  const [attendees, setAttendees] = useState(() => {
    try {
      const saved = localStorage.getItem("eventAttendees");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [eventName, setEventName] = useState(() => {
    try {
      const saved = localStorage.getItem("currentEvent");
      return saved ? JSON.parse(saved).name : "";
    } catch {
      return "";
    }
  });

  // Save attendees to localStorage whenever it changes
  useEffect(() => {
    if (attendees.length > 0) {
      localStorage.setItem("eventAttendees", JSON.stringify(attendees));
    }
  }, [attendees]);

  // Generate Event QR
  const generateEventQR = async () => {
    if (!eventName.trim()) {
      alert("Please enter an event name");
      return;
    }

    const newEventId = "EVT_" + Date.now();
    const timestamp = new Date().toISOString();

    const eventData = {
      type: "ATTENDANCE_EVENT",
      eventId: newEventId,
      eventName: eventName,
      timestamp: timestamp,
      signature: btoa(newEventId + "_SECRET_KEY_" + timestamp),
    };

    const qrData = JSON.stringify(eventData);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      qrData
    )}`;

    setEventQR(qrUrl);
    setEventId(newEventId);

    // Save event to localStorage
    const eventToSave = {
      eventId: newEventId,
      name: eventName,
      qrUrl: qrUrl,
      createdAt: timestamp,
    };
    localStorage.setItem("currentEvent", JSON.stringify(eventToSave));
  };

  // Handle scanned QR data from Scanner component
  const handleQRScanned = (scanResult) => {
    try {
      if (scanResult.valid) {
        // Add to attendees list with timestamp
        const newAttendee = {
          ...scanResult.userData,
          scannedAt: new Date().toISOString(),
          status: "present",
          scanMethod: "qr_scanner"
        };

        setAttendees(prev => {
          // Check if user already exists
          const existingIndex = prev.findIndex(a => a.userId === scanResult.userData.userId);
          
          if (existingIndex > -1) {
            // Update existing attendee
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              ...newAttendee
            };
            return updated;
          } else {
            // Add new attendee
            return [...prev, newAttendee];
          }
        });

        setScannedData({
          valid: true,
          success: true,
          message: `✓ Attendance marked for ${scanResult.userData.name}`,
          data: scanResult.userData
        });
      } else {
        setScannedData({
          valid: false,
          success: false,
          message: scanResult.message || "Invalid QR code",
          data: null
        });
      }
    } catch (error) {
      console.error("Error processing QR:", error);
      setScannedData({
        valid: false,
        success: false,
        message: "Error processing QR code",
        data: null
      });
    }
  };

  // Export attendees to CSV
  const exportAttendees = () => {
    if (attendees.length === 0) {
      alert("No attendees to export");
      return;
    }

    const headers = ["Name", "Email", "Phone", "Student ID", "Roll No", "Faculty", "Semester", "Status", "Scanned At"];
    const csvRows = attendees.map(attendee => [
      `"${attendee.name}"`,
      `"${attendee.email}"`,
      `"${attendee.phone}"`,
      `"${attendee.studentId}"`,
      `"${attendee.rollNo}"`,
      `"${attendee.faculty}"`,
      `"${attendee.semester}"`,
      `"${attendee.status}"`,
      `"${attendee.scannedAt || 'Not scanned'}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...csvRows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_${eventName || 'event'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clear all data
  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      localStorage.removeItem("currentEvent");
      localStorage.removeItem("eventAttendees");
      setEventQR(null);
      setEventId(null);
      setEventName("");
      setAttendees([]);
      setScannedData(null);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <QrCode size={36} />
                  Attendance QR System
                </h1>
                <p className="text-blue-100 mt-2">
                  Complete QR-based attendance tracking solution
                </p>
                {eventId && (
                  <div className="mt-3 text-sm bg-white/20 backdrop-blur-sm rounded-lg p-2 inline-block">
                    <span className="font-semibold">Current Event:</span> {eventName} ({eventId})
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {attendees.length > 0 && (
                  <button
                    onClick={exportAttendees}
                    className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
                  >
                    <Download size={18} />
                    Export CSV
                  </button>
                )}
                {(eventId || attendees.length > 0) && (
                  <button
                    onClick={clearAllData}
                    className="bg-red-500/80 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-blue-600">{attendees.filter(a => a.status === "present").length}</p>
                <p className="text-sm text-gray-600">Present Today</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-green-600">{attendees.filter(a => a.status === "registered").length}</p>
                <p className="text-sm text-gray-600">Registered</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-purple-600">{attendees.length}</p>
                <p className="text-sm text-gray-600">Total Attendees</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-amber-600">{eventId ? "Active" : "No Event"}</p>
                <p className="text-sm text-gray-600">Event Status</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b overflow-x-auto">
            {[
              { key: "generate", label: "Event QR", icon: QrCode, color: "blue" },
              { key: "register", label: "Register", icon: UserPlus, color: "green" },
              { key: "scan", label: "Scanner", icon: ScanLine, color: "purple" },
              {
                key: "attendees",
                label: `Attendees (${attendees.length})`,
                icon: Users,
                color: "indigo"
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 py-4 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-2 min-w-35 ${
                  activeTab === tab.key
                    ? `bg-${tab.color}-50 text-${tab.color}-600 border-b-2 border-${tab.color}-600`
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
                eventName={eventName}
                setEventName={setEventName}
                generateEventQR={generateEventQR}
              />
            )}

            {activeTab === "register" && (
              <RegisterForm
                eventId={eventId}
                eventName={eventName}
                onRegistrationComplete={(newAttendee) => {
                  setAttendees(prev => [...prev, newAttendee]);
                }}
              />
            )}

            {activeTab === "scan" && (
              <div>
                {!eventId ? (
                  <div className="text-center p-8 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="text-amber-600 mb-4">
                      <ScanLine size={48} className="mx-auto opacity-50" />
                    </div>
                    <h3 className="text-xl font-semibold text-amber-800 mb-2">No Active Event</h3>
                    <p className="text-amber-700 mb-4">
                      Please create an event first in the "Event QR" tab before scanning.
                    </p>
                    <button
                      onClick={() => setActiveTab("generate")}
                      className="bg-linear-to-r from-amber-500 to-orange-500 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition-all duration-300"
                    >
                      Create Event
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h3 className="font-bold text-blue-800">Scanning for: {eventName}</h3>
                          <p className="text-sm text-blue-600">Event ID: {eventId}</p>
                          <p className="text-sm text-blue-600 mt-1">
                            Total Scanned: {attendees.filter(a => a.status === "present").length} attendees
                          </p>
                        </div>
                        {scannedData && (
                          <div className={`px-4 py-2 rounded-lg ${scannedData.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            <div className="flex items-center gap-2">
                              {scannedData.valid ? (
                                <QrCode size={20} />
                              ) : (
                                <ScanLine size={20} />
                              )}
                              <span className="font-medium">{scannedData.message}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Scanner
                      onQRScanned={handleQRScanned}
                      currentEvent={{ id: eventId, name: eventName }}
                    />
                  </>
                )}
              </div>
            )}

            {activeTab === "attendees" && (
              <AttendeesList 
                attendees={attendees} 
                eventName={eventName}
                onExport={exportAttendees}
              />
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-4 border-t">
            <div className="text-center text-sm text-gray-600">
              <p>QR Attendance System v1.0 • {attendees.length} total records • Last updated: {new Date().toLocaleTimeString()}</p>
              <p className="mt-1">Scan QR codes quickly and efficiently with our enhanced scanner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceApp;