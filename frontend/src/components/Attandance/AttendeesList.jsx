import React from "react";
import { Users } from "lucide-react";

const AttendeesList = ({ attendees }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-6">
      Marked Attendees
    </h2>

    {attendees.length === 0 ? (
      <div className="text-center py-12 text-gray-500">
        <Users size={48} className="mx-auto mb-4 opacity-50" />
        <p>No attendees scanned yet</p>
      </div>
    ) : (
      <div className="space-y-3">
        {attendees.map((a, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{a.name}</p>
                <p className="text-sm">{a.email}</p>
                <p className="text-sm">{a.phone}</p>
                {a.organization && (
                  <p className="text-sm text-gray-500">{a.organization}</p>
                )}
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {new Date(a.scannedAt).toLocaleString()}
                </p>
                <span className="inline-block mt-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Present
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default AttendeesList;
