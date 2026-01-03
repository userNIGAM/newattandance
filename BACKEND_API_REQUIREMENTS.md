# Backend API Endpoints - Required Implementation

## Overview
To make the Scanner work properly, your backend needs to implement these attendance tracking endpoints.

---

## 1. Check Duplicate Scan Endpoint

### Endpoint: GET /api/attendance/check-duplicate

**Purpose**: Prevent the same person from being marked present twice in a single day

**Request Parameters**:
```javascript
GET /api/attendance/check-duplicate?userId=USER_ID&scanDate=2025-01-03
```

**Query Parameters**:
- `userId`: User's MongoDB ObjectId (string)
- `scanDate`: Date in format YYYY-MM-DD

**Response (Success - Not Scanned Yet)**:
```json
{
  "success": true,
  "alreadyScanned": false,
  "message": "User has not been scanned today"
}
```

**Response (Already Scanned)**:
```json
{
  "success": true,
  "alreadyScanned": true,
  "firstScanTime": "2025-01-03T14:30:00Z",
  "userDetails": {
    "name": "John Doe",
    "email": "john@example.com",
    "rollno": "BCA001",
    "faculty": "BCA"
  },
  "message": "User already marked present today"
}
```

**Response (Error)**:
```json
{
  "success": false,
  "message": "User not found in system"
}
```

**Implementation Logic**:
```javascript
// Pseudo-code
1. Extract userId and scanDate from query params
2. Query User collection by userId
3. If user not found → return error
4. Query AttendanceRecord collection for:
   - userId = userId
   - scanDate = scanDate (in YYYY-MM-DD format)
5. If record exists → return { alreadyScanned: true, firstScanTime: record.scanTime }
6. If no record → return { alreadyScanned: false }
```

---

## 2. Mark Attendance Endpoint

### Endpoint: POST /api/attendance/mark

**Purpose**: Record attendance when QR code is scanned

**Request Body**:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "rollno": "BCA001",
  "name": "John Doe",
  "faculty": "BCA",
  "semester": 3,
  "year": null,
  "scanDate": "2025-01-03",
  "scanTime": "2025-01-03T14:30:00.000Z",
  "eventId": "EVENT_2025"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "attendanceRecord": {
    "id": "507f1f77bcf86cd799439099",
    "userId": "507f1f77bcf86cd799439011",
    "rollno": "BCA001",
    "name": "John Doe",
    "faculty": "BCA",
    "semester": 3,
    "scanDate": "2025-01-03",
    "scanTime": "2025-01-03T14:30:00.000Z",
    "status": "present",
    "eventId": "EVENT_2025"
  },
  "userEmail": "john@example.com"
}
```

**Response (Error - User Not Found)**:
```json
{
  "success": false,
  "message": "User not found in system"
}
```

**Response (Error - Already Scanned)**:
```json
{
  "success": false,
  "message": "User already marked present today"
}
```

**Implementation Logic**:
```javascript
// Pseudo-code
1. Extract data from request body
2. Validate all required fields
3. Query User by userId
4. If user not found → return error
5. Check if already scanned today (scanDate check)
   - If yes → return error
6. Create new AttendanceRecord document:
   {
     userId: userId,
     rollno: rollno,
     name: name,
     faculty: faculty,
     semester: semester,
     year: year,
     scanDate: scanDate,
     scanTime: scanTime,
     status: "present",
     eventId: eventId
   }
7. Save to database
8. Return success with record
```

---

## Database Schema Needed

### AttendanceRecord Collection/Table

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  rollno: String,            // User's roll number
  name: String,              // User's name
  faculty: String,           // Faculty name
  semester: Number,          // Semester (if applicable)
  year: Number,              // Year (if applicable)
  scanDate: String,          // Date in YYYY-MM-DD format
  scanTime: Date,            // ISO datetime of scan
  status: String,            // "present", "absent", etc.
  eventId: String,           // Event identifier
  createdAt: Date,           // Database creation timestamp
  updatedAt: Date,           // Last update timestamp
  
  // Indexes needed:
  // Index 1: { userId, scanDate } - for duplicate check and queries
  // Index 2: { scanDate } - for daily reports
  // Index 3: { eventId } - for event-based queries
}
```

---

## Implementation Steps for Backend

### Step 1: Create AttendanceRecord Model

**File**: `backend/models/Attendance.js`

```javascript
import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rollno: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    faculty: {
      type: String,
      required: true
    },
    semester: {
      type: Number,
      default: null
    },
    year: {
      type: Number,
      default: null
    },
    scanDate: {
      type: String,  // YYYY-MM-DD format
      required: true
    },
    scanTime: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      default: 'present'
    },
    eventId: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for efficient queries
AttendanceSchema.index({ userId: 1, scanDate: 1 }, { unique: true });
AttendanceSchema.index({ scanDate: 1 });
AttendanceSchema.index({ eventId: 1 });

export default mongoose.model('Attendance', AttendanceSchema);
```

### Step 2: Create Attendance Controller

**File**: `backend/controllers/attendanceController.js`

