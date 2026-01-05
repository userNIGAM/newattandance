import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// Check if a user has already scanned today (duplicate prevention)
export const checkDuplicateScan = async (req, res) => {
  try {
    const { userId, scanDate } = req.query;

    if (!userId || !scanDate) {
      return res.status(400).json({
        success: false,
        message: 'User ID and scan date are required'
      });
    }

    // Check if attendance record exists for this user on this date
    const existingRecord = await Attendance.findOne({
      userId: userId,
      scanDate: scanDate
    });

    if (existingRecord) {
      return res.status(200).json({
        success: true,
        alreadyScanned: true,
        firstScanTime: existingRecord.scanTime,
        message: 'User already scanned today'
      });
    }

    return res.status(200).json({
      success: true,
      alreadyScanned: false,
      message: 'No previous scan found'
    });
  } catch (error) {
    console.error('Error checking duplicate scan:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking duplicate scan',
      error: error.message
    });
  }
};

// Mark attendance when QR code is scanned
export const markAttendance = async (req, res) => {
  try {
    const {
      userId,
      rollno,
      name,
      faculty,
      semester,
      year,
      scanDate,
      scanTime,
      eventId
    } = req.body;

    // Validation
    if (!userId || !rollno || !name || !faculty || !scanDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if user exists in database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check for duplicate scan on the same date
    const existingRecord = await Attendance.findOne({
      userId: userId,
      scanDate: scanDate
    });

    if (existingRecord) {
      return res.status(409).json({
        success: false,
        message: 'User already scanned today',
        alreadyScanned: true,
        firstScanTime: existingRecord.scanTime
      });
    }

    // Create new attendance record
    const attendance = new Attendance({
      userId,
      rollno,
      name,
      faculty,
      semester: semester || null,
      year: year || null,
      scanDate,
      scanTime: scanTime || new Date(),
      eventId: eventId || 'default-event',
      status: 'present'
    });

    await attendance.save();

    return res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message
    });
  }
};

// Get attendance records for a specific date or date range
export const getAttendanceRecords = async (req, res) => {
  try {
    const { startDate, endDate, eventId, faculty } = req.query;

    let filter = {};

    if (startDate && endDate) {
      filter.scanDate = {
        $gte: startDate,
        $lte: endDate
      };
    } else if (startDate) {
      filter.scanDate = startDate;
    }

    if (eventId) {
      filter.eventId = eventId;
    }

    if (faculty) {
      filter.faculty = faculty;
    }

    const records = await Attendance.find(filter)
      .sort({ scanTime: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance records',
      error: error.message
    });
  }
};

// Get attendance summary for a specific date
export const getAttendanceSummary = async (req, res) => {
  try {
    const { scanDate, eventId } = req.query;

    if (!scanDate) {
      return res.status(400).json({
        success: false,
        message: 'Scan date is required'
      });
    }

    let filter = { scanDate };
    if (eventId) {
      filter.eventId = eventId;
    }

    const totalScans = await Attendance.countDocuments(filter);
    const byFaculty = await Attendance.aggregate([
      { $match: filter },
      { $group: { _id: '$faculty', count: { $sum: 1 } } }
    ]);

    return res.status(200).json({
      success: true,
      summary: {
        scanDate,
        totalScans,
        byFaculty
      }
    });
  } catch (error) {
    console.error('Error generating attendance summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating attendance summary',
      error: error.message
    });
  }
};

// Get attendance history for a specific student
export const getStudentAttendanceHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    let filter = { userId };

    if (startDate && endDate) {
      filter.scanDate = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const records = await Attendance.find(filter)
      .sort({ scanDate: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Error fetching student attendance history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance history',
      error: error.message
    });
  }
};

// Get all attendees for today or specific date
export const getAttendees = async (req, res) => {
  try {
    const { scanDate, eventId } = req.query;
    const todayDate = new Date().toISOString().split('T')[0];
    const targetDate = scanDate || todayDate;

    let filter = { scanDate: targetDate };
    
    if (eventId) {
      filter.eventId = eventId;
    }

    const attendees = await Attendance.find(filter)
      .sort({ scanTime: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: attendees.length,
      date: targetDate,
      data: attendees
    });
  } catch (error) {
    console.error('Error fetching attendees:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendees',
      error: error.message
    });
  }
};
