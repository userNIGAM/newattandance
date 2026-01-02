// middleware/validation.js
const { validateStudentData } = require('../controllers/userController');

const registrationValidation = (req, res, next) => {
  const validation = validateStudentData(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  
  next();
};

const emailValidation = (req, res, next) => {
  const { email } = req.body;
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Valid email is required'
    });
  }
  
  next();
};

const facultyValidation = (req, res, next) => {
  const { faculty } = req.body;
  const validFaculties = ['BBA', 'BCA', 'BSC', 'CSIT', 'BBS', 'BA', 'BSW', 'BITM'];
  
  if (!faculty || !validFaculties.includes(faculty)) {
    return res.status(400).json({
      success: false,
      message: 'Valid faculty is required'
    });
  }
  
  next();
};

module.exports = {
  registrationValidation,
  emailValidation,
  facultyValidation
};