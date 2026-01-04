import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Attendance from '../models/Attendance.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Save scanned QR data to Excel file
 * Creates or appends to an Excel file with scan records
 */
export const saveScanDataToExcel = async (req, res) => {
  try {
    const { userId, rollno, name, faculty, semester, year, scanDate, scanTime, eventId } = req.body;

    // Validation
    if (!userId || !rollno || !name || !faculty || !scanDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate filename with date
    const fileDate = scanDate.replace(/-/g, '_');
    const filename = `Attendance_${fileDate}_${eventId || 'default'}.xlsx`;
    const filepath = path.join(uploadsDir, filename);

    // Create or load workbook
    let workbook = new ExcelJS.Workbook();
    let worksheet;

    if (fs.existsSync(filepath)) {
      // Load existing file
      await workbook.xlsx.readFile(filepath);
      worksheet = workbook.getWorksheet(1);
    } else {
      // Create new workbook with headers
      worksheet = workbook.addWorksheet('Attendance');
      
      // Set column widths
      worksheet.columns = [
        { header: 'S.N.', key: 'sn', width: 8 },
        { header: 'Roll Number', key: 'rollno', width: 15 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Faculty', key: 'faculty', width: 12 },
        { header: 'Year', key: 'year', width: 8 },
        { header: 'Semester', key: 'semester', width: 10 },
        { header: 'Scan Date', key: 'scanDate', width: 15 },
        { header: 'Scan Time', key: 'scanTime', width: 18 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Event ID', key: 'eventId', width: 15 }
      ];

      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'center' };
    }

    // Check if record already exists to prevent duplicates
    const isDuplicate = worksheet.findRow((row, index) => {
      if (index === 1) return false; // Skip header
      return (
        row.getCell('rollno').value === rollno &&
        row.getCell('scanDate').value === scanDate
      );
    });

    if (isDuplicate && isDuplicate.number !== 1) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate scan detected. User already scanned today.',
        alreadyScanned: true
      });
    }

    // Add new row
    const rowCount = worksheet.rowCount;
    const newRow = worksheet.insertRow(rowCount + 1, {
      sn: rowCount,
      rollno: rollno.toUpperCase(),
      name: name,
      faculty: faculty,
      year: year || '',
      semester: semester || '',
      scanDate: scanDate,
      scanTime: scanTime ? new Date(scanTime).toLocaleTimeString() : new Date().toLocaleTimeString(),
      status: 'present',
      eventId: eventId || 'default-event'
    });

    // Style data row
    newRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F2F2' }
    };
    newRow.alignment = { horizontal: 'left', vertical: 'center' };

    // Save workbook
    await workbook.xlsx.writeFile(filepath);

    return res.status(201).json({
      success: true,
      message: 'Scan data saved to Excel successfully',
      filename: filename,
      filepath: `/uploads/${filename}`,
      data: {
        rollno,
        name,
        faculty,
        scanDate,
        scanTime
      }
    });
  } catch (error) {
    console.error('Error saving scan data to Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving scan data to Excel',
      error: error.message
    });
  }
};

/**
 * Export attendance records to Excel file based on filters
 * GET endpoint for downloading existing attendance data
 */
export const exportAttendanceToExcel = async (req, res) => {
  try {
    const { startDate, endDate, eventId, faculty, format = 'summary' } = req.query;

    // Build filter
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

    // Fetch records from database
    const records = await Attendance.find(filter)
      .sort({ scanDate: 1, scanTime: 1 })
      .lean();

    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No attendance records found for the specified criteria'
      });
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Records');

    // Set columns
    worksheet.columns = [
      { header: 'S.N.', key: 'sn', width: 8 },
      { header: 'Roll Number', key: 'rollno', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Faculty', key: 'faculty', width: 12 },
      { header: 'Year', key: 'year', width: 8 },
      { header: 'Semester', key: 'semester', width: 10 },
      { header: 'Scan Date', key: 'scanDate', width: 15 },
      { header: 'Scan Time', key: 'scanTime', width: 18 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Event ID', key: 'eventId', width: 15 }
    ];

    // Style header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'center' };

    // Add data rows
    records.forEach((record, index) => {
      const row = worksheet.addRow({
        sn: index + 1,
        rollno: record.rollno,
        name: record.name,
        faculty: record.faculty,
        year: record.year || '',
        semester: record.semester || '',
        scanDate: record.scanDate,
        scanTime: new Date(record.scanTime).toLocaleTimeString(),
        status: record.status,
        eventId: record.eventId
      });

      // Alternate row colors
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' }
        };
      }
      row.alignment = { horizontal: 'left', vertical: 'center' };
    });

    // Add summary sheet if requested
    if (format === 'detailed') {
      const summarySheet = workbook.addWorksheet('Summary');
      
      const totalRecords = records.length;
      const uniqueStudents = new Set(records.map(r => r.userId)).size;
      const byFaculty = {};
      const byStatus = {};

      records.forEach(record => {
        byFaculty[record.faculty] = (byFaculty[record.faculty] || 0) + 1;
        byStatus[record.status] = (byStatus[record.status] || 0) + 1;
      });

      summarySheet.addRow(['Total Scans', totalRecords]);
      summarySheet.addRow(['Unique Students', uniqueStudents]);
      summarySheet.addRow(['']);
      summarySheet.addRow(['Faculty', 'Count']);
      Object.entries(byFaculty).forEach(([fac, count]) => {
        summarySheet.addRow([fac, count]);
      });
      summarySheet.addRow(['']);
      summarySheet.addRow(['Status', 'Count']);
      Object.entries(byStatus).forEach(([status, count]) => {
        summarySheet.addRow([status, count]);
      });

      summarySheet.columns = [
        { width: 20 },
        { width: 15 }
      ];
    }

    // Generate filename
    const exportDate = new Date().toISOString().split('T')[0];
    const filename = `Attendance_Export_${exportDate}.xlsx`;

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting attendance to Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting attendance to Excel',
      error: error.message
    });
  }
};

/**
 * Get list of all Excel files created
 */
export const getExcelFiles = async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');

    if (!fs.existsSync(uploadsDir)) {
      return res.status(200).json({
        success: true,
        files: [],
        message: 'No files found'
      });
    }

    const files = fs.readdirSync(uploadsDir)
      .filter(file => file.endsWith('.xlsx'))
      .map(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          downloadUrl: `/uploads/${file}`
        };
      })
      .sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));

    return res.status(200).json({
      success: true,
      files,
      count: files.length
    });
  } catch (error) {
    console.error('Error fetching Excel files:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching Excel files',
      error: error.message
    });
  }
};

/**
 * Download a specific Excel file
 */
export const downloadExcelFile = async (req, res) => {
  try {
    const { filename } = req.params;

    // Security check - prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const filepath = path.join(__dirname, '../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if it's actually an xlsx file
    if (!filename.endsWith('.xlsx')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({
          success: false,
          message: 'Error downloading file'
        });
      }
    });
  } catch (error) {
    console.error('Error in downloadExcelFile:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file',
      error: error.message
    });
  }
};
