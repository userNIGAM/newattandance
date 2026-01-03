// controllers/userController.js
import User from '../models/User.js';
import { toDataURL } from 'qrcode';
import { randomBytes } from 'crypto';
import { sendRegistrationEmail } from '../utils/emailService.js';

// Define faculty types
const semesterFaculties = ['BBA', 'BCA', 'BSC', 'CSIT', 'BITM'];
const yearlyFaculties = ['BBS', 'BA', 'BSW'];

// Validation helper functions
const validateStudentData = (data) => {
  const errors = {};

  // Required fields
  const requiredFields = ['name', 'email', 'faculty', 'rollno', 'contact', 'address'];
  requiredFields.forEach(field => {
    if (!data[field] || data[field].trim() === '') {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
  });

  // Email validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Contact validation (Nepali format: 98XXXXXXXX)
  if (data.contact && !/^(97|98)\d{8}$/.test(data.contact.replace(/\D/g, ''))) {
    errors.contact = 'Phone number must start with 98 and be 10 digits total';
  }

  // Roll number format (uppercase, alphanumeric)
  if (data.rollno && !/^[A-Z0-9]+$/.test(data.rollno)) {
    errors.rollno = 'Roll number must contain only uppercase letters and numbers';
  }

  // Faculty validation
  const validFaculties = ['BBA', 'BCA', 'BSC', 'CSIT', 'BBS', 'BA', 'BSW', 'BITM'];
  if (data.faculty && !validFaculties.includes(data.faculty)) {
    errors.faculty = 'Please select a valid faculty';
  }

  // Conditional validation for semester/year based on faculty type
  if (data.faculty) {
    if (semesterFaculties.includes(data.faculty)) {
      // Semester-based faculties: require semester, reject year
      if (!data.semester || data.semester.toString().trim() === '') {
        errors.semester = 'Semester is required for this faculty';
      } else if (parseInt(data.semester) < 1 || parseInt(data.semester) > 8) {
        errors.semester = 'Please select a valid semester (1-8)';
      }

      // Reject year field if provided for semester-based faculty
      if (data.year !== undefined && data.year !== null && data.year.toString().trim() !== '') {
        errors.year = 'Year field is not applicable for semester-based faculties';
      }
    } else if (yearlyFaculties.includes(data.faculty)) {
      // Yearly-based faculties: require year, reject semester
      if (!data.year || data.year.toString().trim() === '') {
        errors.year = 'Year is required for this faculty';
      } else if (parseInt(data.year) < 1 || parseInt(data.year) > 4) {
        errors.year = 'Please select a valid year (1-4)';
      }

      // Reject semester field if provided for yearly-based faculty
      if (data.semester !== undefined && data.semester !== null && data.semester.toString().trim() !== '') {
        errors.semester = 'Semester field is not applicable for yearly-based faculties';
      }
    } else {
      // For other faculties (if any), both semester and year should be excluded
      if (data.semester !== undefined && data.semester !== null && data.semester.toString().trim() !== '') {
        errors.semester = 'Semester field is not applicable for this faculty';
      }
      if (data.year !== undefined && data.year !== null && data.year.toString().trim() !== '') {
        errors.year = 'Year field is not applicable for this faculty';
      }
    }
  }

  // Address length validation
  if (data.address && data.address.trim().length < 10) {
    errors.address = 'Address must be at least 10 characters long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Generate QR code data
const generateQRData = (user) => {
  return JSON.stringify({
    userId: user._id.toString(),
    rollno: user.rollno,
    name: user.name,
    faculty: user.faculty,
    semester: user.semester || null,
    year: user.year || null,
    eventId: 'event-2024',
    timestamp: Date.now()
  });
};

// Generate verification token
const generateVerificationToken = () => {
  return randomBytes(32).toString('hex');
};

// Main registration function
export async function registerUser(req, res) {
  try {
    const {
      name,
      email,
      faculty,
      semester,
      year,
      rollno,
      contact,
      address
    } = req.body;

    console.log('Registration request:', req.body);

    // Step 1: Basic validation
    const validation = validateStudentData({
      name, email, faculty, semester, year, rollno, contact, address
    });

    if (!validation.isValid) {
      console.log("Validation error:", validation.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Step 2: Check if email already exists (Global email uniqueness)
    const existingEmail = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingEmail) {
      console.log("Email already exists");
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
        errors: { email: 'This email is already registered' }
      });
    }

    // Step 3: Determine faculty type and build unique student identifier
    let existingStudentQuery = {};

    if (semesterFaculties.includes(faculty)) {
      // For semester-based faculties: Check faculty + semester + rollno combination
      existingStudentQuery = {
        faculty,
        semester: parseInt(semester),
        rollno: rollno.toUpperCase().trim()
      };
    } else if (yearlyFaculties.includes(faculty)) {
      // For yearly-based faculties: Check faculty + year + rollno combination
      existingStudentQuery = {
        faculty,
        year: parseInt(year),
        rollno: rollno.toUpperCase().trim()
      };
    } else {
      // For other faculties: Check faculty + rollno combination
      existingStudentQuery = {
        faculty,
        rollno: rollno.toUpperCase().trim()
      };
    }

    // Step 4: Check if student with same faculty+rollno+semester/year already exists
    const existingStudent = await User.findOne(existingStudentQuery);

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student already registered',
        errors: {
          rollno: `Student with roll number ${rollno} is already registered in ${faculty} ${semesterFaculties.includes(faculty) ? `Semester ${semester}` :
            yearlyFaculties.includes(faculty) ? `Year ${year}` : ''
            }`
        }
      });
    }

    // Step 5: Additional check - Same rollno across different emails in same faculty
    const sameRollnoDifferentEmail = await User.findOne({
      faculty,
      rollno: rollno.toUpperCase().trim(),
      email: { $ne: email.toLowerCase().trim() }
    });

    if (sameRollnoDifferentEmail) {
      return res.status(400).json({
        success: false,
        message: 'Roll number conflict',
        errors: {
          rollno: `This roll number is already registered with a different email address. Please use your registered email.`
        }
      });
    }

    // Step 6: Check for similar names in same faculty (optional, for fraud prevention)
    const similarNameInFaculty = await User.findOne({
      faculty,
      name: { $regex: new RegExp(name.split(' ')[0], 'i') },
      rollno: { $ne: rollno.toUpperCase().trim() }
    });

    if (similarNameInFaculty) {
      console.warn(`Potential duplicate name in ${faculty}: ${name}`);
    }

    // Step 7: Prepare user data
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      faculty,
      rollno: rollno.toUpperCase().trim(),
      contact: contact.replace(/\D/g, ''),
      address: address.trim(),
      verificationToken: generateVerificationToken(),
      verificationExpires: Date.now() + 24 * 60 * 60 * 1000,
      status: 'active'
    };

    // Add conditional fields based on faculty type
    if (semesterFaculties.includes(faculty)) {
      userData.semester = parseInt(semester);
      // Don't store year for semester-based faculties
      delete userData.year;
    } else if (yearlyFaculties.includes(faculty)) {
      userData.year = parseInt(year);
      // Don't store semester for yearly-based faculties
      delete userData.semester;
    } else {
      // Don't store either for other faculties
      delete userData.semester;
      delete userData.year;
    }

    // Step 8: Create user instance
    const user = new User(userData);

    // Step 9: Generate QR code
    const qrData = generateQRData(user);
    let qrCode;
    try {
      qrCode = await toDataURL(qrData);
    } catch (qrError) {
      console.error('QR Code generation error:', qrError);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate QR code'
      });
    }

    user.qrCode = qrCode;
    user.qrData = JSON.parse(qrData);

    // Step 10: Save to database
    await user.save();

    // Step 11: Send registration email with QR code
    let emailSent = false;
    let emailError = null;

    if (process.env.NODE_ENV !== 'test') {
      try {
        const emailData = {
          name: user.name,
          email: user.email,
          faculty: user.faculty,
          rollno: user.rollno,
          semester: user.semester || null,
          year: user.year || null,
          registrationId: user._id.toString(),
          registrationDate: user.createdAt
        };

        await sendRegistrationEmail(emailData, qrCode);
        emailSent = true;
        console.log(`✅ Registration email sent to ${user.email}`);
      } catch (emailError) {
        console.error('⚠️ Failed to send email (registration still successful):', emailError.message);
        emailError = emailError.message;
      }
    }

    // Step 12: Prepare response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      faculty: user.faculty,
      rollno: user.rollno,
      contact: user.contact,
      address: user.address,
      qrCode: user.qrCode,
      registrationDate: user.createdAt,
      attendanceCount: user.attendanceLogs?.length || 0,
      emailSent: emailSent
    };

    // Add appropriate field based on faculty type
    if (semesterFaculties.includes(user.faculty) && user.semester) {
      userResponse.semester = user.semester;
    } else if (yearlyFaculties.includes(user.faculty) && user.year) {
      userResponse.year = user.year;
    }

    const responseMessage = emailSent
      ? 'Student registered successfully. Check your email for QR code.'
      : 'Student registered successfully. Please save your QR code below.';

    res.status(201).json({
      success: true,
      message: responseMessage,
      user: userResponse,
      qrCode: user.qrCode,
      registrationId: user._id,
      emailSent: emailSent,
      emailError: emailError
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Handle duplicate key errors (unique constraints)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let message = '';

      switch (field) {
        case 'email':
          message = 'Email already registered';
          break;
        case 'rollno':
          message = 'Roll number already registered';
          break;
        case 'qrCode':
          message = 'QR code already exists';
          break;
        default:
          message = 'Duplicate field value';
      }

      return res.status(400).json({
        success: false,
        message,
        errors: { [field]: message }
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

// Additional validation endpoint (for frontend pre-check)
export async function validateRegistration(req, res) {
  try {
    const { email, faculty, semester, year, rollno } = req.body;

    const validationResults = {
      email: { available: true, message: '' },
      rollno: { available: true, message: '' },
      student: { available: true, message: '' }
    };

    // Check email availability
    if (email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase().trim()
      });

      if (emailExists) {
        validationResults.email.available = false;
        validationResults.email.message = 'Email already registered';
      }
    }

    // Check roll number availability with faculty context
    if (rollno && faculty) {
      const cleanRollno = rollno.toUpperCase().trim();

      let rollnoQuery = {
        faculty,
        rollno: cleanRollno
      };

      // Add semester/year to query if applicable
      if (semesterFaculties.includes(faculty) && semester) {
        rollnoQuery.semester = parseInt(semester);
      } else if (yearlyFaculties.includes(faculty) && year) {
        rollnoQuery.year = parseInt(year);
      }

      const rollnoExists = await User.findOne(rollnoQuery);

      if (rollnoExists) {
        validationResults.rollno.available = false;
        validationResults.rollno.message = `Roll number already registered in ${faculty} ${semesterFaculties.includes(faculty) ? `Semester ${semester}` :
          yearlyFaculties.includes(faculty) ? `Year ${year}` : ''
          }`;
      }

      // Additional check: Same rollno with different email
      const sameRollnoDiffEmail = await User.findOne({
        faculty,
        rollno: cleanRollno,
        ...(email ? { email: { $ne: email.toLowerCase().trim() } } : {})
      });

      if (sameRollnoDiffEmail) {
        validationResults.student.available = false;
        validationResults.student.message = 'This roll number is registered with another email';
      }
    }

    const allValid = Object.values(validationResults).every(result => result.available);

    res.status(200).json({
      success: true,
      valid: allValid,
      results: validationResults
    });

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation check failed'
    });
  }
}

