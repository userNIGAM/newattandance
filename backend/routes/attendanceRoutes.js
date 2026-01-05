import { Router } from 'express';
const router = Router();
import {
  checkDuplicateScan,
  markAttendance,
  getAttendanceRecords,
  getAttendanceSummary,
  getStudentAttendanceHistory,
  getAttendees
} from '../controllers/attendanceController.js';
import {
  saveScanDataToExcel,
  exportAttendanceToExcel,
  getExcelFiles,
  downloadExcelFile
} from '../controllers/scannerData.js';

// Check if user already scanned today
router.get('/check-duplicate', checkDuplicateScan);

// Mark attendance when QR is scanned
router.post('/mark', markAttendance);

// Get all attendees for a date
router.get('/attendees', getAttendees);

// Get attendance records (with optional filters)
router.get('/records', getAttendanceRecords);

// Get attendance summary for a specific date
router.get('/summary', getAttendanceSummary);

// Get attendance history for a specific student
router.get('/student/:userId/history', getStudentAttendanceHistory);

// ==================== Excel Export Routes ====================

// Save scanned QR data directly to Excel file
router.post('/save-scan-excel', saveScanDataToExcel);

// Export attendance records to Excel (with filters)
router.get('/export-excel', exportAttendanceToExcel);

// Get list of all Excel files
router.get('/excel-files', getExcelFiles);

// Download specific Excel file
router.get('/download/:filename', downloadExcelFile);

export default router;
