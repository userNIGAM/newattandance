import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User Registration
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get User QR Code
export const getUserQR = async (userId) => {
  try {
    const response = await api.get(`/user/${userId}/qr`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Check if QR code was already scanned today (duplicate prevention)
export const checkDuplicateScan = async (userId, scanDate) => {
  try {
    const response = await api.get('/attendance/check-duplicate', {
      params: {
        userId: userId,
        scanDate: scanDate // Format: YYYY-MM-DD
      }
    });
    return response.data;
  } catch (error) {
    // If endpoint doesn't exist yet, return false (not scanned)
    console.warn('Duplicate check endpoint not available:', error.message);
    return { alreadyScanned: false };
  }
};

// Mark attendance when QR is scanned
export const markAttendance = async (attendanceData) => {
  try {
    const response = await api.post('/attendance/mark', {
      userId: attendanceData.userId,
      rollno: attendanceData.rollno,
      name: attendanceData.name,
      faculty: attendanceData.faculty,
      semester: attendanceData.semester,
      year: attendanceData.year,
      scanDate: attendanceData.scanDate,
      scanTime: attendanceData.scanTime,
      eventId: attendanceData.eventId
    });
    return response.data;
  } catch (error) {
    console.error('Attendance marking error:', error);
    throw error.response?.data || error;
  }
};