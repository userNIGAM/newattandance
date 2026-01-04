// ============================================================
// EXCEL EXPORT SERVICE - Quick Reference for Frontend
// ============================================================

/**
 * Service module for handling Excel export operations
 * Can be used in React components
 */
import React from 'react';
const API_BASE_URL = 'http://localhost:5000/api/attendance';

// ============================================================
// 1. SAVE SCANNED DATA TO EXCEL
// ============================================================
export const saveScanToExcel = async (scanData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/save-scan-excel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: scanData.userId,
        rollno: scanData.rollno,
        name: scanData.name,
        faculty: scanData.faculty,
        semester: scanData.semester || null,
        year: scanData.year || null,
        scanDate: scanData.scanDate || new Date().toISOString().split('T')[0],
        scanTime: scanData.scanTime || new Date().toISOString(),
        eventId: scanData.eventId || 'default-event'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save scan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving scan to Excel:', error);
    throw error;
  }
};

// ============================================================
// 2. EXPORT ATTENDANCE RECORDS (Database to Excel)
// ============================================================
export const exportAttendanceToExcel = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }
    if (filters.eventId) {
      params.append('eventId', filters.eventId);
    }
    if (filters.faculty) {
      params.append('faculty', filters.faculty);
    }

    // Include detailed summary sheet
    const format = filters.includesSummary ? 'detailed' : 'summary';
    params.append('format', format);

    const url = `${API_BASE_URL}/export-excel?${params.toString()}`;

    // Trigger download directly
    const link = document.createElement('a');
    link.href = url;
    const filename = `Attendance_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, filename };
  } catch (error) {
    console.error('Error exporting attendance:', error);
    throw error;
  }
};

// ============================================================
// 3. GET LIST OF ALL EXCEL FILES
// ============================================================
export const getExcelFilesList = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/excel-files`);

    if (!response.ok) {
      throw new Error('Failed to fetch Excel files');
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error fetching Excel files:', error);
    throw error;
  }
};

// ============================================================
// 4. DOWNLOAD SPECIFIC EXCEL FILE
// ============================================================
export const downloadExcelFile = async (filename) => {
  try {
    // Validate filename
    if (!filename || !filename.endsWith('.xlsx')) {
      throw new Error('Invalid filename');
    }

    const url = `${API_BASE_URL}/download/${encodeURIComponent(filename)}`;

    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, filename };
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

// ============================================================
// USAGE EXAMPLES IN REACT COMPONENTS
// ============================================================

/**
 * Example 1: Save scan immediately after QR scan
 * 
 * Place this in your Scanner component after successful QR scan
 */
export const handleScanAndExport = async (scannedData) => {
  try {
    // Your existing logic to process scanned data
    const scanRecord = {
      userId: scannedData.userId,
      rollno: scannedData.rollNumber,
      name: scannedData.name,
      faculty: scannedData.faculty,
      semester: scannedData.semester,
      year: scannedData.year,
      scanDate: new Date().toISOString().split('T')[0],
      scanTime: new Date().toISOString(),
      eventId: 'current-event-123' // Replace with actual event ID
    };

    // Save to Excel
    const result = await saveScanToExcel(scanRecord);

    if (result.success) {
      console.log('✓ Scan saved to Excel:', result.filename);
      // Show success message to user
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
    // Show error message to user
  }
};

/**
 * Example 2: React component for exporting attendance
 */
export const ExportAttendanceButton = () => {
  const [loading, setLoading] = React.useState(false);
  const [filters, setFilters] = React.useState({
    startDate: '',
    endDate: '',
    faculty: '',
    includesSummary: true
  });

  const handleExport = async () => {
    try {
      setLoading(true);
      await exportAttendanceToExcel(filters);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="date"
        value={filters.startDate}
        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        placeholder="Start Date"
      />
      <input
        type="date"
        value={filters.endDate}
        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        placeholder="End Date"
      />
      <select
        value={filters.faculty}
        onChange={(e) => setFilters({ ...filters, faculty: e.target.value })}
      >
        <option value="">All Faculties</option>
        <option value="BCA">BCA</option>
        <option value="BBA">BBA</option>
        <option value="BSC">BSC</option>
      </select>
      <button onClick={handleExport} disabled={loading}>
        {loading ? 'Exporting...' : 'Export to Excel'}
      </button>
    </div>
  );
};

/**
 * Example 3: React component to view and download Excel files
 */
export const ExcelFilesManager = () => {
  const [files, setFiles] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const filesList = await getExcelFilesList();
      setFiles(filesList);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      await downloadExcelFile(filename);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  React.useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div>
      <h3>Available Excel Files</h3>
      <button onClick={loadFiles} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh'}
      </button>
      <table>
        <thead>
          <tr>
            <th>Filename</th>
            <th>Size</th>
            <th>Modified</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.filename}>
              <td>{file.filename}</td>
              <td>{(file.size / 1024).toFixed(2)} KB</td>
              <td>{new Date(file.modifiedAt).toLocaleString()}</td>
              <td>
                <button onClick={() => handleDownload(file.filename)}>
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Example 4: Hook for managing Excel exports
 */
export const useExcelExport = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [files, setFiles] = React.useState([]);

  const saveScan = async (scanData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await saveScanToExcel(scanData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const exportRecords = async (filters) => {
    try {
      setLoading(true);
      setError(null);
      await exportAttendanceToExcel(filters);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const listFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const filesList = await getExcelFilesList();
      setFiles(filesList);
      return filesList;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (filename) => {
    try {
      setLoading(true);
      setError(null);
      await downloadExcelFile(filename);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    saveScan,
    exportRecords,
    listFiles,
    downloadFile,
    loading,
    error,
    files
  };
};

// ============================================================
// INTEGRATION WITH EXISTING SCANNER COMPONENT
// ============================================================

/**
 * Example: Modify your Scanner.jsx to save scans to Excel
 * 
 * In your handleScan function:
 * 
 * const handleScan = async (scannedQRData) => {
 *   try {
 *     // 1. Mark attendance in database
 *     const markResponse = await api.post('/attendance/mark', {
 *       userId: scannedQRData.userId,
 *       rollno: scannedQRData.rollno,
 *       name: scannedQRData.name,
 *       faculty: scannedQRData.faculty,
 *       semester: scannedQRData.semester,
 *       year: scannedQRData.year,
 *       scanDate: new Date().toISOString().split('T')[0],
 *       scanTime: new Date().toISOString()
 *     });
 * 
 *     // 2. Save to Excel simultaneously
 *     await saveScanToExcel(markResponse.data);
 * 
 *     // 3. Show success
 *     showNotification('✓ Attendance marked and saved!');
 *   } catch (error) {
 *     if (error.response?.data?.alreadyScanned) {
 *       showWarning('⚠ Already scanned today');
 *     } else {
 *       showError('✗ Scan failed');
 *     }
 *   }
 * };
 */