// Get student by unique identifier
export async function getStudentByIdentifier(req, res) {
  try {
    const { faculty, rollno, semester, year } = req.query;

    if (!faculty || !rollno) {
      return res.status(400).json({
        success: false,
        message: 'Faculty and roll number are required'
      });
    }

    const query = {
      faculty,
      rollno: rollno.toUpperCase().trim()
    };

    // Add appropriate field based on faculty type
    if (semesterFaculties.includes(faculty) && semester) {
      query.semester = parseInt(semester);
    } else if (yearlyFaculties.includes(faculty) && year) {
      query.year = parseInt(year);
    }

    const student = await User.findOne(query)
      .select('-verificationToken -verificationExpires -__v -qrData');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      student
    });

  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

// Check if student can register (pre-registration check)
export async function canRegister(req, res) {
  try {
    const { email, faculty, rollno, semester, year } = req.body;

    const checks = {
      emailAvailable: true,
      rollnoAvailable: true,
      facultyValid: true,
      requirementsMet: true,
      messages: []
    };

    // 1. Check email
    if (email) {
      const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
      if (emailExists) {
        checks.emailAvailable = false;
        checks.messages.push('Email already registered');
      }
    }

    // 2. Check faculty validity
    const validFaculties = ['BBA', 'BCA', 'BSC', 'CSIT', 'BBS', 'BA', 'BSW', 'BITM'];
    if (faculty && !validFaculties.includes(faculty)) {
      checks.facultyValid = false;
      checks.messages.push('Invalid faculty selected');
    }

    // 3. Check roll number with faculty context
    if (rollno && faculty) {
      const cleanRollno = rollno.toUpperCase().trim();

      let query = { faculty, rollno: cleanRollno };

      // Add context based on faculty type
      if (semesterFaculties.includes(faculty)) {
        if (semester && semester.toString().trim() !== '') {
          query.semester = parseInt(semester);
        } else {
          checks.requirementsMet = false;
          checks.messages.push('Semester is required for this faculty');
        }
      } else if (yearlyFaculties.includes(faculty)) {
        if (year && year.toString().trim() !== '') {
          query.year = parseInt(year);
        } else {
          checks.requirementsMet = false;
          checks.messages.push('Year is required for this faculty');
        }
      }

      const existingStudent = await User.findOne(query);
      if (existingStudent) {
        checks.rollnoAvailable = false;
        checks.messages.push(`Student with roll number ${rollno} already registered in ${faculty}`);
      }
    }

    const canRegister = Object.values(checks).every(
      (check, index) => index < 4 ? check : true
    );

    res.status(200).json({
      success: true,
      canRegister,
      checks,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Can register check error:', error);
    res.status(500).json({
      success: false,
      canRegister: false,
      message: 'Registration check failed'
    });
  }
}

// Admin endpoint: Get all duplicate registrations
export async function findDuplicates(req, res) {
  try {
    // Find duplicate roll numbers within same faculty
    const duplicates = await User.aggregate([
      {
        $group: {
          _id: {
            faculty: "$faculty",
            rollno: "$rollno",
            semester: "$semester",
            year: "$year"
          },
          count: { $sum: 1 },
          users: {
            $push: {
              _id: "$_id",
              name: "$name",
              email: "$email",
              createdAt: "$createdAt"
            }
          }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      },
      {
        $sort: { "_id.faculty": 1, "_id.rollno": 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: duplicates.length,
      duplicates
    });

  } catch (error) {
    console.error('Find duplicates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find duplicates'
    });
  }
}

// Batch registration validation
export async function validateBatchRegistration(req, res) {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Students array is required'
      });
    }

    const results = [];
    const errors = [];
    const validStudents = [];

    for (const [index, student] of students.entries()) {
      try {
        // Basic validation
        const validation = validateStudentData(student);

        if (!validation.isValid) {
          errors.push({
            index,
            student: `${student.name} (${student.rollno})`,
            errors: validation.errors
          });
          continue;
        }

        // Check email uniqueness
        const emailExists = await User.findOne({
          email: student.email.toLowerCase().trim()
        });

        if (emailExists) {
          errors.push({
            index,
            student: `${student.name} (${student.rollno})`,
            errors: { email: 'Email already registered' }
          });
          continue;
        }

        // Check student uniqueness
        let query = {
          faculty: student.faculty,
          rollno: student.rollno.toUpperCase().trim()
        };

        if (semesterFaculties.includes(student.faculty) && student.semester) {
          query.semester = parseInt(student.semester);
        } else if (yearlyFaculties.includes(student.faculty) && student.year) {
          query.year = parseInt(student.year);
        }

        const studentExists = await User.findOne(query);

        if (studentExists) {
          errors.push({
            index,
            student: `${student.name} (${student.rollno})`,
            errors: { rollno: 'Student already registered' }
          });
          continue;
        }

        // Student is valid
        validStudents.push(student);
        results.push({
          index,
          student: `${student.name} (${student.rollno})`,
          status: 'valid'
        });

      } catch (error) {
        errors.push({
          index,
          student: student?.name || `Student at index ${index}`,
          errors: { general: 'Validation error' }
        });
      }
    }

    res.status(200).json({
      success: true,
      total: students.length,
      valid: validStudents.length,
      invalid: errors.length,
      results,
      errors,
      validStudents
    });

  } catch (error) {
    console.error('Batch validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Batch validation failed'
    });
  }
}
