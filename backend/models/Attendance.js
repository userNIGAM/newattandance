import { Schema, model } from 'mongoose';

const attendanceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  rollno: {
    type: String,
    required: [true, 'Roll number is required'],
    uppercase: true,
    trim: true
  },
  
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  
  faculty: {
    type: String,
    required: [true, 'Faculty is required'],
    enum: ['BBA', 'BCA', 'BSC', 'CSIT', 'BBS', 'BA', 'BSW', 'BITM']
  },
  
  semester: {
    type: Number,
    min: 1,
    max: 8,
    default: null
  },
  
  year: {
    type: Number,
    min: 1,
    max: 4,
    default: null
  },
  
  scanDate: {
    type: String, // Format: YYYY-MM-DD
    required: [true, 'Scan date is required'],
    index: true
  },
  
  scanTime: {
    type: Date,
    required: [true, 'Scan time is required'],
    default: Date.now,
    index: true
  },
  
  eventId: {
    type: String,
    default: 'default-event',
    index: true
  },
  
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present'
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for checking duplicate scans
attendanceSchema.index({ userId: 1, scanDate: 1 });
attendanceSchema.index({ rollno: 1, scanDate: 1 });
attendanceSchema.index({ eventId: 1, scanDate: 1 });

export default model('Attendance', attendanceSchema);
