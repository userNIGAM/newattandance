import React from "react";
import { semesterFaculties, yearlyFaculties, semesterOptions, yearOptions } from "../constants";

const SemesterYearSelect = ({
  formData,
  handleChange,
  handleBlur,
  errors,
  disabled = false
}) => {
  const isSemesterBased = semesterFaculties.includes(formData.faculty);
  const isYearBased = yearlyFaculties.includes(formData.faculty);

  if (!isSemesterBased && !isYearBased) return null;

  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-medium mb-2">
        {isSemesterBased ? "Semester *" : "Year *"}
      </label>
      <div className="relative">
        <select
          name={isSemesterBased ? "semester" : "year"}
          value={isSemesterBased ? formData.semester : formData.year}
          onChange={handleChange}
          onBlur={() => handleBlur(isSemesterBased ? "semester" : "year")}
          disabled={disabled}
          className={`w-full p-3 pl-10 text-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
            errors[isSemesterBased ? "semester" : "year"]
              ? "border-red-500"
              : "border-gray-300"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        >
          <option value="">
            Select {isSemesterBased ? "Semester" : "Year"}
          </option>
          {(isSemesterBased ? semesterOptions : yearOptions).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute left-3 top-3 text-gray-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
      {errors[isSemesterBased ? "semester" : "year"] && (
        <p className="text-red-500 text-xs mt-1 ml-1">
          {errors[isSemesterBased ? "semester" : "year"]}
        </p>
      )}
    </div>
  );
};

export default SemesterYearSelect;