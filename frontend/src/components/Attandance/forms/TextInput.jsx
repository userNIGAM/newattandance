import React from "react";
import Field from "./Field";

const TextInput = ({ name, label, icon = null, type = "text", formData, handleChange, handleBlur, errors, required = false, disabled = false }) => (
  <Field label={label} icon={icon} error={errors[name]} required={required}>
    <input
      name={name}
      type={type}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder={label}
      value={formData[name] || ""}
      onChange={handleChange}
      onBlur={() => handleBlur(name)}
      disabled={disabled}
    />
  </Field>
);

export default TextInput;
