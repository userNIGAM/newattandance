import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    // unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  
  // Academic Information
  faculty: {
    type: String,
    required: [true, 'Faculty is required'],
    enum: {
      values: ['BBA', 'BCA', 'BSC', 'CSIT', 'BBS', 'BA', 'BSW', 'BITM'],
      message: '{VALUE} is not a valid faculty'
    }
  },
  
  rollno: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z0-9]+$/, 'Invalid roll number format']
  },
  
  // Conditional academic fields
  semester: {
    type: Number,
    min: [1, 'Semester must be at least 1'],
    max: [8, 'Semester cannot exceed 8'],
    validate: {
      validator: function(value) {
        // Semester only required for semester-based faculties
        const semesterFaculties = ['BBA', 'BCA', 'BSC', 'CSIT', 'BITM'];
        if (semesterFaculties.includes(this.faculty)) {
          return value !== undefined && value !== null;
        }
        return true; // Not required for other faculties
      },
      message: 'Semester is required for this faculty'
    }
  },
  
  year: {
    type: Number,
    min: [1, 'Year must be at least 1'],
    max: [4, 'Year cannot exceed 4'],
    validate: {
      validator: function(value) {
        // Year only required for yearly-based faculties
        const yearlyFaculties = ['BBS', 'BA', 'BSW'];
        if (yearlyFaculties.includes(this.faculty)) {
          return value !== undefined && value !== null;
        }
        return true; // Not required for other faculties
      },
      message: 'Year is required for this faculty'
    }
  },
  
  // Contact Information
  contact: {
    type: String,
    required: [true, 'Contact number is required'],
    match: [/^\d{7,15}$/, 'Phone number must be 7-15 digits'],
    index: true
  },
  
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    minlength: [10, 'Address must be at least 10 characters'],
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  
  // QR Code Information
  qrCode: {
    type: String,
    required: true
  },
  
  qrData: {
    type: Schema.Types.Mixed,
    required: true,
    default: {}
  },
  
  // Event/Registration Information
  eventName: {
    type: String,
    default: 'Default Event'
  },
  
  registrationDate: {
    type: Date,
    default: Date.now
  },
  
  // Attendance Tracking
  attendanceLogs: [{
    scannedAt: {
      type: Date,
      default: Date.now
    },
    scannerId: String,
    location: String,
    verified: {
      type: Boolean,
      default: false
    }
  }],
  
  lastAttendanceAt: Date,
  
  // Status & Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verificationToken: String,
  verificationExpires: Date,
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  // Analytics
  qrScans: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Metadata
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically manages createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full student info
userSchema.virtual('studentInfo').get(function() {
  const semesterFaculties = ['BBA', 'BCA', 'BSC', 'CSIT', 'BITM'];
  const yearlyFaculties = ['BBS', 'BA', 'BSW'];
  
  if (semesterFaculties.includes(this.faculty)) {
    return `${this.faculty} - Semester ${this.semester}`;
  } else if (yearlyFaculties.includes(this.faculty)) {
    return `${this.faculty} - Year ${this.year}`;
  }
  return this.faculty;
});

// Virtual for formatted registration date
userSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ rollno: 1 }, { unique: true });
userSchema.index({ faculty: 1, semester: 1 });
userSchema.index({ faculty: 1, year: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ status: 1 });
userSchema.index({ qrCode: 1 }, { unique: true });

// Pre-save middleware to handle conditional fields
userSchema.pre('save', function(next) {
  // Ensure semester/year are set appropriately based on faculty
  const semesterFaculties = ['BBA', 'BCA', 'BSC', 'CSIT', 'BITM'];
  const yearlyFaculties = ['BBS', 'BA', 'BSW'];
  
  if (semesterFaculties.includes(this.faculty)) {
    this.year = undefined; // Clear year for semester-based faculties
  } else if (yearlyFaculties.includes(this.faculty)) {
    this.semester = undefined; // Clear semester for yearly-based faculties
  }
  
  // Update QR data
  this.qrData = {
    userId: this._id,
    rollno: this.rollno,
    name: this.name,
    faculty: this.faculty,
    semester: this.semester,
    year: this.year,
    timestamp: Date.now()
  };
  
  this.updatedAt = Date.now();
});

// Method to record attendance
userSchema.methods.recordAttendance = function(scannerData = {}) {
  this.attendanceLogs.push({
    scannedAt: new Date(),
    scannerId: scannerData.scannerId || 'unknown',
    location: scannerData.location || 'unknown',
    verified: scannerData.verified || false
  });
  
  this.lastAttendanceAt = new Date();
  this.qrScans += 1;
  return this.save();
};

// Method to check if user has attended today
userSchema.methods.hasAttendedToday = function() {
  if (!this.lastAttendanceAt) return false;
  
  const today = new Date();
  const lastAttended = new Date(this.lastAttendanceAt);
  
  return (
    today.getDate() === lastAttended.getDate() &&
    today.getMonth() === lastAttended.getMonth() &&
    today.getFullYear() === lastAttended.getFullYear()
  );
};

// Static method to find by QR code
userSchema.statics.findByQRCode = function(qrCode) {
  return this.findOne({ qrCode });
};

// Static method to get attendance stats
userSchema.statics.getAttendanceStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$faculty',
        totalStudents: { $sum: 1 },
        attendedToday: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$lastAttendanceAt', null] },
                  {
                    $eq: [
                      { $dateToString: { format: '%Y-%m-%d', date: '$lastAttendanceAt' } },
                      { $dateToString: { format: '%Y-%m-%d', date: new Date() } }
                    ]
                  }
                ]
              },
              1,
              0
            ]
          }
        },
        averageScans: { $avg: '$qrScans' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Export the model
const User = model('User', userSchema);

export default User;