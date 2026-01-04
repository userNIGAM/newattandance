import React from "react";
import { BookOpen } from "lucide-react";
import { semesterFaculties, yearlyFaculties } from "../constants";

const FacultySelect = ({
  formData,
  handleChange,
  handleBlur,
  errors,
  disabled = false,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-medium mb-2">
        Faculty <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <div className="absolute left-3 top-3 text-gray-400">
          <BookOpen className="w-4 h-4" />
        </div>
        <select
          name="faculty"
          value={formData.faculty}
          onChange={handleChange}
          onBlur={() => handleBlur("faculty")}
          disabled={disabled}
          className={`w-full p-3 pl-10 text-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
            errors.faculty ? "border-red-500" : "border-gray-300"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        >
          <option value="">Select Faculty</option>
          <optgroup label="Semester System">
            {semesterFaculties.map((faculty) => (
              <option key={faculty} value={faculty}>
                {faculty}
              </option>
            ))}
          </optgroup>
          <optgroup label="Yearly System">
            {yearlyFaculties.map((faculty) => (
              <option key={faculty} value={faculty}>
                {faculty}
              </option>
            ))}
          </optgroup>
        </select>
      </div>
      {errors.faculty && (
        <p className="text-red-500 text-xs mt-1 ml-1">{errors.faculty}</p>
      )}
    </div>
  );
};

export default FacultySelect;