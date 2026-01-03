# QR Attendance System - Complete Setup Guide

## Overview

Your QR Attendance System is a complete registration → QR distribution → event scanning workflow with duplicate prevention.

**System Flow:**
```
1. User Registration (RegisterForm.jsx)
   ↓
2. QR Code Generation (via backend in email)
   ↓
3. Event Creation (EventQR.jsx)
   ↓
4. QR Code Scanning (Scanner.jsx)
   ↓
5. Duplicate Prevention (checkDuplicateScan API)
   ↓
6. Attendance Recording (markAttendance API)
```

---

## Frontend Status ✅

### Components Completed

#### 1. **AttandanceApp.jsx** - Main Container
- **Purpose**: Central hub managing all tabs and state
- **Features**:
  - Event name input & QR generation
  - User registration form
  - Scanner interface
  - Attendees display
  - Data persistence with localStorage

#### 2. **EventQR.jsx** - Event QR Generator
- **Purpose**: Create event-specific QR codes
- **Usage**:
  1. Enter event name (e.g., "Tech Fest 2025")
  2. Click "Generate Event QR"
  3. Get event ID for backend integration
  4. Download QR image

#### 3. **RegisterForm.jsx** - User Registration
- **Purpose**: Self-registration for participants
- **Form Fields**:
  - Name (required)
  - Email (required)
  - Faculty type (BCA/BE, determines semester/year)
  - Roll Number (required)
  - Contact (optional)
  - Address (optional)
- **After Registration**: User receives QR code (currently generated locally, sent via email by backend)
- **Data Saved**: To backend database

#### 4. **Scanner.jsx** - QR Code Scanner
- **Purpose**: Scan participant QR codes at event
- **Features**:
  - Real-time camera scanning
  - Statistics dashboard (total scans, marked present, duplicates blocked)
  - Duplicate scan prevention
  - Attendance recording to database
  - Visual feedback (success/warning/error)
  - Scan history with timestamps
  - Demo mode for testing
- **QR Data Validation**: Checks for userId, rollno, name, faculty fields
- **One-Scan Rule**: Same person cannot be scanned twice in one day

#### 5. **AttendeesList.jsx** - Attendees Display
- **Purpose**: Show registered and present participants
- **Columns**: Name, Status, Scan Time

### Build Status
```
✓ Frontend builds successfully
✓ No errors (430KB JavaScript, 31KB CSS)
✓ All dependencies installed
✓ Linting passes
```

---

## Backend Implementation Required

### Endpoints to Create

#### 1. **GET /api/attendance/check-duplicate**
**Purpose**: Check if user was already scanned today

**Query Parameters**:
```
userId: string (MongoDB ObjectId)
scanDate: string (YYYY-MM-DD format)
```

**Response if NOT scanned**:
```json
{
  "success": true,
  "alreadyScanned": false,
  "message": "User has not been scanned today"
}
```

**Response if ALREADY scanned**:
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

#### 2. **POST /api/attendance/mark**
**Purpose**: Record attendance in database

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

**Response**:
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
    "scanDate": "2025-01-03",
    "scanTime": "2025-01-03T14:30:00.000Z",
    "status": "present",
    "eventId": "EVENT_2025"
  },
  "userEmail": "john@example.com"
}
```

### Database Schema

#### Attendance Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,        // Reference to User
  rollno: String,          // Roll number
  name: String,            // User name
  faculty: String,         // Faculty (BCA/BE)
  semester: Number,        // Semester (if applicable)
  year: Number,            // Year (if applicable)
  scanDate: String,        // YYYY-MM-DD
  scanTime: Date,          // ISO datetime
  status: String,          // "present", "absent", etc.
  eventId: String,         // Event identifier
  createdAt: Date,         // Database timestamp
  updatedAt: Date          // Last update timestamp
}
```

**Indexes**:
```javascript
// Unique index - prevents duplicate entries
{ userId: 1, scanDate: 1 } - unique

// Query optimization
{ scanDate: 1 }
{ eventId: 1 }
```

---

## Implementation Steps

### Step 1: Create Attendance Model

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
      type: String,  // YYYY-MM-DD
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

// Create indexes
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

    if (!userId || !scanDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: userId, scanDate'
      });
    }

    // Check user exists
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

    // Check for duplicate
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

    // Create attendance record
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

// Get attendance records for date
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
    if (eventId) query.eventId = eventId;

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

### Step 3: Create Routes

**File**: `backend/routes/attendanceRoutes.js`

```javascript
import { Router } from 'express';
import {
  checkDuplicateScan,
  markAttendance,
  getAttendanceByDate
} from '../controllers/attendanceController.js';

const router = Router();

// Check duplicate
router.get('/check-duplicate', checkDuplicateScan);

// Mark attendance
router.post('/mark', markAttendance);

// Get records
router.get('/records', getAttendanceByDate);

export default router;
```

### Step 4: Register Routes in Server

**File**: `backend/server.js`

Add these lines:
```javascript
import attendanceRoutes from './routes/attendanceRoutes.js';

// Register routes
app.use('/api/attendance', attendanceRoutes);
```

---

## Testing

### 1. Test Duplicate Check Endpoint

```bash
curl -X GET "http://localhost:5000/api/attendance/check-duplicate?userId=507f1f77bcf86cd799439011&scanDate=2025-01-03"
```

### 2. Test Mark Attendance Endpoint

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

### 3. Test Scanner UI Demo Mode

1. Open frontend app
2. Click "Start Scanner"
3. Click "Test Scan" button
4. Should show success message
5. Click "Test Scan" again
6. Should show warning (duplicate prevention)

---

## Frontend Testing Checklist

- [ ] Build completes without errors
- [ ] EventQR tab: Can enter event name and generate QR
- [ ] RegisterForm tab: Can fill form and register user
- [ ] Scanner tab: Can open camera and scan
- [ ] Scanner Demo Mode: Test button works
- [ ] Duplicate Prevention: Scanning same QR twice shows warning
- [ ] Statistics: Counters update correctly
- [ ] Scan History: Recent scans display with timestamps
- [ ] LocalStorage: Data persists after refresh

---

## Workflow Example

### Day of Event

1. **Event Setup** (Staff)
   - Open app
   - Go to "Create Event QR" tab
   - Enter "Tech Fest 2025"
   - Click "Generate Event QR"
   - Note the event ID

2. **Scanner Ready** (Scanning Station)
   - Go to "Scanner" tab
   - Click "Start Scanner"
   - Camera opens
   - Ready to scan

3. **Participant Arrives**
   - Shows QR code from email
   - Staff scans the QR
   - System checks if already scanned today
   - If NOT scanned: ✅ Shows success, records attendance
   - If ALREADY scanned: ⚠️ Shows warning, doesn't record duplicate

4. **End of Event**
   - View "Attendees" tab
   - See all marked present
   - Export data

---

## Important Notes

1. **Date Format**: Always use YYYY-MM-DD for scanDate
2. **QR Structure**: QR must contain { userId, rollno, name, faculty, semester, year }
3. **Timezone**: Use ISO format (with Z) for timestamps
4. **One-Scan Rule**: Cannot scan same userId twice on same scanDate
5. **Demo Mode**: Works without camera or backend for testing

---

## Next Steps

1. ✅ Frontend is production-ready
2. ⏳ Implement backend endpoints (checkDuplicateScan, markAttendance)
3. ⏳ Create Attendance model and database indexes
4. ⏳ Test full workflow end-to-end
5. ⏳ Deploy to production

See [BACKEND_API_REQUIREMENTS.md](./BACKEND_API_REQUIREMENTS.md) for complete backend implementation guide.