```javascript
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// Check for duplicate scan
export const checkDuplicateScan = async (req, res) => {
  try {
    const { userId, scanDate } = req.query;

    // Validate input
    if (!userId || !scanDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: userId, scanDate'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in system'
      });
    }

    // Check for existing scan today
    const existingScan = await Attendance.findOne({
      userId: userId,
      scanDate: scanDate
    });

    if (existingScan) {
      return res.status(200).json({
        success: true,
        alreadyScanned: true,
        firstScanTime: existingScan.scanTime,
        userDetails: {
          name: user.name,
          email: user.email,
          rollno: user.rollno,
          faculty: user.faculty
        },
        message: 'User already marked present today'
      });
    }

    // Not scanned yet
    return res.status(200).json({
      success: true,
      alreadyScanned: false,
      message: 'User has not been scanned today'
    });

  } catch (error) {
    console.error('Duplicate check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking duplicate scan',
      error: error.message
    });
  }
};

// Mark attendance
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

    // Validate required fields
    const requiredFields = ['userId', 'rollno', 'name', 'faculty', 'scanDate', 'scanTime', 'eventId'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in system'
      });
    }

    // Check for duplicate scan (safety check)
    const existingAttendance = await Attendance.findOne({
      userId: userId,
      scanDate: scanDate
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'User already marked present today'
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
      scanTime,
      status: 'present',
      eventId
    });

    await attendance.save();

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      attendanceRecord: {
        id: attendance._id,
        userId: attendance.userId,
        rollno: attendance.rollno,
        name: attendance.name,
        faculty: attendance.faculty,
        semester: attendance.semester,
        scanDate: attendance.scanDate,
        scanTime: attendance.scanTime,
        status: attendance.status,
        eventId: attendance.eventId
      },
      userEmail: user.email
    });

  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message
    });
  }
};

// Get attendance records for a date
export const getAttendanceByDate = async (req, res) => {
  try {
    const { scanDate, eventId } = req.query;

    if (!scanDate) {
      return res.status(400).json({
        success: false,
        message: 'scanDate parameter is required'
      });
    }

    const query = { scanDate };
    if (eventId) {
      query.eventId = eventId;
    }

    const records = await Attendance.find(query)
      .populate('userId', 'name email rollno faculty')
      .sort({ scanTime: 1 });

    res.json({
      success: true,
      count: records.length,
      records
    });

  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance records',
      error: error.message
    });
  }
};
```

### Step 3: Create Attendance Routes

**File**: `backend/routes/attendanceRoutes.js`

```javascript
import { Router } from 'express';
import {
  checkDuplicateScan,
  markAttendance,
  getAttendanceByDate
} from '../controllers/attendanceController.js';

const router = Router();

// Check if already scanned today
router.get('/check-duplicate', checkDuplicateScan);

// Mark attendance
router.post('/mark', markAttendance);

// Get attendance records
router.get('/records', getAttendanceByDate);

export default router;
```

### Step 4: Register Routes in Server

**File**: `backend/server.js`

```javascript
import attendanceRoutes from './routes/attendanceRoutes.js';

// Add this to your Express setup:
app.use('/api/attendance', attendanceRoutes);
```

---

## Testing the Endpoints

### Test 1: Check Duplicate (Not Scanned)
```bash
curl -X GET "http://localhost:5000/api/attendance/check-duplicate?userId=507f1f77bcf86cd799439011&scanDate=2025-01-03"
```

### Test 2: Mark Attendance
```bash
curl -X POST "http://localhost:5000/api/attendance/mark" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "rollno": "BCA001",
    "name": "John Doe",
    "faculty": "BCA",
    "semester": 3,
    "year": null,
    "scanDate": "2025-01-03",
    "scanTime": "2025-01-03T14:30:00.000Z",
    "eventId": "EVENT_2025"
  }'
```

### Test 3: Check Duplicate (Already Scanned)
```bash
curl -X GET "http://localhost:5000/api/attendance/check-duplicate?userId=507f1f77bcf86cd799439011&scanDate=2025-01-03"
```

---

## Frontend-Backend Integration Flow

```
Scanner.jsx
    ↓
[User scans QR code]
    ↓
parseQRData() - Extract userId, rollno, name, etc.
    ↓
checkDuplicateScan(userId, scanDate)
    ↓
GET /api/attendance/check-duplicate
    ↓
    ├─ Already scanned? → Show warning
    │                  → Don't call mark
    │
    └─ Not scanned → Continue
                   ↓
            markAttendance(data)
                   ↓
            POST /api/attendance/mark
                   ↓
                Show success
                Record attendance
```

---

## Important Notes

1. **Date Format**: Always use YYYY-MM-DD for scanDate comparisons
2. **Timezone**: Use ISO format for scanTime (includes timezone info)
3. **Unique Constraint**: Create unique index on (userId, scanDate) to prevent duplicates at database level
4. **Validation**: Always validate on server-side, never trust client data
5. **Error Handling**: Return appropriate HTTP status codes (400, 404, 500)
6. **Performance**: Add indexes for frequent queries (userId, scanDate, eventId)

---

## Summary

Your backend needs:
- ✅ AttendanceRecord model
- ✅ checkDuplicateScan endpoint
- ✅ markAttendance endpoint
- ✅ Database indexes
- ✅ Error handling
- ✅ Input validation

Once these are implemented, your Scanner.jsx will work perfectly with duplicate prevention!
