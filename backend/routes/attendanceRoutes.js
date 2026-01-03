import { Router } from 'express';
const router = Router();
import {
  checkDuplicateScan,
  markAttendance,
  getAttendanceRecords,
  getAttendanceSummary,
  getStudentAttendanceHistory
} from '../controllers/attendanceController.js';

// Check if user already scanned today
router.get('/check-duplicate', checkDuplicateScan);

// Mark attendance when QR is scanned
router.post('/mark', markAttendance);

// Get attendance records (with optional filters)
router.get('/records', getAttendanceRecords);

// Get attendance summary for a specific date
router.get('/summary', getAttendanceSummary);

// Get attendance history for a specific student
router.get('/student/:userId/history', getStudentAttendanceHistory);

export default router;
