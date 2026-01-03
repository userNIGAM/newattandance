# Backend Implementation - Quick Start (Copy & Paste Ready)

## 3 Files to Create - Copy/Paste Implementation

---

## File 1: `backend/models/Attendance.js`

```javascript
import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
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
      type: String,
      required: true,
      index: true
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
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate scans on same day
AttendanceSchema.index({ userId: 1, scanDate: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', AttendanceSchema);

export default Attendance;
```

---

## File 2: `backend/controllers/attendanceController.js`

```javascript
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// Check if user already scanned today
export const checkDuplicateScan = async (req, res) => {
  try {
    const { userId, scanDate } = req.query;

    // Validate parameters
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

    // User has not been scanned today
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

// Mark attendance for a scanned user
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

    // Check for duplicate (safety check)
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

    // Create and save attendance record
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

    // Return success response
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

// Get attendance records for a specific date
export const getAttendanceByDate = async (req, res) => {
  try {
    const { scanDate, eventId } = req.query;

    if (!scanDate) {
      return res.status(400).json({
        success: false,
        message: 'scanDate parameter is required (format: YYYY-MM-DD)'
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

---

## File 3: `backend/routes/attendanceRoutes.js`

```javascript
import { Router } from 'express';
import {
  checkDuplicateScan,
  markAttendance,
  getAttendanceByDate
} from '../controllers/attendanceController.js';

const router = Router();

// Check if user already scanned today
router.get('/check-duplicate', checkDuplicateScan);

// Mark attendance when QR is scanned
router.post('/mark', markAttendance);

// Get attendance records for a date
router.get('/records', getAttendanceByDate);

export default router;
```

---

## File 4: Modify `backend/server.js`

Find where you have other route imports (like `userRoutes`, `emailConfig`), and add this:

```javascript
// Add this import at the top with other imports
import attendanceRoutes from './routes/attendanceRoutes.js';

// Add this with other route registrations (usually after app.use(express.json()))
app.use('/api/attendance', attendanceRoutes);
```

**Example complete setup:**
```javascript
import express from 'express';
import cors from 'cors';
import connectDB from './config/connectDB.js';
import userRoutes from './routes/userRoutes.js';
import emailConfig from './routes/emailConfig.js';
import attendanceRoutes from './routes/attendanceRoutes.js'; // ADD THIS

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/users', userRoutes);
app.use('/api/email', emailConfig);
app.use('/api/attendance', attendanceRoutes); // ADD THIS

app.listen(5000, () => console.log('Server running on port 5000'));
```

---

## Testing Commands (After Implementation)

### Test 1: Check Duplicate (Not Scanned)
```bash
curl -X GET "http://localhost:5000/api/attendance/check-duplicate?userId=507f1f77bcf86cd799439011&scanDate=2025-01-03"
```

**Expected Response:**
```json
{
  "success": true,
  "alreadyScanned": false,
  "message": "User has not been scanned today"
}
```

---

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

**Expected Response:**
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

---

### Test 3: Check Duplicate (Already Scanned)
```bash
curl -X GET "http://localhost:5000/api/attendance/check-duplicate?userId=507f1f77bcf86cd799439011&scanDate=2025-01-03"
```

**Expected Response:**
```json
{
  "success": true,
  "alreadyScanned": true,
  "firstScanTime": "2025-01-03T14:30:00.000Z",
  "userDetails": {
    "name": "John Doe",
    "email": "john@example.com",
    "rollno": "BCA001",
    "faculty": "BCA"
  },
  "message": "User already marked present today"
}
```

---

### Test 4: Get Attendance Records
```bash
curl -X GET "http://localhost:5000/api/attendance/records?scanDate=2025-01-03&eventId=EVENT_2025"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "records": [
    {
      "_id": "507f1f77bcf86cd799439099",
      "userId": {...},
      "rollno": "BCA001",
      "name": "John Doe",
      "faculty": "BCA",
      "scanDate": "2025-01-03",
      "scanTime": "2025-01-03T14:30:00.000Z",
      "status": "present",
      "eventId": "EVENT_2025",
      "createdAt": "2025-01-03T14:30:00.000Z",
      "updatedAt": "2025-01-03T14:30:00.000Z"
    }
  ]
}
```

---

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh # or mongo

# If not running, start it:
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: net start MongoDB
```

### Port Already in Use
```bash
# Change port in server.js or kill process on 5000
lsof -i :5000
kill -9 <PID>
```

### Module Not Found Errors
```bash
# Make sure to use correct import paths
# If using .js extension in imports, use: 
import Attendance from '../models/Attendance.js';

# If NOT using .js extension, remove it
import Attendance from '../models/Attendance';
```

### Unique Index Violation
```bash
# This means duplicate (userId, scanDate) exists
# Check database:
db.attendances.find({ userId: "xyz", scanDate: "2025-01-03" })

# If needed, remove old data:
db.attendances.deleteMany({ scanDate: "2025-01-02" })
```

---

## Implementation Checklist

- [ ] Create `backend/models/Attendance.js`
- [ ] Create `backend/controllers/attendanceController.js`
- [ ] Create `backend/routes/attendanceRoutes.js`
- [ ] Add import to `backend/server.js`
- [ ] Add route registration to `backend/server.js`
- [ ] Test with curl: checkDuplicateScan
- [ ] Test with curl: markAttendance
- [ ] Check database for created Attendance collection
- [ ] Test frontend with real backend
- [ ] Run complete workflow: Register → Event → Scan

---

## Quick Deploy

```bash
# Start backend
cd backend
npm start

# In another terminal, start frontend
cd frontend
npm run dev

# Open http://localhost:5173
# Test the complete workflow!
```

---

## Total Implementation Time: ~30-45 minutes

1. Create 3 files: 10 minutes
2. Modify server.js: 5 minutes
3. Test with curl: 10 minutes
4. Test with frontend: 10 minutes
5. Debug/fixes: 5-15 minutes

**You're ready to go! 🚀**
