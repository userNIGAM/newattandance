import React, { useState } from "react";
import { registerUser } from "../../services/Api.js";
import {
  TextInput,
  AddressInput,
  FacultySelect,
  QRDisplay,
  FormButtons,
  SemesterYearSelect,
} from "./forms";
import { semesterFaculties, yearlyFaculties } from "./constants";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    faculty: "",
    semester: "",
    year: "",
    rollno: "",
    contact: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userQR, setUserQR] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "contact")
      processedValue = value.replace(/\D/g, "").slice(0, 15);
    if (name === "rollno")
      processedValue = value.toUpperCase().replace(/\s/g, "");

    if (name === "faculty") {
      const nextIsSemester = semesterFaculties.includes(processedValue);
      const nextIsYear = yearlyFaculties.includes(processedValue);

      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
        semester: nextIsSemester ? prev.semester : "",
        year: nextIsYear ? prev.year : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: processedValue }));
    }

    if (touched[name]) validateField(name, processedValue);
  };

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName]);
  };

  const validateField = (fieldName, value) => {
    let error = "";
    const faculty = formData.faculty;
    const isSemesterBased = semesterFaculties.includes(faculty);
    const isYearBased = yearlyFaculties.includes(faculty);

    switch (fieldName) {
      case "name":
        if (!value?.trim()) error = "Name is required.";
        else if (value.length < 2)
          error = "Name must be at least 2 characters.";
        break;
      case "email":
        if (!value?.trim()) error = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Enter a valid email address.";
        break;
      case "faculty":
        if (!value) error = "Please select a faculty.";
        break;
      case "semester":
        if (isSemesterBased && !value) error = "Please select a semester.";
        else if (!isSemesterBased && value)
          error = "Semester is not applicable for this faculty.";
        break;
      case "year":
        if (isYearBased && !value) error = "Please select a year.";
        else if (!isYearBased && value)
          error = "Year is not applicable for this faculty.";
        break;
      case "rollno":
        if (!value?.trim()) error = "Roll number is required.";
        else if (!/^[A-Z0-9]+$/.test(value))
          error = "Invalid roll number format.";
        break;
      case "contact":
        if (!value?.trim()) error = "Contact number is required.";
        else if (!/^(97|98)\d{8}$/.test(value))
          error = "Phone must start with 98 and be 10 digits.";
        break;
      case "address":
        if (!value?.trim()) error = "Address is required.";
        else if (value.length < 10)
          error = "Address is too short (minimum 10 characters).";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [fieldName]: error }));
    return !error;
  };

  const validateAllFields = () => {
    const fieldsToValidate = [
      "name",
      "email",
      "faculty",
      "rollno",
      "contact",
      "address",
    ];
    const faculty = formData.faculty;

    if (semesterFaculties.includes(faculty)) {
      fieldsToValidate.push("semester");
      if (formData.year) {
        setFormData((prev) => ({ ...prev, year: "" }));
      }
    } else if (yearlyFaculties.includes(faculty)) {
      fieldsToValidate.push("year");
      if (formData.semester) {
        setFormData((prev) => ({ ...prev, semester: "" }));
      }
    }

    let isValid = true;
    fieldsToValidate.forEach((f) => {
      const valid = validateField(f, formData[f]);
      if (!valid) isValid = false;
    });

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateAllFields()) return;

    try {
      setIsSubmitting(true);
      setErrors({});

      const dataToSend = { ...formData };
      const faculty = dataToSend.faculty;

      if (semesterFaculties.includes(faculty)) {
        delete dataToSend.year;
      } else if (yearlyFaculties.includes(faculty)) {
        delete dataToSend.semester;
      } else {
        delete dataToSend.semester;
        delete dataToSend.year;
      }

      const result = await registerUser(dataToSend);
      if (result.qrCode) {
        setUserQR(result.qrCode);
        setSubmitted(true);

        if (result.emailSent) {
          alert(
            `✅ Registration successful! QR code has been sent to ${formData.email}`
          );
        } else {
          alert(
            `✅ Registration successful! QR code generated. Check your email at ${formData.email} for the QR code.`
          );
        }
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          submit: error.message || "Registration failed. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userQR)
    return (
      <QRDisplay
        userQR={userQR}
        setUserQR={() => {
          setUserQR(null);
          setSubmitted(false);
          setFormData({});
        }}
      />
    );

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Register for Event
      </h2>

      {errors.submit && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-2 rounded-lg mb-4">
          {errors.submit}
        </div>
      )}

      <TextInput
        name="name"
        label="Full Name"
        formData={formData}
        handleChange={handleChange}
        handleBlur={handleBlur}
        errors={errors}
        required
        disabled={submitted || isSubmitting}
      />
      
      <TextInput
        name="email"
        label="Email"
        type="email"
        formData={formData}
        handleChange={handleChange}
        handleBlur={handleBlur}
        errors={errors}
        required
        disabled={submitted || isSubmitting}
      />
      
      <FacultySelect
        formData={formData}
        handleChange={handleChange}
        handleBlur={handleBlur}
        errors={errors}
        disabled={submitted || isSubmitting}
      />
      
      <SemesterYearSelect
        formData={formData}
        handleChange={handleChange}
        handleBlur={handleBlur}
        errors={errors}
        disabled={submitted || isSubmitting}
      />
      
      <TextInput
        name="rollno"
        label="Roll Number"
        formData={formData}
        handleChange={handleChange}
        handleBlur={handleBlur}
        errors={errors}
        required
        disabled={submitted || isSubmitting}
      />
      
      <TextInput
        name="contact"
        label="Contact Number"
        formData={formData}
        handleChange={handleChange}
        handleBlur={handleBlur}
        errors={errors}
        required
        disabled={submitted || isSubmitting}
      />
      
      <AddressInput
        name="address"
        label="Address"
        formData={formData}
        handleChange={handleChange}
        handleBlur={handleBlur}
        errors={errors}
        required
        disabled={submitted || isSubmitting}
      />

      <FormButtons
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitted={submitted}
      />
    </div>
  );
};

export default RegisterForm;