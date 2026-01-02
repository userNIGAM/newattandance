import React from "react";
import Field from "./Field";
import { GraduationCap } from "lucide-react";

const FacultySelect = ({ formData, handleChange, handleBlur, errors, semesterFaculties, yearlyFaculties, disabled }) => {
  const faculty = formData.faculty;
  const isSemesterBased = semesterFaculties.includes(faculty);
  const isYearBased = yearlyFaculties.includes(faculty);

  return (
    <>
      <Field label="Faculty" icon={<GraduationCap className="w-4 h-4" />} error={errors.faculty} required>
        <select
          name="faculty"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={formData.faculty || ""}
          onChange={handleChange}
          onBlur={() => handleBlur("faculty")}
          disabled={disabled}
        >
          <option value="">Select faculty</option>
          {semesterFaculties.concat(yearlyFaculties).map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </Field>

      {isSemesterBased && (
        <Field label="Semester" error={errors.semester} required>
          <select
            name="semester"
            value={formData.semester || ""}
            onChange={handleChange}
            onBlur={() => handleBlur("semester")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          >
            <option value="">Select semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>{`Semester ${s}`}</option>
            ))}
          </select>
        </Field>
      )}

      {isYearBased && (
        <Field label="Year" error={errors.year} required>
          <select
            name="year"
            value={formData.year || ""}
            onChange={handleChange}
            onBlur={() => handleBlur("year")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          >
            <option value="">Select year</option>
            {[1, 2, 3, 4].map((y) => (
              <option key={y} value={y}>{`${y}${["st","nd","rd","th"][y-1]} Year`}</option>
            ))}
          </select>
        </Field>
      )}
    </>
  );
};

export default FacultySelect;
