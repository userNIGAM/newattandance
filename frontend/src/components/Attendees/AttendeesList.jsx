import React, { useState, useEffect } from "react";
import { Users, Loader, AlertCircle } from "lucide-react";
import { getAttendees } from "../../services/Api.js";

const AttendeesList = ({ attendees: propAttendees, scanDate }) => {
  const [attendees, setAttendees] = useState(propAttendees || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const targetDate = scanDate || new Date().toISOString().split('T')[0];
        const response = await getAttendees(targetDate);
        
        if (response.success) {
          setAttendees(response.data || []);
        } else {
          setError(response.message || 'Failed to fetch attendees');
        }
      } catch (err) {
        console.error('Error fetching attendees:', err);
        setError(err.message || 'Failed to fetch attendees from database');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendees();
  }, [scanDate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle size={20} className="text-red-600 mt-0.5" />
        <div>
          <p className="font-semibold text-red-800">Error</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Marked Attendees ({attendees.length})
      </h2>

      {attendees.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p>No attendees marked yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">SN</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Faculty</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Semester</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Year</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Scan Time</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendees.map((attendee, index) => (
                <tr key={attendee._id || index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">{attendee.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{attendee.rollno}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{attendee.faculty}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">{attendee.semester || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">{attendee.year || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(attendee.scanTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {attendee.status || 'Present'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendeesList;
