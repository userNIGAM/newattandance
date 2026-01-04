import React from "react";
import { MapPin } from "lucide-react";

const AddressInput = ({
  name,
  label,
  formData,
  handleChange,
  handleBlur,
  errors,
  required = false,
  disabled = false,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-medium mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-3 text-gray-400">
          <MapPin className="w-4 h-4" />
        </div>
        <textarea
          name={name}
          value={formData[name]}
          onChange={handleChange}
          onBlur={() => handleBlur(name)}
          disabled={disabled}
          rows="3"
          className={`w-full p-3 pl-10 text-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none ${
            errors[name] ? "border-red-500" : "border-gray-300"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </div>
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1 ml-1">{errors[name]}</p>
      )}
    </div>
  );
};

export default AddressInput;